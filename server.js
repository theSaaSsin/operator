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
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// API availability flags — everything degrades gracefully when key missing
const HAS_HUNTER  = !!process.env.HUNTER_API_KEY;
const HAS_TWILIO  = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
const HAS_TWITTER = !!process.env.TWITTER_BEARER_TOKEN;

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

  // ── API Status ───────────────────────────────────────
  'GET /api/status': (_, res) => {
    json(res, {
      ok: true,
      services: {
        supabase:    !!process.env.SUPABASE_URL,
        claude:      !!process.env.ANTHROPIC_API_KEY,
        resend:      !!process.env.RESEND_API_KEY,
        hunter:      HAS_HUNTER,
        twilio:      HAS_TWILIO,
        twitter:     HAS_TWITTER
      }
    });
  },

  // ── Hunter.io — find email from name + domain ─────────
  'POST /api/find-email': async (req, res) => {
    if (!HAS_HUNTER) return json(res, { ok: false, error: 'HUNTER_API_KEY not set', hint: 'Free at hunter.io — 25 searches/mo' }, 400);
    const { name, domain, company } = await body(req);
    if (!domain && !company) return json(res, { ok: false, error: 'domain or company required' }, 400);

    try {
      // If we have a full name, use email-finder; otherwise domain-search
      let url;
      if (name && (domain || company)) {
        const parts  = (name || '').trim().split(' ');
        const first  = parts[0] || '';
        const last   = parts.slice(1).join(' ') || '';
        const dom    = domain || '';
        url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(dom)}&first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&api_key=${process.env.HUNTER_API_KEY}`;
      } else {
        const dom = domain || '';
        url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(dom)}&limit=5&api_key=${process.env.HUNTER_API_KEY}`;
      }

      const r    = await fetch(url);
      const data = await r.json();

      if (data.errors) return json(res, { ok: false, error: data.errors[0]?.details || 'Hunter error' });

      // email-finder returns data.data.email; domain-search returns data.data.emails[]
      const email   = data.data?.email || data.data?.emails?.[0]?.value || null;
      const score   = data.data?.score || data.data?.emails?.[0]?.confidence || 0;
      const emails  = data.data?.emails?.map(e => ({ email: e.value, score: e.confidence, type: e.type })) || [];

      json(res, { ok: true, email, score, emails, credits_left: data.meta?.requests_remaining });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Twitter/X Lead Scraping ───────────────────────────
  'GET /api/feed-x': async (req, res) => {
    if (!HAS_TWITTER) return json(res, { ok: false, posts: [], error: 'TWITTER_BEARER_TOKEN not set', hint: 'Free Basic tier at developer.twitter.com — 100 reads/mo' }, 400);
    const qs = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');

    // Build query — target small biz pain signals, exclude retweets/replies
    const query = `(${kw} OR "no clients" OR "need more clients" OR "struggling to get customers") -is:retweet -is:reply lang:en`;

    try {
      const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=20&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name,public_metrics`;
      const r   = await fetch(url, {
        headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
      });
      const data = await r.json();

      if (data.errors || !data.data) return json(res, { ok: false, posts: [], error: data.title || 'Twitter API error' });

      const usersMap = {};
      (data.includes?.users || []).forEach(u => { usersMap[u.id] = u; });

      const posts = (data.data || []).map(t => {
        const user = usersMap[t.author_id] || {};
        return {
          id:        t.id,
          title:     t.text.substring(0, 120),
          text:      t.text.substring(0, 500),
          author:    user.username || t.author_id,
          name:      user.name || '',
          url:       `https://twitter.com/${user.username}/status/${t.id}`,
          created:   Math.floor(new Date(t.created_at).getTime() / 1000),
          score:     t.public_metrics?.like_count || 0,
          followers: user.public_metrics?.followers_count || 0,
          platform:  'twitter',
          comments:  []
        };
      });

      json(res, { ok: true, posts, keyword: kw });
    } catch (e) {
      json(res, { ok: false, posts: [], error: e.message }, 500);
    }
  },

  // ── LinkedIn Google-dork Lead Search ──────────────────
  // No LinkedIn API needed — uses SerpAPI to dork Google for LinkedIn posts
  'GET /api/feed-linkedin': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const niche = decodeURIComponent((qs.match(/niche=([^&]*)/) || [])[1] || '');

    if (!process.env.SERPAPI_KEY) {
      return json(res, { ok: false, posts: [], error: 'SERPAPI_KEY not set', hint: 'Free 100 searches/mo at serpapi.com' }, 400);
    }

    const query = `site:linkedin.com/posts "${kw}" ${niche} -job -hiring`;
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=10&api_key=${process.env.SERPAPI_KEY}`;
      const r   = await fetch(url);
      const data = await r.json();

      const posts = (data.organic_results || []).map((result, i) => ({
        id:        'li_' + i,
        title:     result.title || '',
        text:      result.snippet || '',
        author:    (result.title || '').split(' on LinkedIn')[0].split(' - ')[0].trim(),
        url:       result.link || '',
        created:   Math.floor(Date.now() / 1000),
        score:     0,
        platform:  'linkedin',
        comments:  []
      })).filter(p => p.text.length > 20);

      json(res, { ok: true, posts, keyword: kw });
    } catch (e) {
      json(res, { ok: false, posts: [], error: e.message }, 500);
    }
  },

  // ── Twilio SMS Outreach ───────────────────────────────
  'POST /api/send-sms': async (req, res) => {
    if (!HAS_TWILIO) return json(res, { ok: false, error: 'Twilio not configured', hint: 'Free trial at twilio.com — $15 credit' }, 400);
    const { to, message, outreach_id } = await body(req);
    if (!to || !message) return json(res, { ok: false, error: 'to + message required' }, 400);

    const phone = to.startsWith('+') ? to : '+44' + to.replace(/^0/, '');

    try {
      const creds  = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams({ To: phone, From: process.env.TWILIO_FROM_NUMBER, Body: message.substring(0, 1600) });
      const r = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        { method: 'POST', headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params }
      );
      const data = await r.json();

      if (data.status === 'failed' || data.code) return json(res, { ok: false, error: data.message || 'SMS failed' });

      if (outreach_id) {
        await supabase.from('outreach_queue').update({ status: 'sent' }).eq('id', outreach_id);
      }

      json(res, { ok: true, sid: data.sid, status: data.status });
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
