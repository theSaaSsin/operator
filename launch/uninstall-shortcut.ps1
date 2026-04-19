# Removes B.O.S.S desktop shortcut + cached icon files.
$desktop = [Environment]::GetFolderPath('Desktop')
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$lnk = Join-Path $desktop 'B.O.S.S.lnk'
if (Test-Path $lnk) { Remove-Item $lnk -Force; Write-Host "removed $lnk" }
foreach ($f in @('boss.ico','boss.png')) {
    $p = Join-Path $projectRoot "launch\$f"
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "removed $p" }
}
Write-Host "Done."
