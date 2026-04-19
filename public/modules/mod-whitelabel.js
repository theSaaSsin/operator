({
  init() {},
  async render(container) {
    let whitelabelConfigs = [];
    try { whitelabelConfigs = JSON.parse(localStorage.getItem('whitelabelConfigs') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${whitelabelConfigs.length}</div><div class="mod-stat-label">White-Label Configs</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Create White-Label Config</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client</label>
              <select id="wl-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select —</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Brand Name</label>
              <input type="text" id="wl-brand" placeholder="Client's brand name" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Primary Color</label>
              <div style="display:flex;gap:6px;align-items:center">
                <input type="color" id="wl-primary" value="#6366f1" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:transparent">
                <input type="text" id="wl-primary-hex" value="#6366f1" style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.78rem;font-family:inherit" oninput="document.getElementById('wl-primary').value=this.value">
              </div>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Secondary Color</label>
              <div style="display:flex;gap:6px;align-items:center">
                <input type="color" id="wl-secondary" value="#22c55e" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:transparent">
                <input type="text" id="wl-secondary-hex" value="#22c55e" style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.78rem;font-family:inherit" oninput="document.getElementById('wl-secondary').value=this.value">
              </div>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Background</label>
              <div style="display:flex;gap:6px;align-items:center">
                <input type="color" id="wl-bg" value="#0a0a12" style="width:36px;height:36px;border:none;border-radius:6px;cursor:pointer;background:transparent">
                <input type="text" id="wl-bg-hex" value="#0a0a12" style="flex:1;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.78rem;font-family:inherit" oninput="document.getElementById('wl-bg').value=this.value">
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Logo URL</label>
              <input type="url" id="wl-logo" placeholder="https://..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Custom Domain</label>
              <input type="text" id="wl-domain" placeholder="app.clientbrand.com" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_saveWhitelabel()"><i class="fas fa-save"></i> Save Config</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Saved Configs (${whitelabelConfigs.length})</div>
        ${whitelabelConfigs.length ? whitelabelConfigs.map((wl, i) => `
          <div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div>
                <strong style="font-size:.85rem">${wl.brand || wl.client}</strong>
                <span style="font-size:.7rem;color:var(--muted);margin-left:8px">→ ${wl.client}</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="_deleteWhitelabel(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
            </div>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
              <div style="display:flex;gap:4px;align-items:center">
                <div style="width:28px;height:28px;border-radius:6px;background:${wl.primary || '#6366f1'}"></div>
                <div style="width:28px;height:28px;border-radius:6px;background:${wl.secondary || '#22c55e'}"></div>
                <div style="width:28px;height:28px;border-radius:6px;background:${wl.bg || '#0a0a12'};border:1px solid var(--border)"></div>
              </div>
              ${wl.logo ? `<img src="${wl.logo}" style="height:28px;border-radius:4px" onerror="this.style.display='none'">` : ''}
              ${wl.domain ? `<span style="font-size:.72rem;color:var(--accent)">${wl.domain}</span>` : ''}
            </div>
            <div style="background:${wl.bg || '#0a0a12'};border-radius:8px;padding:12px;border:1px solid ${wl.primary || '#6366f1'}33">
              <div style="font-size:.8rem;font-weight:700;color:${wl.primary || '#6366f1'}">${wl.brand || wl.client}</div>
              <div style="font-size:.7rem;color:${wl.secondary || '#22c55e'};margin-top:4px">Preview — Client-facing dashboard</div>
            </div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-paint-roller"></i>No white-label configs yet — create one for a client above</div>'}
      </div>`;

    window._saveWhitelabel = function() {
      const client = document.getElementById('wl-client').value;
      if (!client) return toast('Select a client', 'err');
      whitelabelConfigs.unshift({
        client,
        brand: document.getElementById('wl-brand').value.trim() || client,
        primary: document.getElementById('wl-primary').value,
        secondary: document.getElementById('wl-secondary').value,
        bg: document.getElementById('wl-bg').value,
        logo: document.getElementById('wl-logo').value.trim(),
        domain: document.getElementById('wl-domain').value.trim(),
        created: new Date().toISOString()
      });
      localStorage.setItem('whitelabelConfigs', JSON.stringify(whitelabelConfigs));
      toast('White-label config saved', 'ok');
      refreshCurrentModule();
    };
    window._deleteWhitelabel = function(i) { whitelabelConfigs.splice(i, 1); localStorage.setItem('whitelabelConfigs', JSON.stringify(whitelabelConfigs)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 60 — White-Label Option</p>
      <p style="font-size:.75rem;color:var(--muted)">Custom branding per client — set colors, logo, brand name, and custom domain. Applies to client-facing dashboards.</p>`;
  }
})
