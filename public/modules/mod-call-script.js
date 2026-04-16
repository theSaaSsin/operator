({
  init() {},
  async render(container) {
    let scripts = [];
    try { scripts = JSON.parse(localStorage.getItem('callScripts') || '[]'); } catch {}
    const PHASES = ['Opener','Discovery','Pain Amplification','Solution Pitch','Objection Handle','Close'];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${scripts.length}</div><div class="mod-stat-label">Scripts Saved</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${scripts.filter(s=>s.used).length}</div><div class="mod-stat-label">Used in Calls</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${scripts.filter(s=>s.closed).length}</div><div class="mod-stat-label">Closed Deals</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-phone"></i> Generate Call Script</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Lead Niche</label><input id="cs-niche" class="mod-input" placeholder="e.g. Fitness Coach, Dentist, Agency Owner"/></div>
          <div class="mod-field"><label>Their Main Pain</label><input id="cs-pain" class="mod-input" placeholder="e.g. no clients, inconsistent revenue, relying on referrals"/></div>
          <div class="mod-field"><label>Your Offer / System</label><input id="cs-offer" class="mod-input" placeholder="e.g. client acquisition system, AI-powered outreach"/></div>
          <div class="mod-field"><label>Price Point (optional)</label><input id="cs-price" class="mod-input" placeholder="e.g. £997/mo, £2,500 setup"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const niche=document.getElementById('cs-niche').value.trim()||'business owner';
          const pain=document.getElementById('cs-pain').value.trim()||'getting clients';
          const offer=document.getElementById('cs-offer').value.trim()||'a done-for-you system';
          const price=document.getElementById('cs-price').value.trim()||'[price]';
          const script=`CALL SCRIPT — ${niche.toUpperCase()}

OPENER
"Hey [Name], thanks for jumping on — this will take about 15-20 mins. I just want to ask you a few questions first to make sure what we do actually makes sense for you. Sound good?"

DISCOVERY
"So tell me — what's the main thing you're trying to solve right now with ${pain}?"
"How long has that been an issue?"
"And what happens to the business if that doesn't change in the next 6 months?"

PAIN AMPLIFICATION
"So if I understand correctly — you're a ${niche} dealing with ${pain}, and if nothing changes, [reflect their answer]. Is that right?"
"What would it mean for you if you could solve that?"

SOLUTION PITCH
"Here's what we do — we build ${offer} specifically for ${niche}s. It handles [lead gen / outreach / follow-up] so you don't have to. Our clients typically see results in [2-4 weeks]."

OBJECTIONS
"Too expensive" → "What's one client worth to you? This pays for itself with one deal."
"Need to think" → "What specifically do you need to think about? Let's address it now."
"Not the right time" → "When is the right time? The problem doesn't go away."

CLOSE
"Based on everything we've talked about, I think we can help you. Investment is ${price}. If you're ready to move, I can get you started today — what do you think?"`;
          document.getElementById('cs-output').value=script;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Script</button>
        <textarea id="cs-output" class="mod-textarea" style="margin-top:12px;height:300px" placeholder="Script will appear here…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('cs-output').value);toast('Script copied!','ok')"><i class="fas fa-copy"></i> Copy Script</button>
          <button class="mod-btn mod-btn-sm" onclick="(function(){
            const s=document.getElementById('cs-output').value.trim();
            if(!s){toast('Generate first','err');return;}
            let arr=JSON.parse(localStorage.getItem('callScripts')||'[]');
            arr.push({id:Date.now(),text:s,used:false,closed:false,savedAt:new Date().toISOString()});
            localStorage.setItem('callScripts',JSON.stringify(arr));toast('Script saved','ok');
          })()"><i class="fas fa-save"></i> Save Script</button>
        </div>
      </div>`;
  }
})