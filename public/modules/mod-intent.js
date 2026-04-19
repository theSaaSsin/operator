({
  init() {},
  async render(container) {
    container.innerHTML = '<div class="mod-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading leads…</div>';
    try {
      const data = await fetch('/api/leads').then(r => r.json());
      const leads = (data.leads || []).sort((a,b) => (b.score||0) - (a.score||0));
      if (!leads.length) {
        container.innerHTML = '<div class="mod-empty"><i class="fas fa-brain"></i>No leads saved yet — save leads from the Lead Feed first</div>';
        return;
      }

      const high = leads.filter(l => (l.score||0) >= 70).length;
      const med = leads.filter(l => (l.score||0) >= 40 && (l.score||0) < 70).length;
      const low = leads.filter(l => (l.score||0) < 40).length;
      const avgScore = Math.round(leads.reduce((s,l) => s + (l.score||0), 0) / leads.length);

      const nicheMap = {};
      leads.forEach(l => { const n = l.niche || 'Unknown'; nicheMap[n] = (nicheMap[n]||0) + 1; });
      const nicheEntries = Object.entries(nicheMap).sort((a,b) => b[1] - a[1]).slice(0, 8);

      container.innerHTML = `
        <div class="mod-stat-row">
          <div class="mod-stat"><div class="mod-stat-val">${leads.length}</div><div class="mod-stat-label">Total Leads</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${high}</div><div class="mod-stat-label">High Intent</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:#f59e0b">${med}</div><div class="mod-stat-label">Medium Intent</div></div>
          <div class="mod-stat"><div class="mod-stat-val" style="color:var(--muted)">${low}</div><div class="mod-stat-label">Low Intent</div></div>
          <div class="mod-stat"><div class="mod-stat-val">${avgScore}</div><div class="mod-stat-label">Avg Score</div></div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Niche Breakdown</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${nicheEntries.map(([n,c]) => `<span style="background:rgba(255,255,255,.06);padding:4px 10px;border-radius:6px;font-size:.76rem"><strong>${n}</strong> <span style="color:var(--muted)">${c}</span></span>`).join('')}
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Lead Intelligence (Top ${Math.min(leads.length,30)})</div>
          <table class="mod-table">
            <thead><tr><th>Lead</th><th>Score</th><th>Niche</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>
              ${leads.slice(0,30).map(l => {
                const sc = l.score || 0;
                const color = sc >= 70 ? '#22c55e' : sc >= 40 ? '#f59e0b' : '#8888a0';
                return `<tr>
                  <td><strong>${l.name||'Unknown'}</strong><br><span style="font-size:.68rem;color:var(--muted)">${l.business||''}</span></td>
                  <td><span style="color:${color};font-weight:700">${sc}</span></td>
                  <td>${l.niche||'—'}</td>
                  <td><span style="font-size:.72rem;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.06)">${l.status||'new'}</span></td>
                  <td style="font-size:.72rem;color:var(--muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.notes||'—'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`;
    } catch {
      container.innerHTML = '<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Could not load leads</p></div>';
    }
  }
})
