// TheSaaSsin Operator Server — pure Node, no dependencies
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = Number(process.env.PORT || 4000);
const PUBLIC  = path.join(__dirname, 'public');
const DATA    = path.join(__dirname, 'data');

const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js':   'text/javascript', '.json': 'application/json',
  '.mp4':  'video/mp4', '.ico': 'image/x-icon'
};

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return {}; }
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2));
}
function body(req) {
  return new Promise(res => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { res(JSON.parse(d)); } catch { res({}); } });
  });
}

const VALID_MODULE_STATUS = new Set(['active', 'building', 'planned', 'later']);
const DEFAULT_ACTIVE_MODULES = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 16, 21]);
const DEFAULT_BUILDING_MODULES = new Set([7, 12, 13]);

function defaultModuleStatus(n) {
  if (DEFAULT_ACTIVE_MODULES.has(n)) return 'active';
  if (DEFAULT_BUILDING_MODULES.has(n)) return 'building';
  if (n >= 61) return 'later';
  return 'planned';
}

function ensureModulesDB() {
  const db = readJSON('modules.json');
  const now = new Date().toISOString();
  const out = { updatedAt: db.updatedAt || now, modules: {} };
  let changed = false;

  for (let n = 1; n <= 70; n++) {
    const key = String(n);
    const existing = db.modules?.[key] || {};
    const status = VALID_MODULE_STATUS.has(existing.status) ? existing.status : defaultModuleStatus(n);
    out.modules[key] = {
      n,
      status,
      note: typeof existing.note === 'string' ? existing.note : '',
      lastUpdated: existing.lastUpdated || null
    };
    if (!db.modules?.[key] || existing.status !== status || typeof existing.note !== 'string') changed = true;
  }

  if (!db.modules || Object.keys(db.modules).length !== 70) changed = true;
  if (changed) writeJSON('modules.json', out);
  return changed ? out : db;
}

const ROUTES = {
  'GET /api/feed': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const H   = { 'User-Agent': 'TheSaaSsin-Operator/1.0 (lead discovery)' };

    // Search each high-signal sub individually — Reddit ignores restrict_sr on multi-sub URLs
    const TARGET_SUBS = [
      // Core business
      'smallbusiness','Entrepreneur','EntrepreneurRideAlong','sweatystartup',
      'sidehustle','solopreneur','BusinessOwners','growmybusiness',
      // Freelance & sales
      'freelance','sales','forhire','WorkOnline','hiring',
      // Marketing & agency
      'digital_marketing','agency','SEO','PPC','copywriting','socialmediamarketing',
      // Creative & photography
      'photography','weddingphotography','videography','graphic_design','web_design',
      // Trades & home services
      'HomeImprovement','Plumbing','HVAC','landscaping','cleaning_business',
      // Tech freelance
      'webdev','startups',
      // Ecommerce
      'ecommerce','shopify','AmazonSeller',
      // Fitness & health
      'personaltraining','fitness',
      // Real estate & finance
      'realestate','realtors','FinancialPlanning','personalfinance',
      // Coaching & consulting
      'consulting','Coaching'
    ];

    function parsePost(p) {
      return {
        id:        p.id,
        title:     p.title || '',
        text:      (p.selftext || p.title || '').substring(0, 500),
        author:    p.author || 'unknown',
        subreddit: p.subreddit || '',
        url:       `https://reddit.com${p.permalink}`,
        permalink: p.permalink,
        created:   p.created_utc,
        score:     p.score || 0,
        platform:  'reddit',
        comments:  []
      };
    }

    try {
      // Fetch subs in batches of 8 to avoid Reddit rate-limiting
      const BATCH = 8;
      const subResults = [];
      for (let i = 0; i < TARGET_SUBS.length; i += BATCH) {
        const batch = TARGET_SUBS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(async sub => {
          try {
            const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=1&sort=new&t=month&limit=5`;
            const r   = await fetch(url, { headers: H });
            const d   = await r.json();
            return (d.data?.children || []).map(c => parsePost(c.data));
          } catch { return []; }
        }));
        subResults.push(...results);
        if (i + BATCH < TARGET_SUBS.length) await new Promise(r => setTimeout(r, 400));
      }

      // Merge, deduplicate by id
      const seen = new Set();
      const posts = subResults.flat().filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // Fetch comments for top 6 posts in parallel (pain is often in comments)
      await Promise.all(posts.slice(0, 6).map(async post => {
        try {
          const cr = await fetch(
            `https://www.reddit.com/r/${post.subreddit}/comments/${post.id}.json?limit=10&sort=top&depth=1`,
            { headers: H }
          );
          const cd = await cr.json();
          post.comments = ((cd[1]?.data?.children) || [])
            .filter(c => c.kind === 't1')
            .map(c => (c.data.body || '').substring(0, 300))
            .filter(b => b.length > 30 && b !== '[deleted]' && b !== '[removed]')
            .slice(0, 5);
        } catch { post.comments = []; }
      }));

      // ── X (Twitter) search — only if bearer token configured ──
      const cfg = readJSON('config.json');
      if (cfg.xBearerToken) {
        try {
          const xUrl = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(kw + ' -is:retweet lang:en')}&max_results=20&tweet.fields=created_at,author_id,text,public_metrics&expansions=author_id&user.fields=username,name`;
          const xRes = await fetch(xUrl, {
            headers: { Authorization: `Bearer ${cfg.xBearerToken}` }
          });
          const xData = await xRes.json();
          const users = {};
          (xData.includes?.users || []).forEach(u => { users[u.id] = u; });
          (xData.data || []).forEach(t => {
            const user = users[t.author_id] || {};
            posts.push({
              id:        'x_' + t.id,
              title:     t.text.substring(0, 120),
              text:      t.text.substring(0, 500),
              author:    user.username || 'unknown',
              subreddit: '',
              url:       `https://x.com/${user.username || 'i'}/status/${t.id}`,
              permalink: `/x/${t.id}`,
              created:   new Date(t.created_at).getTime() / 1000,
              score:     t.public_metrics?.like_count || 0,
              platform:  'x',
              comments:  []
            });
          });
        } catch { /* X failed silently — Reddit results still returned */ }
      }

      // ── Hacker News via Algolia — free, no auth ──
      try {
        const hnUrl  = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&tags=(story,comment)&hitsPerPage=30`;
        const hnRes  = await fetch(hnUrl, { headers: H });
        const hnData = await hnRes.json();
        (hnData.hits || []).forEach(h => {
          const body = (h.story_text || h.title || '').replace(/<[^>]+>/g, '').substring(0, 500);
          posts.push({
            id:        'hn_' + h.objectID,
            title:     h.title || '',
            text:      body,
            author:    h.author || 'unknown',
            subreddit: '',
            url:       h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            permalink: `/hn/${h.objectID}`,
            created:   h.created_at ? new Date(h.created_at).getTime() / 1000 : 0,
            score:     h.points || 0,
            platform:  'hn',
            comments:  (h._highlightResult?.story_text?.value || '').replace(/<[^>]+>/g,'').substring(0,200) ? [(h._highlightResult?.story_text?.value||'').replace(/<[^>]+>/g,'').substring(0,200)] : []
          });
        });
      } catch { /* HN failed silently */ }

      // ── Serper.dev — one query per platform so each gets a full 10 results ──
      if (cfg.serperApiKey) {
        const sites = (cfg.serperSearchSites || 'facebook.com/groups linkedin.com quora.com').split(/\s+/);
        const serperKey = cfg.serperApiKey;

        const serperResults = await Promise.all(sites.map(async site => {
          try {
            const res  = await fetch('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: `${kw} site:${site}`, num: 10, tbs: 'qdr:m' })
            });
            const data = await res.json();
            return (data.organic || []).map((item, i) => {
              const domain = (item.displayLink || item.link || '').replace(/^www\./, '');
              const plat   = domain.includes('facebook') ? 'facebook'
                           : domain.includes('linkedin') ? 'linkedin'
                           : domain.includes('quora')    ? 'quora'
                           : 'web';
              return {
                id:        `sr_${site.replace(/\W/g,'')}_${i}_${Date.now()}`,
                title:     item.title   || '',
                text:      (item.snippet || '').substring(0, 500),
                author:    domain,
                subreddit: '',
                url:       item.link    || '',
                permalink: item.link    || '',
                created:   Date.now() / 1000,
                score:     0,
                platform:  plat,
                comments:  []
              };
            });
          } catch { return []; }
        }));

        serperResults.flat().forEach(p => posts.push(p));
      }

      res.end(JSON.stringify({
        ok: true, posts, keyword: kw,
        xConfigured:      !!cfg.xBearerToken,
        googleConfigured: !!cfg.serperApiKey
      }));
    } catch (e) {
      res.end(JSON.stringify({ ok: false, posts: [], error: e.message }));
    }
  },

  'GET /api/config':  (_, res) => { res.end(JSON.stringify(readJSON('config.json'))); },
  'POST /api/config': async (req, res) => {
    const data = await body(req);
    const cfg  = readJSON('config.json');
    writeJSON('config.json', { ...cfg, ...data });
    res.end(JSON.stringify({ ok: true }));
  },

  /* ── MODULE REGISTRY (foundation for all 70 modules) ── */
  'GET /api/modules': (_, res) => {
    const db = ensureModulesDB();
    res.end(JSON.stringify({ ok: true, ...db }));
  },

  'PATCH /api/modules': async (req, res) => {
    const data = await body(req);
    const db = ensureModulesDB();
    const updates = Array.isArray(data.updates) ? data.updates : [data];
    const changed = [];
    const now = new Date().toISOString();

    updates.forEach(update => {
      const n = Number(update.n);
      if (!Number.isInteger(n) || n < 1 || n > 70) return;
      const key = String(n);
      const current = db.modules[key] || { n, status: defaultModuleStatus(n), note: '', lastUpdated: null };
      const nextStatus = VALID_MODULE_STATUS.has(update.status) ? update.status : current.status;
      const nextNote = typeof update.note === 'string' ? update.note.substring(0, 240) : current.note;

      const changedThis = nextStatus !== current.status || nextNote !== current.note;
      if (changedThis) {
        db.modules[key] = { ...current, status: nextStatus, note: nextNote, lastUpdated: now };
        changed.push({ n, status: nextStatus, note: nextNote });
      }
    });

    if (changed.length) {
      db.updatedAt = now;
      writeJSON('modules.json', db);
    }
    res.end(JSON.stringify({ ok: true, changed, updatedAt: db.updatedAt }));
  },

  /* ── SYSTEM MATCHER ENGINE (module 7 foundation) ── */
  'POST /api/system-match': async (req, res) => {
    const data = await body(req);
    const niche  = String(data.niche || '');
    const goal   = String(data.goal || '');
    const pain   = String(data.pain || '');
    const source = String(data.source || '');
    const input  = `${niche} ${goal} ${pain} ${source}`.toLowerCase();

    const painSignals = [
      { key: 'no_clients',       re: /no clients?|no customer|no sales|zero clients?|can't find clients?/ },
      { key: 'no_time',          re: /no time|too busy|overwhelmed|swamped|time poor/ },
      { key: 'no_content',       re: /no content|can't create content|dont post|don't post|inconsistent content/ },
      { key: 'no_leads',         re: /no leads?|lead flow is low|not enough leads?|dry pipeline/ },
      { key: 'low_conversions',  re: /low conversion|not converting|few bookings?|few closes?|poor close rate/ },
      { key: 'low_visibility',   re: /low visibility|no reach|no audience|not seen|low traffic/ }
    ];

    const painPoints = painSignals.filter(p => p.re.test(input)).map(p => p.key);
    if (!painPoints.length) painPoints.push('no_leads');

    const PAIN_TO_MODULES = {
      no_clients: [
        'Lead Feed Engine',
        'Cold Outreach Msg Generator',
        'Multi-Platform Outreach Sender',
        'CRM Pipeline'
      ],
      no_time: [
        'Workflow Automation Builder',
        'Follow-Up Automation',
        'CRM Automation',
        'Outreach Queue Manager'
      ],
      no_content: [
        'Content Idea Generator',
        'Short-Form Content Generator',
        'Social Media Post Generator',
        'Content Scheduler'
      ],
      no_leads: [
        'Lead Feed Engine',
        'Keyword Detection Engine',
        'Lead Intent Analyzer',
        'CRM Pipeline'
      ],
      low_conversions: [
        'Funnel Builder',
        'Offer Generator',
        'Proposal Builder',
        'Objection Handling Scripts'
      ],
      low_visibility: [
        'Social Media Lead Scraper',
        'Social Media Post Generator',
        'Engagement Booster System',
        'Content Performance Tracker'
      ]
    };

    const score = {};
    painPoints.forEach(p => {
      (PAIN_TO_MODULES[p] || []).forEach((moduleName, idx) => {
        const weight = Math.max(1, 5 - idx);
        score[moduleName] = (score[moduleName] || 0) + weight;
      });
    });

    const recommendedModules = Object.keys(score)
      .sort((a, b) => score[b] - score[a] || a.localeCompare(b))
      .slice(0, 5);

    const priority = painPoints.some(p => p === 'no_clients' || p === 'no_leads')
      ? 'high'
      : painPoints.some(p => p === 'low_conversions' || p === 'no_time')
        ? 'medium'
        : 'normal';

    const painLabel = painPoints.join(', ');
    const moduleLabel = recommendedModules.join(', ');
    const reasoning = `Detected pain points (${painLabel}) and prioritized the smallest high-impact stack: ${moduleLabel}.`;

    const type = (/agency|consult|service|freelance/.test(input) || painPoints.includes('no_clients') || painPoints.includes('no_leads'))
      ? 'direct'
      : /partner|referral|collab/.test(input)
        ? 'partner'
        : 'distribution';

    res.end(JSON.stringify({
      ok: true,
      type,
      painPoints,
      recommendedModules,
      priority,
      confidence: Math.min(0.98, 0.55 + (painPoints.length * 0.08)),
      reasoning
    }));
  },

  'GET /api/clients':  (_, res) => { res.end(JSON.stringify(readJSON('clients.json'))); },
  'GET /api/leads':    (_, res) => { res.end(JSON.stringify(readJSON('leads.json'))); },
  'GET /api/outreach': (_, res) => { res.end(JSON.stringify(readJSON('outreach_queue.json'))); },

  'POST /api/clients': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('clients.json');
    data.id    = Date.now();
    data.createdAt  = new Date().toISOString();
    data.lastUpdated = new Date().toISOString();
    data.status = 'active';
    data.systems = data.systems || { landingPage: '', outreach: [], crm: {} };
    db.clients.push(data);
    writeJSON('clients.json', db);
    res.end(JSON.stringify({ ok: true, client: data }));
  },

  'PATCH /api/clients': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('clients.json');
    let updated = null;
    db.clients = db.clients.map(c => {
      if (c.id === data.id) {
        updated = { ...c, ...data, lastUpdated: new Date().toISOString() };
        return updated;
      }
      return c;
    });
    writeJSON('clients.json', db);
    res.end(JSON.stringify({ ok: true, client: updated }));
  },

  'POST /api/leads': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('leads.json');
    data.id    = Date.now();
    data.createdAt = new Date().toISOString();
    data.status = data.status || 'new';
    data.score  = data.score  || 0;
    db.leads.push(data);
    writeJSON('leads.json', db);
    res.end(JSON.stringify({ ok: true, lead: data }));
  },

  'PATCH /api/leads': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('leads.json');
    db.leads   = db.leads.map(l => l.id === data.id ? { ...l, ...data } : l);
    writeJSON('leads.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  'POST /api/outreach': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('outreach_queue.json');
    data.id    = Date.now();
    data.status = 'pending';
    data.createdAt = new Date().toISOString();
    db.queue.push(data);
    writeJSON('outreach_queue.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  'PATCH /api/outreach': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('outreach_queue.json');
    db.queue   = db.queue.map(q => q.id === data.id ? { ...q, status: data.status } : q);
    writeJSON('outreach_queue.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  /* ── ANALYTICS ── */
  'GET /api/analytics': (_, res) => { res.end(JSON.stringify(readJSON('analytics.json'))); },

  'POST /api/analytics': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('analytics.json');
    if (!Array.isArray(db.outreach)) db.outreach = [];
    const entry = { ...data, id: Date.now(), timestamp: new Date().toISOString(), status: 'sent' };
    db.outreach.unshift(entry);
    writeJSON('analytics.json', db);
    res.end(JSON.stringify({ ok: true, id: entry.id }));
  },

  'PATCH /api/analytics': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('analytics.json');
    db.outreach = (db.outreach || []).map(o =>
      o.id === data.id ? { ...o, ...data, statusUpdatedAt: new Date().toISOString() } : o
    );
    writeJSON('analytics.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  /* ── MODULE SETTINGS ── */
  'GET /api/module-settings': (_, res) => {
    res.end(JSON.stringify(readJSON('module-settings.json')));
  },

  'PATCH /api/module-settings': async (req, res) => {
    const data = await body(req);
    const n = data.module;
    if (!n) { res.end(JSON.stringify({ ok: false, error: 'missing module number' })); return; }
    const db = readJSON('module-settings.json');
    if (!db.settings) db.settings = {};
    db.settings[n] = { ...(db.settings[n] || {}), ...data.settings, updatedAt: new Date().toISOString() };
    writeJSON('module-settings.json', db);
    res.end(JSON.stringify({ ok: true, settings: db.settings[n] }));
  },

  /* ── INTEGRATIONS ── */
  'GET /api/integrations': (_, res) => {
    res.end(JSON.stringify(readJSON('integrations.json')));
  },

  'POST /api/integrations': async (req, res) => {
    const data = await body(req);
    const db = readJSON('integrations.json');
    if (!Array.isArray(db.integrations)) db.integrations = [];
    const entry = { ...data, id: Date.now(), createdAt: new Date().toISOString(), enabled: true };
    db.integrations.push(entry);
    writeJSON('integrations.json', db);
    res.end(JSON.stringify({ ok: true, integration: entry }));
  },

  'PATCH /api/integrations': async (req, res) => {
    const data = await body(req);
    const db = readJSON('integrations.json');
    db.integrations = (db.integrations || []).map(i =>
      i.id === data.id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
    );
    writeJSON('integrations.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  'DELETE /api/integrations': async (req, res) => {
    const data = await body(req);
    const db = readJSON('integrations.json');
    db.integrations = (db.integrations || []).filter(i => i.id !== data.id);
    writeJSON('integrations.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  /* ── WEBHOOK RECEIVER (external tools fire into this) ── */
  'POST /api/webhook': async (req, res) => {
    const data = await body(req);
    const db = readJSON('integrations.json');
    const webhookLog = readJSON('webhook-log.json');
    if (!Array.isArray(webhookLog.events)) webhookLog.events = [];
    webhookLog.events.unshift({ ...data, receivedAt: new Date().toISOString(), id: Date.now() });
    if (webhookLog.events.length > 500) webhookLog.events = webhookLog.events.slice(0, 500);
    writeJSON('webhook-log.json', webhookLog);
    res.end(JSON.stringify({ ok: true, received: true }));
  },

  'GET /api/webhook-log': (_, res) => {
    res.end(JSON.stringify(readJSON('webhook-log.json')));
  },

  /* ── AI ASSIST — calls Claude Haiku to refine context engine output ── */
  'POST /api/ai': async (req, res) => {
    const cfg = readJSON('config.json');
    if (!cfg.anthropicApiKey) {
      res.end(JSON.stringify({ ok: false, error: 'no_key' }));
      return;
    }

    const data = await body(req);
    if (!data.prompt) { res.end(JSON.stringify({ ok: false, error: 'no_prompt' })); return; }

    const https   = require('https');
    const payload = JSON.stringify({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages:   [{ role: 'user', content: data.prompt }]
    });

    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         cfg.anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(payload)
      }
    };

    const apiReq = https.request(options, apiRes => {
      let d = '';
      apiRes.on('data', chunk => d += chunk);
      apiRes.on('end', () => {
        try {
          const result = JSON.parse(d);
          if (result.error) { res.end(JSON.stringify({ ok: false, error: result.error.message })); return; }
          const text = result.content?.[0]?.text || '';
          // Extract JSON block from response
          const match = text.match(/\{[\s\S]*?\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            res.end(JSON.stringify({ ok: true, ...parsed }));
          } else {
            res.end(JSON.stringify({ ok: false, error: 'parse_fail', raw: text.substring(0, 200) }));
          }
        } catch (e) {
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
    });

    apiReq.on('error', e => res.end(JSON.stringify({ ok: false, error: e.message })));
    apiReq.write(payload);
    apiReq.end();
  }
};

http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url.split('?')[0]}`;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (ROUTES[key]) return ROUTES[key](req, res);

  // Static files
  let filePath = req.url === '/' ? '/operator.html' : req.url;
  filePath = path.join(PUBLIC, filePath);
  const ext = path.extname(filePath);
  res.setHeader('Content-Type', MIME[ext] || 'text/plain');
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200);
    res.end(data);
  });
}).listen(PORT, () => console.log(`Operator → http://localhost:${PORT}`));
