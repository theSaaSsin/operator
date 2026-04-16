({
  init() {},
  async render(container) {
    let requests = [];
    try { requests = JSON.parse(localStorage.getItem('changeRequests') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${requests.filter(r=>r.status==='open').length}</div><div class="mod-stat-label">Open</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${requests.filter(r=>r.status==='in-progress').length}</div><div class="mod-stat-label">In Progress</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${requests.filter(r=>r.status==='done').length}</div><div class="mod-stat-label">Done</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-pen-to-square"></i> Log Change Request</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Client</label>
            <select id="cr-client" class="mod-input">
              <option value="">— Select —</option>
              ${(clients.clients||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="mod-field"><label>Priority</label>
            <select id="cr-priority" class="mod-input"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
          </div>
          <div class="mod-field mod-field-full"><label>Request Description</label>
            <textarea id="cr-desc" class="mod-textarea" style="height:80px" placeholder="e.g. Update CRM to add new stage, change outreach timing to 9am…"></textarea>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const clientId=document.getElementById('cr-client').value;
          const priority=document.getElementById('cr-priority').value;
          const desc=document.getElementById('cr-desc').value.trim();
          if(!desc){toast('Enter request description','err');return;}
          let r=JSON.parse(localStorage.getItem('changeRequests')||'[]');
          r.push({id:Date.now(),clientId,priority,desc,status:'open',createdAt:new Date().toISOString()});
          localStorage.setItem('changeRequests',JSON.stringify(r));toast('Request logged','ok');
        })()"><i class="fas fa-plus"></i> Log Request</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-list"></i> Change Requests</div>
        ${requests.length ? requests.slice().reverse().map(r=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="mod-badge ${r.priority==='Critical'?'badge-danger':r.priority==='High'?'badge-warn':'badge-muted'}">${r.priority}</span>
              <span class="mod-badge ${r.status==='done'?'badge-ok':r.status==='in-progress'?'badge-warn':'badge-muted'}">${r.status}</span>
            </div>
            <div style="font-size:.82rem;margin-top:6px">${r.desc}</div>
            ${r.status!=='done'?`<div style="display:flex;gap:6px;margin-top:8px">
              ${r.status==='open'?`<button class="mod-btn mod-btn-sm" onclick="(function(){let arr=JSON.parse(localStorage.getItem('changeRequests')||'[]');arr=arr.map(x=>x.id===${r.id}?{...x,status:'in-progress'}:x);localStorage.setItem('changeRequests',JSON.stringify(arr));toast('Marked in-progress','ok')})()"><i class="fas fa-play"></i> Start</button>`:''}
              <button class="mod-btn mod-btn-sm" style="background:rgba(34,197,94,.12);color:#22c55e" onclick="(function(){let arr=JSON.parse(localStorage.getItem('changeRequests')||'[]');arr=arr.map(x=>x.id===${r.id}?{...x,status:'done'}:x);localStorage.setItem('changeRequests',JSON.stringify(arr));toast('Marked done','ok')})()"><i class="fas fa-check"></i> Done</button>
            </div>`:'<div class="mod-badge badge-ok" style="margin-top:6px">✓ Completed</div>'}
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-pen-to-square"></i> No change requests</div>'}
      </div>`;
  }
})