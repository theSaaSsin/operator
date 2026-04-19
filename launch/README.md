# B.O.S.S — Launchers & Desktop Shortcut

## One-time install

Right-click **`launch/install-shortcut.ps1`** → **Run with PowerShell**
(or in a terminal: `powershell -ExecutionPolicy Bypass -File launch\install-shortcut.ps1`)

What it does:
1. Generates a 256×256 multi-size **B.O.S.S** icon (`launch/boss.ico`).
2. Removes the old `TheSaaSsin Operator` / `Operator` shortcuts from your Desktop.
3. Creates a new **B.O.S.S** shortcut on your Desktop pointing at `launch/boss.vbs`.

## Daily use

Double-click **B.O.S.S** on your Desktop. The Node server starts silently and your default browser opens to `http://localhost:4000`.

## Files

| File | Purpose |
|---|---|
| `boss.vbs` | Silent launcher (no console window). Default for the shortcut. |
| `boss.bat` | Visible launcher with logs — use when debugging. |
| `install-shortcut.ps1` | Generates icon + creates Desktop shortcut. |
| `uninstall-shortcut.ps1` | Removes the shortcut + cached icon. |
| `boss.ico` | Generated icon (gitignored). |
| `boss.png` | Source PNG (gitignored). |

## Uninstall

Right-click `launch/uninstall-shortcut.ps1` → Run with PowerShell.
