// TheSaaSsin Operator Server — Supabase + Claude AI + Resend
'use strict';
require('dotenv').config();

const http       = require('http');
const path       = require('path');
const fs         = require('fs');
const { createClient } = require('@supabase/supabase-js');
const Anthropic  = require('@anthropic-ai/sdk');
const { Resend } = require('resend');

const PORT   = process.env.PORT || 4000;
const PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js':   'text/javascript', '.json': 'application/json',
  '.mp4':  'video/mp4', '.ico': 'image/x-icon'
};

// ── Clients ──────────────────────────────────────────────
const supabase  = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const resend    = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── Helpers ───────────────────────────────────────────────
function body(req) {
  return new Promise(res => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => { try { res(JSON.parse(d)); } catch { res({}); } });
  });
}
function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ── Routes ────────────────────────────────────────────────
const ROUTES = {

  // Health check for Railway
  'GET /api/health': (_, res) => json(res, { ok: true, ts: Date.now() }),

  // ── Reddit Lead Feed ──────────────────────────────────
  'GET /api/feed': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const H   = { 'User-Agent': 'TheSaaSsin-Operator/1.0 (lead discovery)' };

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
      const subResults = await Promise.all(TARGET_SUBS.map(async sub => {
        try {
          const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=1&sort=new&t=month&limit=8`;
          const r   = await fetch(url, { headers: H });
          const d   = await r.json();
          return (d.data?.children || []).map(c => parsePost(c.data));
        } catch { return []; }
      }));

      const seen = new Set();
      const posts = subResults.flat().filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

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

      json(res, { ok: true, posts, keyword: kw });
    } catch (e) {
      json(res, { ok: false, posts: [], error: e.message });
    }
  },

  // ── Claude Lead Scoring ───────────────────────────────
  'POST /api/score': async (req, res) => {
    if (!anthropic) return json(res, { ok: false, error: 'No ANTHROPIC_API_KEY set' }, 400);
    const { title, text, comments = [] } = await body(req);

    const prompt = `You are a lead qualification expert for a B2B outreach system targeting small businesses that need leads, clients, or sales help.

Score this Reddit post from 0-100 as a sales lead. High score = person is actively seeking help getting clients/leads/sales.

POST TITLE: ${title}
POST TEXT: ${text.substring(0, 400)}
TOP COMMENTS: ${comments.slice(0, 3).join(' | ').substring(0, 400)}

Return JSON only: {"score": <0-100>, "reason": "<one sentence why>", "intent": "<desperate|active|passive|none>", "suggested_opener": "<one punchy opening line for outreach, max 20 words>"}`;

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }]
      });
      const raw = msg.content[0].text.trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
      json(res, { ok: true, ...parsed });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Claude Outreach Generator ─────────────────────────
  'POST /api/generate-outreach': async (req, res) => {
    if (!anthropic) return json(res, { ok: false, error: 'No ANTHROPIC_API_KEY set' }, 400);
    const { niche, offer, goal, location, tone = 'professional', leadContext = '' } = await body(req);

    const prompt = `Write 3 short outreach messages for a ${niche} business${location ? ` in ${location}` : ''}.
Their offer: ${offer}. Their goal: ${goal}. Tone: ${tone}.
${leadContext ? `Lead context: ${leadContext}` : ''}

Each message should be under 80 words, direct, and end with a clear call to action.
Return JSON: {"messages": [{"label": "Cold DM", "body": "..."}, {"label": "Follow-up", "body": "..."}, {"label": "Value-first", "body": "..."}]}`;

    try {
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      });
      const raw = msg.content[0].text.trim();
      const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
      json(res, { ok: true, ...parsed });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Resend Email Outreach ─────────────────────────────
  'POST /api/send-outreach': async (req, res) => {
    if (!resend) return json(res, { ok: false, error: 'No RESEND_API_KEY set' }, 400);
    const { to, subject, message, outreach_id } = await body(req);
    if (!to || !message) return json(res, { ok: false, error: 'to + message required' }, 400);

    try {
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'outreach@thesaasin.com',
        to,
        subject: subject || 'Quick question for you',
        text: message
      });

      // Mark as sent in DB
      if (outreach_id) {
        await supabase.from('outreach_queue')
          .update({ status: 'sent' })
          .eq('id', outreach_id);
      }

      json(res, { ok: true, email_id: result.data?.id });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Clients CRUD ──────────────────────────────────────
  'GET /api/clients': async (_, res) => {
    const { data, error } = await supabase
      .from('clients').select('*').order('created_at', { ascending: false });
    if (error) return json(res, { clients: [], error: error.message }, 500);
    json(res, { clients: (data || []).map(dbToClient) });
  },

  'POST /api/clients': async (req, res) => {
    const data = await body(req);
    const record = {
      id:               Date.now(),
      business_name:    data.businessName || data.business_name || '',
      niche:            data.niche || '',
      offer:            data.offer || '',
      goal:             data.goal || '',
      location:         data.location || '',
      notes:            data.notes || '',
      tone:             data.tone || 'professional',
      system_components: data.systemComponents || data.system_components || {},
      style:            data.style || {},
      systems:          data.systems || {},
      status:           'active'
    };
    const { data: created, error } = await supabase.from('clients').insert(record).select().single();
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, client: dbToClient(created) });
  },

  'PATCH /api/clients': async (req, res) => {
    const data = await body(req);
    const { id, ...rest } = data;
    const update = {
      business_name:    rest.businessName || rest.business_name,
      niche:            rest.niche,
      offer:            rest.offer,
      goal:             rest.goal,
      location:         rest.location,
      notes:            rest.notes,
      tone:             rest.tone,
      system_components: rest.systemComponents || rest.system_components,
      style:            rest.style,
      systems:          rest.systems,
      last_updated:     new Date().toISOString()
    };
    // strip undefined
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const { data: updated, error } = await supabase.from('clients').update(update).eq('id', id).select().single();
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, client: dbToClient(updated) });
  },

  // ── Leads CRUD ────────────────────────────────────────
  'GET /api/leads': async (_, res) => {
    const { data, error } = await supabase
      .from('leads').select('*').order('score', { ascending: false });
    if (error) return json(res, { leads: [], error: error.message }, 500);
    json(res, { leads: (data || []).map(dbToLead) });
  },

  'POST /api/leads': async (req, res) => {
    const data = await body(req);
    const record = {
      id:       Date.now(),
      name:     data.name || '',
      business: data.business || '',
      status:   data.status || 'new',
      score:    data.score || 0,
      score_reason: data.score_reason || '',
      platform: data.platform || 'reddit',
      url:      data.url || '',
      title:    data.title || '',
      body:     data.text || data.body || '',
      author:   data.author || '',
      subreddit: data.subreddit || ''
    };
    const { data: created, error } = await supabase.from('leads').insert(record).select().single();
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, lead: created });
  },

  'PATCH /api/leads': async (req, res) => {
    const { id, ...rest } = await body(req);
    const { error } = await supabase.from('leads').update(rest).eq('id', id);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true });
  },

  // ── Outreach Queue CRUD ───────────────────────────────
  'GET /api/outreach': async (_, res) => {
    const { data, error } = await supabase
      .from('outreach_queue').select('*').order('created_at', { ascending: false });
    if (error) return json(res, { queue: [], error: error.message }, 500);
    json(res, { queue: (data || []).map(dbToOutreach) });
  },

  'POST /api/outreach': async (req, res) => {
    const data = await body(req);
    const record = {
      id:          Date.now(),
      client_name: data.clientName || data.client_name || '',
      niche:       data.niche || '',
      label:       data.label || '',
      message:     data.message || '',
      status:      'pending',
      lead_id:     data.lead_id || null,
      recipient_email: data.recipient_email || ''
    };
    const { data: created, error } = await supabase.from('outreach_queue').insert(record).select().single();
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, item: created });
  },

  'PATCH /api/outreach': async (req, res) => {
    const { id, status } = await body(req);
    const { error } = await supabase.from('outreach_queue').update({ status }).eq('id', id);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true });
  }
};

// ── camelCase shims for operator.js compatibility ─────────
function dbToClient(c) {
  if (!c) return null;
  return {
    id:               c.id,
    businessName:     c.business_name,
    niche:            c.niche,
    offer:            c.offer,
    goal:             c.goal,
    location:         c.location,
    notes:            c.notes,
    tone:             c.tone,
    systemComponents: c.system_components,
    style:            c.style,
    systems:          c.systems,
    status:           c.status,
    createdAt:        c.created_at,
    lastUpdated:      c.last_updated
  };
}
function dbToLead(l) {
  if (!l) return null;
  return {
    id:           l.id,
    name:         l.name,
    business:     l.business,
    status:       l.status,
    score:        l.score,
    score_reason: l.score_reason,
    platform:     l.platform,
    url:          l.url,
    title:        l.title,
    text:         l.body,
    author:       l.author,
    subreddit:    l.subreddit,
    createdAt:    l.created_at
  };
}
function dbToOutreach(q) {
  if (!q) return null;
  return {
    id:             q.id,
    clientName:     q.client_name,
    niche:          q.niche,
    label:          q.label,
    message:        q.message,
    status:         q.status,
    lead_id:        q.lead_id,
    recipientEmail: q.recipient_email,
    createdAt:      q.created_at
  };
}

// ── HTTP Server ───────────────────────────────────────────
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const key = `${req.method} ${req.url.split('?')[0]}`;
  if (ROUTES[key]) return ROUTES[key](req, res);

  // Static files
  let filePath = req.url === '/' ? '/operator.html' : req.url;
  filePath = path.join(PUBLIC, filePath.split('?')[0]);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`TheSaaSsin Operator → http://localhost:${PORT}`));
