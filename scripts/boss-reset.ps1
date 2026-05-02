# boss-reset.ps1 — restart B.O.S.S with full context in minimum tokens
# Usage: powershell -ExecutionPolicy Bypass -File scripts\boss-reset.ps1

$CTX = @"
## B.O.S.S CONTEXT RESET
Project: TheSaaSsin Operator · C:\Users\joshu
Stack: Node.js/Express server.js port 4000 · Vanilla JS · Three.js r128 · Supabase target
Brand: #0a0a0f bg · #ff2a2a red · #f0f0f5 white · #6b6b80 grey
Key files:
  server.js          — Express server + all API routes
  public/operator.html — main UI (panels, nav, chat)
  public/boss.js     — chat engine, slash commands, orchestration UI
  public/offaxis.html — off-axis 3D viewer (MediaPipe face tracking)
  ai/router.js       — LLM router: Groq→OpenRouter→Ollama→Claude
  data/config.json   — API keys (gitignored)
  memory/AGENTS.md   — 8 personalised agents
  .mcp.json          — Playwright MCP config

AI routing (free-first):
  1. Groq (free) — llama-3.3-70b  → set groqApiKey in /config
  2. OpenRouter (free models)      → set openrouterApiKey in /config
  3. Ollama (local)                → run ollama serve
  4. Claude (paid backup only)     → anthropicApiKey has £0 balance

Current session goal: ship everything working, then get first paying client.
Run: cd C:\Users\joshu && node server.js
"@

Write-Host $CTX -ForegroundColor Cyan
Write-Host ""
Write-Host "Server status:" -ForegroundColor Yellow
try {
  $r = Invoke-WebRequest -Uri http://localhost:4000/api/boss/router -UseBasicParsing -TimeoutSec 3
  $j = $r.Content | ConvertFrom-Json
  Write-Host "  groq=$($j.groq) openrouter=$($j.openrouter) anthropic=$($j.anthropic) ollama=$($j.ollama.running)" -ForegroundColor Green
} catch {
  Write-Host "  Server offline — restarting..." -ForegroundColor Red
  Start-Process -FilePath node -ArgumentList "server.js" -WorkingDirectory "C:\Users\joshu" -WindowStyle Hidden
  Start-Sleep 2
}

Write-Host ""
Write-Host "Opening B.O.S.S at http://localhost:4000" -ForegroundColor Cyan
Start-Process "http://localhost:4000"
