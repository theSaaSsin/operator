({
  init() {},
  async render(container) {
    let deals = [];
    try { deals = JSON.parse(localStorage.getItem('deals') || '[]'); } catch {}
    let subscriptions = [];
    try { subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]'); } catch {}
    const now = new Date();
    const thisMonth = deals.filter(d=>{const dt=new Date(d.closedAt||d.createdAt||0);return dt.getMonth()===now.getMonth()&&dt.getFullYear()===now.getFullYear();});
    const totalRevenue = deals.filter(d=>d.stage==='closed_won').reduce((s,d)=>s+(parseFloat(d.value)||0),0);
    const mrr = subscriptions.filter(s=>s.active).reduce((s,sub)=>s+(parseFloat(sub.amount)||0),0);
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">£${totalRevenue.toLocaleString()}</div><div class="mod-stat-label">Total Revenue</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">£${mrr.toLocaleString()}</div><div class="mod-stat-label">MRR</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">£${thisMonth.reduce((s,d)=>s+(parseFloat(d.value)||0),0).toLocaleString()}</div><div class="mod-stat-label">This Month</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${deals.filter(d=>d.stage==='closed_won').length}</div><div class="mod-stat-label">Closed Deals</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-plus"></i> Log Deal / Revenue</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Client Name</label><input id="rv-client" class="mod-input" placeholder="e.g. Jake's Plumbing"/></div>
          <div class="mod-field"><label>Deal Value (£)</label><input id="rv-value" class="mod-input" type="number" placeholder="e.g. 2500"/></div>
          <div class="mod-field"><label>Type</label>
            <select id="rv-type" class="mod-input"><option value="one-time">One-Time</option><option value="monthly">Monthly Retainer</option><option value="upsell">Upsell</option></select>
          </div>
          <div class="mod-field"><label>Stage</label>
            <select id="rv-stage" class="mod-input"><option value="closed_won">Closed Won ✓</option><option value="proposal">Proposal Sent</option><option value="negotiating">Negotiating</option><option value="closed_lost">Closed Lost</option></select>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const clientName=document.getElementById('rv-client').value.trim();
          const value=parseFloat(document.getElementById('rv-value').value)||0;
          const type=document.getElementById('rv-type').value;
          const stage=document.getElementById('rv-stage').value;
          if(!clientName||!value){toast('Enter client and value','err');return;}
          let d=JSON.parse(localStorage.getItem('deals')||'[]');
          d.push({id:Date.now(),clientName,value,type,stage,createdAt:new Date().toISOString(),closedAt:stage==='closed_won'?new Date().toISOString():null});
          localStorage.setItem('deals',JSON.stringify(d));toast('Deal logged','ok');
          if(type==='monthly'&&stage==='closed_won'){
            let s=JSON.parse(localStorage.getItem('subscriptions')||'[]');
            s.push({id:Date.now(),clientName,amount:value,active:true,startedAt:new Date().toISOString()});
            localStorage.setItem('subscriptions',JSON.stringify(s));
          }
        })()"><i class="fas fa-plus"></i> Log Deal</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-receipt"></i> Recent Deals</div>
        ${deals.length ? deals.slice().reverse().slice(0,10).map(d=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><strong>${d.clientName}</strong> <span class="mod-badge ${d.stage==='closed_won'?'badge-ok':d.stage==='closed_lost'?'badge-danger':'badge-warn'}">${d.stage.replace('_',' ')}</span></div>
              <span style="font-weight:700;color:${d.stage==='closed_won'?'#22c55e':d.stage==='closed_lost'?'var(--accent)':'#f59e0b'}">£${parseFloat(d.value||0).toLocaleString()}</span>
            </div>
            <div class="mod-muted" style="font-size:.72rem;margin-top:3px">${d.type} • ${new Date(d.createdAt).toLocaleDateString()}</div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-receipt"></i> No deals logged yet</div>'}
      </div>`;
  }
})