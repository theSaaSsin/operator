({
  init() {},
  async render(container) {
    let metrics = [];
    try { metrics = JSON.parse(localStorage.getItem('contentMetrics') || '[]'); } catch {}

    const totalViews = metrics.reduce((s, m) => s + (parseInt(m.views) || 0), 0);
    const totalEngagement = metrics.reduce((s, m) => s + (parseInt(m.engagement) || 0), 0);
    const totalLeads = metrics.reduce((s, m) => s + (parseInt(m.leads) || 0), 0);
    const avgEngRate = metrics.length ? (totalEngagement / Math.max(totalViews, 1) * 100).toFixed(1) : '0.0';

    const platforms = {};
    metrics.forEach(m => {
      if (!platforms[m.platform]) platforms[m.platform] = { views: 0, engagement: 0, leads: 0, count: 0 };
      platforms[m.platform].views += parseInt(m.views) || 0;
      platforms[m.platform].engagement += parseInt(m.engagement) || 0;
      platforms[m.platform].leads += parseInt(m.leads) || 0;
      platforms[m.platform].count++;
    });

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${totalViews.toLocaleString()}</div><div class="mod-stat-label">Total Views</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${totalEngagement.toLocaleString()}</div><div class="mod-stat-label">Engagements</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${totalLeads}</div><div class="mod-stat-label">Leads from Content</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${avgEngRate}%</div><div class="mod-stat-label">Avg Engagement Rate</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Log Content Performance</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Platform</label>
              <select id="cp-platform" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter / X</option>
                <option value="reddit">Reddit</option>
                <option value="facebook">Facebook</option>
                <option value="blog">Blog</option>
                <option value="youtube">YouTube</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Content Title</label>
              <input type="text" id="cp-title" placeholder="Post or article title" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Date</label>
              <input type="date" id="cp-date" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Views / Impressions</label>
              <input type="number" id="cp-views" placeholder="0" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Engagements (likes, comments)</label>
              <input type="number" id="cp-engagement" placeholder="0" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Leads Generated</label>
              <input type="number" id="cp-leads" placeholder="0" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="_logMetric()"><i class="fas fa-chart-line"></i> Log Performance</button>
        </div>
      </div>

      ${Object.keys(platforms).length ? `<div class="mod-section">
        <div class="mod-section-title">Performance by Platform</div>
        <table class="mod-table"><thead><tr><th>Platform</th><th>Posts</th><th>Views</th><th>Engagements</th><th>Leads</th><th>Eng Rate</th></tr></thead><tbody>
          ${Object.entries(platforms).sort((a,b) => b[1].views - a[1].views).map(([p, d]) => `<tr>
            <td><strong>${p.charAt(0).toUpperCase() + p.slice(1)}</strong></td>
            <td>${d.count}</td>
            <td>${d.views.toLocaleString()}</td>
            <td>${d.engagement.toLocaleString()}</td>
            <td style="color:#22c55e">${d.leads}</td>
            <td>${d.views ? (d.engagement / d.views * 100).toFixed(1) : 0}%</td>
          </tr>`).join('')}
        </tbody></table>
      </div>` : ''}

      <div class="mod-section">
        <div class="mod-section-title">Recent Entries (${metrics.length})</div>
        ${metrics.length ? `<table class="mod-table"><thead><tr><th>Title</th><th>Platform</th><th>Views</th><th>Eng</th><th>Leads</th><th>Date</th><th></th></tr></thead><tbody>
          ${metrics.slice(0, 30).map((m, i) => `<tr>
            <td><strong>${m.title || '—'}</strong></td>
            <td>${(m.platform || '').charAt(0).toUpperCase() + (m.platform || '').slice(1)}</td>
            <td>${(parseInt(m.views) || 0).toLocaleString()}</td>
            <td>${(parseInt(m.engagement) || 0).toLocaleString()}</td>
            <td style="color:#22c55e">${m.leads || 0}</td>
            <td style="font-size:.72rem;color:var(--muted)">${m.date || '—'}</td>
            <td><button class="btn btn-secondary btn-sm" onclick="_deleteMetric(${i})" style="color:#ef4444;font-size:.6rem"><i class="fas fa-trash"></i></button></td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-chart-bar"></i>No content metrics yet — log your first entry above</div>'}
      </div>`;

    window._logMetric = function() {
      const title = document.getElementById('cp-title').value.trim();
      if (!title) return toast('Enter a content title', 'err');
      metrics.unshift({
        platform: document.getElementById('cp-platform').value,
        title,
        date: document.getElementById('cp-date').value || new Date().toISOString().split('T')[0],
        views: document.getElementById('cp-views').value || '0',
        engagement: document.getElementById('cp-engagement').value || '0',
        leads: document.getElementById('cp-leads').value || '0',
        created: new Date().toISOString()
      });
      localStorage.setItem('contentMetrics', JSON.stringify(metrics));
      toast('Metric logged', 'ok');
      refreshCurrentModule();
    };
    window._deleteMetric = function(i) { metrics.splice(i, 1); localStorage.setItem('contentMetrics', JSON.stringify(metrics)); toast('Deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 40 — Content Performance Tracker</p>
      <p style="font-size:.75rem;color:var(--muted)">Track views, engagement, and leads generated from your content across platforms. Log metrics manually or receive them via webhooks.</p>`;
  }
})
