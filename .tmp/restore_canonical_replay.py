#!/usr/bin/env python3
"""Replay Write+StrReplace from all agent transcripts to restore Canonical docs."""
from __future__ import annotations

import json
from pathlib import Path

TRANSCRIPTS = Path(
    r"C:\Users\mamdo\.cursor\projects\c-Users-mamdo-Documents-GitHub-Mall-Shops\agent-transcripts"
)
REPO = Path(r"C:\Users\mamdo\Documents\GitHub\Mall_Shops")

# Paths we want restored (suffix match after normalizing to docs/...)
INCLUDE = (
    "docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md",
    "docs/modules/restaurant/",
    "docs/evidence/restaurant-",
    "docs/evidence/abukhater-knowledge-inventory.md",
    "docs/evidence/salon-module-reference-pattern.md",
    "docs/evidence/salon-reference-readiness-audit.md",
    "docs/evidence/platform-capability-map-from-salon.md",
    "docs/evidence/salon-v1-reference-locked.md",
    "docs/evidence/ezz-business-workflow-reference.md",
    "docs/contracts/modules/restaurant/",
)

# Do not clobber current committed governance/thesis
PROTECT = {
    "docs/modules/restaurant/MVP_THESIS.md",
    "docs/platform/GOVERNANCE_FRAMEWORK.md",
    "docs/evidence/restaurant-canonicalization-audit.md",
    "docs/evidence/restaurant-governance-product-phase-closed.md",
}

# After restore, move pre-Reference stub contracts aside
LEGACY_STUBS = {
    "ORDER.md",
    "PAYMENT.md",
    "FULFILLMENT.md",
    "KITCHEN.md",
    "DRIVER.md",
    "TABLE.md",
    "CUSTOMER.md",
    "EMPLOYEE.md",
    "SHIFT.md",
    "MENU.md",
    "STATUS.md",
    "EVENTS.md",
    "INDEX.md",
}


def to_rel(path: str) -> str | None:
    n = path.replace("\\", "/")
    # handle truncated paths that still contain docs/
    if "docs/" not in n:
        return None
    return n[n.find("docs/") :]


def include(rel: str) -> bool:
    r = rel.replace("\\", "/")
    if r in PROTECT:
        return False
    return any(r == p or r.startswith(p) for p in INCLUDE)


def main() -> None:
    # chronological events: (path, op, payload)
    events: list[tuple[str, str, dict]] = []
    files = sorted(TRANSCRIPTS.rglob("*.jsonl"), key=lambda p: p.stat().st_mtime)
    for tf in files:
        with tf.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                if '"Write"' not in line and '"StrReplace"' not in line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                content = (obj.get("message") or {}).get("content")
                if not isinstance(content, list):
                    continue
                for part in content:
                    if not isinstance(part, dict):
                        continue
                    name = part.get("name")
                    if name not in ("Write", "StrReplace"):
                        continue
                    inp = part.get("input") or {}
                    path = inp.get("path") or ""
                    rel = to_rel(path)
                    if not rel or not include(rel):
                        continue
                    events.append((rel, name, inp))

    state: dict[str, str] = {}
    for rel, op, inp in events:
        if op == "Write":
            c = inp.get("contents")
            if c is not None:
                state[rel] = c
        elif op == "StrReplace":
            if rel not in state:
                continue
            old = inp.get("old_string")
            new = inp.get("new_string")
            if old is None or new is None:
                continue
            cur = state[rel]
            if old not in cur:
                continue
            if inp.get("replace_all"):
                state[rel] = cur.replace(old, new)
            else:
                state[rel] = cur.replace(old, new, 1)

    print(f"events={len(events)} final_files={len(state)}")

    # Move current restaurant contract stubs to _legacy if they look like stubs
    contracts_dir = REPO / "docs" / "contracts" / "modules" / "restaurant"
    legacy_dir = contracts_dir / "_legacy_stubs"
    if contracts_dir.exists():
        legacy_dir.mkdir(parents=True, exist_ok=True)
        for name in LEGACY_STUBS:
            src = contracts_dir / name
            if not src.exists():
                continue
            text = src.read_text(encoding="utf-8", errors="replace")
            # move if stub-shaped or already has LEGACY banner (INDEX)
            stubby = (
                "transactional cart" in text
                or "KitchenTicket" in text
                or "DeliveryAssignment" in text
                or "LEGACY (Read-only)" in text
                or name in ("DRIVER.md", "TABLE.md", "CUSTOMER.md", "KITCHEN.md")
            )
            # Always quarantine existing stubs before restoring canonical over same paths
            if stubby or name in LEGACY_STUBS:
                dest = legacy_dir / name
                dest.write_text(text, encoding="utf-8", newline="\n")
                src.unlink()
                print(f"QUARANTINE -> _legacy_stubs/{name}")

    written = []
    for rel, contents in sorted(state.items()):
        # skip salon VISION under modules/salon if accidentally included — not in INCLUDE prefixes for salon modules
        dest = REPO / Path(*rel.split("/"))
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(contents, encoding="utf-8", newline="\n")
        written.append(rel)
        print(f"RESTORE {rel} ({len(contents)} chars)")

    # Write a pointer README in _legacy_stubs
    if legacy_dir.exists():
        (legacy_dir / "README.md").write_text(
            "# Legacy restaurant contract stubs (Read-only)\n\n"
            "Quarantined during Canonical Restore (2026-07-20).\n\n"
            "Do **not** use for Product / Exit Criteria / Schema / APIs / UI.\n\n"
            "Authority: `docs/platform/GOVERNANCE_FRAMEWORK.md` Canonical Rule.\n"
            "Product SoT: `docs/modules/restaurant/MVP_THESIS.md`.\n"
            "Canonical contracts restored beside this folder (parent directory).\n",
            encoding="utf-8",
            newline="\n",
        )

    print(f"\nRestored {len(written)} files")
    missing_expected = [
        "docs/knowledge/RESTAURANT_KNOWLEDGE_INDEX.md",
        "docs/modules/restaurant/VISION.md",
        "docs/modules/restaurant/MVP_BOUNDARY.md",
        "docs/modules/restaurant/README.md",
        "docs/modules/restaurant/DOMAIN_LANGUAGE.md",
        "docs/modules/restaurant/AGGREGATE_BOUNDARIES.md",
        "docs/modules/restaurant/LIFECYCLE_MAP.md",
        "docs/modules/restaurant/CAPABILITY_MAP.md",
        "docs/modules/restaurant/PACKAGE_MANIFEST.md",
        "docs/evidence/restaurant-discovery-and-mapping.md",
        "docs/evidence/restaurant-anti-patterns.md",
        "docs/evidence/restaurant-operational-workflow.md",
        "docs/evidence/restaurant-pattern-library.md",
        "docs/evidence/restaurant-gap-analysis-salon.md",
        "docs/evidence/restaurant-aggregate-map.md",
        "docs/evidence/restaurant-capability-classification.md",
        "docs/evidence/abukhater-knowledge-inventory.md",
        "docs/evidence/restaurant-knowledge-traceability-verification.md",
        "docs/contracts/modules/restaurant/ORDER.md",
        "docs/contracts/modules/restaurant/MENU.md",
        "docs/contracts/modules/restaurant/FULFILLMENT.md",
        "docs/contracts/modules/restaurant/GUEST.md",
        "docs/contracts/modules/restaurant/PAYMENT.md",
        "docs/contracts/modules/restaurant/SHIFT.md",
        "docs/contracts/modules/restaurant/RESERVATION.md",
        "docs/contracts/modules/restaurant/RESTAURANT_EMPLOYEE.md",
        "docs/contracts/modules/restaurant/SETTINGS.md",
        "docs/contracts/modules/restaurant/REPORTING.md",
        "docs/contracts/modules/restaurant/INDEX.md",
    ]
    print("\nVERIFY:")
    for p in missing_expected:
        ok = (REPO / Path(*p.split("/"))).exists()
        print(f"  {'OK' if ok else 'MISSING'}  {p}")


if __name__ == "__main__":
    main()
