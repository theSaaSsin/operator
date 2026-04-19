({
  init() {},
  render(container) {
    let tutorials = [];
    try { tutorials = JSON.parse(localStorage.getItem('tutorials') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${tutorials.length}</div><div class="mod-stat-label">Tutorials Created</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${tutorials.filter(t=>t.shared).length}</div><div class="mod-stat-label">Shared</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-graduation-cap"></i> Generate Tutorial / Training Doc</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>System / Tool Name</label><input id="tt-system" class="mod-input" placeholder="e.g. Lead Feed, CRM Pipeline, Outreach Queue"/></div>
          <div class="mod-field"><label>Client Name</label><input id="tt-client" class="mod-input" placeholder="e.g. Jake's Plumbing"/></div>
          <div class="mod-field"><label>Skill Level</label>
            <select id="tt-level" class="mod-input"><option>Beginner (no tech background)</option><option>Intermediate (comfortable with tools)</option><option>Advanced (technical user)</option></select>
          </div>
          <div class="mod-field"><label>Format</label>
            <select id="tt-format" class="mod-input"><option>Step-by-Step Guide</option><option>Quick Reference Card</option><option>Video Script</option><option>FAQ Document</option></select>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const system=document.getElementById('tt-system').value.trim()||'Your System';
          const client=document.getElementById('tt-client').value.trim()||'Client';
          const level=document.getElementById('tt-level').value;
          const format=document.getElementById('tt-format').value;
          const doc=`${format.toUpperCase()} — ${system}\nPrepared for: ${client}\nLevel: ${level}\n\n` +
          (format.includes('Step')?`HOW TO USE ${system.toUpperCase()}\n\nStep 1 — Getting Started\nOpen the system and log in. Everything you need is in the sidebar.\n\nStep 2 — Daily Workflow\n• Check the dashboard each morning\n• Review any new leads or notifications\n• Take action on anything flagged as urgent\n\nStep 3 — Core Actions\n• [Primary action for this system]\n• [Secondary action]\n• [How to check results]\n\nStep 4 — What to Watch For\n• Leads with high scores → prioritise\n• Any red indicators → action needed\n• Green = healthy, Yellow = attention, Red = urgent\n\nStep 5 — Getting Help\nMessage [your name] directly if anything looks wrong or you're unsure.\nDon't guess — ask first.\n\nTIPS\n• Check the system daily (5 mins is enough)\n• Don't change settings without checking first\n• Your results improve the more consistent you are`:
          `QUICK REFERENCE — ${system.toUpperCase()}\n\nWHAT IT DOES: [Brief description]\n\nKEY ACTIONS:\n→ Action 1: [What to click / do]\n→ Action 2: [What to click / do]\n→ Action 3: [What to click / do]\n\nCOMMON QUESTIONS:\nQ: [Common question 1]\nA: [Answer]\n\nQ: [Common question 2]\nA: [Answer]\n\nNEED HELP? Contact [your name] directly.`);
          document.getElementById('tt-output').value=doc;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Tutorial</button>
        <textarea id="tt-output" class="mod-textarea" style="margin-top:12px;height:260px" placeholder="Tutorial appears here…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('tt-output').value);toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
          <button class="mod-btn mod-btn-sm" onclick="(function(){
            const t=document.getElementById('tt-output').value.trim();
            if(!t)return;
            let arr=JSON.parse(localStorage.getItem('tutorials')||'[]');
            arr.push({id:Date.now(),text:t,shared:false,createdAt:new Date().toISOString()});
            localStorage.setItem('tutorials',JSON.stringify(arr));toast('Tutorial saved','ok');
          })()"><i class="fas fa-save"></i> Save</button>
        </div>
      </div>`;
  }
})