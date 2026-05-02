({
  init() {},
  async render(container) {
    let pages = [];
    try { pages = JSON.parse(localStorage.getItem('landingPages') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r=>r.json()).catch(()=>({clients:[]}));

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${pages.length}</div><div class="mod-stat-label">Pages Generated</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${pages.filter(p=>p.deployed).length}</div><div class="mod-stat-label">Deployed</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${(clients.clients||[]).length}</div><div class="mod-stat-label">Clients Available</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-globe"></i> Generate Landing Page</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Business / Client Name</label><input id="lp-name" class="mod-input" placeholder="e.g. Jake's Plumbing"/></div>
          <div class="mod-field"><label>Primary Offer / Headline</label><input id="lp-headline" class="mod-input" placeholder="e.g. Get 10 New Clients in 30 Days"/></div>
          <div class="mod-field"><label>Niche</label><input id="lp-niche" class="mod-input" placeholder="e.g. Local Plumber, Fitness Coach, Marketing Agency"/></div>
          <div class="mod-field"><label>CTA Button Text</label><input id="lp-cta" class="mod-input" placeholder="e.g. Book a Free Call, Get Started"/></div>
          <div class="mod-field"><label>Booking URL</label><input id="lp-url" class="mod-input" placeholder="https://calendly.com/..."/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('lp-name').value.trim();
          const headline=document.getElementById('lp-headline').value.trim();
          const niche=document.getElementById('lp-niche').value.trim();
          const cta=document.getElementById('lp-cta').value.trim()||'Book a Free Call';
          const url=document.getElementById('lp-url').value.trim()||'#';
          if(!name||!headline){toast('Fill in name and headline','err');return;}
          const html='<!DOCTYPE html><html><head><meta charset=UTF-8><title>'+name+'</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#f0f0f5;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:40px}.hero{max-width:700px}h1{font-size:3rem;font-weight:900;line-height:1.1;margin-bottom:20px}h1 span{color:#ff2a2a}.sub{font-size:1.2rem;color:#6b6b80;margin-bottom:40px}.cta{display:inline-block;background:#ff2a2a;color:#fff;padding:18px 48px;border-radius:8px;text-decoration:none;font-weight:700;font-size:1.1rem;transition:.2s}.cta:hover{opacity:.85}.niche{font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;color:#ff2a2a;margin-bottom:12px}</style></head><body><div class=hero><div class=niche>'+niche+'</div><h1>'+headline.replace(/(\\d+)/g,'<span>$1</span>')+'</h1><p class=sub>Built specifically for '+niche+' businesses ready to scale.</p><a href='+url+' class=cta>'+cta+'</a></div></body></html>';
          let p=JSON.parse(localStorage.getItem('landingPages')||'[]');
          const id=Date.now();
          p.push({id,name,headline,niche,html,deployed:false,createdAt:new Date().toISOString()});
          localStorage.setItem('landingPages',JSON.stringify(p));
          const blob=new Blob([html],{type:'text/html'});
          const a=document.createElement('a');a.href=URL.createObjectURL(blob);
          a.download=name.replace(/\\s+/g,'-').toLowerCase()+'-landing.html';
          a.click();
          toast('Landing page generated + downloaded!','ok');
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate & Download</button>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-file-code"></i> Generated Pages (${pages.length})</div>
        ${pages.length ? pages.slice().reverse().map(p=>`
          <div class="mod-list-item">
            <div><strong>${p.name}</strong> <span class="mod-badge ${p.deployed?'badge-ok':'badge-muted'}">${p.deployed?'Deployed':'Draft'}</span></div>
            <div class="mod-muted" style="font-size:.75rem;margin-top:3px">${p.headline}</div>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="mod-btn mod-btn-sm" onclick="(function(){
                const p=${JSON.stringify(p)};
                const blob=new Blob([p.html],{type:'text/html'});
                const a=document.createElement('a');a.href=URL.createObjectURL(blob);
                a.download='${p.name.replace(/\s+/g,'-')}-landing.html';a.click();
              })()"><i class="fas fa-download"></i> Download</button>
            </div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-globe"></i> No pages generated yet</div>'}
      </div>`;
  }
})