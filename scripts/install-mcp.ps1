# TheSaaSsin — Install MCP Servers
# Run: powershell -ExecutionPolicy Bypass -File scripts\install-mcp.ps1

Write-Host "Installing Playwright MCP..." -ForegroundColor Cyan
npx playwright install chromium 2>&1

Write-Host ""
Write-Host "MCP servers configured in .mcp.json" -ForegroundColor Green
Write-Host "Restart Claude Code to pick them up." -ForegroundColor Yellow
