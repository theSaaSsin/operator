({
  init() {},
  async render(container) {
    let onboardings = [];
    try { onboardings = JSON.parse(localStorage.getItem('onboardings') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));
    const STEPS = ['Intro call booked','Questionnaire sent','Access granted','System built','Training done','Live & handed over'];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${onboardings.length}</div><div class="mod-stat-label">Onboardings</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${onboardings.filter(o=>o.step>=5).length}</div><div class="mod-stat-label">Completed</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${onboardings.filter(o=>o.step<5).length}</div><div class="mod-stat-label">In Progress</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-user-check"></i> Start New Onboarding</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Client Name</label><input id="ob-name" class="mod-input" placeholder="e.g. Jake's Plumbing"/></div>
          <div class="mod-field"><label>Service / System Being Built</label><input id="ob-service" class="mod-input" placeholder="e.g. Lead acquisition system"/></div>
          <div class="mod-field"><label>Start Date</label><input id="ob-date" class="mod-input" type="date"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('ob-name').value.trim();
          const service=document.getElementById('ob-service').value.trim();
          const date=document.getElementById('ob-date').value;
          if(!name){toast('Enter client name','err');return;}
          let arr=JSON.parse(localStorage.getItem('onboardings')||'[]');
          arr.push({id:Date.now(),name,service,date,step:0,notes:'',startedAt:new Date().toISOString()});
          localStorage.setItem('onboardings',JSON.stringify(arr));toast('Onboarding started','ok');
        })()"><i class="fas fa-plus"></i> Start Onboarding</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-list-check"></i> Active Onboardings</div>
        ${onboardings.length ? onboardings.map(o=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between"><strong>${o.name}</strong><span class="mod-badge ${o.step>=5?'badge-ok':'badge-warn'}">Step ${o.step+1}/6</span></div>
            <div class="mod-muted" style="font-size:.75rem;margin-top:3px">${o.service||''}</div>
            <div style="margin-top:8px">
              ${STEPS.map((s,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;opacity:${i<=o.step?1:0.4}">
                <i class="fas ${i<=o.step?'fa-check-circle':'fa-circle'}" style="color:${i<=o.step?'#22c55e':'#3a3a4a'}"></i>
                <span style="font-size:.78rem">${s}</span>
              </div>`).join('')}
            </div>
            ${o.step<5?`<button class="mod-btn mod-btn-sm" style="margin-top:8px" onclick="(function(){
              let arr=JSON.parse(localStorage.getItem('onboardings')||'[]');
              arr=arr.map(x=>x.id===${o.id}?{...x,step:Math.min(x.step+1,5)}:x);
              localStorage.setItem('onboardings',JSON.stringify(arr));toast('Step advanced','ok');
            })()"><i class="fas fa-arrow-right"></i> Next Step</button>`:'<div class="mod-badge badge-ok" style="margin-top:8px">✓ Complete</div>'}
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-user-check"></i> No onboardings yet</div>'}
      </div>`;
  }
})