({
  init() {},
  render(container) {
    let affiliates = [];
    try { affiliates = JSON.parse(localStorage.getItem('affiliates') || '[]'); } catch {}
    const totalPaid = affiliates.reduce((s,a)=>s+(a.paid||0),0);
    const totalEarned = affiliates.reduce((s,a)=>s+(a.earned||0),0);
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${affiliates.length}</div><div class="mod-stat-label">Affiliates</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">£${totalEarned.toLocaleString()}</div><div class="mod-stat-label">Total Earned</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">£${totalPaid.toLocaleString()}</div><div class="mod-stat-label">Paid Out</div></div>
        <div class="mod-stat"><div class="mod-stat-val">£${(totalEarned-totalPaid).toLocaleString()}</div><div class="mod-stat-label">Outstanding</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-people-arrows"></i> Add Affiliate</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Affiliate Name</label><input id="af-name" class="mod-input" placeholder="e.g. Sarah — Content Creator"/></div>
          <div class="mod-field"><label>Commission Rate</label>
            <select id="af-rate" class="mod-input"><option value="10">10%</option><option value="15">15%</option><option value="20" selected>20%</option><option value="25">25%</option><option value="30">30%</option></select>
          </div>
          <div class="mod-field"><label>Contact / PayPal</label><input id="af-contact" class="mod-input" placeholder="email or PayPal address"/></div>
          <div class="mod-field"><label>Referral Code</label><input id="af-code" class="mod-input" placeholder="e.g. SARAH20 (auto-generates if blank)"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('af-name').value.trim();
          const rate=parseInt(document.getElementById('af-rate').value)||20;
          const contact=document.getElementById('af-contact').value.trim();
          let code=document.getElementById('af-code').value.trim().toUpperCase();
          if(!name){toast('Enter affiliate name','err');return;}
          if(!code)code=name.split(' ')[0].toUpperCase()+(Math.random()*90+10|0);
          let a=JSON.parse(localStorage.getItem('affiliates')||'[]');
          a.push({id:Date.now(),name,rate,contact,code,referrals:0,earned:0,paid:0,active:true,addedAt:new Date().toISOString()});
          localStorage.setItem('affiliates',JSON.stringify(a));toast('Affiliate added — code: '+code,'ok');
        })()"><i class="fas fa-plus"></i> Add Affiliate</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-list"></i> Affiliate Roster</div>
        ${affiliates.length ? affiliates.map(a=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><strong>${a.name}</strong> <code style="font-size:.75rem;background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px">${a.code}</code></div>
              <span style="color:#22c55e;font-weight:700">${a.rate}%</span>
            </div>
            <div class="mod-muted" style="font-size:.72rem;margin-top:3px">${a.referrals||0} referrals • £${(a.earned||0).toLocaleString()} earned • £${(a.paid||0).toLocaleString()} paid</div>
            <button class="mod-btn mod-btn-sm" style="margin-top:6px" onclick="(function(){
              let arr=JSON.parse(localStorage.getItem('affiliates')||'[]');
              arr=arr.map(x=>{if(x.id===${a.id}){const amt=parseFloat(prompt('Amount earned (£):',0)||0);return{...x,earned:(x.earned||0)+amt,referrals:(x.referrals||0)+1};}return x;});
              localStorage.setItem('affiliates',JSON.stringify(arr));toast('Referral logged','ok');
            })()"><i class="fas fa-plus"></i> Log Referral</button>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-people-arrows"></i> No affiliates yet</div>'}
      </div>`;
  }
})