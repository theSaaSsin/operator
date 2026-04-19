({
  init() {},
  render(container) {
    const BUILT_IN = [
      { name:'Cold DM — Pain Hook', category:'Outreach', text:'Hey [Name], saw your post about [pain]. We built a system that fixes exactly that. 15-min call to show you how? No pitch, just the process.' },
      { name:'Follow-Up #1 (3 days)', category:'Outreach', text:'Hey [Name], just circling back on my last message. Still happy to show you what we built for [pain]. Totally fine if timing is off.' },
      { name:'Follow-Up #2 (7 days)', category:'Outreach', text:'Last follow-up from me — if [pain] is still a problem, I can walk you through what we\'ve built in 10 minutes. Otherwise no worries at all.' },
      { name:'Proposal Intro', category:'Sales', text:'Based on our call, here\'s what I\'d build for you. This is a tailored system — not a template. Review below and let me know if you\'d like to adjust anything before we start.' },
      { name:'Onboarding Welcome', category:'Delivery', text:'Welcome aboard! Here\'s what happens next:\n1. I\'ll send the onboarding questionnaire (5 mins)\n2. We\'ll have a kickoff call to align on goals\n3. I\'ll build your system and walk you through it live\nAny questions, message me directly.' },
      { name:'Client Check-In', category:'Delivery', text:'Hey [Name], quick check-in on your system — how\'s it performing? Any leads coming through? Anything you\'d like to adjust or add? Happy to jump on a call if useful.' },
      { name:'Testimonial Request', category:'Delivery', text:'Hey [Name], really glad the system\'s working for you. Would you be open to leaving a quick testimonial? Even 2-3 sentences about what changed — it helps us massively. No pressure at all.' },
    ];
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem('customTemplates') || '[]'); } catch {}
    const all = [...BUILT_IN, ...custom];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${BUILT_IN.length}</div><div class="mod-stat-label">Built-In</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${custom.length}</div><div class="mod-stat-label">Custom</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${all.length}</div><div class="mod-stat-label">Total</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-book"></i> Template Library</div>
        ${['Outreach','Sales','Delivery'].map(cat=>`
          <div style="margin-bottom:16px">
            <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px">${cat}</div>
            ${all.filter(t=>t.category===cat).map(t=>`
              <div class="mod-list-item">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <strong style="font-size:.85rem">${t.name}</strong>
                  <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText('${t.text.replace(/\n/g,'\\n').replace(/'/g,"\\'")}');toast('Template copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
                </div>
                <div class="mod-muted" style="font-size:.75rem;margin-top:4px">${t.text.substring(0,100)}…</div>
              </div>`).join('')}
          </div>`).join('')}
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-plus"></i> Add Custom Template</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Template Name</label><input id="tl-name" class="mod-input" placeholder="e.g. Re-engagement DM"/></div>
          <div class="mod-field"><label>Category</label>
            <select id="tl-cat" class="mod-input"><option>Outreach</option><option>Sales</option><option>Delivery</option><option>Other</option></select>
          </div>
          <div class="mod-field mod-field-full"><label>Template Text</label><textarea id="tl-text" class="mod-textarea" style="height:100px" placeholder="Use [Name], [pain], [offer] as placeholders…"></textarea></div>
        </div>
        <button class="mod-btn" style="margin-top:8px" onclick="(function(){
          const name=document.getElementById('tl-name').value.trim();
          const cat=document.getElementById('tl-cat').value;
          const text=document.getElementById('tl-text').value.trim();
          if(!name||!text){toast('Fill all fields','err');return;}
          let c=JSON.parse(localStorage.getItem('customTemplates')||'[]');
          c.push({name,category:cat,text,addedAt:new Date().toISOString()});
          localStorage.setItem('customTemplates',JSON.stringify(c));toast('Template saved','ok');
        })()"><i class="fas fa-save"></i> Save Template</button>
      </div>`;
  }
})