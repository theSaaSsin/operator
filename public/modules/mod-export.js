({
  init() {},
  async render(container) {
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));
    let exports = [];
    try { exports = JSON.parse(localStorage.getItem('systemExports') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${exports.length}</div><div class="mod-stat-label">Systems Exported</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(clients.clients||[]).length}</div><div class="mod-stat-label">Clients</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-file-export"></i> Export & Handoff System</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Client</label>
            <select id="ex-client" class="mod-input">
              <option value="">— Select —</option>
              ${(clients.clients||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="mod-field"><label>Handoff Type</label>
            <select id="ex-type" class="mod-input">
              <option>Full Handover (client takes over)</option>
              <option>Partial Handover (you retain oversight)</option>
              <option>White-Label Transfer</option>
              <option>Data Export Only</option>
            </select>
          </div>
          <div class="mod-field mod-field-full"><label>Handoff Notes</label>
            <textarea id="ex-notes" class="mod-textarea" style="height:80px" placeholder="e.g. Includes all lead data, templates, CRM setup. Client has been trained on all panels."></textarea>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const clientId=document.getElementById('ex-client').value;
          const type=document.getElementById('ex-type').value;
          const notes=document.getElementById('ex-notes').value.trim();
          if(!clientId){toast('Select a client','err');return;}
          const data={clients:JSON.parse(localStorage.getItem('clients')||'{}'),leads:JSON.parse(localStorage.getItem('leads')||'{}'),outreach:JSON.parse(localStorage.getItem('outreach')||'{}'),exportedAt:new Date().toISOString(),type,notes};
          const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
          const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='system-export-'+Date.now()+'.json';a.click();
          let arr=JSON.parse(localStorage.getItem('systemExports')||'[]');
          arr.push({id:Date.now(),clientId,type,notes,exportedAt:new Date().toISOString()});
          localStorage.setItem('systemExports',JSON.stringify(arr));
          toast('System exported + downloaded','ok');
        })()"><i class="fas fa-file-export"></i> Export System</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-history"></i> Export History</div>
        ${exports.length ? exports.slice().reverse().map(e=>{
          const c=(clients.clients||[]).find(x=>x.id==e.clientId);
          return `<div class="mod-list-item">
            <div><strong>${c?c.name:'Client'}</strong> <span class="mod-badge badge-muted">${e.type.split(' ')[0]}</span></div>
            <div class="mod-muted" style="font-size:.72rem;margin-top:3px">${new Date(e.exportedAt).toLocaleString()}</div>
          </div>`;}).join('') : '<div class="mod-empty"><i class="fas fa-file-export"></i> No exports yet</div>'}
      </div>`;
  }
})