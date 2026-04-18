'use strict';
// Brand Engine — generates complete brand system from client data.
// Pure Node.js, zero external deps (uses tinycolor2 optionally but falls back
// to built-in HSL math). All output is serialisable JSON + SVG strings.

// ── Colour math ───────────────────────────────────────────
function hexToHsl(hex) {
  const h6 = hex.replace('#', '');
  let r = parseInt(h6.slice(0, 2), 16) / 255;
  let g = parseInt(h6.slice(2, 4), 16) / 255;
  let b = parseInt(h6.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue, sat, lig = (max + min) / 2;
  if (max === min) { hue = sat = 0; }
  else {
    const d = max - min;
    sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      default: hue = ((r - g) / d + 4) / 6;
    }
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lig * 100)];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function contrastRatio(hex1, hex2) {
  const lum = hex => {
    const rgb = [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
      .map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ── Niche → theme mapping ─────────────────────────────────
const NICHE_MAP = [
  { keys: ['plumb','pipe','drain','boil'],   primary:'#1a6fc4', secondary:'#ff7c1a', dark:true,  family:'trades'     },
  { keys: ['elect','wire','spark'],          primary:'#f5a623', secondary:'#1a1a2e', dark:true,  family:'trades'     },
  { keys: ['build','construct','roofer'],    primary:'#e74c3c', secondary:'#2c3e50', dark:true,  family:'trades'     },
  { keys: ['trade','handyman','joiner'],     primary:'#2c6fad', secondary:'#f47b20', dark:true,  family:'trades'     },
  { keys: ['clean','domes','maid'],          primary:'#00b894', secondary:'#2c3e50', dark:false, family:'wellness'   },
  { keys: ['fit','gym','pt','personal trai','yoga','pilat'], primary:'#e74c3c', secondary:'#1a1a2e', dark:true, family:'fitness'   },
  { keys: ['tech','saas','software','app','dev','code'],     primary:'#6c5ce7', secondary:'#00b894', dark:true, family:'tech'      },
  { keys: ['agency','studio','design','creative'],           primary:'#1a1a2e', secondary:'#ff2a2a', dark:true, family:'agency'    },
  { keys: ['consult','coach','strateg','advisor'],           primary:'#2c3e50', secondary:'#c0a060', dark:false,family:'consulting'},
  { keys: ['well','health','nutrit','thera'],                primary:'#27ae60', secondary:'#f39c12', dark:false,family:'wellness'  },
  { keys: ['food','cafe','restaurant','cater'],              primary:'#e67e22', secondary:'#2c3e50', dark:true, family:'food'      },
  { keys: ['beauty','salon','hair','nail','lash'],           primary:'#d4a0b0', secondary:'#1a1a2e', dark:false,family:'beauty'    },
];

function getNicheTheme(niche) {
  const n = (niche || '').toLowerCase();
  for (const t of NICHE_MAP) {
    if (t.keys.some(k => n.includes(k))) return t;
  }
  return { primary: '#ff2a2a', secondary: '#1a1a2e', dark: true, family: 'general' };
}

function generatePalette(primaryHex, niche) {
  const theme = getNicheTheme(niche);
  const seed  = primaryHex || theme.primary;
  const [h, s, l] = hexToHsl(seed);
  const isDark = theme.dark;

  const bg    = isDark ? '#08080f' : '#ffffff';
  const bg2   = isDark ? '#12121c' : '#f4f4fb';
  const fgCol = isDark ? '#f0f0f8' : '#1a1a2e';

  // Ensure readable contrast on primary
  const rawSecondary = theme.secondary || hslToHex((h + 180) % 360, Math.max(s - 10, 20), 35);
  const logoOnPrimary = contrastRatio(seed, '#ffffff') >= 3 ? '#ffffff' : '#1a1a2e';

  return {
    primary:    seed,
    secondary:  rawSecondary,
    accent:     seed,
    bg,
    bg2,
    card:       isDark ? '#13131e' : '#ffffff',
    text:       fgCol,
    muted:      isDark ? '#6b6b80' : '#8888a0',
    border:     isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',
    success:    '#00c48c',
    warn:       '#ffa940',
    logoOnPrimary,
    isDark,
    // Tint/shade of primary
    primaryLight: hslToHex(h, Math.max(s - 15, 10), Math.min(l + 35, 88)),
    primaryDark:  hslToHex(h, Math.min(s + 10, 100), Math.max(l - 25, 10)),
  };
}

// ── Typography pairs ──────────────────────────────────────
const FONT_PAIRS = {
  trades:     { heading: 'Barlow Condensed', body: 'Barlow',           weights: '400;600;700',   style: 'condensed' },
  fitness:    { heading: 'Bebas Neue',       body: 'Inter',            weights: '400',            style: 'bold'      },
  tech:       { heading: 'Space Grotesk',    body: 'Space Grotesk',    weights: '400;500;700',    style: 'mono'      },
  consulting: { heading: 'Playfair Display', body: 'Inter',            weights: '400;600;700',    style: 'serif'     },
  agency:     { heading: 'Space Grotesk',    body: 'Inter',            weights: '300;400;700',    style: 'display'   },
  wellness:   { heading: 'Cormorant Garamond',body: 'Nunito',          weights: '300;600',        style: 'soft'      },
  food:       { heading: 'Playfair Display', body: 'Nunito',           weights: '400;700',        style: 'warm'      },
  beauty:     { heading: 'Cormorant Garamond',body: 'Nunito',          weights: '300;400',        style: 'elegant'   },
  fitness:    { heading: 'Bebas Neue',       body: 'Inter',            weights: '400',            style: 'bold'      },
  general:    { heading: 'Inter',            body: 'Inter',            weights: '300;400;600;700', style: 'clean'    },
};

function getTypography(niche) {
  const theme = getNicheTheme(niche);
  return FONT_PAIRS[theme.family] || FONT_PAIRS.general;
}

// ── SVG Logo generators ───────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function generateLogos(name, palette, typography) {
  const c      = palette.primary;
  const fg     = palette.text;
  const onC    = palette.logoOnPrimary;
  const font   = typography.heading;
  const safe   = esc(name || 'Brand');
  const upper  = safe.toUpperCase();
  const init1  = (name || 'A').charAt(0).toUpperCase();
  const parts  = (name || '').trim().split(/\s+/);
  const init2  = parts.length > 1 ? parts[1].charAt(0).toUpperCase() : (name.charAt(1) || '').toUpperCase();
  const mono   = init2 ? init1 + init2 : init1;
  const monoSz = mono.length > 1 ? 26 : 34;
  const monoSzSm = mono.length > 1 ? 12 : 16;

  const gfUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.replace(' ', '+'))}:wght@${typography.weights}&display=swap`;

  // 1. Wordmark — Clean (lowercase, refined)
  const wordmarkClean = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <text x="12" y="44" font-family="${font}, Inter, sans-serif" font-size="34" font-weight="300" fill="${fg}" letter-spacing="-0.5">${safe.toLowerCase()}</text>
</svg>`;

  // 2. Wordmark — Bold (uppercase, heavy, spaced)
  const wordmarkBold = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <text x="12" y="46" font-family="${font}, Inter, sans-serif" font-size="38" font-weight="800" fill="${fg}" letter-spacing="3">${upper}</text>
</svg>`;

  // 3. Wordmark — Accent (coloured first letter + accent dot)
  const nameRest = esc((name || 'Brand').slice(1));
  const firstLetterWidth = 26;
  const wordmarkAccent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <text x="12" y="46" font-family="${font}, Inter, sans-serif" font-size="38" font-weight="800" fill="${c}">${esc(init1)}</text>
  <text x="${12 + firstLetterWidth}" y="46" font-family="${font}, Inter, sans-serif" font-size="38" font-weight="700" fill="${fg}">${nameRest}</text>
  <rect x="12" y="52" width="60" height="3" rx="1.5" fill="${c}"/>
</svg>`;

  // 4. Monogram — Circle
  const monoCircle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <circle cx="40" cy="40" r="36" fill="${c}"/>
  <text x="40" y="${mono.length > 1 ? 51 : 53}" font-family="${font}, Inter, sans-serif" font-size="${monoSz}" font-weight="700" fill="${onC}" text-anchor="middle">${esc(mono)}</text>
</svg>`;

  // 5. Monogram — Hexagon
  const monoHex = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <path d="M40,4 L72,22 L72,58 L40,76 L8,58 L8,22 Z" fill="${c}"/>
  <text x="40" y="${mono.length > 1 ? 51 : 53}" font-family="${font}, Inter, sans-serif" font-size="${monoSz}" font-weight="700" fill="${onC}" text-anchor="middle">${esc(mono)}</text>
</svg>`;

  // 6. Monogram — Rounded tile
  const monoTile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <rect x="4" y="4" width="72" height="72" rx="18" fill="${c}"/>
  <text x="40" y="${mono.length > 1 ? 53 : 55}" font-family="${font}, Inter, sans-serif" font-size="${monoSz + 2}" font-weight="700" fill="${onC}" text-anchor="middle">${esc(mono)}</text>
</svg>`;

  // Favicon (32×32)
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><style>@import url("${gfUrl}");</style></defs>
  <rect width="32" height="32" rx="7" fill="${c}"/>
  <text x="16" y="${mono.length > 1 ? 22 : 23}" font-family="${font}, Inter, sans-serif" font-size="${monoSzSm}" font-weight="700" fill="${onC}" text-anchor="middle">${esc(mono)}</text>
</svg>`;

  return {
    favicon,
    all: [
      { id: 'wordmark-clean',  label: 'Wordmark · Clean',    svg: wordmarkClean,  type: 'wordmark', w: 300, h: 64  },
      { id: 'wordmark-bold',   label: 'Wordmark · Bold',     svg: wordmarkBold,   type: 'wordmark', w: 300, h: 64  },
      { id: 'wordmark-accent', label: 'Wordmark · Accent',   svg: wordmarkAccent, type: 'wordmark', w: 300, h: 64  },
      { id: 'mono-circle',     label: 'Monogram · Circle',   svg: monoCircle,     type: 'monogram', w: 80,  h: 80  },
      { id: 'mono-hex',        label: 'Monogram · Hex',      svg: monoHex,        type: 'monogram', w: 80,  h: 80  },
      { id: 'mono-tile',       label: 'Monogram · Tile',     svg: monoTile,       type: 'monogram', w: 80,  h: 80  },
    ]
  };
}

// ── Tagline ───────────────────────────────────────────────
const TAGLINE_TEMPLATES = [
  n => `${n} — Built to grow.`,
  (n, niche) => `More ${(niche || 'clients').split(' ')[0].toLowerCase()}. Less hassle.`,
  n => `The ${n} difference.`,
  (n, niche, offer) => offer ? offer.split(/[.,]/)[0].trim() + '.' : `${n} — Results, guaranteed.`,
  n => `${n}. Where growth happens.`,
];

function generateTagline(name, niche, offer) {
  const hash = (name + niche).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAGLINE_TEMPLATES[hash % TAGLINE_TEMPLATES.length](name, niche, offer);
}

// ── Brand voice ───────────────────────────────────────────
const VOICE_PROFILES = {
  aggressive:   { adjectives: ['direct','bold','no-nonsense','results-first'],  avoid: ['maybe','try','hope','possibly'] },
  professional: { adjectives: ['credible','expert','trustworthy','proven'],     avoid: ['awesome','amazing','epic','literally'] },
  friendly:     { adjectives: ['warm','approachable','genuine','real'],         avoid: ['synergy','leverage','paradigm','touch base'] },
};

// ── Pitch document ────────────────────────────────────────
const PAIN_COPY = {
  leads:    { problem: 'Your calendar is too empty. Jobs exist — they just can\'t find you.', solution: 'A custom lead system that puts you in front of people actively searching for your service — automatically.' },
  bookings: { problem: 'You\'re losing bookings to competitors who are easier to find online.', solution: 'A branded booking funnel that converts visitors into paying clients 24/7.' },
  awareness:{ problem: 'Great service, invisible online. You\'re losing work to businesses half as good but twice as visible.', solution: 'A professional online presence that makes you the obvious choice in your area.' },
  revenue:  { problem: 'Revenue is inconsistent — feast or famine. The fix is a reliable pipeline.', solution: 'A predictable client system so your revenue grows month-on-month, without chasing.' },
};

function generatePitchDoc({ name, niche, offer, goal, location, palette, typography, tagline }) {
  const { problem, solution } = PAIN_COPY[goal] || PAIN_COPY.leads;
  const font   = typography.heading;
  const bodyFont = typography.body;
  const prim   = palette.primary;
  const gfUrl  = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.replace(' ', '+'))}:wght@${typography.weights}&family=${encodeURIComponent(bodyFont.replace(' ', '+'))}:wght@300;400;600&display=swap`;
  const today  = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const nameParts = (name || 'Client').split(/\s+/);
  const logoHead  = `<span style="color:${prim}">${esc(nameParts[0])}</span>${nameParts.length > 1 ? '<span>' + esc(nameParts.slice(1).join(' ')) + '</span>' : ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(name)} — Proposal</title>
<style>
@import url('${gfUrl}');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'${bodyFont}',Inter,sans-serif;color:#1a1a2e;background:#fff;font-size:11pt;line-height:1.5}
@page{size:A4 portrait;margin:18mm 14mm}
@media print{.no-print{display:none!important}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{width:210mm;min-height:260mm;padding:14mm 16mm;display:flex;flex-direction:column;gap:0}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid ${prim};margin-bottom:22px}
.logo{font-family:'${font}',Inter,sans-serif;font-size:21pt;font-weight:800;letter-spacing:-1px}
.meta{text-align:right;font-size:7.5pt;color:#888;line-height:1.7}
.hero{background:${prim};color:#fff;padding:22px 20px;border-radius:8px;margin-bottom:20px}
.hero-eye{font-size:7pt;font-weight:700;text-transform:uppercase;letter-spacing:.15em;opacity:.75;margin-bottom:6px}
.hero-h{font-family:'${font}',Inter,sans-serif;font-size:19pt;font-weight:800;line-height:1.2;margin-bottom:8px}
.hero-sub{font-size:9.5pt;opacity:.85}
.sec{margin-bottom:18px}
.sec-lbl{font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:${prim};margin-bottom:6px}
.sec-body{font-size:9.5pt;color:#2c2c3e;line-height:1.6}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.card{border:1.5px solid #e5e5f0;border-radius:6px;padding:12px}
.c-lbl{font-size:6.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${prim};margin-bottom:4px}
.c-val{font-size:10.5pt;font-weight:700}
.c-sub{font-size:7.5pt;color:#888;margin-top:2px}
.tl{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.tli{display:flex;gap:10px;align-items:flex-start}
.tl-n{width:20px;height:20px;border-radius:50%;background:${prim};color:#fff;font-size:7.5pt;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.tl-b{font-size:9pt;line-height:1.5;color:#2c2c3e}
.tl-t{font-weight:700;display:block;margin-bottom:1px}
.gbox{background:#f8f8fd;border:1.5px solid ${prim};border-radius:6px;padding:12px;text-align:center;margin-bottom:18px}
.g-title{font-size:10pt;font-weight:800;color:${prim};margin-bottom:4px}
.g-text{font-size:8.5pt;color:#555;line-height:1.5}
.cta-bar{background:#1a1a2e;color:#fff;padding:16px 20px;border-radius:8px;display:flex;justify-content:space-between;align-items:center}
.cta-t{font-family:'${font}',Inter,sans-serif;font-size:11pt;font-weight:700}
.cta-s{font-size:8pt;opacity:.65;margin-top:3px}
.cta-btn{background:${prim};color:#fff;padding:8px 16px;border-radius:5px;font-size:9pt;font-weight:700;text-decoration:none;white-space:nowrap}
.foot{margin-top:auto;padding-top:12px;border-top:1px solid #e5e5f0;display:flex;justify-content:space-between;font-size:7pt;color:#bbb}
.no-print{position:fixed;top:16px;right:16px;background:${prim};color:#fff;border:none;padding:9px 16px;border-radius:6px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,.2)}
</style>
</head>
<body>
<button class="no-print" onclick="window.print()">🖨 Save as PDF</button>
<div class="page">
  <div class="hdr">
    <div class="logo">${logoHead}</div>
    <div class="meta">Prepared for: <b>${esc(name)}</b><br>${esc(location || 'UK')} &nbsp;·&nbsp; ${today}<br><b style="color:${prim}">Confidential Proposal</b></div>
  </div>

  <div class="hero">
    <div class="hero-eye">${esc(niche || 'Local Business')} · Growth Proposal</div>
    <div class="hero-h">${esc(problem)}</div>
    <div class="hero-sub">${esc(tagline)}</div>
  </div>

  <div class="sec">
    <div class="sec-lbl">The Problem</div>
    <div class="sec-body">${esc(problem)} Most businesses in this space have the skills — they just don't have the system. Every slow month is revenue that went to someone more visible.</div>
  </div>

  <div class="sec">
    <div class="sec-lbl">The Solution</div>
    <div class="sec-body">${esc(solution)} We build it once — you own it forever. No agency retainers, no monthly surprises.</div>
  </div>

  <div class="g2">
    <div class="card"><div class="c-lbl">Investment</div><div class="c-val">£497 one-off</div><div class="c-sub">Or £97/mo · cancel anytime</div></div>
    <div class="card"><div class="c-lbl">Delivery</div><div class="c-val">3–5 business days</div><div class="c-sub">Live and running within a week</div></div>
    <div class="card"><div class="c-lbl">What you get</div><div class="c-val">${esc(offer ? offer.split(',')[0].substring(0, 40) : 'Full lead system')}</div><div class="c-sub">Landing page + CRM + outreach</div></div>
    <div class="card"><div class="c-lbl">Target market</div><div class="c-val">${esc(location || 'UK-wide')}</div><div class="c-sub">${esc(niche || 'Local service businesses')}</div></div>
  </div>

  <div class="sec">
    <div class="sec-lbl">Timeline</div>
    <div class="tl">
      <div class="tli"><div class="tl-n">1</div><div class="tl-b"><span class="tl-t">Day 1 — Onboarding (20 min)</span>We gather your service area, target clients, and offer details.</div></div>
      <div class="tli"><div class="tl-n">2</div><div class="tl-b"><span class="tl-t">Day 2–3 — Build</span>Landing page, lead feed setup, and outreach templates — all written and live.</div></div>
      <div class="tli"><div class="tl-n">3</div><div class="tl-b"><span class="tl-t">Day 4–5 — Review + Launch</span>You review everything. We make changes. Then we launch.</div></div>
      <div class="tli"><div class="tl-n">4</div><div class="tl-b"><span class="tl-t">Week 1+ — First leads</span>Your system starts finding and contacting prospects automatically.</div></div>
    </div>
  </div>

  <div class="gbox">
    <div class="g-title">30-Day Results Guarantee</div>
    <div class="g-text">If you don't receive inbound leads within 30 days of launch, we keep working — at no extra cost — until you do. If it doesn't perform, it's our problem to fix.</div>
  </div>

  <div class="cta-bar">
    <div>
      <div class="cta-t">Ready to start?</div>
      <div class="cta-s">Reply to this proposal or book a 15-min call</div>
    </div>
    <a class="cta-btn" href="mailto:?subject=Proposal%20for%20${encodeURIComponent(name)}">Accept Proposal →</a>
  </div>

  <div class="foot">
    <span>TheSaaSsin · AI-powered growth systems</span>
    <span>Prepared ${today} · Confidential</span>
  </div>
</div>
</body>
</html>`;
}

// ── Main export ───────────────────────────────────────────
function generateBrand({ name, niche, offer, goal, location, tone, primaryHex }) {
  const palette    = generatePalette(primaryHex || null, niche);
  const typography = getTypography(niche);
  const logos      = generateLogos(name, palette, typography);
  const tagline    = generateTagline(name, niche, offer);
  const voice      = VOICE_PROFILES[tone] || VOICE_PROFILES.professional;
  const pitchDoc   = generatePitchDoc({ name, niche, offer, goal, location, palette, typography, tagline });

  return { palette, typography, logos, tagline, voice, pitchDoc };
}

module.exports = { generateBrand };
