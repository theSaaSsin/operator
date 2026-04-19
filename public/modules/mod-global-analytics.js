({
  init() {},
  async render(container) {
    const analytics = await fetch('/api/analytics').then(r => r.json()).catch(() => ({}));
    const leads = await fetch('/api/leads').then(r => r.json()).catch(() => []);
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);
    const outreach = await fetch('/api/outreach').then(r => r.json()).catch(() => []);
    let deals = [];
    try { deals = JSON.parse(localStorage.getItem('deals') || '[]'); } catch {}
    let contentMetrics = [];
    try { contentMetrics = JSON.parse(localStorage.getItem('contentMetrics') || '[]'); } catch {}
    let tickets = [];
    try { tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]'); } catch {}

    const totalRevenue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    const pipelineValue = deals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
    const winRate = deals.length ? Math.round(deals.filter(d => d.stage === 'closed_won').length / deals.length * 100) : 0;
    const totalViews = contentMetrics.reduce((s, m) => s + (parseInt(m.views) || 0), 0);
    const outreachSent = (analytics.outreach || []).filter(r => r.status === 'sent').length;
    const outreachBooked = (analytics.outreach || []).filter(r => r.status === 'booked').length;

    const nicheCounts = {};
    leads.forEach(l => { const n = l.niche || 'Unknown'; nicheCounts[n] = (nicheCounts[n] || 0) + 1; });
    const topNiches = Object.entries(nicheCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const today = new Date(); today.setHours(0,0,0,0);
    const last7 = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date(today); day.setDate(day.getDate() - d);
      const dayStr = day.toISOString().split('T')[0];
      const dayLeads = leads.filter(l => l.created && l.created.startsWith(dayStr)).length;
      last7.push({ label: day.toLocaleDateString('en-GB', {weekday: 'short'}), leads: dayLeads });
    }
    const maxLeads = Math.max(...last7.map(d => d.leads), 1);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">$${totalRevenue.toLocaleString()}</div><div class="mod-stat-label">Total Revenue</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">$${pipelineValue.toLocaleString()}</div><div class="mod-stat-label">Pipeline</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${leads.length}</div><div class="mod-stat-label">Total Leads</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Clients</div></div>
      </div>

      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${outreach.length}</div><div class="mod-stat-label">Outreach Queue</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#3b82f6">${outreachSent}</div><div class="mod-stat-label">Messages Sent</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#a855f7">${outreachBooked}</div><div class="mod-stat-label">Calls Booked</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${winRate}%</div><div class="mod-stat-label">Win Rate</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Leads (7-Day Trend)</div>
        <div class="mod-card" style="padding:16px">
          <div style="display:flex;align-items:flex-end;gap:8px;height:120px">
            ${last7.map(d => {
              const h = Math.max((d.leads / maxLeads) * 100, 4);
              return `<div style="flex:1;text-align:center">
                <div style="background:var(--accent);border-radius:4px 4px 0 0;height:${h}px;margin:0 auto;width:80%;transition:height .3s"></div>
                <div style="font-size:.65rem;color:var(--muted);margin-top:4px">${d.label}</div>
                <div style="font-size:.7rem;color:var(--text)">${d.leads}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="mod-section">
          <div class="mod-section-title">Top Niches</div>
          ${topNiches.length ? `<div class="mod-card">${topNiches.map(([n, c]) => {
            const pct = Math.round((c / leads.length) * 100);
            return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.75rem">
              <span style="flex:1;color:var(--text)">${n}</span>
              <div style="width:80px;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="width:${pct}%;height:100%;background:var(--accent);border-radius:3px"></div></div>
              <span style="color:var(--muted);min-width:30px;text-align:right">${c}</span>
            </div>`;
          }).join('')}</div>` : '<div class="mod-empty"><i class="fas fa-chart-pie"></i>No niche data</div>'}
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Cross-Module Summary</div>
          <div class="mod-card">
            ${[
              { label: 'Deals in Pipeline', val: deals.filter(d => !['closed_won','closed_lost'].includes(d.stage)).length, color: 'var(--accent)' },
              { label: 'Content Views', val: totalViews.toLocaleString(), color: '#a855f7' },
              { label: 'Open Support Tickets', val: tickets.filter(t => t.status === 'open').length, color: '#ef4444' },
              { label: 'Content Pieces', val: contentMetrics.length, color: '#06b6d4' }
            ].map(item => `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:.78rem">
              <span style="color:var(--muted)">${item.label}</span>
              <span style="color:${item.color};font-weight:700">${item.val}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Conversion Funnel</div>
        <div class="mod-card" style="padding:16px">
          ${[
            { stage: 'Leads Found', count: leads.length, color: '#3b82f6' },
            { stage: 'Outreach Sent', count: outreachSent, color: '#8b5cf6' },
            { stage: 'Replies', count: (analytics.outreach || []).filter(r => r.status === 'replied').length, color: '#06b6d4' },
            { stage: 'Calls Booked', count: outreachBooked, color: '#22c55e' },
            { stage: 'Deals Won', count: deals.filter(d => d.stage === 'closed_won').length, color: '#f59e0b' }
          ].map((s, i, arr) => {
            const maxCount = Math.max(arr[0].count, 1);
            const width = Math.max((s.count / maxCount) * 100, 8);
            return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <div style="width:100px;font-size:.72rem;color:var(--muted);text-align:right">${s.stage}</div>
              <div style="flex:1;height:24px;background:rgba(255,255,255,.03);border-radius:4px;overflow:hidden">
                <div style="width:${width}%;height:100%;background:${s.color};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;color:white">${s.count}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 70 — Global Analytics</p>
      <p style="font-size:.75rem;color:var(--muted)">Cross-client, cross-module aggregate dashboard. Revenue, pipeline, lead trends, conversion funnel, and niche distribution — all in one view.</p>`;
  }
})
