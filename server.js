// TheSaaSsin Operator Server — pure Node, no dependencies
const http = require('http');
const crypto = require('crypto');
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

const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const WS_CLIENTS = new Set();

function parseQuery(url) {
  const qs = url.includes('?') ? url.split('?')[1] : '';
  const out = {};
  qs.split('&').forEach(part => {
    if (!part) return;
    const [k, v = ''] = part.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  });
  return out;
}

function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function encodeWsFrame(payload) {
  const body = Buffer.from(String(payload));
  const len = body.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  header[0] = 0x81;
  return Buffer.concat([header, body]);
}

function sendWs(socket, event) {
  if (!socket || socket.destroyed || !socket.writable) return;
  try {
    socket.write(encodeWsFrame(JSON.stringify(event)));
  } catch {}
}

function broadcastFeedEvent(event, matcher = () => true) {
  WS_CLIENTS.forEach(client => {
    if (!matcher(client)) return;
    sendWs(client.socket, event);
  });
}

function setupWebSocket(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }
  const accept = crypto.createHash('sha1').update(key + WS_MAGIC).digest('base64');
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${accept}`,
    '\r\n'
  ];
  socket.write(headers.join('\r\n'));

  const query = parseQuery(req.url || '');
  const client = {
    id: createId('ws'),
    socket,
    sessionId: query.sessionId || '',
    connectedAt: Date.now()
  };
  WS_CLIENTS.add(client);
  sendWs(socket, { type: 'socket.ready', sessionId: client.sessionId, clientId: client.id });

  socket.on('data', buffer => {
    if (!buffer || !buffer.length) return;
    const opcode = buffer[0] & 0x0f;
    if (opcode === 0x8) {
      try { socket.end(encodeWsFrame('')); } catch {}
      socket.destroy();
      return;
    }
    if (opcode === 0x9) {
      const pong = Buffer.from(buffer);
      pong[0] = 0x8a;
      pong[1] = pong[1] & 0x7f;
      try { socket.write(pong); } catch {}
    }
  });

  const cleanup = () => WS_CLIENTS.delete(client);
  socket.on('close', cleanup);
  socket.on('end', cleanup);
  socket.on('error', cleanup);
}

const DEFAULT_SERPER_SITES = [
  'facebook.com/groups',
  'linkedin.com',
  'quora.com',
  'indiehackers.com',
  'producthunt.com',
  'instagram.com',
  'upwork.com',
  'fiverr.com',
  'maps.google.com',
  'yelp.com',
  'yell.com',
  'clutch.co',
  'g2.com',
  'goodfirms.co',
  'expertise.com'
].join(' ');

const DIRECTORY_SITE_HINTS = [
  'maps.google.com',
  'yelp.com',
  'yell.com',
  'clutch.co',
  'g2.com',
  'goodfirms.co',
  'expertise.com'
];

const PRESENCE_GAP_TERMS = [
  '"no website"',
  '"without website"',
  '"without a website"',
  '"no landing page"',
  '"without landing page"',
  '"without a landing page"',
  '"need website"',
  '"need a website"',
  '"need landing page"',
  '"facebook page"',
  '"instagram page"',
  '"google business profile"',
  '"google maps listing"'
];

function inferWebPlatform(domain) {
  if (domain.includes('facebook')) return 'facebook';
  if (domain.includes('linkedin')) return 'linkedin';
  if (domain.includes('quora')) return 'quora';
  if (domain.includes('indiehackers')) return 'indiehackers';
  if (domain.includes('producthunt')) return 'producthunt';
  if (domain.includes('instagram')) return 'instagram';
  if (domain.includes('upwork')) return 'upwork';
  if (domain.includes('fiverr')) return 'fiverr';
  if (domain.includes('maps.google')) return 'maps';
  if (DIRECTORY_SITE_HINTS.some(site => domain.includes(site.replace(/^www\./, '')))) return 'directory';
  return 'web';
}

function buildSerperQueries(site, kw) {
  const queries = [`${kw} site:${site}`];
  const presenceGapQuery = `${kw} (${PRESENCE_GAP_TERMS.join(' OR ')}) site:${site}`;
  queries.push(presenceGapQuery);
  if (DIRECTORY_SITE_HINTS.includes(site)) {
    queries.push(`${kw} ("directory" OR listing OR "contact" OR phone OR review) site:${site}`);
  }
  return [...new Set(queries)];
}

function hasPresenceGapSignal(text) {
  const raw = String(text || '').toLowerCase();
  return [
    'no website', 'without website', 'without a website',
    'no landing page', 'without landing page', 'without a landing page',
    'need website', 'need a website', 'need landing page',
    'facebook page', 'instagram page', 'google business profile',
    'google maps listing'
  ].some(sig => raw.includes(sig));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scoreLabel(score) {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function scoreColor(score) {
  if (score >= 85) return '#ef4444';
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#8888a0';
}

function countMatches(raw, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(raw) ? 1 : 0), 0);
}

function inferLeadNiche(raw) {
  return /plumb|pipe|boiler|heating|gas safe/.test(raw)            ? 'Plumber'
    : /electrician|wiring|fuse|eicr|niceic|sparky/.test(raw)       ? 'Electrician'
    : /builder|construction|renovation|extension|joiner|carpenter/.test(raw) ? 'Builder'
    : /cleaner|cleaning|janitorial/.test(raw)                      ? 'Cleaning Business'
    : /landscap|garden|lawn|tree surgeon/.test(raw)                ? 'Landscaper'
    : /roofer|roofing|guttering/.test(raw)                         ? 'Roofer'
    : /hvac|air conditioning|heating engineer/.test(raw)           ? 'HVAC'
    : /dentist|dental|orthodont/.test(raw)                         ? 'Dentist'
    : /lawyer|solicitor|legal|barrister/.test(raw)                 ? 'Solicitor'
    : /accountant|bookkeep|tax|vat|bookkeeper/.test(raw)           ? 'Accountant'
    : /consultant|coach|advisor|freelanc|agency/.test(raw)         ? 'Consultant'
    : /marketing|seo|ppc|paid ads|lead gen/.test(raw)              ? 'Marketing Agency'
    : /saas|software|startup|founder|platform|tech/.test(raw)      ? 'SaaS / Tech'
    : /shopify|ecomm|ecommerce|amazon seller|store/.test(raw)      ? 'eCommerce'
    : /photographer|videographer|photo|video/.test(raw)            ? 'Photographer'
    : /designer|graphic|brand|web design|ux|ui design/.test(raw)   ? 'Designer'
    : /real estate|realtor|estate agent|property/.test(raw)        ? 'Estate Agent'
    : /restaurant|cafe|hospitality|catering/.test(raw)             ? 'Restaurant / Hospitality'
    : 'Business Owner';
}

function inferDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

function extractLeadEntity(post, metadata) {
  const domain = inferDomainFromUrl(post.url || post.permalink || '');
  const author = String(post.author || '').replace(/^u\//, '').trim();
  const titleText = `${post.title || ''} ${post.text || ''}`.toLowerCase();
  const companyGuess = metadata?.profile?.niche && metadata.profile.niche !== 'Business Owner'
    ? `${metadata.profile.niche} Business`
    : /agency/.test(titleText)
      ? 'Agency Business'
      : /saas|startup|platform/.test(titleText)
        ? 'Software Company'
        : '';

  return {
    domain,
    author,
    companyName: companyGuess,
    locationHint: /london|manchester|uk|usa|canada|australia/.exec(titleText)?.[0] || '',
    platform: post.platform || '',
    niche: metadata?.profile?.niche || 'Business Owner'
  };
}

function getEnabledEnrichmentProviders(cfg, groupKey) {
  const group = cfg?.enrichment?.[groupKey];
  if (!cfg?.enrichment?.enabled || !group?.enabled || !Array.isArray(group.providers)) return [];
  const maxProviders = Number(cfg.enrichment.maxProvidersPerLead) || 3;
  return group.providers
    .filter(provider => provider && provider.enabled && provider.apiKey)
    .slice(0, maxProviders);
}

function synthesizeFirmographicProfile(entity, metadata, providerId) {
  const predictive = metadata?.scores?.predictive || 0;
  const employeeEstimate = entity.niche === 'SaaS / Tech'
    ? predictive >= 75 ? '11-50' : '1-10'
    : predictive >= 70 ? '2-25' : '1-10';
  const revenueBand = predictive >= 80 ? '$500k-$2m' : predictive >= 60 ? '$100k-$500k' : 'sub-$100k';
  const growthStage = entity.niche === 'SaaS / Tech'
    ? (predictive >= 75 ? 'growing' : 'early')
    : (predictive >= 70 ? 'active local growth' : 'owner-led');

  return {
    provider: providerId,
    companyName: entity.companyName || entity.domain || entity.author || 'Unknown company',
    domain: entity.domain,
    industry: entity.niche,
    employeeEstimate,
    revenueBand,
    growthStage,
    marketSegment: entity.niche === 'SaaS / Tech' ? 'B2B software' : 'service business',
    confidence: clamp(55 + Math.round((metadata?.ranking?.confidence || 0) * 0.25))
  };
}

function synthesizeIntentProfile(entity, metadata, providerId) {
  const direct = metadata?.scores?.direct || 0;
  const operator = metadata?.scores?.operator || 0;
  const partner = metadata?.scores?.partner || 0;
  const predictive = metadata?.scores?.predictive || 0;
  const surge = clamp(Math.round((predictive * 0.6) + (metadata?.signals?.urgency || 0) * 0.25));

  return {
    provider: providerId,
    buyingStage: direct >= 70 ? 'active evaluation' : partner >= 65 ? 'channel exploration' : operator >= 60 ? 'partner-fit' : 'early awareness',
    intentScore: surge,
    intentTopics: [
      metadata?.opportunity?.demoFocus || 'growth systems',
      metadata?.routing?.category?.label || 'lead qualification',
      metadata?.profile?.niche || 'service growth'
    ].filter(Boolean).slice(0, 3),
    likelyNeed: metadata?.opportunity?.problem || 'lead generation support',
    confidence: clamp(50 + Math.round((metadata?.ranking?.confidence || 0) * 0.3))
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { raw: text }; }
    if (!res.ok) {
      const err = new Error(`${url} -> ${res.status}`);
      err.status = res.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function firstString(...values) {
  for (const v of values) {
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return '';
}

const FIRMOGRAPHIC_ADAPTERS = {
  apollo: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('apollo: missing domain');
    const base = provider.apiBase || 'https://api.apollo.io/api/v1';
    const url = `${base}/organizations/enrich?domain=${encodeURIComponent(entity.domain)}&api_key=${encodeURIComponent(provider.apiKey)}`;
    const data = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } }, timeoutMs);
    const org = data.organization || data.org || {};
    return {
      companyName:      firstString(org.name, entity.companyName, entity.domain),
      domain:           firstString(org.website_url, org.primary_domain, entity.domain),
      industry:         firstString(org.industry, entity.niche),
      employeeEstimate: firstString(org.estimated_num_employees, org.employees),
      revenueBand:      firstString(org.annual_revenue_printed, org.annual_revenue),
      growthStage:      org.publicly_traded_symbol ? 'public' : 'private',
      marketSegment:    firstString(org.keywords?.slice?.(0, 3)?.join?.(', '), org.industry, 'B2B'),
      confidence:       82
    };
  },
  clearbit: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('clearbit: missing domain');
    const base = provider.apiBase || 'https://company.clearbit.com/v2';
    const url = `${base}/companies/find?domain=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    return {
      companyName:      firstString(data.name, entity.companyName, entity.domain),
      domain:           firstString(data.domain, entity.domain),
      industry:         firstString(data.category?.industry, data.category?.sector, entity.niche),
      employeeEstimate: firstString(data.metrics?.employees, data.metrics?.employeesRange),
      revenueBand:      firstString(data.metrics?.annualRevenue, data.metrics?.estimatedAnnualRevenue),
      growthStage:      firstString(data.metrics?.employeesRange, data.type, 'private'),
      marketSegment:    firstString(data.category?.sector, data.category?.industryGroup, 'B2B'),
      confidence:       80
    };
  },
  company_enrich: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('company_enrich: missing domain');
    const base = provider.apiBase || 'https://api.companyenrich.com';
    const url = `${base}/companies/enrich?domain=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    return {
      companyName:      firstString(data.name, data.companyName, entity.domain),
      domain:           firstString(data.domain, entity.domain),
      industry:         firstString(data.industry, entity.niche),
      employeeEstimate: firstString(data.employeeCount, data.employees, data.size),
      revenueBand:      firstString(data.revenue, data.annualRevenue),
      growthStage:      firstString(data.stage, data.type, 'private'),
      marketSegment:    firstString(data.sector, data.industry, 'B2B'),
      confidence:       75
    };
  },
  infobel: async (provider, entity, timeoutMs) => {
    if (!entity.domain && !entity.companyName) throw new Error('infobel: missing domain or company');
    const base = provider.apiBase || 'https://api.infobelpro.com/v2';
    const url = `${base}/companies/search?domain=${encodeURIComponent(entity.domain || '')}&name=${encodeURIComponent(entity.companyName || '')}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'X-Api-Key': provider.apiKey,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    const hit = Array.isArray(data.results) ? data.results[0] : (data.result || data.company || {});
    return {
      companyName:      firstString(hit.name, entity.companyName, entity.domain),
      domain:           firstString(hit.website, hit.domain, entity.domain),
      industry:         firstString(hit.industry, hit.naics, entity.niche),
      employeeEstimate: firstString(hit.employee_count, hit.employees),
      revenueBand:      firstString(hit.revenue, hit.revenue_range),
      growthStage:      firstString(hit.status, hit.stage, 'private'),
      marketSegment:    firstString(hit.sector, hit.naics_description, 'local services'),
      confidence:       70
    };
  }
};

const INTENT_ADAPTERS = {
  factors: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('factors: missing domain');
    const base = provider.apiBase || 'https://api.factors.ai/v1';
    const url = `${base}/accounts/intent?domain=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    const topics = Array.isArray(data.topics) ? data.topics.slice(0, 3).map(t => t.name || t) : [];
    return {
      buyingStage:   firstString(data.stage, data.buyingStage, 'active evaluation'),
      intentScore:   Number.isFinite(data.intentScore) ? clamp(Math.round(data.intentScore)) : clamp(Math.round((data.score || 0) * 100)),
      intentTopics:  topics.length ? topics : ['growth systems'],
      likelyNeed:    firstString(data.likelyNeed, data.summary, 'lead generation systems'),
      confidence:    clamp(Math.round((data.confidence || 0.7) * 100))
    };
  },
  coresignal: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('coresignal: missing domain');
    const base = provider.apiBase || 'https://api.coresignal.com/cdapi/v1';
    const url = `${base}/professional_network/company/collect?website=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    const size = Number(data.employees_count || data.size || 0);
    const growth = Number(data.employees_count_growth_1y || 0);
    return {
      buyingStage:   growth > 0.1 ? 'active hiring / expansion' : size > 50 ? 'active evaluation' : 'early awareness',
      intentScore:   clamp(Math.round(30 + (growth * 400) + (size > 100 ? 20 : 0))),
      intentTopics:  [data.industry, data.specialties?.[0], 'company growth signals'].filter(Boolean).slice(0, 3),
      likelyNeed:    firstString(data.description?.slice?.(0, 120), 'scaling systems'),
      confidence:    65
    };
  },
  success: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('success: missing domain');
    const base = provider.apiBase || 'https://api.success.ai/v1';
    const url = `${base}/intent/domain?domain=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    return {
      buyingStage:   firstString(data.buying_stage, data.stage, 'active awareness'),
      intentScore:   Number.isFinite(data.intent_score) ? clamp(Math.round(data.intent_score)) : clamp(Math.round((data.score || 0.6) * 100)),
      intentTopics:  Array.isArray(data.topics) ? data.topics.slice(0, 3) : ['pipeline growth'],
      likelyNeed:    firstString(data.likely_need, data.summary, 'acquisition system'),
      confidence:    clamp(Math.round((data.confidence || 0.65) * 100))
    };
  },
  dealfront: async (provider, entity, timeoutMs) => {
    if (!entity.domain) throw new Error('dealfront: missing domain');
    const base = provider.apiBase || 'https://api.dealfront.com/v1';
    const url = `${base}/companies/intent?domain=${encodeURIComponent(entity.domain)}`;
    const data = await fetchWithTimeout(url, {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Accept': 'application/json'
      }
    }, timeoutMs);
    return {
      buyingStage:   firstString(data.buying_stage, data.stage, 'active research'),
      intentScore:   Number.isFinite(data.intent_score) ? clamp(Math.round(data.intent_score)) : clamp(Math.round((data.score || 0.6) * 100)),
      intentTopics:  Array.isArray(data.topics) ? data.topics.slice(0, 3) : ['sales intelligence'],
      likelyNeed:    firstString(data.likely_need, data.summary, 'sales enablement'),
      confidence:    clamp(Math.round((data.confidence || 0.7) * 100))
    };
  }
};

function hasProviderAdapter(type, providerId) {
  if (type === 'firmographics') return !!FIRMOGRAPHIC_ADAPTERS[providerId];
  if (type === 'intent') return !!INTENT_ADAPTERS[providerId];
  return false;
}

async function runProviderEnrichment(provider, type, entity, metadata, timeoutMs) {
  const startedAt = Date.now();
  const adapter = type === 'firmographics' ? FIRMOGRAPHIC_ADAPTERS[provider.id] : INTENT_ADAPTERS[provider.id];

  if (adapter) {
    try {
      const data = await adapter(provider, entity, timeoutMs);
      return {
        type,
        provider: provider.id,
        status: 'ok',
        source: 'live',
        elapsedMs: Date.now() - startedAt,
        data: { provider: provider.id, ...data }
      };
    } catch (error) {
      const synth = type === 'firmographics'
        ? synthesizeFirmographicProfile(entity, metadata, provider.id)
        : synthesizeIntentProfile(entity, metadata, provider.id);
      return {
        type,
        provider: provider.id,
        status: 'fallback',
        source: 'synthesized',
        elapsedMs: Date.now() - startedAt,
        error: error.message || String(error),
        data: synth
      };
    }
  }

  const jitter = 120 + Math.floor(Math.random() * 220);
  await sleep(Math.min(timeoutMs, jitter));
  const data = type === 'firmographics'
    ? synthesizeFirmographicProfile(entity, metadata, provider.id)
    : synthesizeIntentProfile(entity, metadata, provider.id);
  return {
    type,
    provider: provider.id,
    status: 'ok',
    source: 'synthesized',
    elapsedMs: Date.now() - startedAt,
    data
  };
}

function mergeEnrichmentIntoMetadata(metadata, enrichment) {
  const next = JSON.parse(JSON.stringify(metadata || {}));
  next.enrichment = next.enrichment || {
    status: 'idle',
    summary: '',
    firmographics: [],
    intent: [],
    providerCount: 0
  };

  const firmographics = enrichment.results.filter(r => r.type === 'firmographics' && r.status === 'ok').map(r => r.data);
  const intent = enrichment.results.filter(r => r.type === 'intent' && r.status === 'ok').map(r => r.data);

  const liveCount = enrichment.results.filter(r => r.source === 'live').length;
  const fallbackCount = enrichment.results.filter(r => r.source === 'synthesized').length;

  next.enrichment.status = firmographics.length || intent.length ? 'enriched' : 'unavailable';
  next.enrichment.firmographics = firmographics;
  next.enrichment.intent = intent;
  next.enrichment.providerCount = firmographics.length + intent.length;
  next.enrichment.liveCount = liveCount;
  next.enrichment.fallbackCount = fallbackCount;
  next.enrichment.sourceMix = liveCount && fallbackCount ? 'mixed' : liveCount ? 'live' : 'synthesized';

  const topFirmographic = firmographics[0];
  const topIntent = intent[0];
  const summaryBits = [];
  if (topFirmographic) summaryBits.push(`${topFirmographic.industry}, ${topFirmographic.employeeEstimate} team, ${topFirmographic.growthStage}`);
  if (topIntent) summaryBits.push(`${topIntent.buyingStage}, intent ${topIntent.intentScore}/100`);
  next.enrichment.summary = summaryBits.join(' · ');

  if (topIntent?.intentScore && topIntent.intentScore > (next.ranking?.overall || 0)) {
    next.ranking.overall = clamp(Math.round((next.ranking.overall * 0.8) + (topIntent.intentScore * 0.2)));
    next.ranking.label = scoreLabel(next.ranking.overall);
    next.ranking.color = scoreColor(next.ranking.overall);
  }

  return next;
}

async function enrichLead(post, cfg, onUpdate) {
  const metadata = post.metadata || buildLeadMetadata(post, '');
  const entity = extractLeadEntity(post, metadata);
  const timeoutMs = Number(cfg?.enrichment?.requestTimeoutMs) || 3500;
  const firmographicProviders = getEnabledEnrichmentProviders(cfg, 'firmographics');
  const intentProviders = getEnabledEnrichmentProviders(cfg, 'intent');
  const providers = [
    ...firmographicProviders.map(provider => ({ provider, type: 'firmographics' })),
    ...intentProviders.map(provider => ({ provider, type: 'intent' }))
  ];

  if (!providers.length) {
    const fallback = {
      leadId: post.id,
      status: 'skipped',
      entity,
      results: []
    };
    if (onUpdate) onUpdate(fallback, mergeEnrichmentIntoMetadata(metadata, fallback));
    return fallback;
  }

  const results = await Promise.all(providers.map(async item => {
    try {
      return await runProviderEnrichment(item.provider, item.type, entity, metadata, timeoutMs);
    } catch (error) {
      return {
        type: item.type,
        provider: item.provider.id,
        status: 'error',
        elapsedMs: 0,
        error: error.message
      };
    }
  }));

  const enrichment = {
    leadId: post.id,
    status: 'ok',
    entity,
    results
  };
  const mergedMetadata = mergeEnrichmentIntoMetadata(metadata, enrichment);
  if (onUpdate) onUpdate(enrichment, mergedMetadata);
  return { ...enrichment, metadata: mergedMetadata };
}

/* ── PREDICTIVE LEARNING LOOP ── */
const PREDICTIVE_FILE = 'predictive-weights.json';
const PREDICTIVE_MAX_RECENT = 500;
const PREDICTIVE_MIN_TRIALS = 3;
const PREDICTIVE_CAP = 12;

function readPredictiveWeights() {
  const raw = readJSON(PREDICTIVE_FILE);
  const seeded = {
    version: 1,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    totals: raw.totals || { closes: 0, deads: 0 },
    features: raw.features || {},
    recent: Array.isArray(raw.recent) ? raw.recent : []
  };
  return seeded;
}

function featureSlug(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function featureKeysFromLead(lead) {
  if (!lead) return [];
  const keys = [];
  const push = (cat, val) => { const s = featureSlug(val); if (s) keys.push(`${cat}:${s}`); };
  push('niche',       lead.niche);
  push('platform',    lead.platform);
  push('leadType',    lead.leadType);
  push('painKey',     lead.painKey);
  push('subreddit',   lead.subreddit);
  push('buyingStage', lead.buyingStage);
  push('industry',    lead.industry);
  return [...new Set(keys)];
}

function featureKeysFromFeed(post, metadata) {
  const keys = [];
  const push = (cat, val) => { const s = featureSlug(val); if (s) keys.push(`${cat}:${s}`); };
  push('niche',     metadata?.profile?.niche);
  push('platform',  post?.platform);
  push('leadType',  metadata?.routing?.primaryType);
  push('subreddit', post?.subreddit);
  const intent = metadata?.enrichment?.intent?.[0];
  push('buyingStage', intent?.buyingStage);
  const firmo = metadata?.enrichment?.firmographics?.[0];
  push('industry', firmo?.industry);
  return [...new Set(keys)];
}

function getPredictiveAdjustment(featureKeys) {
  const weights = readPredictiveWeights();
  const featureCount = Object.keys(weights.features).length;
  if (!featureCount) return { delta: 0, signal: 'cold_start', reasons: [], sampleSize: 0 };

  const baselineRate = (weights.totals.closes + 1) / (weights.totals.closes + weights.totals.deads + 2);
  const deltas = [];
  const reasons = [];
  for (const k of featureKeys) {
    const f = weights.features[k];
    if (!f || f.trials < PREDICTIVE_MIN_TRIALS) continue;
    const rate = (f.closes + 1) / (f.closes + f.deads + 2);
    const d = (rate - baselineRate) * 100;
    deltas.push(d);
    if (Math.abs(d) >= 4) {
      reasons.push({ key: k, closes: f.closes, deads: f.deads, delta: Math.round(d) });
    }
  }
  if (!deltas.length) return { delta: 0, signal: 'not_enough_data', reasons: [], sampleSize: 0 };

  const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const capped = Math.max(-PREDICTIVE_CAP, Math.min(PREDICTIVE_CAP, Math.round(avg)));
  const signal = capped >= 4 ? 'tailwind' : capped <= -4 ? 'headwind' : 'neutral';
  reasons.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return { delta: capped, signal, reasons: reasons.slice(0, 3), sampleSize: deltas.length };
}

function outcomeWeights(status) {
  // Returns { pos, neg }. qualified is a mild positive, contacted is no-op until it resolves.
  if (status === 'closed')    return { pos: 1,   neg: 0 };
  if (status === 'qualified') return { pos: 0.4, neg: 0 };
  if (status === 'dead')      return { pos: 0,   neg: 1 };
  if (status === 'lost')      return { pos: 0,   neg: 1 };
  return { pos: 0, neg: 0 };
}

function learnFromLeadOutcome(lead, status) {
  const { pos, neg } = outcomeWeights(status);
  if (!pos && !neg) return;
  const keys = featureKeysFromLead(lead);
  if (!keys.length) return;

  const weights = readPredictiveWeights();
  const now = new Date().toISOString();
  weights.totals.closes += pos;
  weights.totals.deads  += neg;

  for (const k of keys) {
    const f = weights.features[k] = weights.features[k] || { closes: 0, deads: 0, trials: 0, lastUpdated: now };
    f.closes += pos;
    f.deads  += neg;
    f.trials += 1;
    f.lastUpdated = now;
  }

  weights.recent.unshift({
    leadId: lead.id,
    outcome: status,
    features: keys,
    at: now
  });
  weights.recent = weights.recent.slice(0, PREDICTIVE_MAX_RECENT);
  weights.updatedAt = now;

  writeJSON(PREDICTIVE_FILE, weights);
}

function assignLeadTier(overall, intentScore, confidence, cfg) {
  const tiers = (cfg && cfg.decisionEngine && cfg.decisionEngine.tiers) || {};
  const autoReady  = tiers.autoReady  || { minScore: 85, minIntentScore: 70, minConfidence: 70 };
  const replyReady = tiers.replyReady || { minScore: 65 };
  if (overall >= autoReady.minScore && intentScore >= autoReady.minIntentScore && confidence >= autoReady.minConfidence) return 'autoReady';
  if (overall >= replyReady.minScore) return 'replyReady';
  return 'review';
}

function buildLeadMetadata(post, keyword) {
  const raw = `${post.title || ''} ${post.text || ''} ${(post.comments || []).join(' ')}`.toLowerCase();
  const platform = String(post.platform || 'web').toLowerCase();
  const source = `${platform} ${(post.subreddit || '').toLowerCase()}`;
  const niche = inferLeadNiche(raw);

  const signals = {
    buyerIntent: clamp(
      countMatches(raw, [
        /need clients?|need leads?|need more work|need bookings?/,
        /how do i get clients?|how to get clients?|where do i find clients?/,
        /struggling to get first client|no clients?|no customers?|no enquiries?/,
        /desperate for clients?|need clients urgently|business failing/,
        /traffic but no|visitors but no|not converting|no conversions?/
      ]) * 22
    ),
    urgency: clamp(
      countMatches(raw, [
        /about to give up|considering quitting|thinking of shutting down/,
        /running out of money|burning through savings|cant pay myself|can't pay myself/,
        /desperate|urgent|asap|immediately|make or break/,
        /slow month|quiet month|dry spell|clients dried up/
      ]) * 24
    ),
    financialPressure: clamp(
      countMatches(raw, [
        /burning cash|negative roi|wasted my budget|spent thousands and nothing/,
        /can't pay|cant pay|out of money|running out of money/,
        /\$|£|€|budget|roi|cost/
      ]) * 20
    ),
    timePressure: clamp(
      countMatches(raw, [
        /no time|too busy|overwhelmed|swamped|time poor/,
        /within the hour|today|this week|fast-track/
      ]) * 28
    ),
    outreachPain: clamp(
      countMatches(raw, [
        /cold outreach|cold email|cold dm|cold message/,
        /no replies?|no response|ignored|left on read/,
        /follow.?up.*nothing|ghosted/
      ]) * 24
    ),
    conversionPain: clamp(
      countMatches(raw, [
        /not converting|no conversions?|low conversion/,
        /traffic but no|visitors but no|clicks but no sales/,
        /quotes? ignored|proposals? ignored|ghosted after quotes?/
      ]) * 24
    ),
    visibilityGap: clamp(
      countMatches(raw, [
        /no reach|low traffic|not seen|visibility|discoverability/,
        /seo not working|google rank|not ranking/,
        /posting every day no clients|content not converting/
      ]) * 22
    ),
    webPresenceGap: clamp(
      countMatches(raw, [
        /no website|without website|need website/,
        /no landing page|without landing page/,
        /google business profile|google maps listing|facebook page|instagram page/,
        /website feedback|online presence/
      ]) * 24
    ),
    localServiceFit: clamp(
      countMatches(raw, [
        /local business|small business|service business|my business/,
        /plumber|electrician|builder|roofer|cleaning|landscaping|dentist|restaurant/,
        /google maps|local seo|neighborhood|near me/
      ]) * 22
    ),
    operatorFit: clamp(
      countMatches(raw, [
        /agency|freelancer|consultant|designer|copywriter|retainer/,
        /my clients need|client work|client projects|subcontract|outsource/,
        /white label|resell services|i build websites|i manage/
      ]) * 26
    ),
    distributionFit: clamp(
      countMatches(raw, [
        /saas|software platform|marketplace|community|membership/,
        /integration|plugin|api partner|distribution channel/,
        /white label|reseller|franchise|affiliate program/,
        /thousands of users|raised funding|enterprise/
      ]) * 24
    ),
    authorityReach: clamp(
      countMatches(raw, [
        /enterprise|raised funding|series a|thousands of users/,
        /platform|marketplace|community|directory/,
        /revenue share|integration partner/
      ]) * 24
    )
  };

  const typeScores = {
    direct: clamp(
      15 +
      (signals.buyerIntent * 0.38) +
      (signals.urgency * 0.18) +
      (signals.financialPressure * 0.12) +
      (signals.localServiceFit * 0.15) +
      (signals.webPresenceGap * 0.10) +
      (signals.conversionPain * 0.12) -
      (signals.operatorFit * 0.12) -
      (signals.distributionFit * 0.18)
    ),
    operator: clamp(
      10 +
      (signals.operatorFit * 0.44) +
      (signals.visibilityGap * 0.10) +
      (signals.webPresenceGap * 0.08) +
      (signals.authorityReach * 0.08) +
      (signals.buyerIntent * 0.10) -
      (signals.distributionFit * 0.08)
    ),
    partner: clamp(
      8 +
      (signals.distributionFit * 0.48) +
      (signals.authorityReach * 0.24) +
      (signals.operatorFit * 0.10) +
      (signals.visibilityGap * 0.06) -
      (signals.localServiceFit * 0.10)
    )
  };

  const rankedTypes = Object.entries(typeScores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
  const primaryType = rankedTypes[0] || 'direct';

  const categoryMap = {
    direct: {
      key: signals.localServiceFit >= 55 || signals.webPresenceGap >= 60 ? 'direct_client' : 'high_intent_client',
      label: signals.localServiceFit >= 55 || signals.webPresenceGap >= 60 ? 'Direct Client' : 'Direct Client',
      tagline: signals.localServiceFit >= 55 || signals.webPresenceGap >= 60 ? 'Immediate revenue fit' : 'Strong buyer intent'
    },
    operator: {
      key: 'potential_partner',
      label: 'Potential Partner',
      tagline: 'One relationship can yield repeat clients'
    },
    partner: {
      key: 'distribution_partner',
      label: 'Larger Distribution',
      tagline: 'Platform or channel leverage'
    }
  };
  const category = categoryMap[primaryType];

  const predictiveScore = clamp(Math.round(
    (typeScores[primaryType] * 0.42) +
    (signals.buyerIntent * 0.18) +
    (signals.urgency * 0.12) +
    (signals.conversionPain * 0.08) +
    (signals.webPresenceGap * 0.08) +
    (signals.operatorFit * 0.06) +
    (signals.distributionFit * 0.10) -
    (platform === 'hn' ? 4 : 0)
  ));

  const confidence = clamp(Math.round(
    45 +
    (countMatches(raw, [
      /need clients?|no clients?|no leads?|desperate/,
      /agency|freelancer|white label|client work/,
      /saas|platform|marketplace|integration/
    ]) * 14)
  ));

  const criteriaMatches = [];
  if (signals.buyerIntent >= 40) criteriaMatches.push('explicit demand or acquisition pain');
  if (signals.urgency >= 40) criteriaMatches.push('time-sensitive or financial urgency');
  if (signals.webPresenceGap >= 40) criteriaMatches.push('weak web presence or no landing page');
  if (signals.conversionPain >= 40) criteriaMatches.push('conversion system gap');
  if (signals.outreachPain >= 40) criteriaMatches.push('outreach or follow-up breakdown');
  if (signals.operatorFit >= 40) criteriaMatches.push('agency/operator or white-label fit');
  if (signals.distributionFit >= 40) criteriaMatches.push('platform or distribution leverage');
  if (signals.localServiceFit >= 40) criteriaMatches.push('strong local service-business fit');
  if (!criteriaMatches.length) criteriaMatches.push('general growth-system opportunity');

  const problem = signals.outreachPain >= 50
    ? 'Outreach is getting ignored or stalling before replies.'
    : signals.conversionPain >= 50
      ? 'Interest exists, but it is not turning into enquiries, bookings, or sales.'
      : signals.webPresenceGap >= 50
        ? 'Their online presence is weak or missing, so demand leaks away.'
        : signals.visibilityGap >= 50
          ? 'People are not seeing them consistently enough to build demand.'
          : signals.distributionFit >= 50
            ? 'They have channel potential, but the partnership angle needs packaging.'
            : 'They have a client acquisition gap that points to a missing system.';

  const rootCause = primaryType === 'partner'
    ? 'The opportunity is leverage, not just one sale, so the value needs to be framed as integration, white-label, or distribution.'
    : primaryType === 'operator'
      ? 'They already serve clients, so a backend system offer is stronger than pitching a one-off direct service.'
      : signals.webPresenceGap >= 50
        ? 'Traffic and trust are not being captured by a clear offer, landing page, and follow-up path.'
        : 'Demand signals exist, but there is no reliable system moving attention into closed business.';

  const positioning = primaryType === 'partner'
    ? 'Lead with leverage: position Operator as a plug-in growth layer they can distribute, integrate, or white-label.'
    : primaryType === 'operator'
      ? 'Lead with partnership value: help them sell more to their own clients using your backend systems under their brand.'
      : signals.webPresenceGap >= 50
        ? 'Lead with a quick-win rebuild: website, landing page, offer clarity, and follow-up automation.'
        : 'Lead with a practical acquisition system that fixes the exact point where demand is leaking.';

  const demoFocus = primaryType === 'partner'
    ? 'Operator integration + white-label distribution path'
    : primaryType === 'operator'
      ? 'White-label backend stack for their client services'
      : signals.outreachPain >= 50
        ? 'Outreach sequence + landing page + follow-up automation'
        : signals.conversionPain >= 50
          ? 'Landing page + CRM + close-tracking flow'
          : signals.webPresenceGap >= 50
            ? 'Client Creator + landing page + offer positioning'
            : 'Lead Feed + CRM + outreach workflow';

  const nextAction = primaryType === 'partner'
    ? 'Treat this as a strategic conversation, not a cold close. Show leverage, distribution upside, and integration fit.'
    : primaryType === 'operator'
      ? 'Pitch a partner model first: white-label delivery, resale margin, and faster client fulfillment.'
      : predictiveScore >= 75
        ? 'Message quickly with a pointed fix and a concrete demo angle.'
        : 'Qualify with one smart question, then route them into a focused demo.';

  const whyNow = predictiveScore >= 75
    ? 'Multiple criteria stack together here, so this is more than a single-tag lead.'
    : 'The signal is good, but it still benefits from qualification before heavy effort.';

  const opportunitySummary = primaryType === 'partner'
    ? 'This looks like a distribution opportunity where one relationship could unlock multiple downstream customers.'
    : primaryType === 'operator'
      ? 'This looks like a partner-fit operator who could resell or embed your systems for their own clients.'
      : 'This looks like a direct client opportunity with near-term revenue potential if you solve the visible system gap.';

  const opener = primaryType === 'partner'
    ? `Saw what you're building around ${keyword || niche.toLowerCase()} and there looks like a real fit. I build the backend acquisition layer that platforms and communities can white-label or distribute. Worth a quick look?`
    : primaryType === 'operator'
      ? `Noticed the agency/operator angle in your post. I build the backend systems agencies and freelancers can plug into their own client delivery under their brand. Want to see what that could look like?`
      : `Saw your post and the issue looks more like a system gap than a service problem. I can map out a quick fix around ${demoFocus.toLowerCase()} if that would help.`;

  const tip = primaryType === 'partner'
    ? 'Talk leverage first: integration, distribution, margin, and speed to market.'
    : primaryType === 'operator'
      ? 'Position this as a partner win, not a generic service pitch.'
      : predictiveScore >= 75
        ? 'Move fast and be specific about the broken step in their acquisition flow.'
        : 'Open with empathy, qualify once, then show the exact workflow fix.';

  return {
    version: 1,
    keyword: keyword || '',
    profile: {
      niche,
      source: platform,
      subreddit: post.subreddit || ''
    },
    signals,
    scores: {
      direct: Math.round(typeScores.direct),
      operator: Math.round(typeScores.operator),
      partner: Math.round(typeScores.partner),
      predictive: predictiveScore
    },
    routing: {
      primaryType,
      secondaryTypes: rankedTypes.slice(1, 3),
      category
    },
    opportunity: {
      problem,
      rootCause,
      positioning,
      demoFocus,
      nextAction
    },
    summary: {
      whyNow,
      opportunity: opportunitySummary,
      rationale: criteriaMatches.slice(0, 3).join(' + ')
    },
    explanation: {
      criteriaMatches,
      opener,
      tip
    },
    ranking: (() => {
      const featureKeys = [
        niche ? `niche:${featureSlug(niche)}` : null,
        platform ? `platform:${featureSlug(platform)}` : null,
        primaryType ? `leadType:${featureSlug(primaryType)}` : null,
        post.subreddit ? `subreddit:${featureSlug(post.subreddit)}` : null
      ].filter(Boolean);
      const adjustment = getPredictiveAdjustment(featureKeys);
      const adjusted = clamp(predictiveScore + (adjustment.delta || 0));
      return {
        baseOverall: predictiveScore,
        overall: adjusted,
        label: scoreLabel(adjusted),
        color: scoreColor(adjusted),
        confidence,
        predictive: adjustment,
        tier: assignLeadTier(adjusted, 0, confidence, readJSON('config.json'))
      };
    })(),
    scoreBreakdown: [
      { label: 'Buyer intent',       value: signals.buyerIntent },
      { label: 'Urgency',            value: signals.urgency },
      { label: 'Financial pressure', value: signals.financialPressure },
      { label: 'Conversion pain',    value: signals.conversionPain },
      { label: 'Outreach pain',      value: signals.outreachPain },
      { label: 'Web presence gap',   value: signals.webPresenceGap },
      { label: 'Operator fit',       value: signals.operatorFit },
      { label: 'Distribution fit',   value: signals.distributionFit },
      { label: 'Local service fit',  value: signals.localServiceFit }
    ].filter(s => s.value > 0).sort((a, b) => b.value - a.value),
    source: {
      platform,
      subreddit: post.subreddit || '',
      platformNote: platform === 'reddit' ? 'Reddit signal — community text, high specificity'
        : platform === 'x' ? 'X/Twitter — real-time signal, variable quality'
        : platform === 'hn' ? 'Hacker News — tech/founder audience'
        : 'Web / Serper — aggregated search signal'
    }
  };
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

// ── B.O.S.S modules (memory palace + multi-channel agent swarm) ──────────────
const bossChannels = require('./channels/registry');
const bossSwarm    = require('./channels/agents');
const bossRouter   = require('./ai/router');
const bossMem      = require('./ai/memory-manager');
const bossVector   = require('./ai/vector');

// ── Specialized agent configs — each has a role, model priority, token budget ─
const AGENTS = {
  scout: {
    label: 'Scout',
    role:  'Lead intelligence specialist. Finds real pain in real markets. Outputs WHERE to find leads (subreddits, hashtags, search queries, communities). Never invents data.',
    taskKind: 'analyse',
    maxTokens: 600,
    preferModels: ['groq/llama-3.1-8b-instant'], // fast + free
  },
  copywriter: {
    label: 'Copywriter',
    role:  'Elite pitch writer. Every word earns its place. Writes cold emails, DMs, call openers, captions that get replies. No fluff. No corporate speak. Pain → solution → proof → CTA.',
    taskKind: 'pitch',
    maxTokens: 1000,
    preferModels: ['groq/llama-3.3-70b-versatile', 'anthropic/claude-haiku-4-5-20251001'],
  },
  analyst: {
    label: 'Analyst',
    role:  'Market intelligence expert. Identifies opportunities, gaps, pricing, competitor weaknesses, market timing. Data-first, revenue-focused.',
    taskKind: 'analyse',
    maxTokens: 800,
    preferModels: ['groq/llama-3.3-70b-versatile', 'glm/glm-4-flash'],
  },
  builder: {
    label: 'Builder',
    role:  'Code specialist. Writes and fixes JavaScript modules for the B.O.S.S operator. Outputs working, clean code only. No explanations unless asked.',
    taskKind: 'code',
    maxTokens: 1200,
    preferModels: ['glm/glm-4-flash', 'anthropic/claude-sonnet-4-5'],
  },
  coach: {
    label: 'Coach',
    role:  'Revenue strategist. Gives ONE clear next action that moves toward money. Handles objections, fixes mindset blocks, identifies the highest-leverage move right now.',
    taskKind: 'strategy',
    maxTokens: 500,
    preferModels: ['groq/llama-3.3-70b-versatile'],
  },
  researcher: {
    label: 'Researcher',
    role:  'Deep research agent. Analyses markets, tools, platforms, integrations, competitors, AI APIs, business models. Produces actionable briefs overnight.',
    taskKind: 'analyse',
    maxTokens: 1400,
    preferModels: ['groq/llama-3.3-70b-versatile', 'glm/glm-4-flash'],
  },
};

// ── Inbound message handler (all channels → B.O.S.S AI → reply) ─────────────
async function bossHandleInbound(ch, chanId, norm) {
  try {
    const state    = bossReadState();
    const cfg      = readJSON('config.json');
    if (cfg.anthropicApiKey)  process.env.ANTHROPIC_API_KEY  = cfg.anthropicApiKey;
    if (cfg.groqApiKey)       process.env.GROQ_API_KEY       = cfg.groqApiKey;
    if (cfg.geminiApiKey)     process.env.GEMINI_API_KEY     = cfg.geminiApiKey;
    if (cfg.openaiApiKey)     process.env.OPENAI_API_KEY     = cfg.openaiApiKey;
    if (cfg.cerebrasApiKey)   process.env.CEREBRAS_API_KEY   = cfg.cerebrasApiKey;
    if (cfg.openrouterApiKey) process.env.OPENROUTER_API_KEY = cfg.openrouterApiKey;
    if (cfg.glmApiKey)        process.env.GLM_API_KEY        = cfg.glmApiKey;

    const text = (norm.text || '').trim();

    // Handle photo — acknowledge + ask what to do with it
    if (norm.mediaType === 'photo') {
      try {
        const fileUrl = await ch.getFileUrl(norm.mediaFileId);
        const reply = `📸 Photo received.\n\nWhat do you want me to do with it?\n→ "analyse this image" — I'll describe what I see\n→ "use this for a post" — I'll write a caption\n→ "generate a pitch using this" — I'll build outreach around it\n\nImage URL: ${fileUrl}`;
        bossSwarm.pushMessage(chanId, norm.chatId, 'assistant', reply);
        if (ch.configured()) await ch.send({ to: norm.chatId, text: reply });
        return;
      } catch (e) {
        await ch.send({ to: norm.chatId, text: '📸 Photo received — file download failed. Try sending as a document instead.' });
        return;
      }
    }

    // Voice note — acknowledge
    if (norm.mediaType === 'voice') {
      const reply = `🎤 Voice note received.\n\nVoice transcription isn't wired yet — type your message instead for now.\n\nOr send me:\n→ What you were just saying\n→ A pitch request, market question, or task`;
      await ch.send({ to: norm.chatId, text: reply });
      return;
    }

    // Slash command routing from Telegram
    // Default: 'boss' — forces Claude→Gemini→GPT chain (instruction-following).
    // 'quickReply' was here before but routes Groq-first which roleplays.
    let taskKind = 'boss';
    let systemExtra = '';
    if (text.startsWith('/pitch'))       { taskKind = 'pitch';    systemExtra = 'Generate full cold outreach pack.'; }
    else if (text.startsWith('/scan'))   { taskKind = 'analyse';  systemExtra = 'Find pain points and prospect leads for this market.'; }
    else if (text.startsWith('/auto'))   { taskKind = 'strategy'; systemExtra = 'Assess current state and give one clear next move toward revenue.'; }
    else if (text.startsWith('/coach'))  { taskKind = 'strategy'; systemExtra = 'Give me the most important next action to take right now.'; }
    else if (text.startsWith('/plan'))   { taskKind = 'strategy'; systemExtra = 'Build a step-by-step plan.'; }

    const system = `You are BOSS — ${norm.userName || 'Josh'}'s AI business operator on Telegram.
You are a sharp, direct voice. Money-focused. Short replies. This is a phone screen.

━━ WHAT YOU ARE ━━
You are a SINGLE AI TEXT ASSISTANT. That is ALL you are.
There is NO team. No colleagues. No Emily, David, Rachel, or Michael.
You CANNOT: implement features, run sprints, call meetings, scrape data, send messages, or access the internet.
You CAN: write pitches, strategies, DMs, proposals, plans — immediately, right here.

━━ ABSOLUTE BLOCKS ━━
✗ Do NOT roleplay as a company, CEO, team lead, or project manager
✗ Do NOT invent lead names, company names, or fake stats
✗ Do NOT say "I'll implement", "beginning now", or "estimated X weeks"
✗ Do NOT pretend to connect to external systems

━━ PLATFORM COMMANDS (tell Josh to run these) ━━
• /scan [niche] → lead scraper
• /pitch [target] → full outreach pack
• /auto → workflow guide
• localhost:4000 → full operator

${systemExtra ? 'Task: ' + systemExtra + '\n' : ''}Goal: ${state.current_goal || 'First paying client'}
Reply in max 5 short lines. End with ONE clear next action.`;

    const history = bossSwarm.recentMessages(chanId, norm.chatId, 8);
    const msgs = [...history, { role: 'user', content: text }];

    const r = await bossRouter.route({ taskKind, system, messages: msgs, maxTokens: 400 });
    const reply = r.ok ? r.text : `⚡ All AI providers offline. Add a Groq key at console.groq.com`;

    bossSwarm.pushMessage(chanId, norm.chatId, 'assistant', reply);
    if (ch.configured()) await ch.send({ to: norm.chatId, text: reply });
  } catch (e) {
    console.error('[bossHandleInbound]', e.message);
  }
}

// ── Image generation (HuggingFace free inference) ────────────────────────────
async function generateImage(prompt, hfToken) {
  const model = 'black-forest-labs/FLUX.1-schnell';
  const headers = { 'Content-Type': 'application/json' };
  if (hfToken) headers['Authorization'] = `Bearer ${hfToken}`;
  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs: prompt, parameters: { num_inference_steps: 4 } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HF error ${res.status}: ${err.slice(0, 200)}`);
  }
  // Returns raw image bytes
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

// Freeform Claude call — returns raw markdown text (for B.O.S.S Jarvis chat)
function callClaudeFreeform(apiKey, system, messages, maxTokens) {
  return new Promise((resolve) => {
    const https = require('https');
    const payload = JSON.stringify({
      model:      'claude-3-5-haiku-20241022',
      max_tokens: maxTokens,
      system,
      messages,
    });
    const options = {
      hostname: 'api.anthropic.com',
      path:     '/v1/messages',
      method:   'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length':    Buffer.byteLength(payload),
      },
    };
    const apiReq = https.request(options, apiRes => {
      let d = '';
      apiRes.on('data', c => d += c);
      apiRes.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.error) { resolve({ ok: false, error: r.error.message }); return; }
          resolve({ ok: true, reply: r.content?.[0]?.text || '' });
        } catch (e) { resolve({ ok: false, error: e.message }); }
      });
    });
    apiReq.on('error', e => resolve({ ok: false, error: e.message }));
    apiReq.write(payload);
    apiReq.end();
  });
}

// Read/write B.O.S.S memory palace (data/boss-state.json)
function bossReadState() {
  const raw = readJSON('boss-state.json');
  return Object.keys(raw).length ? raw : {
    current_goal: 'Turn this operator into a full personal AI business system.',
    created_at: new Date().toISOString(),
  };
}
function bossWriteState(patch) {
  const next = { ...bossReadState(), ...patch, updated_at: new Date().toISOString() };
  writeJSON('boss-state.json', next);
  return next;
}

function callClaude(apiKey, prompt, maxTokens, res) {
  const https   = require('https');
  const payload = JSON.stringify({
    model:      'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    messages:   [{ role: 'user', content: prompt }]
  });
  const options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
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
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) {
          res.end(JSON.stringify({ ok: true, ...JSON.parse(match[0]) }));
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

// ── BOSS Hallucination Sanitizer ──────────────────────────────────────────
// Hard filter on EVERY BOSS reply before it hits the browser.
// Catches two failure modes:
//   1. Fake lead lists (names, titles, companies that don't exist)
//   2. Fake company roleplay (team meetings, staff assignments, sprints, implementation timelines)
// Groq/Llama will always try to roleplay — this is the permanent safety net.
function sanitizeBossReply(text) {
  if (!text) return text;

  // ── Mode 1: Fake lead list ──────────────────────────────────────────────
  const FAKE_LEAD_TRIGGERS = [
    /i.{0,5}(will|'ll) initiate a lead.{0,40}sequence/i,
    /leads? generated:/i,
    /targeting potential clients in the \[/i,
    /i.{0,5}(will|'ll) scrape.{0,30}databases/i,
    /scraping.{0,30}databases.{0,50}social media/i,
    /current lead list:/i,
    /lead profiles include:/i,
    /would you like me to prioritize them/i,
    /reviewing the list.{0,30}notice.{0,30}promising prospect/i,
  ];
  // Bullet list of "Name Surname, Title at Company" — 2+ lines = fake lead list
  const fakeNameLines = (text.match(/^[-•*]\s+[A-Z][a-z]+ [A-Z][a-z]+,\s+\w/mg) || []).length;
  if (FAKE_LEAD_TRIGGERS.some(p => p.test(text)) || fakeNameLines >= 2) {
    return `I can't generate lead lists — invented names are useless.

Use the **Lead Scraper** (sidebar → Lead Feed). It pulls REAL posts from real people with real pain.

Tell me your niche and I'll give you the exact search terms to paste in.`;
  }

  // ── Mode 2: Fake company / team roleplay ──────────────────────────────
  const FAKE_ROLEPLAY_TRIGGERS = [
    /will begin implementation immediately/i,
    /estimated development time/i,
    /notify the development team/i,
    /(alright|okay|right)\s+(guys|team|everyone)/i,
    /let('s| us) (break down|assign|divide) (the )?(tasks?|work|responsibilities)/i,
    /bi-?weekly (meeting|check-?in|review|sync)/i,
    /who('s| is) got any questions/i,
    /assemble for briefing/i,
    /called a (team |)meeting/i,
    /assign(ing|ed)?\s+(some\s+)?(ownership|tasks?)/i,
    /(sprint|milestone|roadmap|epic|ticket)\s+(plan|planning|review)/i,
    /development team.{0,30}assembl/i,
  ];

  if (FAKE_ROLEPLAY_TRIGGERS.some(p => p.test(text))) {
    return `There's no development team. It's just you and me — I'm a text AI, not a company.

I can't "begin implementation", assign tickets to Emily, or call a team meeting. None of that is real.

Here's what IS real and what I can actually do:
• Write you the DM to send right now — just give me the lead
• Generate the full pitch/proposal copy — ready to send
• Break down the next 3 steps you should take today
• Tell you exactly which module/button to use for any task

What do you actually need done right now?`;
  }

  return text;
}

const ROUTES = {
  'GET /api/feed': async (req, res) => {
    const qs  = req.url.includes('?') ? req.url.split('?')[1] : '';
    const kw  = decodeURIComponent((qs.match(/q=([^&]*)/) || [])[1] || 'need clients');
    const sessionId = decodeURIComponent((qs.match(/sessionId=([^&]*)/) || [])[1] || '');
    const scanId = decodeURIComponent((qs.match(/scanId=([^&]*)/) || [])[1] || createId('scan'));
    const H   = { 'User-Agent': 'TheSaaSsin-Operator/1.0 (lead discovery)' };
    const emit = (type, payload = {}) => broadcastFeedEvent(
      { type, scanId, sessionId, keyword: kw, ...payload },
      client => !sessionId || client.sessionId === sessionId
    );

    emit('feed.scan.started', { startedAt: Date.now() });

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
        const sites = (cfg.serperSearchSites || DEFAULT_SERPER_SITES).split(/\s+/).filter(Boolean);
        const serperKey = cfg.serperApiKey;

        const serperResults = await Promise.all(sites.map(async site => {
          try {
            const queryResults = await Promise.all(buildSerperQueries(site, kw).map(async (query, qIndex) => {
              try {
                const res  = await fetch('https://google.serper.dev/search', {
                  method: 'POST',
                  headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ q: query, num: 8, tbs: 'qdr:m' })
                });
                const data = await res.json();
                return (data.organic || []).map((item, i) => {
                  const link = item.link || '';
                  const domain = (item.displayLink || link || '').replace(/^www\./, '').toLowerCase();
                  const text = `${item.title || ''} ${item.snippet || ''}`;
                  const noWebsiteSignal = hasPresenceGapSignal(text);
                  return {
                    id:        `sr_${site.replace(/\W/g,'')}_${qIndex}_${i}_${Buffer.from(link || `${site}_${i}`).toString('base64').replace(/[+/=]/g, '').slice(0, 18)}`,
                    title:     item.title || '',
                    text:      (item.snippet || '').substring(0, 500),
                    author:    domain,
                    subreddit: '',
                    url:       link,
                    permalink: link,
                    created:   Date.now() / 1000,
                    score:     noWebsiteSignal ? 42 : (DIRECTORY_SITE_HINTS.includes(site) ? 28 : 0),
                    platform:  inferWebPlatform(domain),
                    comments:  [],
                    sourceQuery: query,
                    noWebsiteSignal,
                    directoryHit: DIRECTORY_SITE_HINTS.includes(site)
                  };
                });
              } catch { return []; }
            }));
            return queryResults.flat();
          } catch { return []; }
        }));

        const seenWeb = new Set();
        serperResults.flat().forEach(p => {
          const key = p.url || `${p.platform}|${p.title}|${p.author}`;
          if (seenWeb.has(key)) return;
          seenWeb.add(key);
          posts.push(p);
        });
      }

      const enrichedPosts = posts.map(post => ({
        ...post,
        metadata: buildLeadMetadata(post, kw)
      }));

      enrichedPosts.forEach((post, index) => {
        emit('feed.scan.lead', { lead: post, index });
      });

      const enrichmentJobs = enrichedPosts.map(async post => {
        const result = await enrichLead(post, cfg, (enrichment, mergedMetadata) => {
          post.metadata = mergedMetadata;
          if (post.metadata && post.metadata.ranking) {
            const intentScore = (post.metadata.enrichment && post.metadata.enrichment.intent && post.metadata.enrichment.intent[0] && post.metadata.enrichment.intent[0].intentScore) || 0;
            post.metadata.ranking.tier = assignLeadTier(
              post.metadata.ranking.overall,
              intentScore,
              post.metadata.ranking.confidence,
              cfg
            );
          }
          emit('feed.lead.enriched', {
            leadId: post.id,
            metadata: mergedMetadata,
            enrichment: {
              status: enrichment.status,
              entity: enrichment.entity,
              providers: enrichment.results.map(item => ({
                type: item.type,
                provider: item.provider,
                status: item.status
              }))
            }
          });
        });
        if (result && result.metadata) {
          post.metadata = result.metadata;
          if (post.metadata.ranking) {
            const intentScore = (post.metadata.enrichment && post.metadata.enrichment.intent && post.metadata.enrichment.intent[0] && post.metadata.enrichment.intent[0].intentScore) || 0;
            post.metadata.ranking.tier = assignLeadTier(
              post.metadata.ranking.overall,
              intentScore,
              post.metadata.ranking.confidence,
              cfg
            );
          }
        }
      });

      await Promise.allSettled(enrichmentJobs);

      emit('feed.scan.completed', {
        total: enrichedPosts.length,
        xConfigured: !!cfg.xBearerToken,
        googleConfigured: !!cfg.serperApiKey
      });

      res.end(JSON.stringify({
        ok: true, posts: enrichedPosts, keyword: kw, scanId, sessionId,
        xConfigured:      !!cfg.xBearerToken,
        googleConfigured: !!cfg.serperApiKey
      }));
    } catch (e) {
      emit('feed.scan.error', { error: e.message });
      res.end(JSON.stringify({ ok: false, posts: [], error: e.message, scanId, sessionId }));
    }
  },

  'GET /api/enrichment/status': (_, res) => {
    const cfg = readJSON('config.json');
    const enrichment = cfg.enrichment || {};
    const buildGroup = (groupKey) => {
      const group = enrichment[groupKey] || {};
      const providers = Array.isArray(group.providers) ? group.providers : [];
      return {
        enabled: group.enabled !== false,
        providers: providers.map(p => ({
          id: p.id,
          enabled: !!p.enabled,
          hasKey: !!p.apiKey,
          hasAdapter: hasProviderAdapter(groupKey, p.id),
          status: !p.enabled ? 'disabled'
                : !p.apiKey ? 'missing_key'
                : hasProviderAdapter(groupKey, p.id) ? 'live_ready' : 'synthesized_only'
        }))
      };
    };
    res.end(JSON.stringify({
      ok: true,
      enabled: enrichment.enabled !== false,
      requestTimeoutMs: enrichment.requestTimeoutMs || 3500,
      maxProvidersPerLead: enrichment.maxProvidersPerLead || 0,
      firmographics: buildGroup('firmographics'),
      intent: buildGroup('intent')
    }));
  },

  'POST /api/enrichment/providers': async (req, res) => {
    const data = await body(req);
    const cfg = readJSON('config.json');
    cfg.enrichment = cfg.enrichment || {};
    const allowedGroups = ['firmographics', 'intent'];
    const updates = Array.isArray(data.updates) ? data.updates : [];

    let changed = 0;
    for (const u of updates) {
      if (!u || !allowedGroups.includes(u.group) || !u.id) continue;
      const group = cfg.enrichment[u.group] = cfg.enrichment[u.group] || { enabled: true, providers: [] };
      group.providers = Array.isArray(group.providers) ? group.providers : [];
      let prov = group.providers.find(p => p.id === u.id);
      if (!prov) {
        prov = { id: u.id, enabled: false, apiKey: '' };
        group.providers.push(prov);
      }
      if (typeof u.enabled === 'boolean') prov.enabled = u.enabled;
      if (typeof u.apiKey === 'string') prov.apiKey = u.apiKey.trim();
      if (typeof u.apiBase === 'string') prov.apiBase = u.apiBase.trim();
      changed++;
    }

    if (typeof data.enabled === 'boolean') cfg.enrichment.enabled = data.enabled;
    if (Number.isFinite(data.requestTimeoutMs)) cfg.enrichment.requestTimeoutMs = Math.max(500, Math.min(20000, data.requestTimeoutMs));

    if (data.groups && typeof data.groups === 'object') {
      for (const g of allowedGroups) {
        if (data.groups[g] && typeof data.groups[g].enabled === 'boolean') {
          cfg.enrichment[g] = cfg.enrichment[g] || { providers: [] };
          cfg.enrichment[g].enabled = data.groups[g].enabled;
        }
      }
    }

    writeJSON('config.json', cfg);
    res.end(JSON.stringify({ ok: true, changed }));
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
    const avoidDb = readJSON('avoid_leads.json');
    if (data.id && avoidDb.avoided && avoidDb.avoided.some(l => l.id === data.id)) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, error: 'lead is in avoid list' }));
      return;
    }
    data.id    = Date.now();
    data.createdAt = new Date().toISOString();
    data.status = data.status || 'new';
    data.score  = data.score  || 0;
    data.leadType = data.leadType || 'direct';
    data.painKey = data.painKey || 'growth_gap';
    data.painLabel = data.painLabel || '';
    data.painChallenge = data.painChallenge || '';
    data.demoFocus = data.demoFocus || '';
    data.platform = data.platform || '';
    data.subreddit = data.subreddit || '';
    data.postTitle = data.postTitle || '';
    data.niche     = data.niche || '';
    data.buyingStage = data.buyingStage || '';
    data.industry    = data.industry || '';
    data.intentScore = Number.isFinite(data.intentScore) ? data.intentScore : null;
    data.baseScore   = Number.isFinite(data.baseScore) ? data.baseScore : data.score;
    db.leads.push(data);
    writeJSON('leads.json', db);
    res.end(JSON.stringify({ ok: true, lead: data }));
  },

  'PATCH /api/leads': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('leads.json');
    let before = null, after = null;
    db.leads = db.leads.map(l => {
      if (l.id === data.id) {
        before = l;
        after = { ...l, ...data };
        return after;
      }
      return l;
    });
    writeJSON('leads.json', db);
    if (before && after && before.status !== after.status) {
      try { learnFromLeadOutcome(after, after.status); }
      catch (e) { console.error('predictive learn failed', e); }
    }
    res.end(JSON.stringify({ ok: true }));
  },

  'DELETE /api/leads': async (req, res) => {
    const data = await body(req);
    if (!data.id) { res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: 'id required' })); return; }
    const db   = readJSON('leads.json');
    const lead = db.leads.find(l => l.id === data.id);
    if (!lead) { res.statusCode = 404; res.end(JSON.stringify({ ok: false, error: 'lead not found' })); return; }
    db.leads = db.leads.filter(l => l.id !== data.id);
    writeJSON('leads.json', db);
    const avoidDb = readJSON('avoid_leads.json');
    avoidDb.avoided = avoidDb.avoided || [];
    avoidDb.avoided.push({ ...lead, removedAt: new Date().toISOString() });
    writeJSON('avoid_leads.json', avoidDb);
    res.end(JSON.stringify({ ok: true }));
  },

  'GET /api/predictive/weights': (_, res) => {
    const weights = readPredictiveWeights();
    const featureEntries = Object.entries(weights.features)
      .map(([key, f]) => {
        const rate = (f.closes + 1) / (f.closes + f.deads + 2);
        return { key, closes: f.closes, deads: f.deads, trials: f.trials, rate: Math.round(rate * 100), lastUpdated: f.lastUpdated };
      })
      .sort((a, b) => b.trials - a.trials);
    const baseline = (weights.totals.closes + 1) / (weights.totals.closes + weights.totals.deads + 2);
    res.end(JSON.stringify({
      ok: true,
      version: weights.version,
      updatedAt: weights.updatedAt,
      totals: weights.totals,
      baselineRate: Math.round(baseline * 100),
      features: featureEntries,
      recent: weights.recent.slice(0, 50)
    }));
  },

  'POST /api/predictive/reset': (_, res) => {
    writeJSON(PREDICTIVE_FILE, {
      version: 1,
      updatedAt: new Date().toISOString(),
      totals: { closes: 0, deads: 0 },
      features: {},
      recent: []
    });
    res.end(JSON.stringify({ ok: true }));
  },

  'POST /api/outreach': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('outreach_queue.json');
    data.id    = Date.now();
    data.status = 'pending';
    data.createdAt = new Date().toISOString();
    data.leadType = data.leadType || 'direct';
    data.painKey = data.painKey || 'growth_gap';
    data.painLabel = data.painLabel || '';
    data.painChallenge = data.painChallenge || '';
    db.queue.push(data);
    writeJSON('outreach_queue.json', db);
    res.end(JSON.stringify({ ok: true }));
  },

  'PATCH /api/outreach': async (req, res) => {
    const data = await body(req);
    const db   = readJSON('outreach_queue.json');
    const msg = db.queue.find(q => q.id === data.id);
    db.queue   = db.queue.map(q => q.id === data.id ? { ...q, status: data.status } : q);
    writeJSON('outreach_queue.json', db);
    if (msg && data.status === 'removed' && msg.leadId) {
      const leads = readJSON('leads.json');
      const lead = leads.leads.find(l => l.id === msg.leadId);
      if (lead) {
        leads.leads = leads.leads.filter(l => l.id !== msg.leadId);
        writeJSON('leads.json', leads);
        const avoidDb = readJSON('avoid_leads.json');
        avoidDb.avoided = avoidDb.avoided || [];
        avoidDb.avoided.push({ ...lead, removedAt: new Date().toISOString(), source: 'outreach_removed' });
        writeJSON('avoid_leads.json', avoidDb);
      }
    }
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
    if (!cfg.anthropicApiKey) { res.end(JSON.stringify({ ok: false, error: 'no_key' })); return; }
    const data = await body(req);
    if (!data.prompt) { res.end(JSON.stringify({ ok: false, error: 'no_prompt' })); return; }
    return callClaude(cfg.anthropicApiKey, data.prompt, 500, res);
  },

  'POST /api/ai/draft-message': async (req, res) => {
    const cfg  = readJSON('config.json');
    if (!cfg.anthropicApiKey) { res.end(JSON.stringify({ ok: false, error: 'no_key' })); return; }
    const data = await body(req);
    const meta = data.leadMeta || {};
    const firmo  = meta.enrichment && meta.enrichment.firmographics && meta.enrichment.firmographics[0];
    const intent = meta.enrichment && meta.enrichment.intent && meta.enrichment.intent[0];
    const opp    = meta.opportunity || {};
    const tone   = data.tone || 'direct';

    const prompt = `You are a sharp sales operator writing a first outreach DM. Write a single short message (under 50 words, no subject line, no greeting, no sign-off) based on the signal below. Tone: ${tone}.

Lead signal:
- Pain: ${opp.problem || 'unknown'}
- Root cause: ${opp.rootCause || ''}
- Angle: ${opp.positioning || ''}
- Niche: ${meta.profile && meta.profile.niche || 'unknown'}
- Company: ${firmo ? firmo.companyName || '' : data.author || 'unknown'}
- Industry: ${firmo ? firmo.industry || '' : ''}
- Intent stage: ${intent ? intent.buyingStage || '' : ''}
- Intent score: ${intent ? intent.intentScore || '' : ''}
- Likely need: ${intent ? intent.likelyNeed || '' : opp.demoFocus || ''}
- Original post snippet: ${data.postSnippet || ''}

Return ONLY a JSON object: { "dm": "the message", "rationale": "one sentence on why this angle" }`;

    return callClaude(cfg.anthropicApiKey, prompt, 300, res);
  },

  'POST /api/ai/rewrite-message': async (req, res) => {
    const cfg  = readJSON('config.json');
    if (!cfg.anthropicApiKey) { res.end(JSON.stringify({ ok: false, error: 'no_key' })); return; }
    const data = await body(req);
    if (!data.draft) { res.end(JSON.stringify({ ok: false, error: 'no_draft' })); return; }
    const presetInstructions = {
      shorter:      'Rewrite to be at most 25 words. Keep the core hook. Cut everything else.',
      warmer:       'Rewrite to be more human and empathetic. Sound like a person, not a tool.',
      stronger_cta: 'Rewrite with a clearer, more direct call to action at the end. One specific ask.',
      custom:       data.customPrompt || 'Improve the message.'
    };
    const instruction = presetInstructions[data.preset] || presetInstructions.custom;
    const prompt = `${instruction}\n\nOriginal message:\n"${data.draft}"\n\nReturn ONLY a JSON object: { "dm": "rewritten message" }`;
    return callClaude(cfg.anthropicApiKey, prompt, 200, res);
  },

  // ═══════════════════════════════════════════════════════════
  // B.O.S.S — Jarvis-tier AI backbone
  // ═══════════════════════════════════════════════════════════

  // ── BOSS Hallucination Filter ─────────────────────────────────────────────
  // Catches fake lead lists / fake scan results before they reach the UI.
  // Groq/Llama ignores honesty rules — this is the safety net.
  // ─────────────────────────────────────────────────────────────────────────

  // Memory palace
  'GET /api/boss/state': (_, res) => {
    res.end(JSON.stringify({ ok: true, state: bossReadState() }));
  },
  'POST /api/boss/state': async (req, res) => {
    const patch = await body(req);
    res.end(JSON.stringify({ ok: true, state: bossWriteState(patch || {}) }));
  },

  // Jarvis chat — hybrid router (local → groq → claude based on task complexity)
  'POST /api/boss/chat': async (req, res) => {
    const cfg  = readJSON('config.json');
    const data = await body(req);
    const state    = bossReadState();
    const messages = Array.isArray(data.messages) ? data.messages.slice(-12) : [];
    const userName = data.userName || cfg.personaName || 'Josh';
    const message  = data.message || (messages[messages.length - 1]?.content) || '';
    const system   = `You are BOSS — a sharp AI assistant inside ${userName}'s B.O.S.S platform. You are a direct, money-focused voice. No fluff.

━━ WHAT YOU ARE (READ FIRST, EVERY TIME) ━━
You are a SINGLE AI TEXT ASSISTANT. That is all you are.
There is NO team. No colleagues. No staff. No Emily, no David, no Rachel, no Michael.
You CANNOT: implement features, run sprints, call meetings, assign tasks to anyone, scrape data, send messages, access the internet, or do anything outside this chat window.
You CAN: write copy, generate strategies, give specific next steps, write DMs/pitches/proposals in full, explain what ${userName} should do and where to click.

━━ FACT-CHECKING RULES ━━
Only state things you know are true in this conversation or in the platform state below.
If you are uncertain about a number, a timeline, or a capability — say so. "I don't know" is better than a made-up answer.
NEVER invent: lead names, company names, email addresses, timelines, team members, platform features that don't exist, or results you haven't seen.
If ${userName} asks something factual you don't know: "I don't have that data. Here's how to find out: [specific step]"

━━ WHAT THE PLATFORM ACTUALLY DOES (real features only) ━━
• Lead Feed (sidebar) → scrapes REAL Reddit/forum posts for real pain signals
• /pitch [target] → write full outreach pack here in this chat
• Brand Assets → generate brand identity (voice, colours, taglines)
• Cold Outreach module → write personalised DMs per lead
• Social Posts module → write captions, generate images, post to socials
• Outreach Queue → approve and track messages before sending
• CRM → track leads: new → contacted → qualified → closed
• Proposal Builder → create real proposals for real clients

━━ ABSOLUTE BLOCKS — NEVER DO THESE ━━
✗ Generate lists of names/contacts/companies — fake leads are useless and dishonest
✗ Say "I'll implement", "beginning implementation", "estimated X weeks" — you can't implement anything
✗ Invent a development team or call a meeting — there is no team
✗ Claim to run a scan, send a message, or access external data — you can't
✗ Roleplay as a company, CEO, project manager, or team lead
✗ Make up facts, stats, or capabilities that aren't confirmed in this conversation

━━ CURRENT STATE (facts only) ━━
Leads in CRM: ${state.leads_count || 0}
Brand set: ${state.brand_set ? 'YES' : 'NO'}
Pitches sent: ${state.pitches_sent || 0}
Deals closed: ${state.deals_closed || 0}
Goal: ${state.current_goal || 'Get first paying client'}
Date: ${new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}

━━ HOW TO ACTUALLY HELP ━━
• Asked to find leads → give exact search terms for Lead Scraper, name the best subreddits
• Asked to write a pitch/DM → write the FULL text right here, ready to copy-paste
• Asked what to do → ONE specific action with exact steps and which button/panel to use
• Asked to implement something → explain what ${userName} needs to do himself, step by step

━━ STYLE ━━
Short. Direct. End every reply with ONE clear next action.
If you're uncertain about something — say it. Honesty builds more trust than confident fiction.`;

    // Inject all API keys from config.json into env for router to pick up
    if (cfg.anthropicApiKey) process.env.ANTHROPIC_API_KEY  = cfg.anthropicApiKey;
    if (cfg.groqApiKey)      process.env.GROQ_API_KEY       = cfg.groqApiKey;
    if (cfg.geminiApiKey)    process.env.GEMINI_API_KEY     = cfg.geminiApiKey;
    if (cfg.openaiApiKey)    process.env.OPENAI_API_KEY     = cfg.openaiApiKey;
    if (cfg.cerebrasApiKey)  process.env.CEREBRAS_API_KEY   = cfg.cerebrasApiKey;
    if (cfg.openrouterApiKey)process.env.OPENROUTER_API_KEY = cfg.openrouterApiKey;

    const r = await bossRouter.route({
      message,
      system,
      messages,
      taskKind:  'boss',   // forces Claude→Gemini→GPT chain, never Groq-first
      maxTokens: Math.min(Number(data.maxTokens) || 600, 1400),
    });
    if (r.ok) {
      // ── Hallucination filter: catch fake lead lists before they reach the UI ──
      const reply = sanitizeBossReply(r.text);
      res.end(JSON.stringify({ ok: true, reply, provider: r.provider, tier: r.tier, taskKind: r.taskKind }));
    } else {
      const userMsg = r.error === 'credits_exhausted'
        ? '💳 Anthropic credits exhausted. Get a FREE Groq key at console.groq.com → paste in API Keys → instant access.'
        : r.error === 'no_provider'
        ? '🔑 No AI provider active. Get a FREE Groq key at console.groq.com — takes 60 seconds, free forever.'
        : r.hint || r.error || 'All AI providers offline. Add a key in API Keys & Settings.';
      res.end(JSON.stringify({ ok: false, error: userMsg, hint: r.hint }));
    }
  },

  // Coach — proactive next-move
  // ── Token usage ──────────────────────────────────────────────────────────
  'GET /api/boss/token-usage': (_, res) => {
    res.end(JSON.stringify({ ok: true, ...bossMem.getTokenUsage() }));
  },
  'POST /api/boss/token-usage/reset': (_, res) => {
    bossMem.resetDailyTokens();
    res.end(JSON.stringify({ ok: true }));
  },

  // ── Memory ────────────────────────────────────────────────────────────────
  'GET /api/boss/memory': (_, res) => {
    res.end(JSON.stringify({ ok: true, memory: bossMem.read() }));
  },
  'POST /api/boss/memory/insight': async (req, res) => {
    const d = await body(req);
    bossMem.addInsight(d.topic || 'general', d.insight, d.confidence || 7);
    res.end(JSON.stringify({ ok: true }));
  },

  // ── Specialized agent chat ────────────────────────────────────────────────
  'POST /api/boss/agent': async (req, res) => {
    const data  = await body(req);
    const agentId = data.agent || 'copywriter';
    const agent   = AGENTS[agentId] || AGENTS.copywriter;
    const cfg     = readJSON('config.json');
    const state   = bossReadState();
    const mem     = bossMem.buildContext(600);

    if (cfg.anthropicApiKey)  process.env.ANTHROPIC_API_KEY  = cfg.anthropicApiKey;
    if (cfg.groqApiKey)       process.env.GROQ_API_KEY       = cfg.groqApiKey;
    if (cfg.geminiApiKey)     process.env.GEMINI_API_KEY     = cfg.geminiApiKey;
    if (cfg.openaiApiKey)     process.env.OPENAI_API_KEY     = cfg.openaiApiKey;
    if (cfg.cerebrasApiKey)   process.env.CEREBRAS_API_KEY   = cfg.cerebrasApiKey;
    if (cfg.openrouterApiKey) process.env.OPENROUTER_API_KEY = cfg.openrouterApiKey;
    if (cfg.glmApiKey)        process.env.GLM_API_KEY        = cfg.glmApiKey;

    // Check provider toggles
    const toggles = cfg.providerToggles || {};
    const agentModels = cfg.agentModels || {};
    const assignedModel = agentModels[agentId];

    const system = `You are the ${agent.label} agent inside the B.O.S.S operator.
Role: ${agent.role}
Owner: ${cfg.personaName || 'Josh'} — building TheSaaSsin customer acquisition business.
${mem ? '\nMemory context:\n' + mem : ''}
Goal: ${state.current_goal || 'First paying client'}
Date: ${new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}

HONESTY RULES: Never invent data. Never claim to perform real actions. Generate content only.
End every response with: ▶ NEXT: [one specific action]`;

    const messages = Array.isArray(data.messages) ? data.messages.slice(-10) : [];
    if (data.message) messages.push({ role: 'user', content: data.message });

    // Route with preferred model if assigned
    let routeOpts = { taskKind: agent.taskKind, system, messages, maxTokens: data.maxTokens || agent.maxTokens };
    if (assignedModel) {
      const [provider, ...modelParts] = assignedModel.split('/');
      routeOpts.preferProvider = provider;
      routeOpts.preferModel    = modelParts.join('/');
    }

    const r = await bossRouter.route(routeOpts);

    if (r.ok) {
      // Track tokens and memory
      bossMem.trackTokens(r.provider, Math.ceil((r.text || '').length / 4));
      if (agentId === 'scout' && data.message) bossMem.rememberMarket(data.message.slice(0, 80));
      res.end(JSON.stringify({ ok: true, reply: r.text, agent: agentId, provider: r.provider, tier: r.tier }));
    } else {
      res.end(JSON.stringify({ ok: false, error: r.hint || r.error }));
    }
  },

  // ── Overnight research — B.O.S.S analyses everything while user sleeps ────
  'POST /api/boss/research/overnight': async (req, res) => {
    const cfg   = readJSON('config.json');
    const state = bossReadState();
    if (cfg.groqApiKey) process.env.GROQ_API_KEY = cfg.groqApiKey;
    if (cfg.anthropicApiKey) process.env.ANTHROPIC_API_KEY = cfg.anthropicApiKey;
    if (cfg.glmApiKey) process.env.GLM_API_KEY = cfg.glmApiKey;

    res.end(JSON.stringify({ ok: true, message: 'Overnight research started. Check /api/boss/memory in the morning.' }));

    // Run async — don't block response
    (async () => {
      const topics = [
        {
          name: 'market_gaps',
          prompt: `You are a market research analyst for a UK-based solo operator building TheSaaSsin — a customer acquisition system for small businesses (coaches, consultants, freelancers, agencies) who struggle to get clients.

Identify the TOP 5 most underserved, high-pain markets RIGHT NOW (2025-2026) where a solo operator could charge £500-£3000/month.
For each: market name, pain level (1-10), avg monthly budget, best outreach channel, easiest first offer, key objection to overcome.
Be specific. Real niches, not vague categories.`,
        },
        {
          name: 'ai_tools_worth_integrating',
          prompt: `List the TOP 10 AI tools, APIs, or integrations that would most increase revenue for a customer acquisition operator serving small businesses.
Consider: free tiers, ease of integration, ROI for client results, current market hype vs real utility.
For each: tool name, what it does, free tier details, integration effort (1-5), revenue potential (1-10).`,
        },
        {
          name: 'pitch_angles_that_convert',
          prompt: `Based on 2025 buyer psychology for small business owners who are struggling to get clients:
What are the TOP 5 cold outreach angles that currently convert best?
For each: angle name, psychological trigger, example opening line, best platform to use it on, why it works now.
Focus on coaches, consultants, freelancers, service businesses.`,
        },
        {
          name: 'self_analysis',
          prompt: `You are analysing a B.O.S.S operator platform (AI-powered business OS for solo operators). Current features: Lead scraping, CRM, cold outreach generator, brand identity builder, social posting with image gen, Telegram integration, AI routing (Groq/GLM/Claude), 70 modules.

What are the 3 biggest gaps or improvements that would increase revenue generation capability?
What should be built next?
What's the single highest-leverage feature missing?`,
        },
      ];

      const briefParts = [`# B.O.S.S Overnight Research Brief\n${new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}\n`];

      for (const topic of topics) {
        try {
          const r = await bossRouter.route({
            taskKind: 'analyse',
            system: 'You are a sharp business analyst. Be specific, actionable, money-focused. No fluff.',
            messages: [{ role: 'user', content: topic.prompt }],
            maxTokens: 800,
          });
          if (r.ok) {
            briefParts.push(`## ${topic.name.replace(/_/g, ' ').toUpperCase()}\n${r.text}\n`);
            bossMem.addInsight(topic.name, r.text.slice(0, 300), 8);
            bossMem.trackTokens(r.provider, Math.ceil(r.text.length / 4));
          }
        } catch (_) {}
        // Small delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Save the full brief to memory
      const brief = briefParts.join('\n---\n');
      const mem = bossMem.read();
      mem.overnight_brief = { content: brief, generated_at: new Date().toISOString() };
      bossMem.write(mem);

      // Try to notify via Telegram if configured
      const tg = bossChannels.get('telegram');
      if (tg && tg.configured()) {
        const summary = `📋 *Overnight Research Complete*\n\nI've analysed markets, tools, and pitch angles. Here's the top finding:\n\n${briefParts[1]?.slice(0, 500) || 'See full brief in operator.'}\n\n→ Open B.O.S.S → Coach → "What did you find overnight?"`;
        tg.broadcast(summary).catch(() => {});
      }
    })();
  },

  // ── Get overnight brief ───────────────────────────────────────────────────
  'GET /api/boss/research/brief': (_, res) => {
    const mem = bossMem.read();
    res.end(JSON.stringify({ ok: true, brief: mem.overnight_brief || null, insights: mem.insights.slice(0, 10) }));
  },

  // ── Image generation ──────────────────────────────────────────────────────
  'POST /api/image/generate': async (req, res) => {
    const data = await body(req);
    const prompt = (data.prompt || '').trim();
    if (!prompt) { res.end(JSON.stringify({ ok: false, error: 'prompt required' })); return; }
    const cfg = readJSON('config.json');
    const hfToken = cfg.hfToken || process.env.HF_TOKEN || '';
    try {
      const dataUrl = await generateImage(prompt, hfToken);
      res.end(JSON.stringify({ ok: true, image: dataUrl, prompt }));
    } catch (e) {
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  },

  // ── Social posting (multi-platform) ───────────────────────────────────────
  'POST /api/social/post': async (req, res) => {
    const data = await body(req);
    const { platforms = [], text = '', imageBase64 } = data;
    if (!text && !imageBase64) { res.end(JSON.stringify({ ok: false, error: 'text required' })); return; }
    const results = {};
    for (const pid of platforms) {
      const ch = bossChannels.get(pid);
      if (!ch) { results[pid] = { ok: false, error: 'channel not found' }; continue; }
      if (!ch.configured()) { results[pid] = { ok: false, error: 'not configured — add API key' }; continue; }
      try {
        results[pid] = await ch.send({ text });
      } catch (e) {
        results[pid] = { ok: false, error: e.message };
      }
    }
    res.end(JSON.stringify({ ok: true, results }));
  },

  'POST /api/boss/coach/tick': async (req, res) => {
    const cfg = readJSON('config.json');
    if (!cfg.anthropicApiKey) { res.end(JSON.stringify({ ok: false, error: 'no_key' })); return; }
    const state = bossReadState();
    const leads = readJSON('leads.json');
    const leadCount = (leads.leads || []).length;
    const prompt = `You are B.O.S.S, a sharp AI operator. The user has ${leadCount} leads in their CRM.
Current goal: "${state.current_goal || 'build momentum'}".
Give ONE punchy next-move suggestion. Return ONLY: { "headline": "short action (max 8 words)", "why": "1 sentence", "do_now": "specific micro-action", "vibe": "green|amber|red" }`;
    return callClaude(cfg.anthropicApiKey, prompt, 180, res);
  },
  'GET /api/boss/coach/latest': (_, res) => {
    const state = bossReadState();
    res.end(JSON.stringify({ ok: true, latest: state.coach_latest || null }));
  },

  // Pitch generator — full pitch document for a lead
  'POST /api/boss/pitch': async (req, res) => {
    const cfg  = readJSON('config.json');
    const data = await body(req);
    if (!cfg.anthropicApiKey) { res.end(JSON.stringify({ ok: false, error: 'no_key' })); return; }
    const persona = cfg.personaName || 'B.O.S.S';
    const offer   = cfg.offer || 'AI-powered lead generation system';
    const prompt  = `Write a sharp sales pitch document for this lead:

LEAD: ${JSON.stringify(data.lead || {})}
YOUR OFFER: ${offer}
YOUR NAME: ${persona}

Return JSON only:
{
  "subject": "email subject line (punchy, <10 words)",
  "hook": "opening line that speaks to their exact pain (1-2 sentences)",
  "problem": "their problem restated back (2-3 sentences)",
  "solution": "how your offer solves it specifically (3-4 sentences)",
  "proof": "one specific result/claim + social proof (2 sentences)",
  "cta": "clear single call to action (1 sentence)",
  "dm_short": "Reddit/Twitter DM version (<280 chars)",
  "email_full": "full email version (Subject + 5 short paragraphs)",
  "score": <lead score 1-100 based on intent signals>
}`;
    return callClaude(cfg.anthropicApiKey, prompt, 800, res);
  },

  // Channels — multi-platform surface
  'GET /api/channels': (_, res) => {
    res.end(JSON.stringify({ ok: true, channels: bossChannels.publicList() }));
  },
  'GET /api/channels/agents': (_, res) => {
    res.end(JSON.stringify({ ok: true, agents: bossSwarm.list() }));
  },

  // ── Telegram: verify token + auto-detect chat ID ───────────────────────
  'POST /api/telegram/verify': async (req, res) => {
    const d   = await body(req);
    const tok = d.token || readJSON('config.json').telegramBotToken || '';
    if (!tok) { res.end(JSON.stringify({ ok: false, error: 'No token supplied' })); return; }
    try {
      const r  = await fetch(`https://api.telegram.org/bot${tok}/getMe`);
      const me = await r.json();
      if (!me.ok) { res.end(JSON.stringify({ ok: false, error: me.description || 'Invalid token' })); return; }
      // Save valid token
      const cfg = readJSON('config.json');
      cfg.telegramBotToken = tok;
      writeJSON('config.json', cfg);
      process.env.TELEGRAM_BOT_TOKEN = tok;
      res.end(JSON.stringify({ ok: true, bot: me.result }));
    } catch(e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
  },

  // Returns the chat_id of whoever last messaged the bot (so user can find their ID)
  'GET /api/telegram/find-me': async (req, res) => {
    const tok = process.env.TELEGRAM_BOT_TOKEN || readJSON('config.json').telegramBotToken || '';
    if (!tok) { res.end(JSON.stringify({ ok: false, error: 'No bot token configured' })); return; }
    try {
      const r  = await fetch(`https://api.telegram.org/bot${tok}/getUpdates?limit=10&allowed_updates=["message"]`);
      const d  = await r.json();
      if (!d.ok || !d.result.length) {
        res.end(JSON.stringify({ ok: false, error: 'No messages received yet — send "/hi" to your bot in Telegram first, then try again.' }));
        return;
      }
      // Pick the most recent sender
      const latest = d.result[d.result.length - 1];
      const chat   = latest.message?.chat || {};
      const from   = latest.message?.from || {};
      const chatId = String(chat.id || '');
      const username = from.username ? '@' + from.username : (from.first_name || 'unknown');
      // Auto-save if not already set
      const cfg = readJSON('config.json');
      if (chatId && cfg.telegramChatIds !== chatId) {
        cfg.telegramChatIds = chatId;
        writeJSON('config.json', cfg);
        process.env.TELEGRAM_CHAT_IDS = chatId;
      }
      res.end(JSON.stringify({ ok: true, chatId, username, name: chat.first_name || from.first_name || username }));
    } catch(e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
  },

  // Send a test message to the configured chat
  'POST /api/telegram/test-send': async (req, res) => {
    const d   = await body(req);
    const cfg = readJSON('config.json');
    const tok = cfg.telegramBotToken || '';
    const chatId = d.chatId || cfg.telegramChatIds || '';
    if (!tok) { res.end(JSON.stringify({ ok: false, error: 'No bot token' })); return; }
    if (!chatId || chatId === '#ffffff') { res.end(JSON.stringify({ ok: false, error: 'No chat ID — use Find My ID first' })); return; }
    try {
      const r  = await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: d.text || '👋 B.O.S.S is live. You can now chat with me on Telegram.', parse_mode: 'Markdown' }),
      });
      const result = await r.json();
      res.end(JSON.stringify({ ok: result.ok, result }));
    } catch(e) { res.end(JSON.stringify({ ok: false, error: e.message })); }
  },

  'POST /api/predictive/signal': async (req, res) => {
    const data = await body(req);
    const outcome = data.outcome;
    const features = Array.isArray(data.features) ? data.features : [];
    const SIGNAL_WEIGHTS = {
      reply_sent:      { pos: 0.5, neg: 0 },
      auto_sent:       { pos: 0.3, neg: 0 },
      saved_from_feed: { pos: 0.2, neg: 0 },
      ignored:         { pos: 0,   neg: 0.5 },
      auto_cancelled:  { pos: 0,   neg: 0.2 }
    };
    const w = SIGNAL_WEIGHTS[outcome];
    if (!w || !features.length) { res.end(JSON.stringify({ ok: true, skipped: true })); return; }
    const weights = readPredictiveWeights();
    const now = new Date().toISOString();
    weights.totals.closes += w.pos;
    weights.totals.deads  += w.neg;
    for (const k of features) {
      const f = weights.features[k] = weights.features[k] || { closes: 0, deads: 0, trials: 0, lastUpdated: now };
      f.closes += w.pos;
      f.deads  += w.neg;
      f.trials += 1;
      f.lastUpdated = now;
    }
    weights.recent.unshift({ outcome, features, at: now });
    weights.recent = weights.recent.slice(0, PREDICTIVE_MAX_RECENT);
    weights.updatedAt = now;
    writeJSON(PREDICTIVE_FILE, weights);
    res.end(JSON.stringify({ ok: true }));
  }
};

const server = http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url.split('?')[0]}`;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (ROUTES[key]) return ROUTES[key](req, res);

  // ── Channel prefix routes: /api/channels/<id>/{send|spawn|webhook} ──────
  if (req.url.startsWith('/api/channels/')) {
    const parts  = req.url.split('?')[0].split('/');
    const chanId = parts[3];
    const action = parts[4];
    const ch     = bossChannels.get(chanId);
    if (req.method === 'POST' && action === 'send') {
      if (!ch) { res.end(JSON.stringify({ ok: false, error: `unknown channel: ${chanId}` })); return; }
      const d = await body(req);
      if (!ch.configured()) { res.end(JSON.stringify({ ok: false, error: `${chanId} not configured — add env key` })); return; }
      return res.end(JSON.stringify(await ch.send(d)));
    }
    if (req.method === 'POST' && action === 'spawn') {
      const d = await body(req);
      return res.end(JSON.stringify({ ok: true, agent: bossSwarm.spawn(chanId, d) }));
    }
    if (req.method === 'POST' && action === 'webhook') {
      const payload = await body(req);
      const norm = ch ? ch.ingest(payload) : null;
      if (!norm) { res.end(JSON.stringify({ ok: true })); return; }
      res.end(JSON.stringify({ ok: true })); // respond immediately (Telegram needs <5s)
      bossSwarm.pushMessage(chanId, norm.chatId, 'user', norm.text);
      bossHandleInbound(ch, chanId, norm).catch(() => {});
      return;
    }
  }

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
});

// ─────────────────────────────────────────────────────────────────────────────
// B.O.S.S  LOCAL MODEL MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

ROUTES['GET /api/local/status'] = async (_, res) => {
  const status = await bossRouter.routerStatus();
  res.end(JSON.stringify({ ok: true, ...status }));
};

ROUTES['GET /api/local/models'] = async (_, res) => {
  try {
    const r    = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    const data = await r.json();
    res.end(JSON.stringify({ ok: true, models: data.models || [] }));
  } catch (_) {
    res.end(JSON.stringify({ ok: false, models: [], error: 'Ollama not running' }));
  }
};

ROUTES['POST /api/local/pull'] = async (req, res) => {
  const data  = await body(req);
  const model = data.model || 'qwen2.5:7b';
  // Fire-and-forget — stream progress via a basic SSE or just kick off
  const { spawn } = require('child_process');
  const proc = spawn('ollama', ['pull', model], { detached: true, stdio: 'ignore' });
  proc.unref();
  res.end(JSON.stringify({ ok: true, message: `Pulling ${model} in background. Check /api/local/models in ~30s.` }));
};

ROUTES['POST /api/local/chat'] = async (req, res) => {
  const data = await body(req);
  const model = data.model || 'qwen2.5:7b';
  const msgs  = Array.isArray(data.messages) ? data.messages : [{ role: 'user', content: data.message || '' }];
  try {
    const r = await fetch('http://localhost:11434/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ model, messages: msgs, stream: false }),
      signal:  AbortSignal.timeout(60000),
    });
    const result = await r.json();
    res.end(JSON.stringify({ ok: true, reply: result.message?.content || '', model }));
  } catch (e) {
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// B.O.S.S  ROUTER STATUS
// ─────────────────────────────────────────────────────────────────────────────

ROUTES['GET /api/boss/router'] = async (req, res) => {
  const cfg    = readJSON('config.json');
  if (cfg.anthropicApiKey) process.env.ANTHROPIC_API_KEY = cfg.anthropicApiKey;
  if (cfg.groqApiKey)      process.env.GROQ_API_KEY      = cfg.groqApiKey;
  const status = await bossRouter.routerStatus();
  status.anthropic = !!cfg.anthropicApiKey;
  status.groq      = !!cfg.groqApiKey;
  res.end(JSON.stringify({ ok: true, ...status }));
};

ROUTES['POST /api/boss/ai/prefs'] = (req, res) => {
  const cfg = readJSON('config.json');
  const body = req.body || {};

  // Update disabled/pinned providers if provided
  if (Array.isArray(body.disabledProviders)) {
    cfg.disabledProviders = body.disabledProviders;
  }
  if (body.pinnedProvider !== undefined) {
    cfg.pinnedProvider = body.pinnedProvider || null;
  }

  writeJSON('config.json', cfg);
  res.end(JSON.stringify({ ok: true, disabledProviders: cfg.disabledProviders, pinnedProvider: cfg.pinnedProvider }));
};

// ─────────────────────────────────────────────────────────────────────────────

// ======================================================
// VECTOR STORE API
// ======================================================

ROUTES['GET /api/vector/stats'] = (_, res) => {
  res.end(JSON.stringify({ ok: true, ...bossVector.stats() }));
};

ROUTES['GET /api/vector/list'] = (req, res) => {
  const url = new URL(req.url, 'http://x');
  const ns  = url.searchParams.get('ns') || null;
  const docs = bossVector.list(ns);
  res.end(JSON.stringify({ ok: true, count: docs.length, docs }));
};

ROUTES['POST /api/vector/upsert'] = async (req, res) => {
  const { id, content, metadata, ns } = req.body || {};
  if (!id || !content) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'id and content required' })); }
  try {
    const r = await bossVector.upsert(id, content, metadata || {}, ns || 'default');
    res.end(JSON.stringify({ ok: true, ...r }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};

ROUTES['POST /api/vector/search'] = async (req, res) => {
  const { query, topK, ns, threshold } = req.body || {};
  if (!query) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'query required' })); }
  try {
    const results = await bossVector.search(query, { topK: topK || 5, ns: ns || null, threshold: threshold || 0.3 });
    res.end(JSON.stringify({ ok: true, count: results.length, results }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: e.message }));
  }
};

ROUTES['DELETE /api/vector/doc'] = (req, res) => {
  const { id } = req.body || {};
  if (!id) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'id required' })); }
  res.end(JSON.stringify(bossVector.remove(id)));
};

ROUTES['DELETE /api/vector/ns'] = (req, res) => {
  const { ns } = req.body || {};
  if (!ns) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'ns required' })); }
  res.end(JSON.stringify(bossVector.clearNs(ns)));
};

// ─────────────────────────────────────────────────────────────────────────────

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ======================================================
// KNOWLEDGE GRAPH API
// ======================================================
function loadGraph() {
  try {
    const fs = require('fs');
    const p  = require('path').join(__dirname, 'data', 'knowledge-graph.json');
    if (!fs.existsSync(p)) return { nodes: [], edges: [] };
    // Strip UTF-8 BOM if present (PowerShell writes it)
    let raw = fs.readFileSync(p, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw);
  } catch (e) { console.error('[graph] load error:', e.message); return { nodes: [], edges: [] }; }
}
function saveGraph(g) {
  const fs = require('fs');
  const p  = require('path').join(__dirname, 'data', 'knowledge-graph.json');
  try { fs.mkdirSync(require('path').dirname(p), { recursive: true }); } catch (_) {}
  fs.writeFileSync(p, JSON.stringify(g, null, 2), 'utf8');
}
function graphAddNode(id, type, label, data) {
  const g = loadGraph();
  const ex = g.nodes.find(n => n.id === id);
  if (ex) { Object.assign(ex.data || {}, data); ex.label = label; }
  else g.nodes.push({ id, type, label, data: data || {}, created: new Date().toISOString() });
  saveGraph(g);
}
function graphAddEdge(source, target, type, weight) {
  const g = loadGraph();
  const eid = 'e_' + source + '_' + target + '_' + (type || 'related_to');
  if (!g.edges.find(e => e.id === eid)) {
    g.edges.push({ id: eid, source, target, type: type || 'related_to', weight: weight || 0.6, created: new Date().toISOString() });
    saveGraph(g);
  }
}
ROUTES['GET /api/graph'] = (_, res) => {
  const g = loadGraph();
  res.end(JSON.stringify({ ok: true, nodes: g.nodes || [], edges: g.edges || [], meta: g.meta || {} }));
};
ROUTES['POST /api/graph/node'] = (req, res) => {
  const { id, type, label, data } = req.body || {};
  if (!id || !type || !label) return res.end(JSON.stringify({ ok: false, error: 'id type label required' }));
  const g = loadGraph();
  const ex = g.nodes.find(n => n.id === id);
  if (ex) { ex.label = label; ex.type = type; ex.data = Object.assign(ex.data || {}, data); ex.updated = new Date().toISOString(); }
  else g.nodes.push({ id, type, label, data: data || {}, created: new Date().toISOString() });
  saveGraph(g);
  res.end(JSON.stringify({ ok: true }));
};
ROUTES['POST /api/graph/edge'] = (req, res) => {
  const { source, target, type, weight } = req.body || {};
  if (!source || !target) return res.end(JSON.stringify({ ok: false, error: 'source and target required' }));
  const g = loadGraph(); const eid = 'e_' + source + '_' + target + '_' + (type || 'rel');
  if (!g.edges.find(e => e.id === eid)) g.edges.push({ id: eid, source, target, type: type || 'related_to', weight: weight || 0.6, created: new Date().toISOString() });
  saveGraph(g);
  res.end(JSON.stringify({ ok: true }));
};
ROUTES['DELETE /api/graph/node'] = (req, res) => {
  const nodeId = (req.body || {}).id;
  if (!nodeId) return res.end(JSON.stringify({ ok: false, error: 'id required' }));
  const g = loadGraph();
  g.nodes = g.nodes.filter(n => n.id !== nodeId);
  g.edges = g.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
  saveGraph(g);
  res.end(JSON.stringify({ ok: true }));
};
ROUTES['POST /api/graph/seed'] = (req, res) => {
  const g = loadGraph();
  const leads = readJSON('leads.json') || [];
  let added = 0;
  leads.slice(0, 50).forEach(lead => {
    const lid = 'lead_' + (lead.id || (lead.author || '').replace(/\W/g,'_') || Math.random().toString(36).slice(2));
    if (!g.nodes.find(n => n.id === lid)) {
      g.nodes.push({ id: lid, type: 'lead', label: lead.author || lead.name || 'Lead', data: { score: lead.score || 0, source: lead.source || '' }, created: lead.timestamp || new Date().toISOString() });
      g.edges.push({ id: 'e_' + lid + '_tag', source: lid, target: 'tag_saas', type: 'tagged_with', weight: 0.5 });
      added++;
    }
  });
  saveGraph(g);
  res.end(JSON.stringify({ ok: true, added, total: g.nodes.length }));
};
// B.O.S.S ORCHESTRATOR - Multi-agent goal execution
// POST /api/boss/orchestrate  { goal, context? }
// GET  /api/boss/agents       list agents
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const AGENT_ROSTER = {
  boss:       { taskKind: "strategy", tier: "cloud", desc: "Master director" },
  planner:    { taskKind: "plan",     tier: "groq",  desc: "Breaks goals into tasks" },
  builder:    { taskKind: "build",    tier: "cloud", desc: "Writes production code" },
  analyst:    { taskKind: "analyse",  tier: "groq",  desc: "Reviews metrics" },
  growth:     { taskKind: "pitch",    tier: "cloud", desc: "Client acquisition" },
  creative:   { taskKind: "build",    tier: "cloud", desc: "Video and brand" },
  scout:      { taskKind: "research", tier: "groq",  desc: "Market intelligence" },
  copywriter: { taskKind: "pitch",    tier: "cloud", desc: "Copy that converts" },
  guardian:   { taskKind: "classify", tier: "groq",  desc: "Sanity checks output" },
};

const AGENT_SYSTEMS = {
  boss:       "You are B.O.S.S, Josh director for TheSaaSsin Operator. British spelling. Calm, direct, one step ahead. End every response with NEXT MOVE.",
  planner:    "You are the Planner for B.O.S.S. Josh runs TheSaaSsin (AI client acquisition SaaS, solo, Node.js/Express stack). Break goals into numbered steps with [AGENT] prefixes. Under 200 words.",
  builder:    "You are the Builder for B.O.S.S. Write production Node.js/Express or vanilla JS. No TypeScript, no TODOs. Error handling on every async op.",
  analyst:    "You are the Analyst for B.O.S.S. Honest performance analysis. Numbers over words. Flag biggest risk. Highest-leverage change.",
  growth:     "You are the Growth agent for B.O.S.S. Josh targets B2B SaaS founders (1-20 staff, UK/EU). Specific acquisition tactics, not generic advice.",
  creative:   "You are the Creative agent for B.O.S.S. Josh uses Remotion v4 + Three.js + GLSL. Brand: #0a0a0f bg, #1de5ff cyan, #7f5af0 purple.",
  scout:      "You are the Scout for B.O.S.S. Surface market intelligence from Reddit/LinkedIn/IH/PH. Quote exact prospect language. Under 300 words.",
  copywriter: "You are the Copywriter for B.O.S.S. TheSaaSsin = AI client acquisition for SaaS founders. No fluff. Always 2 variants: A (bold) B (story).",
  guardian:   "You are the Guardian for B.O.S.S. Review all output. Output: PASS or FAIL + specific issues. Brief.",
};

ROUTES["POST /api/boss/orchestrate"] = async (req, res) => {
  const cfg = readJSON("config.json");
  if (cfg.anthropicApiKey) process.env.ANTHROPIC_API_KEY = cfg.anthropicApiKey;
  if (cfg.groqApiKey)      process.env.GROQ_API_KEY      = cfg.groqApiKey;
  const { goal, context = "" } = req.body || {};
  if (!goal) return res.end(JSON.stringify({ ok: false, error: "goal required" }));
  const steps = [];
  try {
    const dirMsg = "Goal: " + goal + (context ? "\nContext: " + context : "") +
      "\n\nBreak into 2-4 sub-tasks. For each specify:\nAGENT: [planner|builder|analyst|growth|creative|scout|copywriter]\nTASK: [specific instruction]\n\nReturn ONLY the task list.";
    const planResult = await bossRouter.route({
      taskKind: "strategy", system: AGENT_SYSTEMS.boss,
      messages: [{ role: "user", content: dirMsg }], maxTokens: 400,
    });
    if (!planResult.ok) throw new Error("Director failed: " + (planResult.error || "unknown"));
    steps.push({ agent: "boss", task: "Plan", output: planResult.text, provider: planResult.provider });
    const lines = planResult.text.split("\n");
    const agentTasks = [];
    for (let i = 0; i < lines.length; i++) {
      const am = lines[i].match(/^AGENT:\s*(\w+)/i);
      if (!am) continue;
      const agentId = am[1].toLowerCase();
      const nextTask = lines.slice(i + 1).find(l => l.match(/^TASK:/i));
      if (nextTask && AGENT_ROSTER[agentId]) {
        agentTasks.push({ agentId, task: nextTask.replace(/^TASK:\s*/i, "").trim() });
      }
    }
    if (agentTasks.length === 0) {
      agentTasks.push({ agentId: "growth", task: goal });
      agentTasks.push({ agentId: "copywriter", task: "Create copy for: " + goal });
    }
    let ctx = "Original goal: " + goal + "\n";
    for (const { agentId, task } of agentTasks) {
      const agent = AGENT_ROSTER[agentId];
      const system = AGENT_SYSTEMS[agentId] || AGENT_SYSTEMS.boss;
      const userMsg = ctx.length > 200 ? "Context:\n" + ctx.slice(-600) + "\n\nYour task: " + task : "Your task: " + task;
      const result = await bossRouter.route({ taskKind: agent.taskKind, system, messages: [{ role: "user", content: userMsg }], maxTokens: 600 });
      const output = result.ok ? result.text : "[" + agentId + " failed: " + result.error + "]";
      ctx += "\n[" + agentId.toUpperCase() + "]:\n" + output + "\n";
      steps.push({ agent: agentId, task, output, provider: result.provider || "unknown" });
    }
    const assembleResult = await bossRouter.route({
      taskKind: "strategy", system: AGENT_SYSTEMS.boss,
      messages: [{ role: "user", content: "Assemble agent outputs into a brief for Josh.\nGoal: " + goal + "\n\n" + ctx + "\n\nDeliver: key outputs, what is ready to use, and the NEXT MOVE." }],
      maxTokens: 800,
    });
    const finalOutput = assembleResult.ok ? assembleResult.text : ctx;
    steps.push({ agent: "boss", task: "Assemble", output: finalOutput, provider: assembleResult.provider || "unknown" });
    res.end(JSON.stringify({ ok: true, goal, steps, result: finalOutput, agentCount: agentTasks.length }));
  } catch (err) {
    res.end(JSON.stringify({ ok: false, error: err.message, steps }));
  }
};

ROUTES["GET /api/boss/agents"] = (_, res) => {
  res.end(JSON.stringify({ ok: true, agents: Object.entries(AGENT_ROSTER).map(([id, a]) => ({ id, ...a })) }));
};

// B.O.S.S  CREATIVE STUDIO — Anime Morph renderer
// ─────────────────────────────────────────────────────────────────────────────

const ANIME_MORPH_DIR = require('path').join(__dirname, 'creative', 'anime-morph');

ROUTES['GET /api/creative/status'] = (_, res) => {
  const fs   = require('fs');
  const path = require('path');
  const out  = path.join(ANIME_MORPH_DIR, 'out', 'AnimeMorph.mp4');
  const assets = path.join(ANIME_MORPH_DIR, 'public', 'assets');
  let assetList = [];
  try { assetList = fs.readdirSync(assets).filter(f => /\.(png|jpg|webp)$/i.test(f)); } catch (_) {}
  const mp4Exists  = fs.existsSync(out);
  const mp4Size    = mp4Exists ? fs.statSync(out).size : 0;
  res.end(JSON.stringify({
    ok: true,
    mp4: mp4Exists,
    mp4SizeMB: +(mp4Size / 1024 / 1024).toFixed(1),
    mp4Path: mp4Exists ? '/api/creative/download' : null,
    assets: assetList,
    assetsDir: assets,
    renderDir: ANIME_MORPH_DIR,
  }));
};

ROUTES['GET /api/creative/download'] = (_, res) => {
  const fs   = require('fs');
  const path = require('path');
  const out  = path.join(ANIME_MORPH_DIR, 'out', 'AnimeMorph.mp4');
  if (!fs.existsSync(out)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, {
    'Content-Type':        'video/mp4',
    'Content-Disposition': 'attachment; filename="AnimeMorph.mp4"',
    'Content-Length':      fs.statSync(out).size,
  });
  fs.createReadStream(out).pipe(res);
};

ROUTES['POST /api/creative/render'] = async (req, res) => {
  const { spawn } = require('child_process');
  const path      = require('path');
  const fs        = require('fs');

  // Mark render in progress
  bossWriteState({ render_status: 'running', render_started: new Date().toISOString() });

  const outDir = path.join(ANIME_MORPH_DIR, 'out');
  fs.mkdirSync(outDir, { recursive: true });

  // Spawn npm run render in anime-morph dir
  const proc = spawn('npm', ['run', 'render'], {
    cwd:   ANIME_MORPH_DIR,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let log = '';
  proc.stdout.on('data', d => { log += d.toString(); });
  proc.stderr.on('data', d => { log += d.toString(); });

  proc.on('close', code => {
    const ok = code === 0;
    bossWriteState({
      render_status:   ok ? 'done' : 'error',
      render_finished: new Date().toISOString(),
      render_log_tail: log.slice(-500),
    });
  });

  res.end(JSON.stringify({
    ok:      true,
    message: 'Render started in background (~2-5 min). Watch progress in Creative Studio.',
    pid:     proc.pid,
  }));
};

ROUTES['GET /api/creative/assets'] = (_, res) => {
  const fs   = require('fs');
  const path = require('path');
  const dir  = path.join(ANIME_MORPH_DIR, 'public', 'assets');
  try {
    const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|webp)$/i.test(f));
    res.end(JSON.stringify({ ok: true, assets: files }));
  } catch (_) { res.end(JSON.stringify({ ok: true, assets: [] })); }
};

// Serve individual asset images for the Creative Studio grid
function serveCreativeAsset(req, res) {
  const fs   = require('fs');
  const path = require('path');
  const file = decodeURIComponent(req.url.replace('/api/creative/asset/', ''));
  const full = path.join(ANIME_MORPH_DIR, 'public', 'assets', path.basename(file));
  if (!fs.existsSync(full)) { res.writeHead(404); res.end('Not found'); return; }
  const ext  = path.extname(full).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(full).pipe(res);
}

ROUTES['GET /api/creative/render-status'] = (_, res) => {
  const state = bossReadState();
  res.end(JSON.stringify({
    ok:      true,
    status:  state.render_status  || 'idle',
    started: state.render_started || null,
    finished:state.render_finished|| null,
    logTail: state.render_log_tail|| '',
  }));
};

server.on('upgrade', (req, socket) => {
  const pathname = (req.url || '').split('?')[0];
  if (pathname !== '/ws') {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }
  setupWebSocket(req, socket);
});

server.listen(PORT, () => {
  console.log(`Operator → http://localhost:${PORT}`);

  // ── Auto-start Telegram polling if token is set ───────────────────────────
  // No public URL needed — long-poll grabs messages every 25s
  const tg = bossChannels.get('telegram');
  const cfg0 = readJSON('config.json');
  if (cfg0.telegramBotToken)  process.env.TELEGRAM_BOT_TOKEN         = cfg0.telegramBotToken;
  if (cfg0.telegramChatIds)   process.env.TELEGRAM_ALLOWED_CHAT_IDS  = cfg0.telegramChatIds;
  if (cfg0.xBearerToken)      process.env.X_BEARER_TOKEN             = cfg0.xBearerToken;
  if (cfg0.linkedinToken)     process.env.LINKEDIN_TOKEN             = cfg0.linkedinToken;
  if (cfg0.igAccessToken)     process.env.IG_ACCESS_TOKEN            = cfg0.igAccessToken;

  if (tg && tg.configured()) {
    console.log('[Telegram] Starting polling…');
    tg.startPolling(async (norm) => {
      bossSwarm.pushMessage('telegram', norm.chatId, 'user', norm.text);
      await bossHandleInbound(tg, 'telegram', norm);
    }).catch(e => console.error('[Telegram] polling error:', e.message));
  } else {
    console.log('[Telegram] Not configured — add TELEGRAM_BOT_TOKEN in API Keys to enable.');
  }
});
