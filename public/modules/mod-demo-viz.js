({
  init() {},
  async render(container) {
    const modules = await fetch('/api/modules').then(r => r.json()).catch(() => ({ modules: {} }));
    const clients = await fetch('/api/clients').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.clients || [])).catch(() => []);
    const modList = modules.modules || modules;
    const activeModules = Object.entries(modList).filter(([, v]) => v.status === 'active' || v.active);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${activeModules.length}</div><div class="mod-stat-label">Active Modules</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${Object.keys(modList).length}</div><div class="mod-stat-label">Total Modules</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Client System Selector</div>
        <div class="mod-card">
          <div style="display:flex;gap:8px;align-items:flex-end">
            <div style="flex:1">
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Select Client to Visualize</label>
              <select id="dv-client" onchange="_renderFlow()" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="_default">Default System (All Active Modules)</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}${c.niche ? ' — '+c.niche : ''}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">System Flow Diagram</div>
        <div id="dv-flow" style="background:rgba(255,255,255,.02);border-radius:8px;padding:20px;min-height:300px;overflow-x:auto"></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Module List</div>
        <div id="dv-modlist"></div>
      </div>`;

    const phases = [
      { name: 'Acquisition', color: '#3b82f6', ids: [12,13,17,18,19,20] },
      { name: 'Sales', color: '#22c55e', ids: [22,23,24,25,30] },
      { name: 'Content', color: '#a855f7', ids: [31,34,35,37,40] },
      { name: 'Automation', color: '#f59e0b', ids: [41,42,43,44,45] },
      { name: 'Delivery', color: '#06b6d4', ids: [51,52,54,56,60] },
      { name: 'Expansion', color: '#ec4899', ids: [64,67,69,70] }
    ];

    window._renderFlow = function() {
      const flowEl = document.getElementById('dv-flow');
      const listEl = document.getElementById('dv-modlist');
      let html = '<div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">';
      let listHtml = '';

      phases.forEach((phase, pi) => {
        const phaseModules = phase.ids.map(id => {
          const m = modList[id];
          return m ? { id, name: m.name || `Module ${id}`, active: m.status === 'active' || m.active } : null;
        }).filter(Boolean);

        html += `<div style="min-width:160px;flex:1">
          <div style="background:${phase.color}22;border:1px solid ${phase.color}44;border-radius:8px;padding:12px">
            <div style="font-size:.78rem;font-weight:700;color:${phase.color};margin-bottom:8px;text-align:center">${phase.name}</div>
            ${phaseModules.map(m => `<div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px 10px;margin-bottom:4px;font-size:.72rem;color:${m.active ? 'var(--text)' : 'var(--muted)'};display:flex;align-items:center;gap:6px">
              <div style="width:6px;height:6px;border-radius:50%;background:${m.active ? '#22c55e' : '#555'}"></div>
              ${m.name}
            </div>`).join('')}
          </div>
          ${pi < phases.length - 1 ? '<div style="text-align:center;padding:8px 0;color:var(--muted);font-size:.8rem"><i class="fas fa-arrow-right"></i></div>' : ''}
        </div>`;

        listHtml += phaseModules.map(m => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.75rem">
          <div style="width:8px;height:8px;border-radius:50%;background:${m.active ? '#22c55e' : '#555'}"></div>
          <span style="color:var(--muted);min-width:30px">#${m.id}</span>
          <span style="color:var(--text)">${m.name}</span>
          <span style="color:${phase.color};font-size:.68rem">${phase.name}</span>
        </div>`).join('');
      });

      html += '</div>';
      flowEl.innerHTML = html;
      listEl.innerHTML = `<div class="mod-card" style="max-height:300px;overflow-y:auto">${listHtml}</div>`;
    };

    _renderFlow();
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 25 — Demo System Visualizer</p>
      <p style="font-size:.75rem;color:var(--muted)">Visual flow diagram showing all active modules organized by phase. Use this to demo the system architecture to clients.</p>`;
  }
})
