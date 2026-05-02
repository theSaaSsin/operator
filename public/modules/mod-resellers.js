({
  init() {},
  async render(container) {
    let resellers = [];
    try { resellers = JSON.parse(localStorage.getItem('resellers') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${resellers.length}</div><div class="mod-stat-label">Resellers</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${resellers.reduce((s,r)=>s+(r.clients||0),0)}</div><div class="mod-stat-label">Sub-Clients</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">£${resellers.reduce((s,r)=>s+(r.mrr||0),0).toLocaleString()}</div><div class="mod-stat-label">MRR</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-store"></i> Add Reseller</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Reseller Name / Agency</label><input id="rs-name" class="mod-input" placeholder="e.g. Apex Marketing Agency"/></div>
          <div class="mod-field"><label>Wholesale Price (£/mo)</label><input id="rs-price" class="mod-input" type="number" placeholder="e.g. 497"/></div>
          <div class="mod-field"><label>Max Client Seats</label><input id="rs-seats" class="mod-input" type="number" placeholder="e.g. 10"/></div>
          <div class="mod-field"><label>Contact Email</label><input id="rs-email" class="mod-input" placeholder="agency@email.com"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('rs-name').value.trim();
          const price=parseFloat(document.getElementById('rs-price').value)||0;
          const seats=parseInt(document.getElementById('rs-seats').value)||0;
          const email=document.getElementById('rs-email').value.trim();
          if(!name){toast('Enter reseller name','err');return;}
          let r=JSON.parse(localStorage.getItem('resellers')||'[]');
          r.push({id:Date.now(),name,price,seats,email,clients:0,mrr:price,status:'active',addedAt:new Date().toISOString()});
          localStorage.setItem('resellers',JSON.stringify(r));toast('Reseller added','ok');
        })()"><i class="fas fa-plus"></i> Add Reseller</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-users-gear"></i> Reseller Accounts</div>
        ${resellers.length ? resellers.map(r=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong>${r.name}</strong>
              <span style="color:#22c55e;font-weight:700">£${(r.mrr||0).toLocaleString()}/mo</span>
            </div>
            <div class="mod-muted" style="font-size:.72rem;margin-top:3px">${r.clients||0}/${r.seats||0} seats • ${r.email||''}</div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-store"></i> No resellers yet</div>'}
      </div>`;
  }
})