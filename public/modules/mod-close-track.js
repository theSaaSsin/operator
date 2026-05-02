({
  init() {},
  async render(container) {
    let deals = [];
    try { deals = JSON.parse(localStorage.getItem('deals') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).then(d => Array.isArray(d) ? d : (d.clients || [])).catch(() => []);

    const stages = ['proposal_sent', 'negotiation', 'closed_won', 'closed_lost'];
    const stageLabels = { proposal_sent: 'Proposal Sent', negotiation: 'Negotiation', closed_won: 'Closed Won', closed_lost: 'Closed Lost' };
    const stageColors = { proposal_sent: '#3b82f6', negotiation: '#f59e0b', closed_won: '#22c55e', closed_lost: '#ef4444' };
    const stageCounts = {};
    stages.forEach(s => stageCounts[s] = deals.filter(d => d.stage === s).length);

    const totalRevenue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    const pipelineValue = deals.filter(d => d.stage !== 'closed_lost').reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    const winRate = deals.length ? Math.round((stageCounts.closed_won / deals.length) * 100) : 0;

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">$${totalRevenue.toLocaleString()}</div><div class="mod-stat-label">Revenue Won</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">$${pipelineValue.toLocaleString()}</div><div class="mod-stat-label">Pipeline Value</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${deals.length}</div><div class="mod-stat-label">Total Deals</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${winRate}%</div><div class="mod-stat-label">Win Rate</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Add Deal</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client</label>
              <select id="ct-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— Select —</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Deal Value ($)</label>
              <input type="number" id="ct-value" placeholder="2500" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Description</label>
              <input type="text" id="ct-desc" placeholder="Web design package" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_addDeal()"><i class="fas fa-plus"></i> Add Deal</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Pipeline</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          ${stages.map(s => `<div style="background:${stageColors[s]}11;border:1px solid ${stageColors[s]}33;border-radius:8px;padding:10px;min-height:200px">
            <div style="font-size:.75rem;font-weight:700;color:${stageColors[s]};margin-bottom:8px;text-align:center">${stageLabels[s]} (${stageCounts[s]})</div>
            ${deals.filter(d => d.stage === s).map((d, di) => {
              const idx = deals.indexOf(d);
              return `<div style="background:rgba(0,0,0,.3);border-radius:6px;padding:8px;margin-bottom:6px;font-size:.75rem">
                <div style="font-weight:600;color:var(--text)">${d.client}</div>
                <div style="color:${stageColors[s]};font-weight:700">$${(parseFloat(d.value)||0).toLocaleString()}</div>
                <div style="color:var(--muted);font-size:.7rem">${d.desc || ''}</div>
                <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">
                  ${stages.filter(st => st !== s).map(st => `<button class="btn btn-secondary btn-sm" style="font-size:.6rem;padding:2px 6px" onclick="_moveDeal(${idx},'${st}')">${stageLabels[st].split(' ').pop()}</button>`).join('')}
                  <button class="btn btn-secondary btn-sm" style="font-size:.6rem;padding:2px 6px;color:#ef4444" onclick="_deleteDeal(${idx})"><i class="fas fa-trash"></i></button>
                </div>
              </div>`;
            }).join('')}
          </div>`).join('')}
        </div>
      </div>`;

    window._addDeal = function() {
      const client = document.getElementById('ct-client').value;
      const value = document.getElementById('ct-value').value;
      if (!client) return toast('Select a client', 'err');
      deals.unshift({ client, value: value || '0', desc: document.getElementById('ct-desc').value.trim(), stage: 'proposal_sent', created: new Date().toISOString() });
      localStorage.setItem('deals', JSON.stringify(deals));
      toast('Deal added', 'ok');
      refreshCurrentModule();
    };
    window._moveDeal = function(i, s) { deals[i].stage = s; deals[i].stageUpdated = new Date().toISOString(); localStorage.setItem('deals', JSON.stringify(deals)); refreshCurrentModule(); };
    window._deleteDeal = function(i) { deals.splice(i, 1); localStorage.setItem('deals', JSON.stringify(deals)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 30 — Close Tracking</p>
      <p style="font-size:.75rem;color:var(--muted)">Track deals through your sales pipeline from proposal to close. Monitor revenue, pipeline value, and win rate.</p>`;
  }
})
