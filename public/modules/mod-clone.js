({
  init() {},
  async render(container) {
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));
    let clones = [];
    try { clones = JSON.parse(localStorage.getItem('clonedSystems') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${clones.length}</div><div class="mod-stat-label">Systems Cloned</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(clients.clients||[]).length}</div><div class="mod-stat-label">Source Clients</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-clone"></i> Clone a System</div>
        <div class="mod-info-box"><i class="fas fa-info-circle"></i> Cloning duplicates a client's system configuration — templates, workflows, and settings — so you can deploy the same setup for a new client instantly.</div>
        <div class="mod-form-grid" style="margin-top:12px">
          <div class="mod-field"><label>Source Client</label>
            <select id="sc-source" class="mod-input">
              <option value="">— Select client —</option>
              ${(clients.clients||[]).map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="mod-field"><label>New Client Name</label><input id="sc-newname" class="mod-input" placeholder="e.g. New Client Ltd"/></div>
          <div class="mod-field"><label>New Client Niche</label><input id="sc-newniche" class="mod-input" placeholder="e.g. Electrician, Coach, Agency"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const sourceId=document.getElementById('sc-source').value;
          const newName=document.getElementById('sc-newname').value.trim();
          const newNiche=document.getElementById('sc-newniche').value.trim();
          if(!sourceId||!newName){toast('Select source and enter new client name','err');return;}
          let c=JSON.parse(localStorage.getItem('clonedSystems')||'[]');
          c.push({id:Date.now(),sourceId,newName,newNiche,clonedAt:new Date().toISOString(),status:'ready'});
          localStorage.setItem('clonedSystems',JSON.stringify(c));
          toast('System cloned for '+newName,'ok');
        })()"><i class="fas fa-clone"></i> Clone System</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-history"></i> Cloned Systems</div>
        ${clones.length ? clones.slice().reverse().map(c=>`
          <div class="mod-list-item">
            <div><strong>${c.newName}</strong> <span class="mod-badge badge-ok">Ready</span></div>
            <div class="mod-muted" style="font-size:.75rem;margin-top:3px">Niche: ${c.newNiche||'Not set'} • Cloned ${new Date(c.clonedAt).toLocaleDateString()}</div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-clone"></i> No systems cloned yet</div>'}
      </div>`;
  }
})