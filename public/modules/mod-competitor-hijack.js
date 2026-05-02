({
  init() {},
  async render(container) {
    let targets = [];
    try { targets = JSON.parse(localStorage.getItem('competitorTargets') || '[]'); } catch {}
    const leads = await fetch('/api/leads').then(r=>r.json()).catch(()=>({leads:[]}));
    const converted = targets.filter(t => t.status === 'converted').length;
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${targets.length}</div><div class="mod-stat-label">Targets Tracked</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${targets.filter(t=>t.status==='contacted').length}</div><div class="mod-stat-label">Contacted</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${converted}</div><div class="mod-stat-label">Converted</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(leads.leads||[]).filter(l=>l.tags&&l.tags.includes('competitor')).length}</div><div class="mod-stat-label">From Competitors</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-user-secret"></i> Competitor Monitoring</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Competitor Brand / Tool</label><input id="ch-brand" class="mod-input" placeholder="e.g. Gohighlevel, Notion, Webflow"/></div>
          <div class="mod-field"><label>Platform to Monitor</label>
            <select id="ch-platform" class="mod-input">
              <option>Reddit</option><option>X / Twitter</option><option>Facebook Groups</option><option>LinkedIn</option><option>Trustpilot</option>
            </select>
          </div>
          <div class="mod-field"><label>Pain Keywords (comma-separated)</label><input id="ch-kw" class="mod-input" placeholder="e.g. expensive, cancelled, doesn't work, switching from"/></div>
        </div>
        <button class="mod-btn" onclick="(function(){
          const brand=document.getElementById('ch-brand').value.trim();
          const platform=document.getElementById('ch-platform').value;
          const kw=document.getElementById('ch-kw').value.trim();
          if(!brand||!kw){toast('Fill in brand and keywords','err');return;}
          let t=JSON.parse(localStorage.getItem('competitorTargets')||'[]');
          t.push({id:Date.now(),brand,platform,keywords:kw,status:'monitoring',addedAt:new Date().toISOString()});
          localStorage.setItem('competitorTargets',JSON.stringify(t));
          toast('Competitor target added — monitoring active','ok');
          window._modPanels&&window._modPanels['mod-competitor-hijack']&&window._modPanels['mod-competitor-hijack'].render(document.querySelector('#panel-mod-competitor-hijack .mod-container'));
        })()"><i class="fas fa-plus"></i> Add Target</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-crosshairs"></i> Tracked Competitors</div>
        ${targets.length ? targets.map(t=>`
          <div class="mod-list-item">
            <div><strong>${t.brand}</strong> <span class="mod-badge">${t.platform}</span></div>
            <div class="mod-muted" style="font-size:.75rem;margin-top:3px">Keywords: ${t.keywords}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <span class="mod-status-pill ${t.status==='converted'?'pill-ok':t.status==='contacted'?'pill-warn':'pill-muted'}">${t.status}</span>
              <button class="mod-btn mod-btn-sm" onclick="(function(){
                let t=JSON.parse(localStorage.getItem('competitorTargets')||'[]');
                t=t.filter(x=>x.id!==${t.id});localStorage.setItem('competitorTargets',JSON.stringify(t));
                toast('Target removed','ok');
              })()"><i class="fas fa-trash"></i></button>
            </div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-user-secret"></i> No competitors tracked yet — add one above</div>'}
      </div>`;
  }
})