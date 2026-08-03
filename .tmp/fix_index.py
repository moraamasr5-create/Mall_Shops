#!/usr/bin/env python3
import json
from pathlib import Path

root = Path(
    r"C:\Users\mamdo\.cursor\projects\c-Users-mamdo-Documents-GitHub-Mall-Shops\agent-transcripts"
)
out = Path(
    r"C:\Users\mamdo\Documents\GitHub\Mall_Shops\docs\contracts\modules\restaurant\INDEX.md"
)
best = None
for p in root.rglob("*.jsonl"):
    with p.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            if "INDEX.md" not in line or "restaurant" not in line:
                continue
            if "Write" not in line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            for part in (obj.get("message") or {}).get("content") or []:
                if not isinstance(part, dict) or part.get("name") != "Write":
                    continue
                path = ((part.get("input") or {}).get("path") or "").replace("\\", "/")
                if not path.endswith("contracts/modules/restaurant/INDEX.md"):
                    continue
                c = (part.get("input") or {}).get("contents") or ""
                score = 0
                if "GUEST" in c:
                    score += 3
                if "RESTAURANT_EMPLOYEE" in c:
                    score += 3
                if "RESERVATION" in c:
                    score += 2
                if "REPORTING" in c:
                    score += 1
                if "KitchenTicket" in c:
                    score -= 5
                if "DeliveryAssignment" in c:
                    score -= 5
                if "LEGACY" in c:
                    score -= 10
                if "transactional cart" in c:
                    score -= 10
                print(f"{p.name[:12]} chars={len(c)} score={score}")
                if best is None or score > best[0] or (score == best[0] and len(c) > len(best[1])):
                    best = (score, c)

if not best or best[0] < 5:
    raise SystemExit(f"No good INDEX found: {best[0] if best else None}")

out.write_text(best[1], encoding="utf-8", newline="\n")
print("WROTE", out, "score", best[0], "len", len(best[1]))
print(best[1][:900])
