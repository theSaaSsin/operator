({
  init() {},
  async render(container) {
    let funnels = [];
    try { funnels = JSON.parse(localStorage.getItem('funnels') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);

    const activeCount = funnels.filter(f => f.active).length;
    const totalSteps = funnels.reduce((s, f) => s + (f.stages || []).length, 0);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${funnels.length}</div><div class="mod-stat-label">Total Funnels</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${activeCount}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${totalSteps}</div><div class="mod-stat-label">Total Stages</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
          Create New Funnel
          <button class="btn btn-primary btn-sm" onclick="_addFunnel()"><i class="fas fa-plus"></i> Create</button>
        </div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Funnel Name</label>
              <input type="text" id="fn-name" placeholder="e.g. Web Design Lead Funnel" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client (optional)</label>
              <select id="fn-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— None —</option>
                ${clients.map(c => `<option value="${c.id || c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div>
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Stages (comma-separated)</label>
            <input type="text" id="fn-stages" value="Landing Page, Lead Form, Offer Page, Booking" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Your Funnels (${funnels.length})</div>
        ${funnels.length ? funnels.map((f, i) => `
          <div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div>
                <strong style="font-size:.88rem">${f.name}</strong>
                ${f.client ? `<span style="font-size:.7rem;color:var(--muted);margin-left:8px">Client: ${f.client}</span>` : ''}
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm ${f.active ? 'btn-primary' : 'btn-secondary'}" onclick="_toggleFunnel(${i})">${f.active ? '<i class="fas fa-check"></i> Active' : 'Inactive'}</button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteFunnel(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
              ${(f.stages || []).map((s, si) => `<div style="display:flex;align-items:center;gap:4px">
                <div style="background:rgba(255,255,255,.06);padding:4px 10px;border-radius:6px;font-size:.75rem;color:var(--text)">${s}</div>
                ${si < f.stages.length - 1 ? '<i class="fas fa-arrow-right" style="font-size:.6rem;color:var(--muted)"></i>' : ''}
              </div>`).join('')}
            </div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:6px">Created ${new Date(f.created).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-filter"></i>No funnels yet — create your first funnel above</div>'}
      </div>`;

    window._addFunnel = function() {
      const name = document.getElementById('fn-name').value.trim();
      if (!name) return toast('Enter a funnel name', 'err');
      const stages = document.getElementById('fn-stages').value.split(',').map(s => s.trim()).filter(Boolean);
      if (!stages.length) return toast('Add at least one stage', 'err');
      const client = document.getElementById('fn-client').value;
      funnels.push({ name, client, stages, active: true, created: new Date().toISOString() });
      localStorage.setItem('funnels', JSON.stringify(funnels));
      toast('Funnel created', 'ok');
      refreshCurrentModule();
    };
    window._toggleFunnel = function(i) {
      funnels[i].active = !funnels[i].active;
      localStorage.setItem('funnels', JSON.stringify(funnels));
      refreshCurrentModule();
    };
    window._deleteFunnel = function(i) {
      funnels.splice(i, 1);
      localStorage.setItem('funnels', JSON.stringify(funnels));
      toast('Funnel deleted', 'ok');
      refreshCurrentModule();
    };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 22 — Funnel Builder</p>
      <p style="font-size:.75rem;color:var(--muted)">Build multi-step funnels with customizable stages. Assign funnels to clients and toggle them active/inactive.</p>
      <p style="font-size:.72rem;color:var(--muted);margin-top:12px;opacity:.6">Funnels are stored locally. Connect to the Booking module for calendar integration at the final stage.</p>`;
  }
})
