({
  init() {},
  render(container) {
    let profiles = [];
    try { profiles = JSON.parse(localStorage.getItem('profileDrafts') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${profiles.length}</div><div class="mod-stat-label">Profiles Optimized</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-user-circle"></i> Optimize Your Profile</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Platform</label>
            <select id="po-platform" class="mod-input"><option>LinkedIn</option><option>Twitter / X</option><option>Instagram</option><option>TikTok</option><option>Reddit</option></select>
          </div>
          <div class="mod-field"><label>Your Role / What You Do</label><input id="po-role" class="mod-input" placeholder="e.g. I build client acquisition systems for service businesses"/></div>
          <div class="mod-field"><label>Target Audience</label><input id="po-audience" class="mod-input" placeholder="e.g. coaches, agency owners, freelancers"/></div>
          <div class="mod-field"><label>Your #1 Result / Proof</label><input id="po-result" class="mod-input" placeholder="e.g. helped 30+ businesses get 10+ clients in 30 days"/></div>
          <div class="mod-field"><label>CTA / Next Step</label><input id="po-cta" class="mod-input" placeholder="e.g. DM me 'SYSTEM' or link in bio"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const platform=document.getElementById('po-platform').value;
          const role=document.getElementById('po-role').value.trim()||'I build systems for service businesses';
          const audience=document.getElementById('po-audience').value.trim()||'service business owners';
          const result=document.getElementById('po-result').value.trim()||'helped 30+ businesses get more clients';
          const cta=document.getElementById('po-cta').value.trim()||'DM me to learn more';
          let bio='';
          if(platform==='LinkedIn'){
            bio=`I help ${audience} get more clients — without paid ads.\n\n${role}.\n\nMost ${audience} are stuck relying on referrals or cold calls that don't convert. I built a system that changes that.\n\n→ ${result}\n→ Done for you in 2-4 weeks\n→ Works while you sleep\n\n${cta}`;
          } else if(platform==='Twitter / X'){
            bio=`${role} | ${result} | Helping ${audience} get clients on autopilot | ${cta}`;
          } else {
            bio=`${role.charAt(0).toUpperCase()+role.slice(1)} ✦\n${result} 🎯\nBuilt for ${audience}\n${cta} 👇`;
          }
          document.getElementById('po-output').value=bio;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Bio</button>
        <textarea id="po-output" class="mod-textarea" style="margin-top:12px;height:160px" placeholder="Optimized bio appears here…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('po-output').value);toast('Bio copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
          <button class="mod-btn mod-btn-sm" onclick="(function(){
            const text=document.getElementById('po-output').value.trim();
            if(!text)return;
            let p=JSON.parse(localStorage.getItem('profileDrafts')||'[]');
            p.push({id:Date.now(),text,savedAt:new Date().toISOString()});
            localStorage.setItem('profileDrafts',JSON.stringify(p));toast('Saved','ok');
          })()"><i class="fas fa-save"></i> Save</button>
        </div>
      </div>`;
  }
})