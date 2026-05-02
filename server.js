// TheSaaSsin Operator Server — pure Node, no dependencies
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT    = process.env.PORT || 4000;
const PUBLIC  = path.join(__dirname, 'public');
const DATA    = path.join(__dirname, 'data');
const RENDERS = path.join(PUBLIC, 'renders');
const BLENDER = process.env.BLENDER_PATH || 'C:/Program Files/Blender Foundation/Blender 5.1/blender.exe';

const WORKFLOWS = {
  'hero-render': {
    script: path.join(__dirname, 'modules/workflows/hero-render/render.py'),
    output: () => `hero_${Date.now()}.png`,
    kind: 'image'
  },
  'tiktok-promo': {
    script: path.join(__dirname, 'modules/workflows/tiktok-promo/render.py'),
    output: () => `promo_${Date.now()}.mp4`,
    kind: 'video'
  },
  'logo-mark': {
    script: path.join(__dirname, 'modules/workflows/logo-mark/render.py'),
    output: () => `logo_${Date.now()}.mp4`,
    kind: 'video'
  },
  'square-card': {
    script: path.join(__dirname, 'modules/workflows/square-card/render.py'),
    output: () => `square_${Date.now()}.png`,
    kind: 'image'
  },
  'mood-pack': {
    script: path.join(__dirname, 'modules/workflows/mood-pack/render.py'),
    output: () => `moodpack_${Date.now()}.png`,
    kind: 'image'
  }
};

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

const ROUTES = {
  'GET /api/feed': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const H   = { 'User-Agent': 'TheSaaSsin-Operator/1.0 (lead discovery)' };

    // Search each high-signal sub individually — Reddit ignores restrict_sr on multi-sub URLs
    const TARGET_SUBS = [
      'smallbusiness', 'Entrepreneur', 'freelance', 'sidehustle',
      'sweatystartup', 'EntrepreneurRideAlong', 'startups', 'sales'
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
      // Fetch all subs in parallel, 8 results each = up to 64 candidates
      const subResults = await Promise.all(TARGET_SUBS.map(async sub => {
        try {
          const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=1&sort=new&t=month&limit=8`;
          const r   = await fetch(url, { headers: H });
          const d   = await r.json();
          return (d.data?.children || []).map(c => parsePost(c.data));
        } catch { return []; }
      }));

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

      res.end(JSON.stringify({ ok: true, posts, keyword: kw }));
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
  },

  'POST /api/workflow/run': async (req, res) => {
    const data = await body(req);
    const wf = WORKFLOWS[data.workflow];
    if (!wf) return res.end(JSON.stringify({ ok: false, error: `Unknown workflow: ${data.workflow}` }));

    if (!fs.existsSync(BLENDER)) {
      return res.end(JSON.stringify({ ok: false, error: `Blender not found at ${BLENDER}. Set BLENDER_PATH env var.` }));
    }
    if (!fs.existsSync(wf.script)) {
      return res.end(JSON.stringify({ ok: false, error: `Workflow script missing: ${wf.script}` }));
    }
    if (!fs.existsSync(RENDERS)) fs.mkdirSync(RENDERS, { recursive: true });

    const filename = wf.output();
    const outputPath = path.join(RENDERS, filename);
    const startedAt = Date.now();

    const child = spawn(BLENDER, ['--background', '--python', wf.script], {
      env: { ...process.env, OUTPUT_PATH: outputPath }
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });

    child.on('close', code => {
      const durationMs = Date.now() - startedAt;
      if (code !== 0 || !fs.existsSync(outputPath)) {
        return res.end(JSON.stringify({
          ok: false,
          error: `Render failed (exit ${code})`,
          stderr: stderr.split('\n').slice(-20).join('\n'),
          durationMs
        }));
      }
      res.end(JSON.stringify({
        ok: true,
        outputUrl: `/renders/${filename}`,
        filename,
        kind: wf.kind || 'image',
        durationMs,
        log: stdout.split('\n').slice(-12).join('\n')
      }));
    });

    child.on('error', err => {
      res.end(JSON.stringify({ ok: false, error: err.message }));
    });
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
