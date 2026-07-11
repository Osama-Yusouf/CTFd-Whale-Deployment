import json
with open("graphify-out/.graphify_detect.json", "r", encoding="utf-8-sig") as f:
    d = json.load(f)
print(f"Total files: {d.get('total_files')}")
print(f"Total words: {d.get('total_words')}")
print(f"Code files: {len(d.get('files', {}).get('code', []))}")
print(f"Doc files: {len(d.get('files', {}).get('document', []))}")
