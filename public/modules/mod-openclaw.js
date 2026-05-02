({
  init() {},

  async render(container) {
    let clawStatus = { running: false };
    let sessions   = [];
    let history    = [];
    let activeSession = 'main';

    try {
      const r = await fetch('/api/openclaw/status', { signal: AbortSignal.timeout(3000) });
      if (r.ok) clawStatus = await r.json();
    } catch (_) {}

    if (clawStatus.running) {
      try {
        const r = await fetch('/api/openclaw/sessions', { signal: AbortSignal.timeout(3000) });
        if (r.ok) { const d = await r.json(); sessions = d.sessions || []; }
      } catch (_) {}
      try {
        const r = await fetch(`/api/openclaw/history?session=${activeSession}&limit=30`, { signal: AbortSignal.timeout(4000) });
        if (r.ok) { const d = await r.json(); history = d.messages || []; }
      } catch (_) {}
    }

    const isRunning = clawStatus.running;
    const statusColor = isRunning ? '#22c55e' : '#ef4444';
    const statusText  = isRunning ? 'Online' : 'Offline';

    container.innerHTML = `
<style>
  .claw-header { display:flex; align-items:center; gap:14px; padding:16px 20px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:12px; margin-bottom:20px; }
  .claw-logo   { font-size:2rem; line-height:1; }
  .claw-title  { font-size:1.05rem; font-weight:800; }
  .claw-sub    { font-size:.72rem; color:var(--muted); margin-top:2px; }
  .claw-badge  { margin-left:auto; display:flex; align-items:center; gap:6px; font-size:.78rem; font-weight:700; padding:5px 12px; border-radius:999px; border:1px solid; }
  .claw-badge.online  { color:#22c55e; border-color:rgba(34,197,94,.3); background:rgba(34,197,94,.08); }
  .claw-badge.offline { color:#ef4444; border-color:rgba(239,68,68,.3); background:rgba(239,68,68,.08); }
  .claw-dot    { width:7px; height:7px; border-radius:50%; background:currentColor; }

  .claw-offline-card { text-align:center; padding:40px 24px; background:rgba(255,255,255,.02); border:1px dashed rgba(255,255,255,.1); border-radius:12px; margin-bottom:20px; }
  .claw-offline-icon { font-size:2.5rem; margin-bottom:12px; opacity:.4; }
  .claw-offline-msg  { font-size:.85rem; color:var(--muted); line-height:1.7; }
  .claw-install-steps { text-align:left; margin:16px auto; max-width:360px; }
  .claw-install-step  { display:flex; gap:10px; align-items:flex-start; margin-bottom:10px; font-size:.78rem; }
  .claw-step-num  { width:20px; height:20px; border-radius:50%; background:var(--accent); color:#fff; font-size:.65rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }

  .claw-chat-wrap  { display:flex; flex-direction:column; gap:0; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:12px; overflow:hidden; margin-bottom:20px; }
  .claw-chat-top   { padding:10px 16px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; gap:10px; align-items:center; }
  .claw-sess-select { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:6px; padding:5px 10px; color:var(--text); font-size:.75rem; font-family:inherit; cursor:pointer; }
  .claw-msgs  { height:340px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
  .claw-msg   { max-width:82%; padding:9px 13px; border-radius:10px; font-size:.82rem; line-height:1.55; white-space:pre-wrap; }
  .claw-msg.user     { align-self:flex-end; background:rgba(255,42,42,.15); border:1px solid rgba(255,42,42,.2); }
  .claw-msg.assistant { align-self:flex-start; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); }
  .claw-msg .claw-msg-who { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; opacity:.6; margin-bottom:3px; }
  .claw-input-row { padding:12px 14px; border-top:1px solid rgba(255,255,255,.06); display:flex; gap:10px; }
  .claw-input  { flex:1; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:9px 13px; color:var(--text); font-size:.83rem; font-family:inherit; }
  .claw-input:focus { outline:1px solid var(--accent); }

  .claw-delegate-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:16px; margin-bottom:20px; }
  .claw-quick-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:8px; margin-top:12px; }
  .claw-quick-btn { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:10px 14px; color:var(--text); font-size:.78rem; cursor:pointer; text-align:left; transition:border-color .15s, background .15s; }
  .claw-quick-btn:hover { border-color:rgba(255,42,42,.3); background:rgba(255,42,42,.05); }
  .claw-quick-btn i { display:block; font-size:1.1rem; margin-bottom:5px; color:var(--accent); }
</style>

<!-- HEADER -->
<div class="claw-header">
  <div class="claw-logo">🦞</div>
  <div>
    <div class="claw-title">OpenClaw</div>
    <div class="claw-sub">Local AI agent · port 18789</div>
  </div>
  <div class="claw-badge ${isRunning ? 'online' : 'offline'}">
    <span class="claw-dot"></span> ${statusText}
  </div>
  <button class="btn btn-ghost btn-sm" onclick="window._clawRefresh()" style="margin-left:6px"><i class="fas fa-rotate-right"></i></button>
</div>

${!isRunning ? `
<!-- OFFLINE STATE -->
<div class="claw-offline-card">
  <div class="claw-offline-icon">🦞</div>
  <div class="claw-offline-msg">OpenClaw isn't running on port 18789.<br>Install it and BOSS can delegate tasks directly to your local agent.</div>
  <div class="claw-install-steps">
    <div class="claw-install-step"><span class="claw-step-num">1</span><span>Install: <code style="background:rgba(255,255,255,.08);padding:1px 6px;border-radius:4px">npm install -g openclaw</code> or download from <strong>openclaw.ai</strong></span></div>
    <div class="claw-install-step"><span class="claw-step-num">2</span><span>Run: <code style="background:rgba(255,255,255,.08);padding:1px 6px;border-radius:4px">openclaw</code> — it starts on port 18789</span></div>
    <div class="claw-install-step"><span class="claw-step-num">3</span><span>Add your Bearer token in <strong>API Keys → OpenClaw Token</strong> below</span></div>
    <div class="claw-install-step"><span class="claw-step-num">4</span><span>Click refresh above — status turns green</span></div>
  </div>
  <button class="btn btn-primary" onclick="window._clawRefresh()"><i class="fas fa-rotate-right"></i> Check again</button>
</div>
` : `
<!-- CHAT -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-comment-dots" style="margin-right:6px"></i>OpenClaw Chat</div>
  <div class="claw-chat-wrap">
    <div class="claw-chat-top">
      <span style="font-size:.72rem;color:var(--muted)">Session:</span>
      <select class="claw-sess-select" id="claw-session-sel" onchange="window._clawLoadHistory(this.value)">
        <option value="main">main</option>
        ${sessions.filter(s => s !== 'main').map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <button class="btn btn-ghost btn-sm" onclick="window._clawClearChat()" style="margin-left:auto;font-size:.7rem"><i class="fas fa-broom"></i> Clear view</button>
    </div>
    <div class="claw-msgs" id="claw-msgs">
      ${history.length === 0
        ? `<div style="text-align:center;color:var(--muted);font-size:.78rem;padding:20px">No messages yet — send one below</div>`
        : history.map(m => `
          <div class="claw-msg ${m.role}">
            <div class="claw-msg-who">${m.role === 'user' ? 'You' : '🦞 OpenClaw'}</div>
            ${m.content || m.message || ''}
          </div>`).join('')}
    </div>
    <div class="claw-input-row">
      <input id="claw-input" class="claw-input" placeholder="Send a task to OpenClaw..." />
      <button class="btn btn-primary" id="claw-send-btn" onclick="window._clawSend()"><i class="fas fa-paper-plane"></i></button>
    </div>
  </div>
</div>

<!-- QUICK TASKS -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-bolt" style="margin-right:6px"></i>Quick Delegate to OpenClaw</div>
  <div class="claw-delegate-card">
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:4px">Send a preset task to OpenClaw in one click</div>
    <div class="claw-quick-grid">
      <button class="claw-quick-btn" onclick="window._clawDelegate('Scan my inbox and summarise the 5 most important messages I need to act on today')">
        <i class="fas fa-inbox"></i>Summarise inbox
      </button>
      <button class="claw-quick-btn" onclick="window._clawDelegate('Check my calendar for today and tomorrow. What meetings do I have and what should I prep?')">
        <i class="fas fa-calendar-check"></i>Today\'s schedule
      </button>
      <button class="claw-quick-btn" onclick="window._clawDelegate('Search for any messages or posts mentioning our brand or competitors today')">
        <i class="fas fa-magnifying-glass"></i>Brand mentions
      </button>
      <button class="claw-quick-btn" onclick="window._clawDelegate('Draft a follow-up message for any leads I contacted 48+ hours ago with no reply')">
        <i class="fas fa-clock-rotate-left"></i>Follow-up drafts
      </button>
      <button class="claw-quick-btn" onclick="window._clawDelegate('Give me a morning briefing: what happened overnight, what do I need to action first?')">
        <i class="fas fa-sun"></i>Morning briefing
      </button>
      <button class="claw-quick-btn" onclick="window._clawDelegate('Summarise everything I did today into a short end-of-day report')">
        <i class="fas fa-moon"></i>EOD report
      </button>
    </div>
  </div>
</div>
`}

<!-- CONFIG -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-key" style="margin-right:6px"></i>OpenClaw Config</div>
  <div class="mod-card" style="padding:16px">
    <div style="margin-bottom:12px">
      <label style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:6px">Gateway URL</label>
      <input id="claw-url-input" class="vec-add-input" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:9px 12px;color:var(--text);font-size:.82rem;font-family:inherit" value="${'http://localhost:18789'}" placeholder="http://localhost:18789" />
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:6px">Bearer Token</label>
      <input id="claw-token-input" type="password" class="vec-add-input" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:9px 12px;color:var(--text);font-size:.82rem;font-family:inherit" placeholder="Leave blank if no auth set" />
    </div>
    <button class="btn btn-primary" onclick="window._clawSaveConfig()"><i class="fas fa-floppy-disk"></i> Save & Test</button>
    <div id="claw-config-status" style="margin-top:10px;font-size:.75rem;color:var(--muted)"></div>
  </div>
</div>`;

    // ── Refresh ───────────────────────────────────────────────────────────────
    window._clawRefresh = async () => {
      try {
        const r = await fetch('/api/openclaw/status', { signal: AbortSignal.timeout(3000) });
        const d = await r.json();
        if (d.running) { toast('OpenClaw online', 'ok'); location.reload(); }
        else toast('OpenClaw still offline — is it running?', 'error');
      } catch (_) { toast('Cannot reach OpenClaw', 'error'); }
    };

    // ── Load history for a session ────────────────────────────────────────────
    window._clawLoadHistory = async (session) => {
      activeSession = session;
      const box = document.getElementById('claw-msgs');
      if (!box) return;
      box.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:.78rem;padding:20px"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
      try {
        const r = await fetch(`/api/openclaw/history?session=${encodeURIComponent(session)}&limit=30`);
        const d = await r.json();
        const msgs = d.messages || [];
        box.innerHTML = msgs.length === 0
          ? `<div style="text-align:center;color:var(--muted);font-size:.78rem;padding:20px">No messages in this session</div>`
          : msgs.map(m => `<div class="claw-msg ${m.role}"><div class="claw-msg-who">${m.role === 'user' ? 'You' : '🦞 OpenClaw'}</div>${m.content || m.message || ''}</div>`).join('');
        box.scrollTop = box.scrollHeight;
      } catch (_) { box.innerHTML = `<div style="color:#ef4444;padding:16px;font-size:.8rem">Failed to load history</div>`; }
    };

    // ── Send message ──────────────────────────────────────────────────────────
    window._clawSend = async () => {
      const input = document.getElementById('claw-input');
      const msg   = input?.value?.trim();
      if (!msg) return;
      const box = document.getElementById('claw-msgs');
      const btn = document.getElementById('claw-send-btn');
      const sess = document.getElementById('claw-session-sel')?.value || 'main';
      if (box) {
        box.innerHTML += `<div class="claw-msg user"><div class="claw-msg-who">You</div>${msg}</div>`;
        box.innerHTML += `<div class="claw-msg assistant" id="claw-thinking"><div class="claw-msg-who">🦞 OpenClaw</div><i class="fas fa-spinner fa-spin"></i></div>`;
        box.scrollTop = box.scrollHeight;
      }
      if (input) input.value = '';
      if (btn) btn.disabled = true;
      try {
        const r = await fetch('/api/openclaw/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, session: sess }),
        });
        const d = await r.json();
        const thinking = document.getElementById('claw-thinking');
        if (thinking) thinking.outerHTML = `<div class="claw-msg assistant"><div class="claw-msg-who">🦞 OpenClaw</div>${d.content || d.message || d.reply || (d.ok ? 'Done.' : d.error)}</div>`;
        if (box) box.scrollTop = box.scrollHeight;
      } catch (e) {
        const thinking = document.getElementById('claw-thinking');
        if (thinking) thinking.outerHTML = `<div class="claw-msg assistant" style="color:#ef4444"><div class="claw-msg-who">🦞 OpenClaw</div>${e.message}</div>`;
      } finally {
        if (btn) btn.disabled = false;
      }
    };

    // ── Delegate quick task ───────────────────────────────────────────────────
    window._clawDelegate = async (task) => {
      const input = document.getElementById('claw-input');
      if (input) { input.value = task; window._clawSend(); }
    };

    // ── Clear chat view ───────────────────────────────────────────────────────
    window._clawClearChat = () => {
      const box = document.getElementById('claw-msgs');
      if (box) box.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:.78rem;padding:20px">Cleared</div>`;
    };

    // ── Save config ───────────────────────────────────────────────────────────
    window._clawSaveConfig = async () => {
      const url   = document.getElementById('claw-url-input')?.value?.trim() || 'http://localhost:18789';
      const token = document.getElementById('claw-token-input')?.value?.trim() || '';
      const status = document.getElementById('claw-config-status');
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ openclawUrl: url, openclawToken: token }),
        });
        const r = await fetch('/api/openclaw/status', { signal: AbortSignal.timeout(3000) });
        const d = await r.json();
        if (status) status.textContent = d.running ? '✓ Connected to OpenClaw' : '✗ Saved but OpenClaw is offline';
        if (status) status.style.color = d.running ? '#22c55e' : '#f59e0b';
        toast('OpenClaw config saved', 'ok');
      } catch (e) {
        if (status) { status.textContent = '✗ ' + e.message; status.style.color = '#ef4444'; }
      }
    };

    // ── Enter key ─────────────────────────────────────────────────────────────
    document.getElementById('claw-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window._clawSend(); }
    });
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">OpenClaw Agent</p>
      <p style="font-size:.75rem;color:var(--muted);line-height:1.6">
        OpenClaw is your local AI agent — runs 24/7, connects to your files, email, and messaging apps.
        BOSS delegates complex background tasks to it via the Gateway API on port 18789.
      </p>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
        <a href="https://openclaw.ai" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:8px;justify-content:flex-start">
          <i class="fas fa-arrow-up-right-from-square"></i> openclaw.ai
        </a>
        <a href="https://docs.openclaw.ai" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="width:100%;justify-content:flex-start">
          <i class="fas fa-book"></i> Documentation
        </a>
      </div>`;
  },
})
