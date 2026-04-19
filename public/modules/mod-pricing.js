({
  init() {},
  async render(container) {
    let tiers = [];
    try { tiers = JSON.parse(localStorage.getItem('pricingTiers') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${tiers.length}</div><div class="mod-stat-label">Pricing Tiers</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${tiers.filter(t=>t.type==='monthly').length}</div><div class="mod-stat-label">Monthly</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${tiers.filter(t=>t.type==='one-time').length}</div><div class="mod-stat-label">One-Time</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-tags"></i> Build Pricing Tier</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Tier Name</label><input id="pt-name" class="mod-input" placeholder="e.g. Starter, Growth, Elite"/></div>
          <div class="mod-field"><label>Price</label><input id="pt-price" class="mod-input" placeholder="e.g. £997, £2,500, £497/mo"/></div>
          <div class="mod-field"><label>Type</label>
            <select id="pt-type" class="mod-input"><option value="monthly">Monthly Retainer</option><option value="one-time">One-Time Setup</option><option value="hybrid">Hybrid (Setup + Retainer)</option></select>
          </div>
          <div class="mod-field mod-field-full"><label>What's Included (one per line)</label><textarea id="pt-features" class="mod-textarea" style="height:100px" placeholder="Done-for-you outreach system&#10;Lead feed integration&#10;Weekly strategy call&#10;CRM setup and handover"></textarea></div>
          <div class="mod-field"><label>Target Client Type</label><input id="pt-target" class="mod-input" placeholder="e.g. Service businesses under £20k/mo revenue"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('pt-name').value.trim();
          const price=document.getElementById('pt-price').value.trim();
          const type=document.getElementById('pt-type').value;
          const features=document.getElementById('pt-features').value.trim();
          const target=document.getElementById('pt-target').value.trim();
          if(!name||!price){toast('Enter name and price','err');return;}
          let t=JSON.parse(localStorage.getItem('pricingTiers')||'[]');
          t.push({id:Date.now(),name,price,type,features,target,createdAt:new Date().toISOString()});
          localStorage.setItem('pricingTiers',JSON.stringify(t));toast('Tier saved','ok');
        })()"><i class="fas fa-plus"></i> Save Tier</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-layer-group"></i> Pricing Structure</div>
        ${tiers.length ? tiers.map(t=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><strong>${t.name}</strong> <span class="mod-badge badge-warn">${t.type}</span></div>
              <div style="font-size:1.2rem;font-weight:900;color:#22c55e">${t.price}</div>
            </div>
            ${t.target?`<div class="mod-muted" style="font-size:.75rem;margin-top:4px">Target: ${t.target}</div>`:''}
            ${t.features?`<div style="margin-top:8px">${t.features.split('\n').map(f=>`<div style="font-size:.78rem;padding:2px 0"><i class="fas fa-check" style="color:#22c55e;margin-right:6px"></i>${f}</div>`).join('')}</div>`:''}
            <button class="mod-btn mod-btn-sm mod-btn-danger" style="margin-top:8px" onclick="(function(){
              let arr=JSON.parse(localStorage.getItem('pricingTiers')||'[]');
              arr=arr.filter(x=>x.id!==${t.id});localStorage.setItem('pricingTiers',JSON.stringify(arr));toast('Tier removed','ok');
            })()"><i class="fas fa-trash"></i></button>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-tags"></i> No pricing tiers built yet</div>'}
      </div>`;
  }
})