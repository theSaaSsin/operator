({
  init() {},
  render(container) {
    let articles = [];
    try { articles = JSON.parse(localStorage.getItem('longFormContent') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${articles.length}</div><div class="mod-stat-label">Pieces Created</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${articles.filter(a=>a.published).length}</div><div class="mod-stat-label">Published</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-newspaper"></i> Generate Long-Form Outline</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Topic / Title Idea</label><input id="lf-topic" class="mod-input" placeholder="e.g. How I got 10 clients in 30 days with no ad spend"/></div>
          <div class="mod-field"><label>Format</label>
            <select id="lf-format" class="mod-input"><option>YouTube Script</option><option>Blog Post</option><option>LinkedIn Article</option><option>Email Newsletter</option></select>
          </div>
          <div class="mod-field"><label>Target Audience</label><input id="lf-audience" class="mod-input" placeholder="e.g. freelancers, coaches, local business owners"/></div>
          <div class="mod-field"><label>Core Insight / Angle</label><input id="lf-angle" class="mod-input" placeholder="e.g. most people focus on ads, but systems beat ads every time"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const topic=document.getElementById('lf-topic').value.trim()||'Getting clients without ads';
          const format=document.getElementById('lf-format').value;
          const audience=document.getElementById('lf-audience').value.trim()||'service business owners';
          const angle=document.getElementById('lf-angle').value.trim()||'systems beat tactics';
          const outline=`${format.toUpperCase()} OUTLINE\n\nTITLE: ${topic}\n\nOPENER\n- Hook: Relatable struggle or bold claim\n- Why this matters to ${audience}\n- What they'll learn / get from this\n\nSECTION 1 — THE PROBLEM\n- What most ${audience} do wrong\n- Why conventional advice fails\n- The real root cause\n\nSECTION 2 — THE INSIGHT\n- Core angle: ${angle}\n- Why this changes everything\n- Proof / personal story\n\nSECTION 3 — THE SYSTEM\n- Step 1: [Lead generation / finding the right people]\n- Step 2: [Outreach / making contact]\n- Step 3: [Converting / closing]\n- Step 4: [Delivering / retaining]\n\nSECTION 4 — RESULTS / PROOF\n- Before and after\n- Numbers and outcomes\n- What's now possible\n\nCLOSE + CTA\n- Summary of key points\n- What to do next\n- Where to go for more help`;
          document.getElementById('lf-output').value=outline;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Outline</button>
        <textarea id="lf-output" class="mod-textarea" style="margin-top:12px;height:280px" placeholder="Outline appears here…"></textarea>
        <button class="mod-btn mod-btn-sm" style="margin-top:8px" onclick="navigator.clipboard.writeText(document.getElementById('lf-output').value);toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy Outline</button>
      </div>`;
  }
})