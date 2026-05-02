({
  init() {},
  async render(container) {
    let proofs = [];
    try { proofs = JSON.parse(localStorage.getItem('proofItems') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${proofs.length}</div><div class="mod-stat-label">Proof Items</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${proofs.filter(p=>p.type==='testimonial').length}</div><div class="mod-stat-label">Testimonials</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${proofs.filter(p=>p.type==='result').length}</div><div class="mod-stat-label">Results</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-star"></i> Add Proof / Testimonial</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Type</label>
            <select id="pr-type" class="mod-input"><option value="testimonial">Testimonial</option><option value="result">Result / Case Study</option><option value="screenshot">Screenshot Reference</option></select>
          </div>
          <div class="mod-field"><label>Client / Source Name</label><input id="pr-name" class="mod-input" placeholder="e.g. Jake M., Restaurant Owner"/></div>
          <div class="mod-field mod-field-full"><label>Quote / Result Description</label><textarea id="pr-text" class="mod-textarea" style="height:80px" placeholder="e.g. Got 8 new clients in 3 weeks using this system…"></textarea></div>
          <div class="mod-field"><label>Metric / Result (optional)</label><input id="pr-metric" class="mod-input" placeholder="e.g. +8 clients, £4,200 revenue, 3x leads"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const type=document.getElementById('pr-type').value;
          const name=document.getElementById('pr-name').value.trim();
          const text=document.getElementById('pr-text').value.trim();
          const metric=document.getElementById('pr-metric').value.trim();
          if(!name||!text){toast('Fill in name and quote','err');return;}
          let p=JSON.parse(localStorage.getItem('proofItems')||'[]');
          p.push({id:Date.now(),type,name,text,metric,addedAt:new Date().toISOString()});
          localStorage.setItem('proofItems',JSON.stringify(p));
          toast('Proof item saved','ok');
        })()"><i class="fas fa-plus"></i> Save Proof Item</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-shield-halved"></i> Proof Library (${proofs.length})</div>
        ${proofs.length ? proofs.slice().reverse().map(p=>`
          <div class="mod-list-item">
            <div><span class="mod-badge ${p.type==='testimonial'?'badge-ok':p.type==='result'?'badge-warn':'badge-muted'}">${p.type}</span> <strong>${p.name}</strong></div>
            ${p.metric?`<div style="color:#22c55e;font-weight:700;margin-top:4px">${p.metric}</div>`:''}
            <div class="mod-muted" style="font-size:.78rem;margin-top:4px;font-style:italic">"${p.text}"</div>
            <button class="mod-btn mod-btn-sm" style="margin-top:8px" onclick="navigator.clipboard.writeText('"${p.text.replace(/"/g,'\\"')}" — ${p.name}');toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-star"></i> No proof items yet — add testimonials and results</div>'}
      </div>`;
  }
})