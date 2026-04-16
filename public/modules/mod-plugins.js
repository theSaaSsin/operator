({
  init() {},
  render(container) {
    let plugins = [];
    try { plugins = JSON.parse(localStorage.getItem('plugins') || '[]'); } catch {}
    const BUILT_IN = [
      { name:'Lead Score Booster', desc:'Applies extra weight to pain keywords in scoring algorithm', type:'scoring', active:true },
      { name:'Auto-Archive Old Leads', desc:'Moves leads older than 30 days with no activity to archive', type:'automation', active:false },
      { name:'Duplicate Detector', desc:'Flags duplicate leads from same username/source', type:'filter', active:true },
      { name:'Sentiment Analyzer', desc:'Adds emotional urgency score to lead posts', type:'scoring', active:false },
      { name:'Competitor Keyword Injector', desc:'Auto-adds competitor names to keyword watchlist', type:'detection', active:false },
    ];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${BUILT_IN.filter(p=>p.active).length}</div><div class="mod-stat-label">Active Plugins</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${BUILT_IN.length}</div><div class="mod-stat-label">Available</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--muted)">${plugins.length}</div><div class="mod-stat-label">Custom</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-puzzle-piece"></i> Plugin Library</div>
        ${BUILT_IN.map((p,i)=>`
          <div class="mod-list-item" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600">${p.name} <span class="mod-badge badge-muted">${p.type}</span></div>
              <div class="mod-muted" style="font-size:.75rem;margin-top:3px">${p.desc}</div>
            </div>
            <label class="mod-toggle">
              <input type="checkbox" ${p.active?'checked':''} onchange="toast(this.checked?'Plugin enabled':'Plugin disabled','ok')">
              <span class="mod-toggle-slider"></span>
            </label>
          </div>`).join('')}
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-code"></i> Custom Plugin (Webhook)</div>
        <div class="mod-info-box"><i class="fas fa-info-circle"></i> Connect external tools via webhooks. When a lead is captured, the operator will POST lead data to your endpoint.</div>
        <div class="mod-form-grid" style="margin-top:12px">
          <div class="mod-field"><label>Plugin Name</label><input id="pl-name" class="mod-input" placeholder="e.g. Slack Lead Alert"/></div>
          <div class="mod-field"><label>Webhook URL</label><input id="pl-url" class="mod-input" placeholder="https://hooks.slack.com/..."/></div>
          <div class="mod-field"><label>Trigger On</label>
            <select id="pl-trigger" class="mod-input"><option>New Lead Captured</option><option>Lead Score > 80</option><option>Outreach Sent</option><option>Client Added</option></select>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:8px" onclick="(function(){
          const name=document.getElementById('pl-name').value.trim();
          const url=document.getElementById('pl-url').value.trim();
          const trigger=document.getElementById('pl-trigger').value;
          if(!name||!url){toast('Fill name and URL','err');return;}
          let p=JSON.parse(localStorage.getItem('plugins')||'[]');
          p.push({id:Date.now(),name,url,trigger,active:true,addedAt:new Date().toISOString()});
          localStorage.setItem('plugins',JSON.stringify(p));toast('Plugin registered','ok');
        })()"><i class="fas fa-plus"></i> Register Plugin</button>
      </div>`;
  }
})