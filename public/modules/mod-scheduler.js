({
  init() {},
  async render(container) {
    let scheduled = [];
    try { scheduled = JSON.parse(localStorage.getItem('scheduledPosts') || '[]'); } catch {}
    let posts = [];
    try { posts = JSON.parse(localStorage.getItem('socialPosts') || '[]'); } catch {}

    const now = new Date();
    const upcoming = scheduled.filter(s => new Date(s.scheduledFor) >= now).sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    const past = scheduled.filter(s => new Date(s.scheduledFor) < now);

    const today = new Date(); today.setHours(0,0,0,0);
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(today); day.setDate(day.getDate() + d);
      const dayPosts = scheduled.filter(s => { const sd = new Date(s.scheduledFor); sd.setHours(0,0,0,0); return sd.getTime() === day.getTime(); });
      weekDays.push({ date: day, posts: dayPosts });
    }

    const platformIcons = { linkedin: 'fab fa-linkedin', twitter: 'fab fa-twitter', reddit: 'fab fa-reddit', facebook: 'fab fa-facebook' };
    const platformColors = { linkedin: '#0077b5', twitter: '#1da1f2', reddit: '#ff4500', facebook: '#1877f2' };

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${upcoming.length}</div><div class="mod-stat-label">Upcoming</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${past.length}</div><div class="mod-stat-label">Published</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${scheduled.length}</div><div class="mod-stat-label">Total Scheduled</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${posts.length}</div><div class="mod-stat-label">Draft Posts</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">7-Day Calendar</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
          ${weekDays.map(wd => {
            const isToday = wd.date.getTime() === today.getTime();
            return `<div style="background:${isToday ? 'rgba(99,102,241,.1)' : 'rgba(255,255,255,.02)'};border:1px solid ${isToday ? 'var(--accent)' : 'var(--border)'};border-radius:8px;padding:8px;min-height:80px">
              <div style="font-size:.7rem;font-weight:700;color:${isToday ? 'var(--accent)' : 'var(--muted)'};margin-bottom:6px">${wd.date.toLocaleDateString('en-GB',{weekday:'short',day:'numeric'})}</div>
              ${wd.posts.map(p => `<div style="background:rgba(255,255,255,.06);border-radius:4px;padding:3px 6px;margin-bottom:3px;font-size:.65rem;color:var(--text);display:flex;align-items:center;gap:4px">
                <i class="${platformIcons[p.platform] || 'fas fa-globe'}" style="color:${platformColors[p.platform] || 'var(--muted)'};font-size:.6rem"></i>
                ${new Date(p.scheduledFor).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
              </div>`).join('')}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Schedule a Post</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Platform</label>
              <select id="sch-platform" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
                <option value="reddit">Reddit</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Date</label>
              <input type="date" id="sch-date" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Time</label>
              <input type="time" id="sch-time" value="09:00" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Content</label>
            <textarea id="sch-content" rows="3" placeholder="Post content..." style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_schedulePost()"><i class="fas fa-clock"></i> Schedule</button>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Upcoming (${upcoming.length})</div>
        ${upcoming.length ? upcoming.map((s, i) => {
          const idx = scheduled.indexOf(s);
          return `<div class="mod-card" style="margin-bottom:6px;display:flex;align-items:center;gap:10px">
            <i class="${platformIcons[s.platform] || 'fas fa-globe'}" style="color:${platformColors[s.platform] || 'var(--muted)'};font-size:1.1rem"></i>
            <div style="flex:1">
              <div style="font-size:.78rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:400px">${s.content}</div>
              <div style="font-size:.68rem;color:var(--muted)">${new Date(s.scheduledFor).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="_deleteScheduled(${idx})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
          </div>`;
        }).join('') : '<div class="mod-empty"><i class="fas fa-calendar-alt"></i>Nothing scheduled — add posts above</div>'}
      </div>`;

    window._schedulePost = function() {
      const platform = document.getElementById('sch-platform').value;
      const date = document.getElementById('sch-date').value;
      const time = document.getElementById('sch-time').value;
      const content = document.getElementById('sch-content').value.trim();
      if (!date) return toast('Pick a date', 'err');
      if (!content) return toast('Enter content', 'err');
      scheduled.push({ platform, content, scheduledFor: new Date(date + 'T' + (time || '09:00')).toISOString(), created: new Date().toISOString() });
      localStorage.setItem('scheduledPosts', JSON.stringify(scheduled));
      toast('Post scheduled', 'ok');
      refreshCurrentModule();
    };
    window._deleteScheduled = function(i) { scheduled.splice(i, 1); localStorage.setItem('scheduledPosts', JSON.stringify(scheduled)); toast('Removed', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 35 — Content Scheduler</p>
      <p style="font-size:.75rem;color:var(--muted)">Schedule posts across platforms with a visual calendar. Integrate with Buffer or Hootsuite via the webhook system for auto-publishing.</p>`;
  }
})
