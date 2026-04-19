({
  init() {},
  async render(container) {
    let templates = [];
    try { templates = JSON.parse(localStorage.getItem('outreachTemplates') || '[]'); } catch {}
    const STARTERS = [
      "Saw your post about [pain] — that's exactly what we fix.",
      "You mentioned struggling with [pain] — we built a system for that.",
      "Quick one — noticed [pain] from your post. Happy to show you what we do.",
      "Came across your comment on [pain]. Built exactly the fix for this.",
    ];
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${templates.length}</div><div class="mod-stat-label">Templates Saved</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${templates.filter(t=>t.used).length}</div><div class="mod-stat-label">Used</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${templates.filter(t=>t.replied).length}</div><div class="mod-stat-label">Got Replies</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-comment-dots"></i> Generate Message</div>
        <div class="mod-form-grid">
          <div class="mod-field"><label>Lead Name (optional)</label><input id="co-name" class="mod-input" placeholder="e.g. James"/></div>
          <div class="mod-field"><label>Their Pain Point</label><input id="co-pain" class="mod-input" placeholder="e.g. no clients, zero sales, can't grow"/></div>
          <div class="mod-field"><label>Platform</label>
            <select id="co-platform" class="mod-input">
              <option>Reddit DM</option><option>LinkedIn</option><option>Email</option><option>Instagram DM</option><option>Twitter/X DM</option>
            </select>
          </div>
          <div class="mod-field"><label>Offer/Solution</label><input id="co-offer" class="mod-input" placeholder="e.g. client acquisition system, AI outreach tool"/></div>
        </div>
        <button class="mod-btn" style="margin-top:12px" onclick="(function(){
          const name=document.getElementById('co-name').value.trim()||'there';
          const pain=document.getElementById('co-pain').value.trim()||'getting clients';
          const offer=document.getElementById('co-offer').value.trim()||'a system that fixes this';
          const starter=\`${STARTERS[0]}\`.replace('[pain]',pain);
          const msg=\`Hey \${name}, \${starter}\n\nWe built \${offer} specifically for people dealing with this. Takes 15 minutes to see if it fits.\n\nWant me to show you how it works?\`;
          document.getElementById('co-output').value=msg;
        })()"><i class="fas fa-wand-magic-sparkles"></i> Generate Message</button>
        <textarea id="co-output" class="mod-textarea" style="margin-top:12px;height:140px" placeholder="Generated message will appear here…"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('co-output').value);toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
          <button class="mod-btn mod-btn-sm" onclick="(function(){
            const msg=document.getElementById('co-output').value.trim();
            if(!msg){toast('Generate a message first','err');return;}
            let t=JSON.parse(localStorage.getItem('outreachTemplates')||'[]');
            t.push({id:Date.now(),text:msg,used:false,replied:false,savedAt:new Date().toISOString()});
            localStorage.setItem('outreachTemplates',JSON.stringify(t));
            toast('Template saved','ok');
          })()"><i class="fas fa-save"></i> Save Template</button>
        </div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-folder"></i> Saved Templates (${templates.length})</div>
        ${templates.length ? templates.slice().reverse().slice(0,8).map(t=>`
          <div class="mod-list-item">
            <div class="mod-muted" style="font-size:.75rem">${t.text.substring(0,120)}…</div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
              <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText(\`${t.text.replace(/`/g,'\`')}\`);toast('Copied!','ok')"><i class="fas fa-copy"></i> Copy</button>
              ${t.used?'<span class="mod-badge badge-ok">Used</span>':''}
              ${t.replied?'<span class="mod-badge badge-warn">Replied</span>':''}
            </div>
          </div>`).join('') : '<div class="mod-empty"><i class="fas fa-comment-dots"></i> No templates saved yet</div>'}
      </div>`;
  }
})