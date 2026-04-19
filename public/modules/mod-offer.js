({
  init() {},
  async render(container) {
    let offers = [];
    try { offers = JSON.parse(localStorage.getItem('offers') || '[]'); } catch {}
    const clients = await fetch('/api/clients').then(r => r.json()).catch(() => []);

    container.innerHTML = `
      <div class="mod-stat-row">
        <div class="mod-stat"><div class="mod-stat-val" style="color:#22c55e">${offers.length}</div><div class="mod-stat-label">Offers Generated</div></div>
        <div class="mod-stat"><div class="mod-stat-val" style="color:var(--accent)">${offers.filter(o => o.sent).length}</div><div class="mod-stat-label">Sent to Client</div></div>
        <div class="mod-stat"><div class="mod-stat-val">${clients.length}</div><div class="mod-stat-label">Available Clients</div></div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">AI Offer Generator</div>
        <div class="mod-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Niche / Industry</label>
              <input type="text" id="of-niche" placeholder="e.g. dental clinics" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Client (optional)</label>
              <select id="of-client" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
                <option value="">— None —</option>
                ${clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Pain Points / Problems</label>
            <textarea id="of-pain" rows="3" placeholder="e.g. No online presence, losing patients to competitors, no booking system" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit;resize:vertical"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Price Range</label>
              <input type="text" id="of-price" placeholder="e.g. $1,500 - $3,000" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
            <div>
              <label style="font-size:.7rem;color:var(--muted);display:block;margin-bottom:4px">Timeline</label>
              <input type="text" id="of-timeline" placeholder="e.g. 2-3 weeks" style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:.82rem;font-family:inherit">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="of-gen-btn" onclick="_generateOffer()"><i class="fas fa-magic"></i> Generate Offer with AI</button>
          <div id="of-result" style="margin-top:10px"></div>
        </div>
      </div>

      <div class="mod-section">
        <div class="mod-section-title">Saved Offers (${offers.length})</div>
        ${offers.length ? offers.map((o, i) => `
          <div class="mod-card" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div>
                <strong style="font-size:.85rem">${o.niche || 'Offer'}</strong>
                ${o.client ? `<span style="font-size:.7rem;color:var(--muted);margin-left:8px">→ ${o.client}</span>` : ''}
                <span style="font-size:.68rem;color:var(--muted);margin-left:8px">${o.price || ''}</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-sm ${o.sent ? 'btn-primary' : 'btn-secondary'}" onclick="_toggleOfferSent(${i})">${o.sent ? '<i class="fas fa-check"></i> Sent' : 'Mark Sent'}</button>
                <button class="btn btn-secondary btn-sm" onclick="_deleteOffer(${i})" style="color:#ef4444"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <div style="font-size:.78rem;color:var(--text);white-space:pre-wrap;max-height:200px;overflow-y:auto;background:rgba(255,255,255,.02);padding:8px;border-radius:6px">${o.content || ''}</div>
            <div style="font-size:.68rem;color:var(--muted);margin-top:6px">${new Date(o.created).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        `).join('') : '<div class="mod-empty"><i class="fas fa-file-invoice-dollar"></i>No offers yet — generate your first offer above</div>'}
      </div>`;

    window._generateOffer = async function() {
      const niche = document.getElementById('of-niche').value.trim();
      const pain = document.getElementById('of-pain').value.trim();
      const price = document.getElementById('of-price').value.trim();
      const timeline = document.getElementById('of-timeline').value.trim();
      if (!niche) return toast('Enter a niche', 'err');
      if (!pain) return toast('Enter pain points', 'err');

      const btn = document.getElementById('of-gen-btn');
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      document.getElementById('of-result').innerHTML = '<p style="color:var(--muted);font-size:.8rem">Calling AI...</p>';

      try {
        const resp = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `Generate a professional service offer for a ${niche} business.\n\nTheir pain points: ${pain}\nPrice range: ${price || 'suggest appropriate pricing'}\nTimeline: ${timeline || 'suggest timeline'}\n\nFormat the offer with:\n1. Headline\n2. Problem statement\n3. Solution overview (3-5 deliverables)\n4. Pricing with breakdown\n5. Timeline\n6. Guarantee/risk reversal\n7. Call to action\n\nKeep it concise and compelling.` })
        });
        const data = await resp.json();
        const content = data.response || data.text || data.message || 'No response from AI';
        const client = document.getElementById('of-client').value;
        offers.unshift({ niche, client, pain, price, timeline, content, sent: false, created: new Date().toISOString() });
        localStorage.setItem('offers', JSON.stringify(offers));
        toast('Offer generated', 'ok');
        refreshCurrentModule();
      } catch (e) {
        document.getElementById('of-result').innerHTML = `<p style="color:#ef4444;font-size:.8rem">AI error: ${e.message}</p>`;
      } finally {
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-magic"></i> Generate Offer with AI';
      }
    };
    window._toggleOfferSent = function(i) { offers[i].sent = !offers[i].sent; localStorage.setItem('offers', JSON.stringify(offers)); refreshCurrentModule(); };
    window._deleteOffer = function(i) { offers.splice(i, 1); localStorage.setItem('offers', JSON.stringify(offers)); toast('Offer deleted', 'ok'); refreshCurrentModule(); };
  },
  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <p style="font-size:.8rem;color:var(--muted);margin-bottom:12px">Module 23 — Offer Generator</p>
      <p style="font-size:.75rem;color:var(--muted)">Generate professional service offers using AI. Input your client's niche and pain points to get a structured offer with pricing and deliverables.</p>
      <p style="font-size:.72rem;color:var(--muted);margin-top:12px;opacity:.6">Requires the /api/ai endpoint to be configured with a Claude API key.</p>`;
  }
})
