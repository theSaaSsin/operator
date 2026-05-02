({
  init() {},
  render(container) {
    let scripts = [];
    try { scripts = JSON.parse(localStorage.getItem('shortFormScripts') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${scripts.length}</div><div class="mod-stat-label">Scripts Generated</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${scripts.filter(s=>s.posted).length}</div><div class="mod-stat-label">Posted</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-video"></i> Generate Short-Form Script (TikTok / Reels)</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Hook Topic / Pain</label><input id="sf-pain" class="mod-input" placeholder="e.g. why you have no clients, biggest lead gen mistake"/></div>
          <div class="mod-field"><label>Your Niche / Audience</label><input id="sf-niche" class="mod-input" placeholder="e.g. freelancers, agency owners, coaches"/></div>
          <div class="mod-field"><label>Format</label>
            <select id="sf-format" class="mod-input">
              <option>Hook + Story + CTA</option><option>3 Mistakes + Fix</option><option>Before/After</option><option>Controversial Take</option><option>Day in My Life</option>
            </select>
          </div>
          <div class="mod-field"><label>Duration Target</label>
            <select id="sf-dur" class="mod-input"><option>30 seconds</option><option>60 seconds</option><option>90 seconds</option></select>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const pain=document.getElementById('sf-pain').value.trim()||'getting clients';
          const niche=document.getElementById('sf-niche').value.trim()||'service business owners';
          const format=document.getElementById('sf-format').value;
          const dur=document.getElementById('sf-dur').value;
          let script='';
          if(format.includes('Hook + Story')){
            script=`[HOOK - 3 sec]\n"${pain.charAt(0).toUpperCase()+pain.slice(1)}? Here's what nobody tells ${niche}..."\n\n[STORY - 15 sec]\n"I used to [relatable struggle]. Then I realized [insight]. The problem wasn't [surface issue] — it was [real problem]."\n\n[VALUE - 15 sec]\n"Here's what actually works: [1-2 sentence solution]. Most ${niche} skip this and wonder why [pain continues]."\n\n[CTA - 5 sec]\n"If you're a ${niche} dealing with ${pain}, follow for more. Link in bio to see exactly how we fix this."`;
          } else if(format.includes('3 Mistakes')){
            script=`[HOOK]\n"3 reasons ${niche} can't fix ${pain}:"\n\n[MISTAKE 1] "They [common mistake 1] — this kills [result]"\n[MISTAKE 2] "They [common mistake 2] — nobody tells you this"\n[MISTAKE 3] "They [common mistake 3] — this one costs the most"\n\n[FIX]\n"The fix: [simple 1-line solution]. That's it."\n\n[CTA]\n"Save this. It'll make sense when you hit that wall."`;
          } else {
            script=`[HOOK]\n"${pain.charAt(0).toUpperCase()+pain.slice(1)} — this is why:"\n\n[POINT 1]\n[POINT 2]\n[POINT 3]\n\n[CTA]\n"Follow if this hit. More for ${niche} who are serious."`;
          }
          document.getElementById('sf-output').value=script;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Script</button>
        <textarea id="sf-output" class="mod-textarea" style="margin-top:12px;height:220px" placeholder="Script appears here…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('sf-output').value);toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
          <button class="mod-btn mod-btn-sm" onclick="(function(){
            const s=document.getElementById('sf-output').value.trim();
            if(!s){toast('Generate first','err');return;}
            let arr=JSON.parse(localStorage.getItem('shortFormScripts')||'[]');
            arr.push({id:Date.now(),text:s,posted:false,savedAt:new Date().toISOString()});
            localStorage.setItem('shortFormScripts',JSON.stringify(arr));toast('Script saved','ok');
          })()"><i class="fas fa-save"></i> Save</button>
        </div>
      </div>`;
  }
})