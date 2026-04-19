({
  init() {},
  async render(container) {
    let localLeads = [];
    try { localLeads = JSON.parse(localStorage.getItem('localLeads') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${localLeads.length}</div><div class="mod-stat-label">Businesses Found</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${localLeads.filter(l=>l.contacted).length}</div><div class="mod-stat-label">Contacted</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${localLeads.filter(l=>l.niche).length}</div><div class="mod-stat-label">Niches Targeted</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-map-pin"></i> Local Business Search</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>City / Area</label><input id="lb-city" class="mod-input" placeholder="e.g. Manchester, London, Birmingham"/></div>
          <div class="mod-field"><label>Business Niche</label><input id="lb-niche" class="mod-input" placeholder="e.g. Dentist, Plumber, Hair Salon, Restaurant"/></div>
          <div class="mod-field"><label>Pain Point to Target</label><input id="lb-pain" class="mod-input" placeholder="e.g. no website, no social media, bad reviews"/></div>
        </div>
        <div class="mod-info-box" style="margin-top:12px">
          <i class="fas fa-info-circle"></i>
          Use Google Maps search: <code>[niche] in [city]</code> — look for businesses with no website, poor photos, or under 4.0 stars. These are your highest-intent targets.
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const city=document.getElementById('lb-city').value.trim();
          const niche=document.getElementById('lb-niche').value.trim();
          const pain=document.getElementById('lb-pain').value.trim();
          if(!city||!niche){toast('Enter city and niche','err');return;}
          let leads=JSON.parse(localStorage.getItem('localLeads')||'[]');
          leads.push({id:Date.now(),city,niche,pain,contacted:false,addedAt:new Date().toISOString()});
          localStorage.setItem('localLeads',JSON.stringify(leads));
          toast('Local target saved','ok');
        })()"><i class="fas fa-plus"></i> Save Target</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-list"></i> Saved Local Targets</div>
        ${localLeads.length ? localLeads.slice().reverse().map(l=>`
          <div class="mod-list-item">
            <div><strong>${l.niche}</strong> — ${l.city} <span class="mod-badge ${l.contacted?'badge-ok':'badge-muted'}">${l.contacted?'Contacted':'Pending'}</span></div>
            ${l.pain?`<div class="mod-muted" style="font-size:.75rem;margin-top:3px">Pain: ${l.pain}</div>`:''}
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="mod-btn mod-btn-sm" onclick="(function(){
                let leads=JSON.parse(localStorage.getItem('localLeads')||'[]');
                leads=leads.map(x=>x.id===${l.id}?{...x,contacted:true}:x);
                localStorage.setItem('localLeads',JSON.stringify(leads));toast('Marked contacted','ok');
              })()"><i class="fas fa-check"></i> Mark Contacted</button>
              <button class="mod-btn mod-btn-sm mod-btn-danger" onclick="(function(){
                let leads=JSON.parse(localStorage.getItem('localLeads')||'[]');
                leads=leads.filter(x=>x.id!==${l.id});
                localStorage.setItem('localLeads',JSON.stringify(leads));toast('Removed','ok');
              })()"><i class="fas fa-trash"></i></button>
            </div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-map-pin"></i> No local targets saved yet</div>'}
      </div>`;
  }
})