({
  init() {},
  async render(container) {
    const [clients, leads, outreach] = await Promise.all([
      fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]})),
      fetch('/api/leads').then(r=>r.json()).catch(()=>({leads:[]})),
      fetch('/api/outreach').then(r=>r.json()).catch(()=>({queue:[]}))
    ]);
    let deals = [];
    try { deals = JSON.parse(localStorage.getItem('deals') || '[]'); } catch {}
    const closedDeals = deals.filter(d=>d.stage==='closed_won');
    const totalRevenue = closedDeals.reduce((s,d)=>s+(parseFloat(d.value)||0),0);
    const convRate = leads.leads?.length ? Math.round((closedDeals.length/leads.leads.length)*100) : 0;
    const avgDeal = closedDeals.length ? Math.round(totalRevenue/closedDeals.length) : 0;
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">£${totalRevenue.toLocaleString()}</div><div class="mod-stat-label">Total Revenue</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${closedDeals.length}</div><div class="mod-stat-label">Closed Deals</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${convRate}%</div><div class="mod-stat-label">Conversion Rate</div></div>
        <div class="mod-stat"><div class="mod-stat-val">£${avgDeal.toLocaleString()}</div><div class="mod-stat-label">Avg Deal Value</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(clients.clients||[]).length}</div><div class="mod-stat-label">Active Clients</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(leads.leads||[]).length}</div><div class="mod-stat-label">Total Leads</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-chart-line"></i> Pipeline Performance</div>
        <div class="mod-kpi-grid">
          ${[
            {label:'Leads → Contacted',val:`${(outreach.queue||[]).length} / ${(leads.leads||[]).length}`,color:'#f59e0b'},
            {label:'Contacted → Proposal',val:`${deals.filter(d=>['proposal','closed_won','closed_lost'].includes(d.stage)).length}`,color:'#22c55e'},
            {label:'Proposal → Close',val:`${closedDeals.length}`,color:'var(--accent)'},
            {label:'Outreach Sent',val:`${(outreach.queue||[]).filter(q=>q.status==='sent').length}`,color:'#6b6b80'},
          ].map(k=>`<div class="mod-kpi-card"><div style="font-size:1.4rem;font-weight:900;color:${k.color}">${k.val}</div><div class="mod-muted" style="font-size:.72rem;margin-top:4px">${k.label}</div></div>`).join('')}
        </div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-trophy"></i> Top Closed Deals</div>
        ${closedDeals.length ? closedDeals.sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,5).map(d=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between">
              <strong>${d.clientName||d.name||'Deal'}</strong>
              <span style="color:#22c55e;font-weight:700">£${parseFloat(d.value||0).toLocaleString()}</span>
            </div>
            ${d.closedAt?`<div class="mod-muted" style="font-size:.72rem;margin-top:3px">Closed ${new Date(d.closedAt).toLocaleDateString()}</div>`:''}
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-trophy"></i> No closed deals yet — keep pushing</div>'}
      </div>`;
  }
})