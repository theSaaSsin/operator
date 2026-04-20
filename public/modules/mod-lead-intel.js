({
  init() {},

  async render(container) {
    container.innerHTML = `
      <div style="padding:20px;max-width:900px;margin:0 auto">

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- SECTION 1 — MARKET SCANNER                             -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="mod-section">
          <div class="mod-section-title">
            <i class="fas fa-radar" style="color:var(--accent)"></i>
            &nbsp;Market Scanner
          </div>

          <div class="mod-card" style="padding:16px">
            <div class="mod-field" style="margin-bottom:12px">
              <label style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:6px">
                Describe Your Target Market
              </label>
              <textarea
                id="li-market-desc"
                class="mod-textarea"
                style="height:80px;font-size:.84rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:10px 12px;color:var(--text);font-family:inherit;resize:vertical;outline:none"
                placeholder='e.g. "fitness coaches with less than 500 IG followers who complain about not getting clients"'
              ></textarea>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:20px;margin-bottom:14px">
              <div>
                <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px">Platforms</div>
                <div style="display:flex;flex-wrap:wrap;gap:10px" id="li-platforms">
                  ${['Reddit','Twitter/X','LinkedIn','Facebook Groups','Quora','Google'].map(p => `
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.8rem;color:var(--text)">
                      <input type="checkbox" value="${p}" checked
                        style="accent-color:var(--accent);width:13px;height:13px;cursor:pointer"
                        class="li-plat-cb">
                      ${p}
                    </label>`).join('')}
                </div>
              </div>

              <div style="margin-left:auto">
                <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px">Scan Depth</div>
                <div style="display:flex;gap:10px">
                  ${[['quick','Quick (50)'],['deep','Deep (200)'],['exhaustive','Exhaustive (500)']].map(([v,l],i) => `
                    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:.8rem;color:var(--text)">
                      <input type="radio" name="li-depth" value="${v}" ${i===0?'checked':''} style="accent-color:var(--accent);cursor:pointer">
                      ${l}
                    </label>`).join('')}
                </div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:10px">
              <button class="btn btn-primary" id="li-scan-btn" onclick="_liScan()">
                <i class="fas fa-satellite-dish"></i> Scan Now
              </button>
              <div id="li-scan-loading" style="display:none;font-size:.78rem;color:var(--muted)">
                <i class="fas fa-circle-notch fa-spin"></i> B.O.S.S is scanning the market…
              </div>
            </div>
          </div>

          <div id="li-scan-results" style="margin-top:14px"></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- SECTION 2 — PITCH INTELLIGENCE                         -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="mod-section">
          <div class="mod-section-title">
            <i class="fas fa-crosshairs" style="color:#f59e0b"></i>
            &nbsp;Pitch Intelligence
          </div>

          <div class="mod-card" style="padding:16px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
              <div class="mod-field">
                <label style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:6px">
                  Who You're Pitching
                </label>
                <input id="li-pitch-target" class="mod-input"
                  style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:9px 12px;color:var(--text);font-size:.84rem;font-family:inherit;outline:none"
                  placeholder='e.g. solo fitness coaches struggling to get clients online'/>
              </div>
              <div class="mod-field">
                <label style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);display:block;margin-bottom:6px">
                  What You're Offering
                </label>
                <input id="li-pitch-offer" class="mod-input"
                  style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:6px;padding:9px 12px;color:var(--text);font-size:.84rem;font-family:inherit;outline:none"
                  placeholder='e.g. done-for-you client acquisition system, £500/mo'/>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:10px">
              <button class="btn btn-primary" id="li-pitch-btn" onclick="_liGenPitch()">
                <i class="fas fa-bolt"></i> Generate Battle Pack
              </button>
              <div id="li-pitch-loading" style="display:none;font-size:.78rem;color:var(--muted)">
                <i class="fas fa-circle-notch fa-spin"></i> Building 3 pitch variants…
              </div>
            </div>
          </div>

          <div id="li-pitch-results" style="margin-top:14px"></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════ -->
        <!-- SECTION 3 — OPPORTUNITY RADAR                          -->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="mod-section">
          <div class="mod-section-title">
            <i class="fas fa-circle-dot" style="color:#22c55e"></i>
            &nbsp;Opportunity Radar
          </div>

          <div class="mod-card" style="padding:16px">
            <p style="font-size:.8rem;color:var(--muted);margin-bottom:14px;line-height:1.5">
              Identify the top underserved pain points in the market right now — niches where you could charge £500–£2,000/month for a solution.
            </p>
            <div style="display:flex;align-items:center;gap:10px">
              <button class="btn btn-primary" id="li-radar-btn" onclick="_liRadar()">
                <i class="fas fa-tower-broadcast"></i> Scan Trending Pain Points
              </button>
              <div id="li-radar-loading" style="display:none;font-size:.78rem;color:var(--muted)">
                <i class="fas fa-circle-notch fa-spin"></i> Analysing market opportunities…
              </div>
            </div>
          </div>

          <div id="li-radar-results" style="margin-top:14px"></div>
        </div>

      </div>`;

    /* ─── helpers ─────────────────────────────────────────────── */
    const API = '/api/boss/chat';

    async function callBoss(payload) {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data.text || data.reply || data.message || '';
    }

    function esc(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* ─── navigate to Cold Outreach with prefill ──────────────── */
    function goToOutreach(pain, offer) {
      localStorage.setItem('li_prefill_pain',  pain  || '');
      localStorage.setItem('li_prefill_offer', offer || '');
      // attempt to navigate via operator nav
      const item = document.querySelector('[data-target="mod-cold-outreach"]') ||
                   document.querySelector('.nav-item[data-key="mod-cold-outreach"]');
      if (item) { item.click(); return; }
      window.toast && toast('Go to Cold Outreach — pain point pre-filled in localStorage', 'ok');
    }

    /* ─── push to Queue helper ────────────────────────────────── */
    function sendToQueue(subject, body) {
      try {
        const q = JSON.parse(localStorage.getItem('outreachQueue') || '[]');
        q.unshift({ id: Date.now(), message: `${subject}\n\n${body}`, status: 'queued', addedAt: new Date().toISOString() });
        localStorage.setItem('outreachQueue', JSON.stringify(q));
        window.toast && toast('Sent to Outreach Queue', 'ok');
      } catch { window.toast && toast('Could not push to queue', 'err'); }
    }

    /* ═══════════════════════════════════════════════════════════ */
    /* MARKET SCANNER                                             */
    /* ═══════════════════════════════════════════════════════════ */
    window._liScan = async function() {
      const desc = document.getElementById('li-market-desc').value.trim();
      if (!desc) { window.toast && toast('Describe your target market first', 'err'); return; }

      const checked = [...document.querySelectorAll('.li-plat-cb:checked')].map(c => c.value);
      if (!checked.length) { window.toast && toast('Select at least one platform', 'err'); return; }

      const depth = document.querySelector('[name="li-depth"]:checked')?.value || 'quick';
      const depthMap = { quick: '50 leads', deep: '200 leads', exhaustive: '500 leads' };

      const btn = document.getElementById('li-scan-btn');
      const loading = document.getElementById('li-scan-loading');
      const results = document.getElementById('li-scan-results');

      btn.disabled = true;
      loading.style.display = '';
      results.innerHTML = '';

      const systemPrompt = 'You are a lead intelligence expert. Generate a detailed market scan report. Be specific about WHERE to find these leads (exact subreddits, hashtags, keywords, search queries). Output structured data.';

      const message = `Scan this market: ${desc}. Platforms: ${checked.join(', ')}. Target volume: ${depthMap[depth]}.
Return exactly:
1) Top 5 subreddits/communities with member counts (label each: COMMUNITY: name | members: X | why)
2) Top 10 exact search queries that surface pain (label each: QUERY: "...")
3) Top 5 keywords people use when struggling (label each: KEYWORD: ...)
4) Typical pain statements verbatim — at least 4 real-sounding quotes (label each: PAIN: "...")
5) Best times/triggers to reach out (label: TIMING: ...)
6) 3 example prospect archetypes — no fake names, describe the person (label each: ARCHETYPE: ...)`;

      try {
        const raw = await callBoss({ taskKind: 'analyse', system: systemPrompt, messages: [{ role: 'user', content: message }] });
        results.innerHTML = _liRenderScanCards(raw, desc);
      } catch (e) {
        results.innerHTML = `<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Scan failed — check API connection</p></div>`;
      }

      btn.disabled = false;
      loading.style.display = 'none';
    };

    function _liRenderScanCards(raw, marketDesc) {
      // Parse labelled sections out of the raw AI text
      function extract(label, text) {
        const rx = new RegExp(`${label}:([^\\n]+)`, 'gi');
        const matches = [];
        let m;
        while ((m = rx.exec(text)) !== null) matches.push(m[1].trim());
        return matches;
      }

      const communities = extract('COMMUNITY', raw);
      const queries     = extract('QUERY', raw);
      const keywords    = extract('KEYWORD', raw);
      const pains       = extract('PAIN', raw);
      const timings     = extract('TIMING', raw);
      const archetypes  = extract('ARCHETYPE', raw);

      // Fallback: if parsing got nothing, show raw in a card
      if (!communities.length && !queries.length && !pains.length) {
        return `<div class="mod-card"><pre style="white-space:pre-wrap;font-size:.78rem;color:var(--text);line-height:1.6">${esc(raw)}</pre></div>`;
      }

      const card = (icon, color, title, items, btnLabel) => {
        if (!items.length) return '';
        return `
          <div class="mod-card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <i class="fas ${icon}" style="color:${color};font-size:.9rem"></i>
              <span style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">${title}</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${items.map(item => `
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:8px 10px;background:rgba(255,255,255,.03);border-radius:6px;border:1px solid rgba(255,255,255,.05)">
                  <span style="font-size:.82rem;line-height:1.5;flex:1">${esc(item)}</span>
                  ${btnLabel ? `<button class="btn btn-sm btn-secondary" onclick="_liUseInPitch('${esc(item).replace(/'/g,"\\'")}','${esc(marketDesc).replace(/'/g,"\\'")}')" style="white-space:nowrap;flex-shrink:0">${btnLabel}</button>` : ''}
                </div>`).join('')}
            </div>
          </div>`;
      };

      return `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div>
            ${card('fa-users-rectangle','var(--accent)','Top Communities / Subreddits', communities, '')}
            ${card('fa-magnifying-glass','#60a5fa','Top Search Queries', queries, '')}
            ${card('fa-key','#a78bfa','Pain Keywords', keywords, '')}
          </div>
          <div>
            ${card('fa-quote-left','#f59e0b','Pain Statements (Verbatim)', pains, 'Use in Pitch')}
            ${card('fa-clock','#22c55e','Best Reach-out Timing', timings, '')}
            ${card('fa-person','#ec4899','Prospect Archetypes', archetypes, 'Use in Pitch')}
          </div>
        </div>`;
    }

    window._liUseInPitch = function(painText, marketDesc) {
      // Pre-fill Pitch Intelligence section
      const targetEl = document.getElementById('li-pitch-target');
      const offerEl  = document.getElementById('li-pitch-offer');
      if (targetEl && !targetEl.value) targetEl.value = marketDesc || '';
      // scroll to pitch section
      document.getElementById('li-pitch-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Also store for cold outreach prefill
      localStorage.setItem('li_prefill_pain', painText);
      window.toast && toast('Pre-filled in Pitch Intelligence — also stored for Cold Outreach', 'ok');
    };

    /* ═══════════════════════════════════════════════════════════ */
    /* PITCH INTELLIGENCE                                         */
    /* ═══════════════════════════════════════════════════════════ */
    window._liGenPitch = async function() {
      const target = document.getElementById('li-pitch-target').value.trim();
      const offer  = document.getElementById('li-pitch-offer').value.trim();
      if (!target) { window.toast && toast('Enter who you are pitching', 'err'); return; }
      if (!offer)  { window.toast && toast('Enter your offer', 'err'); return; }

      const btn     = document.getElementById('li-pitch-btn');
      const loading = document.getElementById('li-pitch-loading');
      const results = document.getElementById('li-pitch-results');

      btn.disabled = true;
      loading.style.display = '';
      results.innerHTML = '';

      const systemPrompt = 'You are a direct-response copywriting expert. Write real, battle-tested pitch variants. Use genuine pain language. No fake stats. Test distinctly different psychological angles. Focus on specificity and emotional resonance.';

      const message = `Write 3 pitch variants targeting: "${target}"
Offer: "${offer}"

VARIANT A — Problem-Aware (they know they have the problem, but haven't found the right solution):
- Subject line
- Opening hook (1 sentence that names their exact pain)
- Body (3-4 sentences max)
- CTA
- Estimated read time

VARIANT B — Solution-Aware (comparing options, know a solution exists):
- Subject line
- Opening hook (lead with differentiation — why yours beats what they're currently considering)
- Body (3-4 sentences)
- CTA
- Estimated read time

VARIANT C — Unaware (don't know there's a solution — pattern interrupt required):
- Subject line
- Opening hook (challenge their current worldview or assumption)
- Body (3-4 sentences)
- CTA
- Estimated read time

Format each section EXACTLY:
---VARIANT A---
SUBJECT: ...
HOOK: ...
BODY: ...
CTA: ...
READ_TIME: ...
---VARIANT B---
...
---VARIANT C---
...`;

      try {
        const raw = await callBoss({ taskKind: 'pitch', system: systemPrompt, messages: [{ role: 'user', content: message }], maxTokens: 1200 });
        results.innerHTML = _liRenderPitchVariants(raw, target, offer);
      } catch (e) {
        results.innerHTML = `<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Pitch generation failed — check API connection</p></div>`;
      }

      btn.disabled = false;
      loading.style.display = 'none';
    };

    function _liRenderPitchVariants(raw, target, offer) {
      const variantMeta = [
        { key: 'A', label: 'Problem-Aware',   color: 'var(--accent)',  desc: 'They know the pain — needs the right solution',  icon: 'fa-head-side-virus' },
        { key: 'B', label: 'Solution-Aware',   color: '#f59e0b',        desc: 'Comparing options — lead with differentiation',   icon: 'fa-scale-balanced' },
        { key: 'C', label: 'Unaware',          color: '#22c55e',        desc: 'Pattern interrupt — challenge their worldview',    icon: 'fa-lightbulb' },
      ];

      const blocks = raw.split(/---VARIANT [ABC]---/).map(s => s.trim()).filter(Boolean);

      function parseBlock(text) {
        const get = (lbl) => {
          const m = text.match(new RegExp(`${lbl}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 'si'));
          return m ? m[1].trim() : '';
        };
        return {
          subject:   get('SUBJECT'),
          hook:      get('HOOK'),
          body:      get('BODY'),
          cta:       get('CTA'),
          readTime:  get('READ_TIME'),
        };
      }

      if (!blocks.length) {
        return `<div class="mod-card"><pre style="white-space:pre-wrap;font-size:.78rem;color:var(--text);line-height:1.6">${esc(raw)}</pre></div>`;
      }

      return variantMeta.map((meta, i) => {
        const b = parseBlock(blocks[i] || '');
        const bodyText = [b.subject ? `SUBJECT: ${b.subject}` : '', b.hook || '', b.body || '', b.cta ? `CTA: ${b.cta}` : ''].filter(Boolean).join('\n\n');

        return `
          <div class="mod-card" style="margin-bottom:12px;border-left:3px solid ${meta.color}">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <i class="fas ${meta.icon}" style="color:${meta.color}"></i>
                <span style="font-weight:700;font-size:.85rem">VARIANT ${meta.key}: ${meta.label}</span>
                ${b.readTime ? `<span style="font-size:.68rem;color:var(--muted);background:rgba(255,255,255,.05);padding:2px 7px;border-radius:4px">${esc(b.readTime)}</span>` : ''}
              </div>
              <div style="display:flex;gap:7px">
                <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(${JSON.stringify(bodyText)}).then(()=>window.toast&&toast('Copied!','ok'))">
                  <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn btn-sm" style="background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.2)"
                  onclick="_liSendQueue(${JSON.stringify(b.subject || 'Pitch')}, ${JSON.stringify(bodyText)})">
                  <i class="fas fa-paper-plane"></i> Send to Queue
                </button>
              </div>
            </div>

            <p style="font-size:.68rem;color:var(--muted);margin-bottom:12px">${meta.desc}</p>

            ${b.subject ? `
              <div style="margin-bottom:10px">
                <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:4px">Subject Line</div>
                <div style="font-size:.84rem;font-weight:600;color:${meta.color}">${esc(b.subject)}</div>
              </div>` : ''}

            ${b.hook ? `
              <div style="margin-bottom:10px">
                <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:4px">Opening Hook</div>
                <div style="font-size:.84rem;font-style:italic;line-height:1.5">"${esc(b.hook)}"</div>
              </div>` : ''}

            ${b.body ? `
              <div style="margin-bottom:10px">
                <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:4px">Body</div>
                <div style="font-size:.82rem;line-height:1.6;white-space:pre-wrap">${esc(b.body)}</div>
              </div>` : ''}

            ${b.cta ? `
              <div>
                <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:4px">CTA</div>
                <div style="font-size:.82rem;font-weight:600;color:${meta.color}">${esc(b.cta)}</div>
              </div>` : ''}
          </div>`;
      }).join('');
    }

    window._liSendQueue = function(subject, body) {
      sendToQueue(subject, body);
    };

    /* ═══════════════════════════════════════════════════════════ */
    /* OPPORTUNITY RADAR                                          */
    /* ═══════════════════════════════════════════════════════════ */
    window._liRadar = async function() {
      const btn     = document.getElementById('li-radar-btn');
      const loading = document.getElementById('li-radar-loading');
      const results = document.getElementById('li-radar-results');

      btn.disabled = true;
      loading.style.display = '';
      results.innerHTML = '';

      const systemPrompt = 'Based on current market conditions (2025-2026), what are the TOP 5 underserved pain points where someone could charge £500-£2000/month for a solution? Be specific, tactical, money-focused. No platitudes. Real niches, real numbers, real channels.';

      const message = `Give me the 5 hottest underserved market opportunities right now (2025-2026) where a solo operator or small team could charge £500-£2000/month.

For each opportunity format EXACTLY as:
---OPP 1---
NICHE: [specific niche]
PAIN: [the exact pain they have]
PAIN_LEVEL: [1-10]
MARKET_SIZE: [realistic estimate of addressable market]
OFFER: [what you'd sell them, specific]
PRICE: [suggested monthly price]
FIRST_CHANNEL: [best first channel to reach them]
WHY_NOW: [why this is urgent in 2025-2026 specifically]
---OPP 2---
...`;

      try {
        const raw = await callBoss({ taskKind: 'analyse', system: systemPrompt, messages: [{ role: 'user', content: message }], maxTokens: 1000 });
        results.innerHTML = _liRenderOpps(raw);
      } catch (e) {
        results.innerHTML = `<div class="mod-error"><i class="fas fa-triangle-exclamation"></i><p>Radar scan failed — check API connection</p></div>`;
      }

      btn.disabled = false;
      loading.style.display = 'none';
    };

    function _liRenderOpps(raw) {
      const blocks = raw.split(/---OPP \d+---/).map(s => s.trim()).filter(Boolean);

      function parseOpp(text) {
        const get = (lbl) => {
          const m = text.match(new RegExp(`${lbl}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 'si'));
          return m ? m[1].trim() : '';
        };
        return {
          niche:      get('NICHE'),
          pain:       get('PAIN'),
          painLevel:  parseInt(get('PAIN_LEVEL')) || 0,
          marketSize: get('MARKET_SIZE'),
          offer:      get('OFFER'),
          price:      get('PRICE'),
          channel:    get('FIRST_CHANNEL'),
          whyNow:     get('WHY_NOW'),
        };
      }

      if (!blocks.length) {
        return `<div class="mod-card"><pre style="white-space:pre-wrap;font-size:.78rem;color:var(--text);line-height:1.6">${esc(raw)}</pre></div>`;
      }

      const painColor = (n) => n >= 8 ? 'var(--accent)' : n >= 6 ? '#f59e0b' : '#22c55e';

      return `<div style="display:flex;flex-direction:column;gap:10px">` + blocks.map((block, i) => {
        const o = parseOpp(block);
        const pl = o.painLevel;

        return `
          <div class="mod-card" style="border-left:3px solid ${painColor(pl)}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <span style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">OPP ${i+1}</span>
                  ${pl ? `<span style="font-size:.72rem;font-weight:700;color:${painColor(pl)};background:${painColor(pl)}18;padding:2px 8px;border-radius:4px">Pain ${pl}/10</span>` : ''}
                  ${o.price ? `<span style="font-size:.72rem;font-weight:700;color:#22c55e;background:rgba(34,197,94,.12);padding:2px 8px;border-radius:4px">${esc(o.price)}</span>` : ''}
                </div>
                <div style="font-size:.92rem;font-weight:700">${esc(o.niche || `Opportunity ${i+1}`)}</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="_liExploreOpp(${JSON.stringify(o.niche || '')}, ${JSON.stringify(o.pain || '')})">
                <i class="fas fa-arrow-up-right-from-square"></i> Explore This
              </button>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.8rem">
              ${o.pain ? `
                <div>
                  <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px">The Pain</div>
                  <div style="line-height:1.5">${esc(o.pain)}</div>
                </div>` : ''}
              ${o.offer ? `
                <div>
                  <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px">Suggested Offer</div>
                  <div style="line-height:1.5">${esc(o.offer)}</div>
                </div>` : ''}
              ${o.marketSize ? `
                <div>
                  <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px">Market Size</div>
                  <div style="line-height:1.5">${esc(o.marketSize)}</div>
                </div>` : ''}
              ${o.channel ? `
                <div>
                  <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px">Best First Channel</div>
                  <div style="line-height:1.5;font-weight:600;color:#60a5fa">${esc(o.channel)}</div>
                </div>` : ''}
              ${o.whyNow ? `
                <div style="grid-column:1/-1">
                  <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:3px">Why Now (2025-2026)</div>
                  <div style="line-height:1.5;color:var(--muted)">${esc(o.whyNow)}</div>
                </div>` : ''}
            </div>
          </div>`;
      }).join('') + `</div>`;
    }

    window._liExploreOpp = function(niche, pain) {
      const desc = `${niche}${pain ? ' who ' + pain.toLowerCase() : ''}`;
      const el = document.getElementById('li-market-desc');
      if (el) {
        el.value = desc;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        window.toast && toast('Market Scanner pre-filled — hit Scan Now', 'ok');
      }
    };

    /* ── Check for cross-module prefill from other modules ─────── */
    const prefillPain = localStorage.getItem('li_prefill_pain');
    if (prefillPain) {
      const target = document.getElementById('li-pitch-target');
      if (target && !target.value) target.value = prefillPain;
      localStorage.removeItem('li_prefill_pain');
    }
    const prefillOffer = localStorage.getItem('li_prefill_offer');
    if (prefillOffer) {
      const offerEl = document.getElementById('li-pitch-offer');
      if (offerEl && !offerEl.value) offerEl.value = prefillOffer;
      localStorage.removeItem('li_prefill_offer');
    }
  },

  renderSettings(sidebar) {
    sidebar.innerHTML = `
      <div style="padding:16px">

        <div class="mod-section">
          <div class="mod-section-title">About the Scout Agent</div>
          <div class="mod-card" style="font-size:.8rem;line-height:1.6;color:var(--text)">
            <p style="margin-bottom:10px">
              Lead Intel uses the <strong style="color:var(--accent)">B.O.S.S Scout</strong> agent — powered by Groq's fast inference model for near-instant results.
            </p>
            <p style="color:var(--muted)">
              Scout specialises in market pattern recognition, pain-point mapping, and prospect profiling. It does not scrape live data — it synthesises intelligence based on known market patterns up to its training cutoff.
            </p>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Token Cost Per Scan</div>
          <div class="mod-card">
            <div style="display:flex;flex-direction:column;gap:8px;font-size:.8rem">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span>Market Scanner (Quick)</span>
                <span style="color:var(--accent);font-weight:700">~200 tokens</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span>Market Scanner (Deep/Exhaustive)</span>
                <span style="color:var(--accent);font-weight:700">~350–500 tokens</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span>Pitch Battle Pack (3 variants)</span>
                <span style="color:var(--accent);font-weight:700">~400–600 tokens</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span>Opportunity Radar</span>
                <span style="color:var(--accent);font-weight:700">~300–450 tokens</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">How to Get Better Output</div>
          <div class="mod-card" style="font-size:.8rem;line-height:1.7;color:var(--muted)">
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px">
              <li>
                <strong style="color:var(--text)">Be hyper-specific in the market description.</strong><br>
                "Fitness coaches" is weak. "Female fitness coaches aged 28–40 selling 1-to-1 online PT who post on Instagram but get under 10 DMs per week" is powerful.
              </li>
              <li>
                <strong style="color:var(--text)">Include the platform context.</strong><br>
                Selecting Reddit + LinkedIn vs just Google produces very different community lists and search queries.
              </li>
              <li>
                <strong style="color:var(--text)">For Pitch Intelligence:</strong><br>
                Paste verbatim pain quotes from the Market Scanner into the "Who you're pitching" field. Real language beats assumptions every time.
              </li>
              <li>
                <strong style="color:var(--text)">Use "Explore This" on Opportunity Radar</strong><br>
                to instantly pre-fill the Market Scanner with a niche you hadn't considered — then scan it before committing time to outreach.
              </li>
              <li>
                <strong style="color:var(--text)">Send to Outreach Queue</strong><br>
                pushes pitch variants directly to the Outreach Queue manager so you can track, send, and follow up — without losing momentum.
              </li>
            </ul>
          </div>
        </div>

        <div class="mod-section">
          <div class="mod-section-title">Cross-Module Links</div>
          <div class="mod-card" style="font-size:.8rem;line-height:1.6;color:var(--muted)">
            <p style="margin-bottom:8px">Pain points surfaced here flow into:</p>
            <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:6px">
              <li><i class="fas fa-comment-dots" style="color:var(--accent);margin-right:6px"></i><strong style="color:var(--text)">Cold Outreach</strong> — "Use in Pitch" pre-fills the pain field</li>
              <li><i class="fas fa-paper-plane" style="color:#60a5fa;margin-right:6px"></i><strong style="color:var(--text)">Outreach Queue</strong> — "Send to Queue" pushes pitch variants directly</li>
              <li><i class="fas fa-satellite-dish" style="color:#22c55e;margin-right:6px"></i><strong style="color:var(--text)">Market Scanner</strong> — "Explore This" on Opportunity Radar auto-fills the niche</li>
            </ul>
          </div>
        </div>

      </div>`;
  }
})
