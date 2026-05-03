"""Audit for any remaining mojibake. Read-only - does not modify."""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SKIP = {'.git', 'node_modules', '.claude', '.antigravity', '.codex',
        'AppData', 'public/renders'}
EXT = {'.js', '.html', '.css', '.json', '.md', '.py', '.txt',
       '.ts', '.svg', '.csv', '.yaml', '.yml'}

# Common mojibake patterns built from raw bytes to avoid editor mangling
MARKERS = [
    b'\xc3\xa2\xe2\x80\x99'.decode('utf-8'),  # right single quote
    b'\xc3\xa2\xe2\x80\x98'.decode('utf-8'),  # left single quote
    b'\xc3\xa2\xe2\x80\x9c'.decode('utf-8'),  # left double quote
    b'\xc3\xa2\xe2\x82\xac'.decode('utf-8'),  # part of right double quote / euro
    b'\xc3\xa2\xe2\x80\x93'.decode('utf-8'),  # en dash
    b'\xc3\xa2\xe2\x80\x94'.decode('utf-8'),  # em dash
    b'\xc3\xa2\xe2\x80\xa6'.decode('utf-8'),  # ellipsis
    b'\xc3\xa2\xe2\x80\xa2'.decode('utf-8'),  # bullet
    b'\xc3\xa2\xe2\x80\xa0'.decode('utf-8'),  # dagger (used in arrow mojibake)
    b'\xc3\xa2\xe2\x80\xa1'.decode('utf-8'),  # double dagger
    b'\xc3\x82\xc2\xa0'.decode('utf-8'),       # nbsp
    b'\xc3\x82\xc2\xa9'.decode('utf-8'),       # copyright
    b'\xc3\xa2\xe2\x84\xa2'.decode('utf-8'),   # tm
]

hits = {}
for root, dirs, files in os.walk(ROOT):
    rel = os.path.relpath(root, ROOT).replace(os.sep, '/')
    if any(s in rel.split('/') for s in SKIP):
        continue
    dirs[:] = [d for d in dirs if d not in SKIP]
    for fname in files:
        ext = os.path.splitext(fname)[1].lower()
        if ext not in EXT:
            continue
        p = os.path.join(root, fname)
        try:
            with open(p, 'rb') as f:
                raw = f.read(2 * 1024 * 1024)  # 2 MB cap
            text = raw.decode('utf-8', errors='replace')
        except Exception:
            continue
        n = sum(text.count(m) for m in MARKERS)
        if n:
            relp = os.path.relpath(p, ROOT).replace(os.sep, '/')
            hits[relp] = n

for p, n in sorted(hits.items(), key=lambda x: -x[1])[:40]:
    print(f'  {p}: {n}')
print(f'\nTotal files with mojibake: {len(hits)}')
