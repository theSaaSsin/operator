({
  init() {},
  render(container) {
    const COMMENT_STARTERS = [
      "This is exactly the problem most [niche] overlook — [add insight].",
      "Counterpoint: [different angle on post topic]. Thoughts?",
      "Been dealing with this exact thing. What worked for me: [brief tip].",
      "The real issue behind this is [deeper insight]. Good post.",
      "Curious — have you tried [approach]? It addresses [specific point].",
    ];
    let log = [];
    try { log = JSON.parse(localStorage.getItem('engagementLog') || '[]'); } catch {}
    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${log.length}</div><div class="mod-stat-label">Engagements Logged</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${log.filter(l=>l.type==='comment').length}</div><div class="mod-stat-label">Comments</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${log.filter(l=>l.reply).length}</div><div class="mod-stat-label">Got Reply</div></div>
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-comments"></i> Comment Starter Templates</div>
        ${COMMENT_STARTERS.map((s,i)=>`
          <div class="mod-list-item" style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:.82rem;flex:1">${s}</div>
            <button class="mod-btn mod-btn-sm" onclick="navigator.clipboard.writeText('${s.replace(/'/g,"\\'")}');toast('Copied!','ok')"><i class="fas fa-copy"></i></button>
          </div>`).join('')}
      </div>
      <div class="mod-section">
        <div class="mod-section-title"><i class="fas fa-calendar-check"></i> Daily Engagement Tracker</div>
        <div class="mod-info-box"><i class="fas fa-lightbulb"></i> Engage with 5-10 posts daily in your niche. Comment value, not just "great post". Leads find YOU through your comments.</div>
        <div class="mod-form-grid" style="margin-top:12px">
          <div class="mod-field"><label>Post URL / Description</label><input id="eg-url" class="mod-input" placeholder="e.g. Reddit r/Entrepreneur — 'I can't get clients'"/></div>
          <div class="mod-field"><label>Type</label>
            <select id="eg-type" class="mod-input"><option value="comment">Comment</option><option value="like">Like/React</option><option value="dm">DM Sent</option></select>
          </div>
        </div>
        <button class="mod-btn" style="margin-top:8px" onclick="(function(){
          const url=document.getElementById('eg-url').value.trim();
          if(!url){toast('Enter post info','err');return;}
          const type=document.getElementById('eg-type').value;
          let l=JSON.parse(localStorage.getItem('engagementLog')||'[]');
          l.push({id:Date.now(),url,type,reply:false,loggedAt:new Date().toISOString()});
          localStorage.setItem('engagementLog',JSON.stringify(l));toast('Engagement logged','ok');
        })()"><i class="fas fa-plus"></i> Log Engagement</button>
      </div>`;
  }
})