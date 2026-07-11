import json
from pathlib import Path
from collections import Counter

with open("graphify-out/.graphify_detect.json", "r", encoding="utf-8-sig") as f:
    d = json.load(f)

scan_root = d.get("scan_root", "c:\\Dev\\ExploitX\\CTFd-3.8.6")
all_files = []
for cat in ["code", "document", "paper", "image", "video"]:
    all_files.extend(d.get("files", {}).get(cat, []))

counts = Counter()
for f in all_files:
    if f.startswith(str(Path(scan_root) / "graphify-out")):
        continue
    try:
        rel = Path(f).relative_to(scan_root)
        if len(rel.parts) > 1:
            counts[rel.parts[0]] += 1
        else:
            counts["(root)"] += 1
    except ValueError:
        pass

print("Top subdirectories:")
for subdir, count in counts.most_common(5):
    print(f"  {subdir}: {count} files")
