({
  init() {},
  render(container) {
    let files = [];
    try { files = JSON.parse(localStorage.getItem('assetLibrary') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${files.length}</div><div class="mod-stat-label">Assets Stored</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${files.filter(f=>f.type==='template').length}</div><div class="mod-stat-label">Templates</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${files.filter(f=>f.type==='document').length}</div><div class="mod-stat-label">Documents</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-folder-open"></i> Add Asset Reference</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Asset Name</label><input id="am-name" class="mod-input" placeholder="e.g. Onboarding Questionnaire"/></div>
          <div class="mod-field"><label>Type</label>
            <select id="am-type" class="mod-input"><option value="template">Template</option><option value="document">Document</option><option value="image">Image/Graphic</option><option value="script">Script</option><option value="link">External Link</option></select>
          </div>
          <div class="mod-field"><label>URL / Reference</label><input id="am-url" class="mod-input" placeholder="https://... or Google Drive link"/></div>
          <div class="mod-field"><label>Notes</label><input id="am-notes" class="mod-input" placeholder="e.g. Send on day 1 of onboarding"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('am-name').value.trim();
          const type=document.getElementById('am-type').value;
          const url=document.getElementById('am-url').value.trim();
          const notes=document.getElementById('am-notes').value.trim();
          if(!name){toast('Enter asset name','err');return;}
          let f=JSON.parse(localStorage.getItem('assetLibrary')||'[]');
          f.push({id:Date.now(),name,type,url,notes,addedAt:new Date().toISOString()});
          localStorage.setItem('assetLibrary',JSON.stringify(f));toast('Asset saved','ok');
        })()"><i class="fas fa-plus"></i> Add Asset</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-archive"></i> Asset Library (${files.length})</div>
        ${files.length ? files.slice().reverse().map(f=>`
          <div class="mod-list-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div><strong>${f.name}</strong> <span class="mod-badge badge-muted">${f.type}</span></div>
              ${f.url?`<a href="${f.url}" target="_blank" class="mod-btn mod-btn-sm"><i class="fas fa-external-link-alt"></i> Open</a>`:''}
            </div>
            ${f.notes?`<div class="mod-muted" style="font-size:.75rem;margin-top:4px">${f.notes}</div>`:''}
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-folder-open"></i> No assets saved yet</div>'}
      </div>`;
  }
})