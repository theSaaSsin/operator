({
  init() {},
  async render(container) {
    let permissions = [];
    try { permissions = JSON.parse(localStorage.getItem('clientAccess') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${permissions.filter(p=>p.status==='active').length}</div><div class="mod-stat-label">Active Access</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${permissions.filter(p=>p.status==='revoked').length}</div><div class="mod-stat-label">Revoked</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(clients.clients||[]).length}</div><div class="mod-stat-label">Total Clients</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-lock"></i> Manage Client Access</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Client</label>
            <select id="ca-client" class="mod-input">
              <option value="">— Select —</option>
              ${(clients.clients||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="mod-field"><label>Access Level</label>
            <select id="ca-level" class="mod-input">
              <option value="view-only">View Only (dashboard, analytics)</option>
              <option value="standard">Standard (view + update CRM)</option>
              <option value="full">Full (all panels except settings)</option>
            </select>
          </div>
          <div class="mod-field"><label>Access URL / Password</label><input id="ca-pass" class="mod-input" placeholder="e.g. Shared ngrok URL or login"/></div>
          <div class="mod-field"><label>Expiry (optional)</label><input id="ca-expiry" class="mod-input" type="date"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const clientId=document.getElementById('ca-client').value;
          const level=document.getElementById('ca-level').value;
          const pass=document.getElementById('ca-pass').value.trim();
          const expiry=document.getElementById('ca-expiry').value;
          if(!clientId){toast('Select a client','err');return;}
          let p=JSON.parse(localStorage.getItem('clientAccess')||'[]');
          p=p.filter(x=>x.clientId!==clientId);
          p.push({id:Date.now(),clientId,level,pass,expiry,status:'active',grantedAt:new Date().toISOString()});
          localStorage.setItem('clientAccess',JSON.stringify(p));toast('Access saved','ok');
        })()"><i class="fas fa-key"></i> Grant Access</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-users"></i> Active Access Records</div>
        ${permissions.filter(p=>p.status==='active').length ? permissions.filter(p=>p.status==='active').map(p=>{
          const client=(clients.clients||[]).find(c=>c.id==p.clientId);
          return `<div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong>${client?client.name:'Unknown Client'}</strong>
              <span class="mod-badge badge-ok">${p.level}</span>
            </div>
            ${p.expiry?`<div class="mod-muted" style="font-size:.72rem;margin-top:3px">Expires: ${p.expiry}</div>`:''}
            <button class="mod-btn mod-btn-sm mod-btn-danger" style="margin-top:8px" onclick="(function(){
              let arr=JSON.parse(localStorage.getItem('clientAccess')||'[]');
              arr=arr.map(x=>x.id===${p.id}?{...x,status:'revoked'}:x);
              localStorage.setItem('clientAccess',JSON.stringify(arr));toast('Access revoked','ok');
            })()"><i class="fas fa-ban"></i> Revoke</button>
          </div>`;}).join('') : '<div class="mod-empty"><i class="fas fa-lock"></i> No active access records</div>'}
      </div>`;
  }
})