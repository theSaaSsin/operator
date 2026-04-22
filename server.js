// TheSaaSsin Operator Server — pure Node, no dependencies
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT    = 4000;
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

/* ── LEAD SOURCE FETCHERS ── */
// All return Promise<Array<NormalizedPost>>.
// NormalizedPost: { id, platform, title, text, author, url, created, subreddit?, companyHint?, websiteHint? }

// Simple in-memory cache — keyed by platform:url. 5-minute TTL.
// Stops us hammering Reddit into a 429 ban during rapid dev/test cycles.
const CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
async function cachedFetch(url, opts) {
  const key = (opts?.method || 'GET') + ' ' + url + (opts?.body || '');
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.json;
  const r = await fetch(url, opts);
  if (r.status === 429) { CACHE.set(key, { at: Date.now(), json: { _rateLimited: true } }); return { _rateLimited: true }; }
  if (!r.ok) return null;
  const json = await r.json();
  CACHE.set(key, { at: Date.now(), json });
  return json;
}

async function fetchReddit(kw, H) {
  const SUBS = ['smallbusiness','Entrepreneur','freelance','sidehustle',
    'sweatystartup','EntrepreneurRideAlong','startups','sales',
    'SaaS','indiehackers','SideProject','roastmystartup','webdev','marketing'];
  const parsePost = p => ({
    id:        'r_' + p.id,
    platform:  'reddit',
    title:     p.title || '',
    text:      (p.selftext || p.title || '').substring(0, 600),
    author:    p.author || 'unknown',
    subreddit: p.subreddit || '',
    url:       `https://reddit.com${p.permalink}`,
    created:   p.created_utc,
    score:     p.score || 0
  });
  try {
    const subResults = await Promise.all(SUBS.map(async sub => {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=1&sort=new&t=month&limit=8`;
        const d = await cachedFetch(url, { headers: H });
        if (!d || d._rateLimited) return [];
        return (d.data?.children || []).map(c => parsePost(c.data));
      } catch { return []; }
    }));
    const seen = new Set();
    return subResults.flat().filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  } catch { return []; }
}

// Product Hunt — public GraphQL requires token, but daily/weekly RSS + search via official sitemap works without.
// We use the public discover feed (JSON) which returns recent launches.
async function fetchProductHunt(kw, H) {
  try {
    // Public unauthenticated discover endpoint (feed returns recent launches w/ tagline + site)
    const url = 'https://www.producthunt.com/frontend/graphql';
    const query = {
      operationName: 'HomefeedPostsQuery',
      variables: { order: 'RANKING', first: 20 },
      query: `query HomefeedPostsQuery($first:Int,$order:String){posts(first:$first,order:$order){edges{node{id name tagline slug website createdAt votesCount user{name}}}}}`
    };
    const r = await fetch(url, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    const d = await r.json();
    const edges = d?.data?.posts?.edges || [];
    const kwLow = kw.toLowerCase();
    return edges
      .map(e => e.node)
      .filter(n => !kw || (n.name + ' ' + n.tagline).toLowerCase().includes(kwLow.split(' ')[0]))
      .map(n => ({
        id:       'ph_' + n.id,
        platform: 'producthunt',
        title:    n.name + ' — ' + (n.tagline || ''),
        text:     n.tagline || '',
        author:   n.user?.name || 'maker',
        url:      `https://www.producthunt.com/posts/${n.slug}`,
        created:  Math.floor(new Date(n.createdAt).getTime() / 1000),
        score:    n.votesCount || 0,
        companyHint: n.name,
        websiteHint: n.website || ''
      }));
  } catch { return []; }
}

// Indie Hackers — public feed scrape (no API). Grab recent posts from /feed or topic pages.
async function fetchIndieHackers(kw, H) {
  try {
    const url = `https://www.indiehackers.com/search.json?q=${encodeURIComponent(kw)}&type=posts`;
    const r = await fetch(url, { headers: H });
    if (!r.ok) return [];
    const d = await r.json();
    const posts = d?.posts || d?.results?.posts || [];
    return posts.slice(0, 20).map(p => ({
      id:       'ih_' + (p.id || p.slug || Math.random().toString(36).slice(2)),
      platform: 'indiehackers',
      title:    p.title || p.name || '',
      text:     (p.rawBody || p.body || p.description || '').substring(0, 600),
      author:   p.userName || p.user?.name || 'founder',
      url:      p.url || `https://www.indiehackers.com/post/${p.slug || p.id}`,
      created:  Math.floor(new Date(p.createdAt || Date.now()).getTime() / 1000),
      score:    p.voteCount || 0,
      companyHint: p.product?.name || '',
      websiteHint: p.product?.website || ''
    }));
  } catch { return []; }
}

// Crunchbase stub — requires paid API key. Returns empty until CRUNCHBASE_API_KEY is set in env.
async function fetchCrunchbase(kw, H) {
  const key = process.env.CRUNCHBASE_API_KEY;
  if (!key) return []; // silently skip if not configured
  try {
    const url = `https://api.crunchbase.com/api/v4/searches/organizations?user_key=${key}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field_ids: ['identifier','short_description','website_url','categories'],
        query: [{ type: 'predicate', field_id: 'identifier', operator_id: 'contains', values: [kw] }],
        limit: 20
      })
    });
    const d = await r.json();
    return (d?.entities || []).map(e => ({
      id:       'cb_' + e.uuid,
      platform: 'crunchbase',
      title:    e.properties?.identifier?.value || '',
      text:     e.properties?.short_description || '',
      author:   '',
      url:      `https://www.crunchbase.com/organization/${e.properties?.identifier?.permalink}`,
      created:  Math.floor(Date.now() / 1000),
      score:    0,
      companyHint: e.properties?.identifier?.value || '',
      websiteHint: e.properties?.website_url || ''
    }));
  } catch { return []; }
}

const ROUTES = {
  'GET /api/feed': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const srcParam = decodeURIComponent((qs.match(/sources=([^&]*)/) || [])[1] || 'reddit,producthunt,indiehackers');
    const sources  = new Set(srcParam.split(',').map(s => s.trim().toLowerCase()));
    const H = { 'User-Agent': 'TheSaaSsin-Operator/1.0 (lead discovery)' };

    const tasks = [];
    if (sources.has('reddit'))       tasks.push(fetchReddit(kw, H));
    if (sources.has('producthunt'))  tasks.push(fetchProductHunt(kw, H));
    if (sources.has('indiehackers')) tasks.push(fetchIndieHackers(kw, H));
    if (sources.has('crunchbase'))   tasks.push(fetchCrunchbase(kw, H));

    try {
      const results = await Promise.all(tasks);
      const posts = results.flat();
      res.end(JSON.stringify({ ok: true, posts, keyword: kw, sources: [...sources] }));
    } catch (e) {
      res.end(JSON.stringify({ ok: false, posts: [], error: e.message }));
    }
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
