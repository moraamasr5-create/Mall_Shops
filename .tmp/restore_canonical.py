#!/usr/bin/env python3
"""Restore Canonical restaurant docs from agent transcript Write snapshots (no new authorship)."""
from __future__ import annotations

import json
from pathlib import Path

TRANSCRIPT = Path(
    r"C:\Users\mamdo\.cursor\projects\c-Users-mamdo-Documents-GitHub-Mall-Shops"
    r"\agent-transcripts\0a3d998d-1871-449a-a2af-f7750d55361e"
    r"\0a3d998d-1871-449a-a2af-f7750d55361e.jsonl"
)
REPO = Path(r"C:\Users\mamdo\Documents\GitHub\Mall_Shops")

WANT_PREFIXES = (
    "docs/knowledge/",
    "docs/modules/restaurant/",
    "docs/evidence/restaurant-",
    "docs/evidence/abukhater-",
    "docs/evidence/salon-module-reference",
    "docs/evidence/salon-reference-readiness",
    "docs/evidence/platform-capability-map",
    "docs/evidence/salon-v1-reference-locked",
    "docs/contracts/modules/restaurant/",
)

# Already committed / do not overwrite with older transcript versions
SKIP_SUFFIXES = (
    "MVP_THESIS.md",
    "GOVERNANCE_FRAMEWORK.md",
    "restaurant-canonicalization-audit.md",
    "restaurant-governance-product-phase-closed.md",
)

# Stub-era contract filenames that must NOT overwrite Legacy stubs with wrong Write
# unless contents look Index-canonical (PWU). We restore canonical pack beside stubs
# only when transcript Write is the PWU version.
LEGACY_STUB_NAMES = {
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
    i = n.lower().find("/docs/")
    if i >= 0:
        return n[i + 1 :]
    if "docs/" in n:
        return n[n.find("docs/") :]
    return None


def wanted(rel: str) -> bool:
    r = rel.replace("\\", "/")
    if any(r.endswith(s) for s in SKIP_SUFFIXES):
        return False
    return any(r.startswith(p) or p in r for p in WANT_PREFIXES)


def is_pw_order(contents: str) -> bool:
    """Heuristic: Index-canonical ORDER vs cart stub."""
    markers = (
        "Primary Operational Work Unit",
        "primary Operational Work Unit",
        "Primary Work Unit",
        "PaymentAcceptance",
        "Fulfillment Entity",
    )
    bad = (
        "purely a transactional cart",
        "delegates fulfillment, payment, and preparation to other independent domains",
    )
    if any(b in contents for b in bad):
        return False
    return any(m in contents for m in markers)


def main() -> None:
    last: dict[str, str] = {}
    with TRANSCRIPT.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            if '"name":"Write"' not in line and '"name": "Write"' not in line:
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
                if part.get("type") != "tool_use" or part.get("name") != "Write":
                    continue
                inp = part.get("input") or {}
                path = inp.get("path") or ""
                contents = inp.get("contents")
                if contents is None:
                    continue
                rel = to_rel(path)
                if not rel or not wanted(rel):
                    continue
                last[rel.replace("\\", "/")] = contents

    print(f"Recoverable Write snapshots: {len(last)}")
    written = []
    skipped = []
    for rel, contents in sorted(last.items()):
        name = Path(rel).name
        dest = REPO / rel.replace("/", "\\")

        if "contracts/modules/restaurant/" in rel and name in LEGACY_STUB_NAMES:
            if name == "INDEX.md":
                skipped.append((rel, "keep Legacy INDEX banner (committed)"))
                continue
            if name == "ORDER.md" and not is_pw_order(contents):
                skipped.append((rel, "cart stub Write — skip"))
                continue
            if name != "ORDER.md" and name in LEGACY_STUB_NAMES:
                # Prefer restoring Index-canonical under docs/contracts/modules/restaurant/canonical/
                # OR overwrite only if clearly PWU pack. For GUEST etc. those aren't in LEGACY_STUB_NAMES.
                # For FULFILLMENT/PAYMENT etc. transcript may have Entity versions — check heuristics
                if name in ("FULFILLMENT.md", "PAYMENT.md", "MENU.md", "SHIFT.md"):
                    # write to canonical/ subfolder to avoid clobbering Legacy stubs wrongly
                    dest = REPO / "docs" / "contracts" / "modules" / "restaurant" / "canonical" / name
                    rel_out = f"docs/contracts/modules/restaurant/canonical/{name}"
                elif name in ("KITCHEN.md", "DRIVER.md", "TABLE.md", "CUSTOMER.md", "EMPLOYEE.md", "STATUS.md", "EVENTS.md"):
                    skipped.append((rel, "legacy-shaped contract — leave stub + banner"))
                    continue
                else:
                    rel_out = rel
            else:
                # ORDER PWU — write to canonical/ and also note
                dest = REPO / "docs" / "contracts" / "modules" / "restaurant" / "canonical" / name
                rel_out = f"docs/contracts/modules/restaurant/canonical/{name}"
        else:
            rel_out = rel

        # Guest / RestaurantEmployee / Reservation / Settings / Reporting go to canonical/ if restaurant contracts
        if "contracts/modules/restaurant/" in rel and name not in LEGACY_STUB_NAMES:
            dest = REPO / "docs" / "contracts" / "modules" / "restaurant" / "canonical" / name
            rel_out = f"docs/contracts/modules/restaurant/canonical/{name}"

        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(contents, encoding="utf-8", newline="\n")
        written.append(rel_out)
        print(f"WROTE {rel_out} ({len(contents)} chars)")

    print("\nSKIPPED:")
    for rel, why in skipped:
        print(f"  {rel}: {why}")
    print(f"\nDone. wrote={len(written)} skipped={len(skipped)}")


if __name__ == "__main__":
    main()
