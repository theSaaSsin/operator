# B.O.S.S — Desktop Shortcut Installer
# Generates a .ico from the SVG/text logo, then drops a Desktop shortcut
# pointing at launch\boss.vbs (silent launcher).
#
# Usage:  Right-click → "Run with PowerShell"
#  or :   powershell -ExecutionPolicy Bypass -File launch\install-shortcut.ps1

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$launcher    = Join-Path $projectRoot 'launch\boss.vbs'
$iconPath    = Join-Path $projectRoot 'launch\boss.ico'
$pngPath     = Join-Path $projectRoot 'launch\boss.png'

Write-Host "B.O.S.S installer" -ForegroundColor Green
Write-Host "  project: $projectRoot"
Write-Host "  launcher: $launcher"

if (-not (Test-Path $launcher)) { throw "boss.vbs not found at $launcher" }

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms

# ── Build a 256×256 PNG icon from scratch (no dependencies) ────────
function New-BossPng {
    param([string]$OutPath)
    $size = 256
    $bmp  = New-Object System.Drawing.Bitmap $size, $size
    $g    = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background — rounded dark square
    $bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = 48
    $bgPath.AddArc(0, 0, $r*2, $r*2, 180, 90)
    $bgPath.AddArc($size-$r*2, 0, $r*2, $r*2, 270, 90)
    $bgPath.AddArc($size-$r*2, $size-$r*2, $r*2, $r*2, 0, 90)
    $bgPath.AddArc(0, $size-$r*2, $r*2, $r*2, 90, 90)
    $bgPath.CloseAllFigures()
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0,0)),
        (New-Object System.Drawing.Point($size,$size)),
        [System.Drawing.Color]::FromArgb(255,10,10,10),
        [System.Drawing.Color]::FromArgb(255,26,26,26))
    $g.FillPath($bgBrush, $bgPath)

    # Outer ring (lime → green gradient)
    $ringRect = New-Object System.Drawing.Rectangle(40, 40, 176, 176)
    $ringPen  = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255,200,255,0)), 6
    $g.DrawEllipse($ringPen, $ringRect)

    # Inner dashed ring
    $dashRect = New-Object System.Drawing.Rectangle(64, 64, 128, 128)
    $dashPen  = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120,200,255,0)), 2
    $dashPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $g.DrawEllipse($dashPen, $dashRect)

    # Big "B"
    $font  = New-Object System.Drawing.Font('Arial Black', 96, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,200,255,0))
    $sf    = New-Object System.Drawing.StringFormat
    $sf.Alignment     = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString('B', $font, $brush, (New-Object System.Drawing.RectangleF(0, -10, $size, $size)), $sf)

    # B·O·S·S wordmark
    $wf  = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString('B  O  S  S', $wf, $brush, (New-Object System.Drawing.RectangleF(0, 195, $size, 30)), $sf)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}

# ── Convert PNG → multi-size ICO ───────────────────────────────────
function ConvertTo-Ico {
    param([string]$PngPath, [string]$IcoPath)
    $sizes = @(16, 32, 48, 64, 128, 256)
    $pngs = @()
    $src  = [System.Drawing.Image]::FromFile($PngPath)
    foreach ($s in $sizes) {
        $bmp = New-Object System.Drawing.Bitmap $s, $s
        $gg  = [System.Drawing.Graphics]::FromImage($bmp)
        $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gg.DrawImage($src, 0, 0, $s, $s)
        $ms  = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngs += ,@{ size = $s; bytes = $ms.ToArray() }
        $gg.Dispose(); $bmp.Dispose(); $ms.Dispose()
    }
    $src.Dispose()

    $fs = [System.IO.File]::Create($IcoPath)
    $bw = New-Object System.IO.BinaryWriter $fs
    # ICONDIR
    $bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$pngs.Count)
    $offset = 6 + 16 * $pngs.Count
    foreach ($p in $pngs) {
        $w = if ($p.size -ge 256) { 0 } else { $p.size }
        $h = $w
        $bw.Write([Byte]$w); $bw.Write([Byte]$h)
        $bw.Write([Byte]0);  $bw.Write([Byte]0)            # color count, reserved
        $bw.Write([UInt16]1); $bw.Write([UInt16]32)        # planes, bpp
        $bw.Write([UInt32]$p.bytes.Length)
        $bw.Write([UInt32]$offset)
        $offset += $p.bytes.Length
    }
    foreach ($p in $pngs) { $bw.Write($p.bytes) }
    $bw.Close(); $fs.Close()
}

Write-Host "[*] Drawing PNG icon..."
New-BossPng -OutPath $pngPath
Write-Host "[*] Converting to .ico..."
ConvertTo-Ico -PngPath $pngPath -IcoPath $iconPath
Write-Host "    -> $iconPath"

# ── Remove old TheSaaSsin Operator shortcut(s) ─────────────────────
$desktop = [Environment]::GetFolderPath('Desktop')
$oldNames = @('TheSaaSsin Operator.lnk', 'TheSaaSsin-launch.lnk', 'Operator.lnk', 'TheSaaSsin.lnk')
foreach ($n in $oldNames) {
    $p = Join-Path $desktop $n
    if (Test-Path $p) {
        Remove-Item $p -Force
        Write-Host "[-] removed old shortcut: $n" -ForegroundColor Yellow
    }
}

# ── Create new B.O.S.S desktop shortcut ────────────────────────────
$shortcutPath = Join-Path $desktop 'B.O.S.S.lnk'
$wsh = New-Object -ComObject WScript.Shell
$sc  = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath       = "$env:WINDIR\System32\wscript.exe"
$sc.Arguments        = "`"$launcher`""
$sc.WorkingDirectory = $projectRoot
$sc.IconLocation     = "$iconPath,0"
$sc.Description      = 'B.O.S.S — Business Optimization System Service'
$sc.WindowStyle      = 7   # minimised
$sc.Save()

Write-Host ""
Write-Host "[OK] Desktop shortcut created:" -ForegroundColor Green
Write-Host "     $shortcutPath"
Write-Host "     icon: $iconPath"
Write-Host ""
Write-Host "Double-click 'B.O.S.S' on your desktop to launch." -ForegroundColor Cyan
