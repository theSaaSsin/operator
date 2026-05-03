"""
fix-mojibake.py
================
Walks the codebase and fixes UTF-8 text that was previously decoded as
Latin-1 / Windows-1252 and re-saved as UTF-8 (the classic "�'" etc. mess).

Approach:
1. Try `bytes.decode('utf-8').encode('latin-1').decode('utf-8')`. If it
   round-trips cleanly AND the result no longer contains any mojibake
   marker characters (�, �, etc. preceded by other unusual code points),
   it was double-encoded � keep the fixed version.
2. Strip UTF-8 BOM if present.
3. Skip binary files (.png, .jpg, .mp4, .ico, etc.).

Run from repo root:
    python scripts/fix-mojibake.py
"""

import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SKIP_DIRS = {'.git', 'node_modules', '.claude', '.antigravity', '.codex',
             'AppData', 'public/renders'}
TEXT_EXTS = {'.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.css', '.scss',
             '.json', '.md', '.txt', '.py', '.yaml', '.yml', '.toml',
             '.csv', '.svg', '.xml', '.vbs', '.ps1', '.sh'}

# Mojibake detection markers (these chars almost always indicate wrong encoding)
MOJIBAKE_MARKERS = ['�\x80', '�\x81', '�\x82', '�\x84', '�\x86', '�\x87',
                    '�\x88', '�\x9a', '�', '�', '�', '�', '�',
                    '�\xa0', '�\xa9', '®', 'é', '� ', 'è', 'ë',
                    'î', 'ô', 'û', 'ñ', 'ç']


def is_binary(path):
    try:
        with open(path, 'rb') as f:
            chunk = f.read(1024)
        if b'\x00' in chunk:
            return True
    except Exception:
        return True
    return False


def has_mojibake(text):
    return any(m in text for m in MOJIBAKE_MARKERS)


def try_fix(text):
    """Round-trip text through cp1252 ? utf-8 to undo double-encoding.
    cp1252 (Windows-1252) is the actual culprit: 0x86 = �, 0x92 = ',
    0x93 = ", 0x94 = ", 0x96 = �, 0x97 = �, 0xA0 = nbsp.
    Latin-1 doesn't have these so we use cp1252.
    Falls back to latin-1 for files that don't fit cp1252.
    """
    for codec in ('cp1252', 'latin-1'):
        try:
            fixed = text.encode(codec, errors='strict').decode('utf-8', errors='strict')
            return fixed
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
    # Last resort: cp1252 with replace, only swap mojibake chars
    try:
        return text.encode('cp1252', errors='replace').decode('utf-8', errors='replace')
    except Exception:
        return None


def process_file(path):
    if is_binary(path):
        return None

    with open(path, 'rb') as f:
        raw = f.read()

    if not raw:
        return None

    # Strip UTF-8 BOM if present
    had_bom = raw.startswith(b'\xef\xbb\xbf')
    if had_bom:
        raw = raw[3:]

    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        # File isn't valid UTF-8 to start with � try cp1252
        try:
            text = raw.decode('cp1252')
        except Exception:
            return None

    if not has_mojibake(text) and not had_bom:
        return None

    # Iteratively un-double-encode. Stop when no markers left or fix fails.
    fixed = text
    iterations = 0
    while has_mojibake(fixed) and iterations < 3:
        attempt = try_fix(fixed)
        if attempt is None or attempt == fixed:
            break
        fixed = attempt
        iterations += 1

    if fixed == text and not had_bom:
        return None

    if fixed == text and had_bom:
        # No mojibake but BOM was present � strip and rewrite
        with open(path, 'wb') as f:
            f.write(text.encode('utf-8'))
        return ('bom-stripped', 0)

    # Write back without BOM
    with open(path, 'wb') as f:
        f.write(fixed.encode('utf-8'))
    return ('fixed', iterations)


def walk():
    fixed_count = 0
    bom_count = 0
    files_touched = []
    for root, dirs, files in os.walk(REPO_ROOT):
        # prune skip dirs
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        # also skip nested SKIP_DIRS by relative path
        rel = os.path.relpath(root, REPO_ROOT).replace('\\', '/')
        if any(skip in rel.split('/') for skip in SKIP_DIRS):
            continue
        if rel.startswith('public/renders'):
            continue
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in TEXT_EXTS:
                continue
            path = os.path.join(root, fname)
            try:
                result = process_file(path)
            except Exception as e:
                print(f'ERROR on {path}: {e}')
                continue
            if result:
                kind, iters = result
                rel_path = os.path.relpath(path, REPO_ROOT).replace('\\', '/')
                if kind == 'fixed':
                    fixed_count += 1
                    files_touched.append((rel_path, iters))
                else:
                    bom_count += 1
                    files_touched.append((rel_path, 'bom-only'))

    print(f'\nFIXED: {fixed_count} files (mojibake)')
    print(f'BOM stripped: {bom_count} files')
    print(f'Total touched: {len(files_touched)}')
    print('\nFiles:')
    for f, n in files_touched:
        print(f'  {f}  [{n}]')


if __name__ == '__main__':
    walk()
