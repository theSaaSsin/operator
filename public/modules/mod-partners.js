({
  init() {},
  async render(container) {
    let partners = [];
    try { partners = JSON.parse(localStorage.getItem('partners') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${partners.length}</div><div class="mod-stat-label">Partners</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${partners.filter(p=>p.status==='active').length}</div><div class="mod-stat-label">Active</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${partners.reduce((s,p)=>s+(p.referrals||0),0)}</div><div class="mod-stat-label">Total Referrals</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-handshake"></i> Add Partner</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Partner Name</label><input id="pm-name" class="mod-input" placeholder="e.g. Jake M. — Marketing Agency"/></div>
          <div class="mod-field"><label>Type</label>
            <select id="pm-type" class="mod-input"><option>Referral Partner</option><option>White-Label Reseller</option><option>Agency Partner</option><option>Strategic Ally</option></select>
          </div>
          <div class="mod-field"><label>Commission %</label><input id="pm-comm" class="mod-input" type="number" placeholder="e.g. 20" min="0" max="100"/></div>
          <div class="mod-field"><label>Contact / Email</label><input id="pm-email" class="mod-input" placeholder="partner@email.com"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('pm-name').value.trim();
          const type=document.getElementById('pm-type').value;
          const comm=document.getElementById('pm-comm').value;
          const email=document.getElementById('pm-email').value.trim();
          if(!name){toast('Enter partner name','err');return;}
          let p=JSON.parse(localStorage.getItem('partners')||'[]');
          p.push({id:Date.now(),name,type,commission:parseInt(comm)||0,email,status:'active',referrals:0,revenue:0,addedAt:new Date().toISOString()});
          localStorage.setItem('partners',JSON.stringify(p));toast('Partner added','ok');
        })()"><i class="fas fa-plus"></i> Add Partner</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-network-wired"></i> Partner Network</div>
        ${partners.length ? partners.map(p=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><strong>${p.name}</strong> <span class="mod-badge badge-muted">${p.type}</span></div>
              <span style="color:#22c55e;font-weight:700">${p.commission}% comm.</span>
            </div>
            <div class="mod-muted" style="font-size:.72rem;margin-top:3px">${p.email||''} • ${p.referrals||0} referrals • £${(p.revenue||0).toLocaleString()} generated</div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-handshake"></i> No partners yet — build your network</div>'}
      </div>`;
  }
})