({
  init() {},
  render(container) {
    const fa = (function() { try { return JSON.parse(localStorage.getItem('feedActivity') || 'null') || {}; } catch { return {}; } })();
    const kwData = fa.topKeywords || {};
    const entries = Object.entries(kwData).sort((a,b) => b[1] - a[1]);
    const totalLeads = entries.reduce((s,[,v]) => s + v, 0);
    const pool = typeof KW_POOL !== 'undefined' ? KW_POOL : [];
    const desp = typeof DESPERATION_SIGNALS !== 'undefined' ? DESPERATION_SIGNALS : [];
    const real = typeof REAL_INTENT !== 'undefined' ? REAL_INTENT : [];
    const soft = typeof SOFT_INTENT !== 'undefined' ? SOFT_INTENT : [];

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val">${pool.length}</div><div class="mod-stat-label">Keywords in Pool</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:#ef4444">${desp.length}</div><div class="mod-stat-label">Desperation Signals</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${real.length}</div><div class="mod-stat-label">Real Intent</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${soft.length}</div><div class="mod-stat-label">Soft Intent</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Keyword Performance (by leads found)</div>
        ${entries.length ? `<table class="mod-table"><thead><tr><th>Keyword</th><th>Leads</th><th>Share</th></tr></thead><tbody>
          ${entries.slice(0,20).map(([k,v]) => {
            const pct = totalLeads ? Math.round((v/totalLeads)*100) : 0;
            return `<tr><td><strong>"${k}"</strong></td><td>${v}</td><td><div style="display:flex;align-items:center;gap:6px"><div style="width:${pct}px;height:6px;background:var(--accent);border-radius:3px"></div><span style="font-size:.7rem;color:var(--muted)">${pct}%</span></div></td></tr>`;
          }).join('')}
        </tbody></table>` : '<div class="mod-empty"><i class="fas fa-search"></i>No keyword data yet — scan the Lead Feed to build stats</div>'}
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Test a Phrase</div>
        <div class="mod-card" style="display:flex;gap:8px;align-items:flex-end">
          <div style="flex:1">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Enter a phrase to test against scoring engine</label>
            <input type="text" id="kw-test-input" placeholder="e.g. I have no clients and no time" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
          </div>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('kw-test-result').innerHTML=_testPhrase()">Test</button>
        </div>
        <div id="kw-test-result" style="margin-top:8px"></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Keyword Pool (${pool.length} entries)</div>
        <div style="max-height:300px;overflow-y:auto;background:rgba(255,255,255,.02);border-radius:6px;padding:10px;font-size:.75rem;color:var(--muted);line-height:1.8">
          ${pool.map(k => `<span style="display:inline-block;background:rgba(255,255,255,.06);padding:2px 8px;border-radius:4px;margin:2px">${k}</span>`).join('')}
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Desperation Signals (${desp.length} entries)</div>
        <div style="max-height:200px;overflow-y:auto;background:rgba(239,68,68,.04);border-radius:6px;padding:10px;font-size:.75rem;color:var(--muted);line-height:1.8">
          ${desp.map(k => `<span style="display:inline-block;background:rgba(239,68,68,.1);padding:2px 8px;border-radius:4px;margin:2px;color:#ef4444">${k}</span>`).join('')}
        </div>
      </div>`;

    window._testPhrase = function() {
      const input = document.getElementById('kw-test-input').value;
      if (!input.trim()) return '<p style="color:var(--muted);font-size:.8rem">Enter a phrase above</p>';
      const score = typeof scorePost === 'function' ? scorePost(input, '', false) : 0;
      const analysis = typeof analyzePost === 'function' ? analyzePost(input, '', score) : {};
      const color = score >= 85 ? '#ef4444' : score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#8888a0';
      return `<div class="mod-card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <span style="font-size:1.4rem;font-weight:800;color:${color}">${score}</span>
          <span style="font-size:.8rem;font-weight:600;color:${color}">${analysis.urgencyLabel || 'N/A'}</span>
          <span style="font-size:.72rem;color:var(--muted)">${analysis.urgencyReason || ''}</span>
        </div>
        ${analysis.niche ? `<p style="font-size:.78rem;color:var(--muted)"><strong>Niche:</strong> ${analysis.niche}</p>` : ''}
        ${analysis.problem ? `<p style="font-size:.78rem;color:var(--text)"><strong>Problem:</strong> ${analysis.problem}</p>` : ''}
        ${analysis.cause ? `<p style="font-size:.78rem;color:var(--muted)"><strong>Cause:</strong> ${analysis.cause}</p>` : ''}
        ${analysis.angle ? `<p style="font-size:.78rem;color:var(--accent)"><strong>Angle:</strong> ${analysis.angle}</p>` : ''}
      </div>`;
    };
  }
})
