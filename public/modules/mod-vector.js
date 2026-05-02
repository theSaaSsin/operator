({
  init() {},

  async render(container) {
    let stats = { total: 0, namespaces: {} };
    let docs   = [];
    let searchResults = [];

    const NS_COLORS = {
      leads:    '#22c55e',
      bible:    '#f59e0b',
      pitches:  '#3b82f6',
      clients:  '#a855f7',
      default:  '#6b7280',
    };

    const nsColor = (ns) => NS_COLORS[ns] || NS_COLORS.default;

    try {
      const r = await fetch('/api/vector/stats', { signal: AbortSignal.timeout(3000) });
      if (r.ok) stats = (await r.json());
    } catch (_) {}

    try {
      const r = await fetch('/api/vector/list', { signal: AbortSignal.timeout(3000) });
      if (r.ok) { const d = await r.json(); docs = d.docs || []; }
    } catch (_) {}

    const nsOptions = ['all', 'leads', 'bible', 'pitches', 'clients', 'default'];

    container.innerHTML = `
<style>
  .vec-stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:10px; margin-bottom:20px; }
  .vec-stat-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:14px; text-align:center; }
  .vec-stat-num  { font-size:1.6rem; font-weight:800; color:var(--accent); }
  .vec-stat-lbl  { font-size:.68rem; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-top:4px; }

  .vec-search-row { display:flex; gap:10px; align-items:stretch; margin-bottom:16px; }
  .vec-search-input { flex:1; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:10px 14px; color:var(--text); font-size:.85rem; font-family:inherit; }
  .vec-search-input:focus { outline:1px solid var(--accent); }
  .vec-ns-select { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:10px 14px; color:var(--text); font-size:.82rem; font-family:inherit; cursor:pointer; min-width:110px; }

  .vec-doc-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:8px; padding:12px 14px; margin-bottom:8px; display:flex; gap:12px; align-items:flex-start; }
  .vec-doc-card:hover { border-color:rgba(255,42,42,.2); }
  .vec-doc-ns   { display:inline-block; padding:2px 8px; border-radius:999px; font-size:.62rem; font-weight:700; letter-spacing:.07em; color:#fff; flex-shrink:0; margin-top:2px; }
  .vec-doc-body { flex:1; min-width:0; }
  .vec-doc-id   { font-size:.72rem; color:var(--muted); margin-bottom:4px; }
  .vec-doc-text { font-size:.8rem; line-height:1.5; white-space:pre-wrap; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; }
  .vec-doc-score { font-size:.78rem; font-weight:700; color:#22c55e; flex-shrink:0; }
  .vec-doc-del  { background:none; border:none; color:var(--muted); cursor:pointer; font-size:.8rem; flex-shrink:0; padding:2px 6px; border-radius:4px; }
  .vec-doc-del:hover { color:#ef4444; background:rgba(239,68,68,.1); }

  .vec-add-form { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:10px; padding:16px; margin-bottom:20px; }
  .vec-add-row  { margin-bottom:12px; }
  .vec-add-label { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-bottom:6px; display:block; }
  .vec-add-input { width:100%; box-sizing:border-box; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:7px; padding:9px 12px; color:var(--text); font-size:.82rem; font-family:inherit; }
  .vec-add-textarea { width:100%; box-sizing:border-box; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1); border-radius:7px; padding:9px 12px; color:var(--text); font-size:.82rem; font-family:inherit; min-height:90px; resize:vertical; }
  .vec-add-input:focus, .vec-add-textarea:focus { outline:1px solid var(--accent); }
  .vec-add-row-inline { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
  .vec-empty { text-align:center; padding:40px 20px; color:var(--muted); font-size:.82rem; }
</style>

<!-- STATS -->
<div class="vec-stat-grid">
  <div class="vec-stat-card">
    <div class="vec-stat-num">${stats.total || 0}</div>
    <div class="vec-stat-lbl">Vectors stored</div>
  </div>
  ${Object.entries(stats.namespaces || {}).map(([ns, count]) => `
    <div class="vec-stat-card">
      <div class="vec-stat-num" style="color:${nsColor(ns)}">${count}</div>
      <div class="vec-stat-lbl">${ns}</div>
    </div>`).join('')}
  ${Object.keys(stats.namespaces || {}).length === 0 ? `
    <div class="vec-stat-card">
      <div class="vec-stat-num" style="color:var(--muted)">—</div>
      <div class="vec-stat-lbl">No namespaces yet</div>
    </div>` : ''}
</div>

<!-- SEMANTIC SEARCH -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-magnifying-glass" style="margin-right:6px"></i>Semantic Search</div>
  <div class="vec-search-row">
    <input id="vec-query" class="vec-search-input" type="text" placeholder='Try: "angry client about pricing" or "cold email for SaaS agency"' />
    <select id="vec-ns-filter" class="vec-ns-select">
      ${nsOptions.map(n => `<option value="${n}">${n}</option>`).join('')}
    </select>
    <button class="btn btn-primary" id="vec-search-btn" onclick="window._vecSearch()">
      <i class="fas fa-search"></i> Search
    </button>
  </div>
  <div id="vec-results"></div>
</div>

<!-- ADD DOCUMENT -->
<div class="mod-section">
  <div class="mod-section-title"><i class="fas fa-plus-circle" style="margin-right:6px"></i>Add to Vector Store</div>
  <div class="vec-add-form">
    <div class="vec-add-row-inline">
      <div>
        <label class="vec-add-label">ID (unique key)</label>
        <input id="vec-add-id" class="vec-add-input" placeholder="e.g. pitch:saas-agency-001" />
      </div>
      <div>
        <label class="vec-add-label">Namespace</label>
        <select id="vec-add-ns" class="vec-add-input" style="cursor:pointer">
          <option value="default">default</option>
          <option value="leads">leads</option>
          <option value="bible">bible</option>
          <option value="pitches">pitches</option>
          <option value="clients">clients</option>
        </select>
      </div>
    </div>
    <div class="vec-add-row">
      <label class="vec-add-label">Content (this gets embedded)</label>
      <textarea id="vec-add-content" class="vec-add-textarea" placeholder="Paste any text: a pitch, a lead post, a client bio, a cold email..."></textarea>
    </div>
    <div class="vec-add-row">
      <label class="vec-add-label">Metadata (optional JSON)</label>
      <input id="vec-add-meta" class="vec-add-input" placeholder='{"source":"reddit","score":80}' />
    </div>
    <button class="btn btn-primary" onclick="window._vecAdd()" id="vec-add-btn">
      <i class="fas fa-database"></i> Embed & Store
    </button>
  </div>
</div>

<!-- DOCUMENT LIST -->
<div class="mod-section">
  <div class="mod-section-title" style="display:flex;justify-content:space-between;align-items:center">
    <span><i class="fas fa-list" style="margin-right:6px"></i>All Documents <span id="vec-count" style="color:var(--muted);font-weight:400">(${docs.length})</span></span>
    <select id="vec-list-ns" class="vec-ns-select" style="font-size:.7rem" onchange="window._vecFilterList(this.value)">
      <option value="">All namespaces</option>
      ${nsOptions.slice(1).map(n => `<option value="${n}">${n}</option>`).join('')}
    </select>
  </div>
  <div id="vec-doc-list">
    ${docs.length === 0
      ? `<div class="vec-empty"><i class="fas fa-database" style="font-size:2rem;margin-bottom:12px;display:block;opacity:.3"></i>No vectors yet — add your first document above.</div>`
      : docs.map(d => window._vecDocCard ? '' : `
        <div class="vec-doc-card" id="vdoc-${CSS.escape(d.id)}">
          <span class="vec-doc-ns" style="background:${nsColor(d.ns)}">${d.ns}</span>
          <div class="vec-doc-body">
            <div class="vec-doc-id">${d.id}</div>
            <div class="vec-doc-text">${d.content}</div>
            ${d.metadata && Object.keys(d.metadata).length ? `<div style="font-size:.68rem;color:var(--muted);margin-top:4px">${JSON.stringify(d.metadata)}</div>` : ''}
          </div>
          <button class="vec-doc-del" onclick="window._vecDel('${d.id.replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
        </div>`).join('')}
  </div>
</div>`;

    // ── Render doc card helper ─────────────────────────────────────────────────
    window._vecDocCard = (d, score = null) => `
      <div class="vec-doc-card" id="vdoc-${CSS.escape(d.id)}">
        <span class="vec-doc-ns" style="background:${nsColor(d.ns)}">${d.ns}</span>
        <div class="vec-doc-body">
          <div class="vec-doc-id">${d.id}</div>
          <div class="vec-doc-text">${(d.content || '').slice(0, 300)}${d.content?.length > 300 ? '…' : ''}</div>
          ${d.metadata && Object.keys(d.metadata).length ? `<div style="font-size:.68rem;color:var(--muted);margin-top:4px">${JSON.stringify(d.metadata)}</div>` : ''}
        </div>
        ${score !== null ? `<div class="vec-doc-score">${Math.round(score * 100)}%</div>` : ''}
        <button class="vec-doc-del" onclick="window._vecDel('${d.id.replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
      </div>`;

    // ── Re-render list ─────────────────────────────────────────────────────────
    window._vecRenderList = (data) => {
      const el = document.getElementById('vec-doc-list');
      if (!el) return;
      if (!data.length) {
        el.innerHTML = `<div class="vec-empty"><i class="fas fa-database" style="font-size:2rem;margin-bottom:12px;display:block;opacity:.3"></i>No documents in this namespace.</div>`;
        return;
      }
      el.innerHTML = data.map(d => window._vecDocCard(d)).join('');
      const cnt = document.getElementById('vec-count');
      if (cnt) cnt.textContent = `(${data.length})`;
    };
    window._vecRenderList(docs);

    // ── Filter list by namespace ───────────────────────────────────────────────
    window._vecFilterList = async (ns) => {
      try {
        const url = ns ? `/api/vector/list?ns=${encodeURIComponent(ns)}` : '/api/vector/list';
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (r.ok) { const d = await r.json(); window._vecRenderList(d.docs || []); }
      } catch (_) {}
    };

    // ── Search ─────────────────────────────────────────────────────────────────
    window._vecSearch = async () => {
      const query = document.getElementById('vec-query')?.value?.trim();
      if (!query) return;
      const ns = document.getElementById('vec-ns-filter')?.value;
      const btn = document.getElementById('vec-search-btn');
      const out = document.getElementById('vec-results');
      if (!query || !out) return;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...'; }
      try {
        const r = await fetch('/api/vector/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, ns: ns === 'all' ? null : ns, topK: 8 }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (!d.results?.length) {
          out.innerHTML = `<div style="padding:16px;font-size:.8rem;color:var(--muted)">No results above threshold. Try different keywords or lower threshold.</div>`;
        } else {
          out.innerHTML = `<div style="font-size:.72rem;color:var(--muted);margin-bottom:8px">${d.count} result${d.count !== 1 ? 's' : ''}</div>` +
            d.results.map(r => window._vecDocCard(r, r.score)).join('');
        }
      } catch (e) {
        out.innerHTML = `<div style="padding:16px;font-size:.8rem;color:#ef4444"><i class="fas fa-circle-xmark"></i> ${e.message}</div>`;
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-search"></i> Search'; }
      }
    };

    // ── Add doc ───────────────────────────────────────────────────────────────
    window._vecAdd = async () => {
      const id      = document.getElementById('vec-add-id')?.value?.trim();
      const content = document.getElementById('vec-add-content')?.value?.trim();
      const ns      = document.getElementById('vec-add-ns')?.value || 'default';
      const metaRaw = document.getElementById('vec-add-meta')?.value?.trim();
      if (!id || !content) { toast('ID and content are required', 'error'); return; }
      let metadata = {};
      if (metaRaw) { try { metadata = JSON.parse(metaRaw); } catch { toast('Metadata must be valid JSON', 'error'); return; } }
      const btn = document.getElementById('vec-add-btn');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Embedding...'; }
      try {
        const r = await fetch('/api/vector/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, content, metadata, ns }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        toast(`Stored: ${id} (${d.dims}-dim)`, 'ok');
        document.getElementById('vec-add-id').value = '';
        document.getElementById('vec-add-content').value = '';
        document.getElementById('vec-add-meta').value = '';
        // Refresh list
        window._vecFilterList(document.getElementById('vec-list-ns')?.value || '');
      } catch (e) {
        toast(e.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-database"></i> Embed & Store'; }
      }
    };

    // ── Delete doc ────────────────────────────────────────────────────────────
    window._vecDel = async (id) => {
      if (!confirm(`Delete vector: ${id}?`)) return;
      try {
        const r = await fetch('/api/vector/doc', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (r.ok) {
          const el = document.getElementById(`vdoc-${CSS.escape(id)}`);
          if (el) el.remove();
          toast('Deleted', 'ok');
        }
      } catch (_) {}
    };

    // ── Enter key on search ───────────────────────────────────────────────────
    document.getElementById('vec-query')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') window._vecSearch();
    });
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Vector Store</p>
      <p style="font-size:.75rem;color:var(--muted);line-height:1.6">
        Semantic memory for B.O.S.S. Embed leads, pitches, knowledge bible entries, and client notes.
        Search by meaning — not keywords. Powered by Gemini text-embedding-004 (free, 768-dim).
      </p>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
        <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:8px">Namespaces</div>
        ${['leads','bible','pitches','clients','default'].map(ns => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)">
            <span style="font-size:.75rem">${ns}</span>
            <button class="btn btn-ghost btn-sm" style="font-size:.65rem;color:#ef4444" onclick="if(confirm('Clear ${ns} namespace?')) fetch('/api/vector/ns',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({ns:'${ns}'})}).then(()=>toast('${ns} cleared','ok'))">
              Clear
            </button>
          </div>`).join('')}
      </div>`;
  },
})
