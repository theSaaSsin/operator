({
  init() {},
  async render(container) {
    let apiKeys = [];
    try { apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '[]'); } catch {}
    let apiLog = [];
    try { apiLog = JSON.parse(localStorage.getItem('apiLog') || '[]'); } catch {}

    const activeKeys = apiKeys.filter(k => k.active).length;
    const totalRequests = apiLog.length;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${apiKeys.length}</div><div class="mod-stat-label">API Keys</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${activeKeys}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${totalRequests}</div><div class="mod-stat-label">Requests Logged</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Generate API Key</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Label</label>
              <input type="text" id="ak-label" placeholder="e.g. Client App" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Rate Limit (req/min)</label>
              <input type="number" id="ak-rate" value="60" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Permissions</label>
              <select id="ak-perms" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="read">Read Only</option>
                <option value="read_write">Read & Write</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_generateKey()"><i class="fas fa-key"></i> Generate Key</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">API Keys (${apiKeys.length})</div>
        ${apiKeys.length ? apiKeys.map((k, i) => `
          <div class="mod-card" style="margin-bottom:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div>
                <strong style="font-size:.82rem">${k.label}</strong>
                <span style="font-size:.68rem;color:var(--muted);margin-left:8px">${k.permissions} · ${k.rateLimit} req/min</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm ${k.active ? 'btn-primary' : 'btn-secondary'}" onclick="_toggleKey(${i})">${k.active ? 'Active' : 'Disabled'}</button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteKey(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center">
              <code style="flex:1;background:rgba(255,255,255,.06);padding:6px 10px;border-radius:6px;font-size:.72rem;color:var(--text);word-break:break-all">${k.key}</code>
              <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${k.key}');toast('Key copied','ok')"><i class="fas fa-copy"></i></button>
            </div>
            <div style="font-size:.65rem;color:var(--muted);margin-top:4px">Created ${new Date(k.created).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-key"></i>No API keys yet — generate one above</div>'}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">API Documentation</div>
        <div class="mod-card">
          <div style="font-size:.78rem;color:var(--text);margin-bottom:8px"><strong>Base URL:</strong> <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px">${location.origin}/api</code></div>
          <div style="font-size:.78rem;color:var(--muted);margin-bottom:8px">Include your API key in the <code>X-API-Key</code> header.</div>
          <table class="mod-table"><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead><tbody>
            <tr><td style="color:#22c55e">GET</td><td><code>/api/leads</code></td><td>List all leads</td></tr>
            <tr><td style="color:#22c55e">GET</td><td><code>/api/clients</code></td><td>List all clients</td></tr>
            <tr><td style="color:#22c55e">GET</td><td><code>/api/outreach</code></td><td>Outreach queue</td></tr>
            <tr><td style="color:#22c55e">GET</td><td><code>/api/analytics</code></td><td>Analytics data</td></tr>
            <tr><td style="color:#3b82f6">POST</td><td><code>/api/leads</code></td><td>Create a lead</td></tr>
            <tr><td style="color:#3b82f6">POST</td><td><code>/api/clients</code></td><td>Create a client</td></tr>
            <tr><td style="color:#3b82f6">POST</td><td><code>/api/webhook</code></td><td>Incoming webhook</td></tr>
            <tr><td style="color:#f59e0b">PATCH</td><td><code>/api/leads</code></td><td>Update a lead</td></tr>
            <tr><td style="color:#f59e0b">PATCH</td><td><code>/api/clients</code></td><td>Update a client</td></tr>
          </tbody></table>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Recent API Requests (${apiLog.length})</div>
        ${apiLog.length ? `<table class="mod-table"><thead><tr><th>Key</th><th>Method</th><th>Endpoint</th><th>Status</th><th>Time</th></tr></thead><tbody>
          ${apiLog.slice(0, 15).map(l => `<tr>
            <td style="font-size:.7rem">${l.keyLabel || '—'}</td>
            <td style="font-size:.7rem;color:${l.method === 'GET' ? '#22c55e' : '#3b82f6'}">${l.method}</td>
            <td style="font-size:.7rem"><code>${l.endpoint}</code></td>
            <td style="font-size:.7rem;color:${l.status < 400 ? '#22c55e' : '#ef4444'}">${l.status}</td>
            <td style="font-size:.68rem;color:var(--muted)">${l.time ? new Date(l.time).toLocaleTimeString('en-GB') : ''}</td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-server"></i>No API activity yet</div>'}
      </div>`;

    window._generateKey = function() {
      const label = document.getElementById('ak-label').value.trim();
      if (!label) return toast('Enter a label', 'err');
      const key = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
      apiKeys.push({
        label, key,
        rateLimit: parseInt(document.getElementById('ak-rate').value) || 60,
        permissions: document.getElementById('ak-perms').value,
        active: true, created: new Date().toISOString()
      });
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
      toast('API key generated — copy it now', 'ok');
      refreshCurrentModule();
    };
    window._toggleKey = function(i) { apiKeys[i].active = !apiKeys[i].active; localStorage.setItem('apiKeys', JSON.stringify(apiKeys)); refreshCurrentModule(); };
    window._deleteKey = function(i) { apiKeys.splice(i, 1); localStorage.setItem('apiKeys', JSON.stringify(apiKeys)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 64 — API Access Layer</p>
      <p style="font-size:.75rem;color:var(--muted)">Generate API keys with rate limiting and permissions. Includes auto-generated API documentation for external developers.</p>`;
  }
})
