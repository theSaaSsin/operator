({
  init() {},
  async render(container) {
    const modules = await fetch('/api/modules').then(r => r.json()).catch(() => ({ modules: {} }));
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);
    const modList = modules.modules || modules;

    const categories = {
      'Lead Generation': { color: '#3b82f6', icon: 'fa-magnet', ids: [1,2,3,4,5,6,7,8,9,10,11] },
      'Lead Intelligence': { color: '#8b5cf6', icon: 'fa-brain', ids: [12,13,14,15,16] },
      'Outreach': { color: '#06b6d4', icon: 'fa-paper-plane', ids: [17,18,19,20,21] },
      'Sales': { color: '#22c55e', icon: 'fa-handshake', ids: [22,23,24,25,26,27,28,29,30] },
      'Content': { color: '#a855f7', icon: 'fa-pen-fancy', ids: [31,32,33,34,35,36,37,38,39,40] },
      'Automation': { color: '#f59e0b', icon: 'fa-cogs', ids: [41,42,43,44,45,46,47,48,49,50] },
      'Delivery': { color: '#ec4899', icon: 'fa-truck', ids: [51,52,53,54,55,56,57,58,59,60] },
      'Expansion': { color: '#14b8a6', icon: 'fa-rocket', ids: [61,62,63,64,65,66,67,68,69,70] }
    };

    const totalActive = Object.values(modList).filter(m => m.status === 'active' || m.active).length;
    const totalModules = Object.keys(modList).length;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${totalActive}</div><div class="mod-stat-label">Active Modules</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${totalModules}</div><div class="mod-stat-label">Total Modules</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${Object.keys(categories).length}</div><div class="mod-stat-label">Categories</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">System Architecture Overview</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          ${Object.entries(categories).map(([cat, cfg]) => {
            const catMods = cfg.ids.map(id => modList[id]).filter(Boolean);
            const activeInCat = catMods.filter(m => m.status === 'active' || m.active).length;
            return `<div style="background:${cfg.color}0a;border:1px solid ${cfg.color}22;border-radius:8px;padding:12px">
              <div style="text-align:center;margin-bottom:8px">
                <i class="fas ${cfg.icon}" style="color:${cfg.color};font-size:1.2rem"></i>
                <div style="font-size:.75rem;font-weight:700;color:${cfg.color};margin-top:4px">${cat}</div>
                <div style="font-size:.65rem;color:var(--muted)">${activeInCat}/${catMods.length} active</div>
              </div>
              ${catMods.slice(0, 6).map(m => {
                const isActive = m.status === 'active' || m.active;
                return `<div style="font-size:.68rem;padding:3px 6px;margin-bottom:2px;border-radius:4px;background:rgba(255,255,255,.03);color:${isActive ? 'var(--text)' : 'var(--muted)'};display:flex;align-items:center;gap:4px">
                  <div style="width:5px;height:5px;border-radius:50%;background:${isActive ? '#22c55e' : '#555'}"></div>
                  ${m.name || 'Module'}
                </div>`;
              }).join('')}
              ${catMods.length > 6 ? `<div style="font-size:.65rem;color:var(--muted);text-align:center;margin-top:4px">+${catMods.length - 6} more</div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Data Flow</div>
        <div class="mod-card" style="text-align:center;padding:20px">
          <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap">
            ${['Lead Gen', 'Intelligence', 'Outreach', 'Sales', 'Delivery'].map((step, i) => `
              <div style="display:flex;align-items:center;gap:12px">
                <div style="background:rgba(255,255,255,.06);padding:10px 16px;border-radius:8px">
                  <div style="font-size:.78rem;font-weight:600;color:var(--text)">${step}</div>
                </div>
                ${i < 4 ? '<i class="fas fa-arrow-right" style="color:var(--muted)"></i>' : ''}
              </div>
            `).join('')}
          </div>
          <div style="margin-top:12px;font-size:.7rem;color:var(--muted)">Content & Automation run in parallel across all stages</div>
        </div>
      </div>`;
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 52 — System Overview Visual</p>
      <p style="font-size:.75rem;color:var(--muted)">Auto-generated visual of all modules organized by category. Shows active/inactive status and data flow through the system.</p>`;
  }
})
