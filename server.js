// TheSaaSsin Operator Server — Supabase + Claude AI + Resend
'use strict';
require('dotenv').config();

const http       = require('http');
const path       = require('path');
const fs         = require('fs');
const { createClient } = require('@supabase/supabase-js');
const Anthropic  = require('@anthropic-ai/sdk');
const { Resend } = require('resend');
const makeStorage   = require('./storage');
const { generateBrand } = require('./brand');

const PORT   = process.env.PORT || 4000;
const PUBLIC = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html', '.css': 'text/css',
  '.js':   'text/javascript', '.json': 'application/json',
  '.mp4':  'video/mp4', '.ico': 'image/x-icon'
};

// ── Clients ──────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const storage = makeStorage(supabase);

let anthropic, resend, stripe;
let HAS_HUNTER, HAS_TWILIO, HAS_TWITTER;

function initServices() {
  anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;
  resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;
  HAS_HUNTER  = !!process.env.HUNTER_API_KEY;
  HAS_TWILIO  = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  HAS_TWITTER = !!process.env.TWITTER_BEARER_TOKEN;
  stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;
}
initServices();

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

  // ── Brand Engine ─────────────────────────────────────────
  'POST /api/generate-brand': async (req, res) => {
    const data = await body(req);
    try {
      const brand = generateBrand({
        name:       data.businessName || data.name || 'Brand',
        niche:      data.niche || '',
        offer:      data.offer || '',
        goal:       data.goal || 'leads',
        location:   data.location || '',
        tone:       data.tone || 'professional',
        primaryHex: (data.style && data.style.primary) || data.primaryHex || null,
      });
      json(res, { ok: true, brand });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Public routes (no auth — called from deployed landing pages) ──
  'GET /api/public/health': (_, res) => json(res, { ok: true }),

  // Lead capture from deployed landing pages — adds to CRM
  'POST /api/public/capture': async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const data = await body(req);
    const name    = (data.name    || '').toString().trim().substring(0, 120);
    const email   = (data.email   || '').toString().trim().substring(0, 200);
    const phone   = (data.phone   || '').toString().trim().substring(0, 30);
    const message = (data.message || '').toString().trim().substring(0, 1000);
    const source  = (data.source  || 'landing-page').toString().substring(0, 100);

    if (!name && !email) return json(res, { ok: false, error: 'name or email required' }, 400);

    const record = {
      id:       Date.now(),
      name:     name || email,
      business: data.business || '',
      status:   'new',
      score:    30,
      score_reason: `Inbound via ${source}`,
      platform: 'inbound',
      url:      '',
      title:    message ? message.substring(0, 120) : `Inbound from ${source}`,
      body:     [message, email && `Email: ${email}`, phone && `Phone: ${phone}`].filter(Boolean).join('\n'),
      author:   name || email,
      subreddit: ''
    };

    const { error } = await storage.leads.create(record);
    if (error) {
      console.error('[capture]', error.message);
      return json(res, { ok: false, error: 'Failed to save lead' }, 500);
    }
    json(res, { ok: true, message: 'Thanks! We\'ll be in touch soon.' });
  },

  // ── Demo pages ────────────────────────────────────────
  'GET /demo': (_, res) => {
    fs.readFile(path.join(PUBLIC, 'demo.html'), (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  },
  'GET /demo/success': (_, res) => {
    fs.readFile(path.join(PUBLIC, 'demo-success.html'), (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  },

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
    if (!anthropic) return json(res, { ok: false, error: 'ANTHROPIC_API_KEY not set', needsKey: 'claude' }, 400);
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
    if (!anthropic) return json(res, { ok: false, error: 'ANTHROPIC_API_KEY not set', needsKey: 'claude' }, 400);
    const { niche, offer, goal, location, tone = 'professional', leadContext = '',
            persona = {} } = await body(req);

    const senderName   = persona.name    || 'I';
    const senderNiche  = persona.niche   || niche || 'lead generation';
    const senderOffer  = persona.offer   || offer || 'a system that gets you consistent clients';
    const senderMarket = persona.market  || 'local service businesses';

    const prompt = `You are ${senderName}, who ${senderNiche}.
Your offer: ${senderOffer}.
You target: ${senderMarket}.
Tone: ${tone}. Location context: ${location || 'UK'}.

Write 3 short outreach messages for this lead:
${leadContext ? leadContext : `Someone who needs help getting clients in ${niche || 'their business'}`}

Rules:
- Under 80 words each
- Sound human, not AI — avoid "I hope this finds you well", "reach out", "leverage"
- Lead with the pain you spotted in their post
- End with ONE clear action (reply, 15-min call, see a preview)
- Variant 1 = Direct (assume they want help now, make an offer)
- Variant 2 = Empathy (acknowledge pain first, then offer)
- Variant 3 = Value-first (give something useful, then pitch)

Return JSON only: {"messages": [{"label": "Direct", "body": "..."}, {"label": "Empathy", "body": "..."}, {"label": "Value-first", "body": "..."}]}`;

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

  // ── Stripe Checkout ──────────────────────────────────
  'POST /api/checkout': async (req, res) => {
    if (!stripe) return json(res, { ok: false, error: 'STRIPE_SECRET_KEY not set' }, 400);
    const { email, plan = 'monthly' } = await body(req);
    const origin = process.env.APP_URL || `http://localhost:${PORT}`;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email || undefined,
        line_items: [{
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'TheSaaSsin Operator',
              description: 'AI lead engine — Reddit, X, LinkedIn scanning + outreach automation',
              images: []
            },
            unit_amount: 4900,          // £49.00
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        subscription_data: {
          trial_period_days: 14,
          metadata: { plan, source: 'demo_page' }
        },
        success_url: `${origin}/demo/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${origin}/demo`
      });
      json(res, { ok: true, url: session.url });
    } catch (e) {
      json(res, { ok: false, error: e.message }, 500);
    }
  },

  // ── Stripe Webhook ────────────────────────────────────
  'POST /api/webhook': async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.writeHead(200); res.end('ok'); return;
    }
    let rawBody = '';
    req.on('data', c => rawBody += c);
    await new Promise(r => req.on('end', r));
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      if (event.type === 'customer.subscription.created' || event.type === 'checkout.session.completed') {
        const sub = event.data.object;
        console.log(`[Stripe] New subscriber: ${sub.customer_email || sub.customer} — ${event.type}`);
      }
      res.writeHead(200); res.end('ok');
    } catch (e) {
      res.writeHead(400); res.end(`Webhook error: ${e.message}`);
    }
  },

  // ── Save API Key (hot-reload without restart) ────────
  'POST /api/save-key': async (req, res) => {
    const ALLOWED = {
      ANTHROPIC_API_KEY: true, RESEND_API_KEY: true, FROM_EMAIL: true,
      HUNTER_API_KEY: true, TWILIO_ACCOUNT_SID: true, TWILIO_AUTH_TOKEN: true,
      TWILIO_FROM_NUMBER: true, TWITTER_BEARER_TOKEN: true, SERPAPI_KEY: true,
      STRIPE_SECRET_KEY: true, STRIPE_WEBHOOK_SECRET: true
    };
    const { key, value } = await body(req);
    if (!ALLOWED[key]) return json(res, { ok: false, error: 'Unknown key' }, 400);
    if (!value || !value.trim()) return json(res, { ok: false, error: 'Empty value' }, 400);

    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    try { envContent = fs.readFileSync(envPath, 'utf8'); } catch {}
    const escaped = value.trim().replace(/\r?\n/g, '');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${escaped}`);
    } else {
      envContent = envContent.trimEnd() + `\n${key}=${escaped}\n`;
    }
    try { fs.writeFileSync(envPath, envContent, 'utf8'); } catch (e) {
      console.warn('[save-key] Could not write .env:', e.message);
    }
    process.env[key] = value.trim();
    initServices();
    json(res, { ok: true, key });
  },

  // ── API Status ───────────────────────────────────────
  'GET /api/status': (_, res) => {
    json(res, {
      ok: true,
      services: {
        supabase: !!process.env.SUPABASE_URL,
        claude:   !!process.env.ANTHROPIC_API_KEY,
        resend:   !!process.env.RESEND_API_KEY,
        hunter:   HAS_HUNTER,
        twilio:   HAS_TWILIO,
        twitter:  HAS_TWITTER,
        stripe:   !!process.env.STRIPE_SECRET_KEY,
        serpapi:  !!process.env.SERPAPI_KEY
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
    const { data, error } = await storage.clients.list();
    if (error) return json(res, { clients: [], error: error.message }, 500);
    json(res, { clients: data });
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
    const { data: created, error } = await storage.clients.create(record);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, client: created });
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
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const { data: updated, error } = await storage.clients.update(id, update);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, client: updated });
  },

  // ── Leads CRUD ────────────────────────────────────────
  'GET /api/leads': async (_, res) => {
    const { data, error } = await storage.leads.list();
    if (error) return json(res, { leads: [], error: error.message }, 500);
    json(res, { leads: data });
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
    const { data: created, error } = await storage.leads.create(record);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, lead: created });
  },

  'PATCH /api/leads': async (req, res) => {
    const { id, ...rest } = await body(req);
    const { error } = await storage.leads.update(id, rest);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true });
  },

  // ── Outreach Queue CRUD ───────────────────────────────
  'GET /api/outreach': async (_, res) => {
    const { data, error } = await storage.outreach.list();
    if (error) return json(res, { queue: [], error: error.message }, 500);
    json(res, { queue: data });
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
    const { data: created, error } = await storage.outreach.create(record);
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true, item: created });
  },

  'PATCH /api/outreach': async (req, res) => {
    const { id, status } = await body(req);
    const { error } = await storage.outreach.update(id, { status });
    if (error) return json(res, { ok: false, error: error.message }, 500);
    json(res, { ok: true });
  },

  // ── Revenue Dashboard aggregates ────────────────────────
  'GET /api/revenue': async (_, res) => {
    const out = {
      ok: true,
      hasStripe: !!stripe,
      mrr: 0,
      activeSubs: 0,
      last30dGross: 0,
      currency: 'gbp',
      recent: [],     // [{ amount, currency, created, description, customer_email }]
      warning: null
    };

    if (!stripe) return json(res, out);

    try {
      // Active subscriptions → MRR
      const subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
      let mrr = 0;
      for (const s of subs.data) {
        for (const it of (s.items?.data || [])) {
          const amount   = it.price?.unit_amount || 0;
          const interval = it.price?.recurring?.interval || 'month';
          const qty      = it.quantity || 1;
          const monthly  = interval === 'year' ? amount / 12 : amount;
          mrr += monthly * qty;
        }
      }
      out.mrr = Math.round(mrr);
      out.activeSubs = subs.data.length;

      // Charges in last 30 days
      const since = Math.floor((Date.now() - 30 * 86400000) / 1000);
      const charges = await stripe.charges.list({ limit: 100, created: { gte: since } });
      let gross = 0;
      for (const c of charges.data) {
        if (c.status === 'succeeded' && !c.refunded) gross += c.amount;
      }
      out.last30dGross = gross;
      out.recent = charges.data.slice(0, 10).map(c => ({
        amount:         c.amount,
        currency:       c.currency,
        created:        c.created,
        description:    c.description || c.statement_descriptor || 'Payment',
        customer_email: c.billing_details?.email || '',
        status:         c.status,
        refunded:       c.refunded
      }));
      out.currency = subs.data[0]?.items?.data?.[0]?.price?.currency || charges.data[0]?.currency || 'gbp';
    } catch (e) {
      out.warning = e.message;
    }

    json(res, out);
  },

  // ── Keyword Explorer: AI-generated scan combos ──────────
  'POST /api/explore-keywords': async (req, res) => {
    const { persona = {}, seed = '' } = await body(req);
    const market = persona.market || 'small service businesses';
    const offer  = persona.offer  || 'client acquisition system';

    const fallback = [
      { keyword: 'struggling to get customers',     subreddit: 'smallbusiness',    reason: 'Direct pain — actively searching for a fix' },
      { keyword: 'no leads coming in',              subreddit: 'entrepreneur',     reason: 'High-intent, revenue pressure' },
      { keyword: 'dead month',                      subreddit: 'sweatystartup',    reason: 'Trade-specific urgency — owners ready to spend' },
      { keyword: 'how do you get clients',          subreddit: 'freelance',        reason: 'New operators, willing to pay for shortcuts' },
      { keyword: 'no bookings',                     subreddit: 'smallbusinessuk',  reason: 'UK service trades — quickest to close locally' },
      { keyword: 'slow summer',                     subreddit: 'sweatystartup',    reason: 'Seasonal urgency lowers sales resistance' },
      { keyword: 'tried facebook ads wasted money', subreddit: 'marketinghelp',    reason: 'Burned-by-ads persona — primed for organic lead-gen' },
      { keyword: 'first client tips',               subreddit: 'sidehustle',       reason: 'Early-stage, high-conversion intent' },
      { keyword: 'cold email not working',          subreddit: 'sales',            reason: 'Already running outreach, needs better system' },
      { keyword: 'need work fast',                  subreddit: 'forhire',          reason: 'Cash-flow urgency — immediate buyer' },
      { keyword: 'growing my agency',               subreddit: 'agency',           reason: 'Agency owners looking for white-label ops' },
      { keyword: 'starting out freelance',          subreddit: 'entrepreneur_ride_along', reason: 'Low-noise sub with engaged readers' },
      { keyword: 'no one responding to dms',        subreddit: 'digital_marketing',reason: 'Operators looking for a working outreach system' },
      { keyword: 'how to scale past 5k',            subreddit: 'growmybusiness',   reason: 'Small-but-stuck owners — willing to pay' },
      { keyword: 'quitting my business',            subreddit: 'smallbusiness',    reason: 'Last-resort mindset — most desperate, most flexible' }
    ];

    if (!anthropic) return json(res, { ok: true, combos: fallback, source: 'template' });

    try {
      const prompt = `You help operators find Reddit prospects who need "${offer}".
Target market: ${market}.${seed ? '\nSeed idea from operator: ' + seed : ''}

Generate 15 keyword + subreddit combos that match business owners with active pain.

Rules:
- Keywords = exact PHRASES owners type when struggling ("no bookings this month", "can't find clients", "dead month")
- Not generic terms ("marketing", "advertising") — always a complaint or question phrase
- Real subreddits only: smallbusiness, smallbusinessuk, entrepreneur, sweatystartup, sidehustle, freelance, businessowners, digital_marketing, marketinghelp, agency, startups, sales, growmybusiness, entrepreneur_ride_along, forhire
- Mix: ~40% high-desperation (revenue emergency), ~40% active-search (trying to fix), ~20% goal-oriented (growing)
- "reason" = one short sentence (max 12 words) why this combo finds buyers

Return JSON only:
{"combos":[{"keyword":"...","subreddit":"...","reason":"..."}]}`;

      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      });
      const raw = msg.content[0].text.trim();
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('no JSON');
      const parsed = JSON.parse(m[0]);
      const combos = (parsed.combos || []).filter(c => c.keyword && c.subreddit);
      json(res, { ok: true, combos: combos.length ? combos : fallback, source: combos.length ? 'ai' : 'template' });
    } catch (e) {
      json(res, { ok: true, combos: fallback, source: 'fallback', warning: e.message });
    }
  },

  // ── Follow-up nudge generator ───────────────────────────
  'POST /api/generate-followup': async (req, res) => {
    const { originalMessage = '', leadName = '', niche = '', channel = 'reddit', persona = {} } = await body(req);

    const senderName  = persona.name  || 'I';
    const senderOffer = persona.offer || 'help getting consistent clients';

    // Template fallback — used when no Claude key
    const firstName = (leadName || '').split(/\s+/)[0];
    const template =
      (firstName ? `Hey ${firstName}, ` : 'Hey, ') +
      `wanted to circle back — no pressure if the timing's off. ` +
      `Since I messaged, I've been thinking: the fastest win for ${niche || 'folks like you'} is usually just one consistent lead source running in the background. ` +
      `Happy to show you how it'd look for your situation — 10 mins, zero pitch. Want me to send over a quick example?`;

    if (!anthropic) return json(res, { ok: true, message: template, source: 'template' });

    try {
      const prompt = `Someone sent this outreach ~48 hours ago and got no reply. Write a short follow-up nudge.

Original message sent:
"""
${originalMessage}
"""

Lead: ${leadName || 'unknown'} · Niche: ${niche || 'small business owner'} · Channel: ${channel}
Sender: ${senderName} — offer: ${senderOffer}

Rules:
- 2-3 sentences, under 60 words total
- Human tone, no "just checking in", no "bumping this"
- Add ONE new angle of value or a different question than the original
- Low pressure, end with a soft opt-out or easy yes/no question
- No emojis, no signature, no subject line
- Return ONLY the message body, nothing else`;

      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });
      const body_ = msg.content[0].text.trim().replace(/^["'`]|["'`]$/g, '');
      json(res, { ok: true, message: body_, source: 'ai' });
    } catch (e) {
      json(res, { ok: true, message: template, source: 'template', warning: e.message });
    }
  }
};

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
