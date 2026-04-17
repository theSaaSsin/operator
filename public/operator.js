/* ── TheSaaSsin Operator Panel — operator.js ── */
'use strict';

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://localhost:${window.location.port || 4000}/api`
  : `${window.location.origin}/api`;

/* ── CLOCK ── */
(function clock() {
  const el = document.getElementById('clock');
  function tick() {
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);
})();

/* ── TOAST ── */
function toast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + (type === 'err' ? 'toast-err' : 'toast-ok');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = ''; }, 3000);
}

/* ── NAV ── */
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item');
const topbarTitle = document.getElementById('topbar-title');
const TITLES = { client: 'Client Creator', feed: 'Lead Feed', crm: 'CRM / Lead Pipeline', outreach: 'Outreach Queue' };

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.panel;
    navItems.forEach(n => n.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('panel-' + target).classList.add('active');
    topbarTitle.textContent = TITLES[target];
    if (target === 'crm') loadLeads();
    if (target === 'outreach') loadOutreach();
  });
});

/* ══════════════════════════════════
   CLIENT CREATOR
══════════════════════════════════ */
let selectedClient = null;
let generatedHTML  = '';

async function loadClients() {
  try {
    const res  = await fetch(API + '/clients');
    const data = await res.json();
    renderClientList(data.clients || []);
  } catch { renderClientList([]); }
}

function renderClientList(clients) {
  const list  = document.getElementById('client-list');
  const count = document.getElementById('client-count');
  count.textContent = clients.length;
  if (!clients.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No clients yet</p></div>';
    return;
  }
  list.innerHTML = clients.map(c => `
    <div class="client-card${selectedClient && selectedClient.id === c.id ? ' selected' : ''}"
         data-id="${c.id}" onclick="selectClient(${c.id})">
      <div class="client-avatar">${c.businessName.charAt(0).toUpperCase()}</div>
      <div class="client-info">
        <div class="client-name">${esc(c.businessName)}</div>
        <div class="client-meta">${esc(c.niche)} &middot; ${c.goal}</div>
      </div>
      <span class="badge badge-active">active</span>
    </div>`).join('');
}

function selectClient(id) {
  fetch(API + '/clients').then(r => r.json()).then(data => {
    const c = (data.clients || []).find(x => x.id === id);
    if (!c) return;
    selectedClient = c;
    document.getElementById('f-name').value     = c.businessName || '';
    document.getElementById('f-niche').value    = c.niche        || '';
    document.getElementById('f-offer').value    = c.offer        || '';
    document.getElementById('f-goal').value     = c.goal         || 'leads';
    document.getElementById('f-location').value = c.location     || '';
    document.getElementById('f-notes').value    = c.notes        || '';

    // Restore tone
    if (c.tone) {
      document.querySelectorAll('.tone-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tone === c.tone);
      });
    }

    // Restore system component checkboxes
    if (c.systemComponents) {
      const sc = c.systemComponents;
      ['landing','crm','outreach','followup','booking'].forEach(key => {
        const el = document.getElementById('sys-' + key);
        if (el && sc[key] !== undefined) el.checked = sc[key];
      });
    }

    // Restore style settings
    if (c.style) {
      const s = c.style;
      if (s.primary) {
        document.getElementById('s-primary').value     = s.primary;
        document.getElementById('s-primary-hex').value = s.primary;
      }
      if (s.accent) {
        document.getElementById('s-accent').value      = s.accent;
        document.getElementById('s-accent-hex').value  = s.accent;
      }
      if (s.theme) {
        document.querySelectorAll('.theme-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.theme === s.theme);
        });
      }
      if (s.imgStyle) document.getElementById('s-imgstyle').value = s.imgStyle;
    }

    renderClientList(data.clients);
  });
}

document.getElementById('btn-clear-form').addEventListener('click', () => {
  ['f-name','f-niche','f-offer','f-location','f-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f-goal').value = 'leads';
  selectedClient = null;
  document.getElementById('preview-frame').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'flex';
  document.getElementById('btn-download').style.display  = 'none';
  document.getElementById('btn-copy-html').style.display = 'none';
  const pkgBar = document.getElementById('pkg-bar');
  if (pkgBar) { pkgBar.innerHTML = ''; pkgBar.classList.remove('visible'); }
  generatedHTML = '';
});

function getFormPayload() {
  const style = getStyle();
  return {
    businessName: document.getElementById('f-name').value.trim(),
    niche:        document.getElementById('f-niche').value.trim(),
    offer:        document.getElementById('f-offer').value.trim(),
    goal:         document.getElementById('f-goal').value,
    location:     document.getElementById('f-location').value.trim(),
    notes:        document.getElementById('f-notes').value.trim(),
    tone:         style.tone,
    systemComponents: style.systems,
    style: {
      primary:  style.primary,
      accent:   style.accent,
      theme:    style.theme,
      imgStyle: style.imgStyle
    }
  };
}

document.getElementById('btn-save-client').addEventListener('click', async () => {
  const payload = getFormPayload();
  if (!payload.businessName) { toast('Business name is required', 'err'); return; }
  try {
    if (selectedClient) {
      // Update existing
      const res  = await fetch(API + '/clients', { method: 'PATCH', body: JSON.stringify({ ...payload, id: selectedClient.id }) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client updated', 'ok');
    } else {
      // Create new
      const res  = await fetch(API + '/clients', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      selectedClient = data.client;
      toast('Client saved', 'ok');
    }
    loadClients();
  } catch { toast('Could not save client', 'err'); }
});

/* ── STYLE CONTROLS WIRING ── */
(function() {
  // Sync color picker ↔ hex input
  function syncColor(pickerId, hexId) {
    const picker = document.getElementById(pickerId);
    const hex    = document.getElementById(hexId);
    if (!picker || !hex) return;
    picker.addEventListener('input', () => { hex.value = picker.value; });
    hex.addEventListener('input', () => {
      if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
    });
  }
  syncColor('s-primary', 's-primary-hex');
  syncColor('s-accent',  's-accent-hex');

  // Theme button toggle
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Tone button toggle
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Style panel collapse toggle
  const header  = document.getElementById('style-toggle');
  const body    = document.getElementById('style-body');
  const chevron = document.getElementById('style-chevron');
  let open = false;
  if (body) body.style.display = 'none';  // collapsed by default
  if (header) header.addEventListener('click', () => {
    open = !open;
    body.style.display    = open ? 'flex' : 'none';
    chevron.classList.toggle('open', open);
  });
})();

function getStyle() {
  const activeTheme = document.querySelector('.theme-btn.active');
  const activeTone  = document.querySelector('.tone-btn.active');
  return {
    primary:  document.getElementById('s-primary-hex').value  || '#ff2a2a',
    accent:   document.getElementById('s-accent-hex').value   || '#ffffff',
    theme:    activeTheme ? activeTheme.dataset.theme : 'dark',
    tone:     activeTone  ? activeTone.dataset.tone  : 'professional',
    imgStyle: document.getElementById('s-imgstyle').value     || 'auto',
    imgUrl:   document.getElementById('s-imgurl').value.trim() || '',
    systems: {
      landing:  document.getElementById('sys-landing')  ? document.getElementById('sys-landing').checked  : true,
      crm:      document.getElementById('sys-crm')      ? document.getElementById('sys-crm').checked      : true,
      outreach: document.getElementById('sys-outreach') ? document.getElementById('sys-outreach').checked : true,
      followup: document.getElementById('sys-followup') ? document.getElementById('sys-followup').checked : true,
      booking:  document.getElementById('sys-booking')  ? document.getElementById('sys-booking').checked  : false
    }
  };
}

document.getElementById('btn-generate').addEventListener('click', () => {
  const name  = document.getElementById('f-name').value.trim()    || 'Your Business';
  const niche = document.getElementById('f-niche').value.trim()   || 'your industry';
  const offer = document.getElementById('f-offer').value.trim()   || 'our service';
  const goal  = document.getElementById('f-goal').value;
  const loc   = document.getElementById('f-location').value.trim();
  const notes = document.getElementById('f-notes').value.trim();
  const style = getStyle();

  /* Resolve niche profile — drives ALL output */
  const profile = getNicheProfile(niche, offer, goal, loc);

  /* 1. Landing page */
  generatedHTML = buildLandingPage({ name, niche, offer, goal, loc, profile, style });
  showPreview(generatedHTML);

  /* 2. Full outreach sequence → outreach queue (only if system component enabled) */
  const sequence = buildOutreachSequence({ name, niche, offer, loc, profile, style });
  if (style.systems.outreach) {
    sequence.forEach((msg) => {
      fetch(API + '/outreach', {
        method: 'POST',
        body: JSON.stringify({ clientName: name, niche, label: msg.label, message: msg.body })
      }).catch(() => {});
    });
  }

  /* 3. CRM structure → logged */
  const crm = buildCRMStructure({ name, niche, offer, goal, profile });
  console.log('[TheSaaSsin] CRM Structure for', name, JSON.stringify(crm, null, 2));

  /* 4. Offer definition → logged */
  const offerDef = buildOfferDefinition({ name, niche, offer, goal, loc, profile });
  console.log('[TheSaaSsin] Offer Definition:', JSON.stringify(offerDef, null, 2));

  /* 5. Package summary → show in right panel */
  showPackageSummary(buildPackageSummary({ name, profile, style }));

  /* 6. Auto-save generated system back to client record */
  if (selectedClient) {
    const updatedSystems = {
      landingPage: generatedHTML,
      outreach:    sequence.map(s => ({ label: s.label, body: s.body })),
      crm:         buildCRMStructure({ name, niche, offer, goal, profile }),
      generatedAt: new Date().toISOString()
    };
    fetch(API + '/clients', {
      method: 'PATCH',
      body: JSON.stringify({ id: selectedClient.id, systems: updatedSystems, lastUpdated: new Date().toISOString() })
    }).then(r => r.json()).then(d => { if (d.client) selectedClient = d.client; }).catch(() => {});
  }

  toast('System generated for ' + name, 'ok');
});

document.getElementById('btn-download').addEventListener('click', () => {
  if (!generatedHTML) return;
  const blob = new Blob([generatedHTML], { type: 'text/html' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = (document.getElementById('f-name').value.trim() || 'client').replace(/\s+/g,'-').toLowerCase() + '.html';
  a.click();
  toast('HTML downloaded', 'ok');
});

document.getElementById('btn-copy-html').addEventListener('click', () => {
  if (!generatedHTML) return;
  navigator.clipboard.writeText(generatedHTML).then(() => toast('HTML copied to clipboard', 'ok'));
});

function showPreview(html) {
  const frame = document.getElementById('preview-frame');
  const placeholder = document.getElementById('preview-placeholder');
  frame.style.display = 'block';
  placeholder.style.display = 'none';
  document.getElementById('btn-download').style.display  = 'inline-flex';
  document.getElementById('btn-copy-html').style.display = 'inline-flex';
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
}

/* ══════════════════════════════════
   NICHE INTELLIGENCE ENGINE
══════════════════════════════════ */

/**
 * Returns a rich niche profile that drives all generator outputs.
 * Falls back gracefully if no keyword match — no generic filler.
 */
function getNicheProfile(niche, offer, goal, loc) {
  const n   = (niche + ' ' + offer).toLowerCase();
  const at  = loc ? ` in ${loc}` : '';
  const for_ = loc ? `for ${loc} homeowners` : 'for local homeowners';

  /* ── PLUMBER ── */
  if (/plumb|pipe|boiler|heating|gas|drain/.test(n)) return {
    type: 'trade',
    audience: `homeowners and landlords${at}`,
    scenarios: [
      `When your boiler dies at 9pm on a Sunday${at} — and every plumber you call either doesn't answer or quotes you a fortune just to show up`,
      `When you've got a leak spreading through the ceiling and you can't find anyone who can come today`,
      `When you've been let down by a tradesperson who said they'd show up and just… didn't`
    ],
    painPoints: [
      `Boiler breaks down${at} — nobody picks up, or they want £150 just to look at it`,
      `Waiting 3–5 days for a callout that should take hours`,
      `Getting quoted one price on the phone and a different one on the day`,
      `Never knowing if the person coming is actually qualified`
    ],
    outcomes: [
      `Same-day callout booked within 2 hours — 7 days a week${at}`,
      `Upfront fixed price before anyone sets foot in your home`,
      `Gas Safe registered — certificate provided on completion`,
      `Problem diagnosed and resolved in a single visit, 90% of the time`
    ],
    headline:  `${loc ? loc + ' Emergency Plumber' : 'Emergency Plumber Near You'} — Here Today, Not Next Week`,
    subline:   `${offer || 'Emergency callouts, boiler repairs & heating'} · Fixed pricing · Available 7 days`,
    cta:       goal === 'bookings' ? `Book a Callout${at}` : `Get a Fixed Quote Today`,
    ctaLow:    `Want me to show you what this system looks like for your setup?`,
    proof:     [`Trusted by 100+ ${loc || 'local'} homeowners`, 'Gas Safe registered', 'Same-day response', 'Fixed pricing — no surprises'],
    form:      { q1: `What's the problem? (e.g. no hot water, leak, boiler fault)`, q2: `Is this urgent — or can it wait a day or two?` }
  };

  /* ── ELECTRICIAN ── */
  if (/electric|wir|fuse|power|sparks/.test(n)) return {
    type: 'trade',
    audience: `homeowners, landlords and small businesses${at}`,
    scenarios: [
      `When a fuse keeps tripping and you don't know if it's safe to leave — let alone who to call`,
      `When a landlord certificate is overdue and your tenant's chasing you${at}`,
      `When you've had three electricians quote three wildly different prices and you still don't know who to trust`
    ],
    painPoints: [
      `Electrical faults you're not sure are safe to leave — and no one to call at short notice`,
      `Landlord certificates overdue, holding up a sale or new tenancy${at}`,
      `Quotes that vary by hundreds with no explanation`,
      `Electricians who book in then cancel, leaving you in the dark`
    ],
    outcomes: [
      `Fault found and fixed in a single visit — certificate issued same day`,
      `Landlord EICR completed within 48 hours, paperwork sent immediately`,
      `Fixed price agreed before work starts — nothing added on the day`,
      `NICEIC approved work, fully insured, guaranteed for 12 months`
    ],
    headline:  `${loc ? loc + ' Electrician' : 'Local Electrician'} — Certified, On Time, Fixed Price`,
    subline:   `${offer || 'Electrical installations, fault finding & certificates'} · NICEIC approved · No hidden costs`,
    cta:       goal === 'bookings' ? `Book a Free Assessment` : `Get a Fixed Quote`,
    ctaLow:    `Happy to show you what a system like this looks like for your business`,
    proof:     [`Trusted by ${loc || 'local'} homeowners & landlords`, 'NICEIC Approved', 'Same-day certificates', 'Fully insured'],
    form:      { q1: `What electrical work do you need?`, q2: `Is this a safety issue, or is it planned work?` }
  };

  /* ── BUILDER / RENOVATION ── */
  if (/build|construct|renovat|extension|loft|kitchen fit/.test(n)) return {
    type: 'trade',
    audience: `homeowners planning renovations${at}`,
    scenarios: [
      `When you've found a builder${at} but they want 50% upfront, no contract, and a verbal promise they'll be done by summer`,
      `When your kitchen renovation is on week 8 of a "3-week job" and the builder's gone quiet`,
      `When you get four quotes that are all different and none of them explain what's actually included`
    ],
    painPoints: [
      `Projects going 40% over budget with no warning it was coming`,
      `Builders${at} who disappear mid-job — phone goes straight to voicemail`,
      `No project timeline, no updates, no idea what's happening on site`,
      `Paying for work that wasn't done right the first time`
    ],
    outcomes: [
      `Fixed-price contract signed before a single tool is picked up`,
      `Dedicated project manager — you get updates without having to chase`,
      `Build diary with photos sent weekly so you always know the status`,
      `On-time completion or we work weekends to catch up at no extra cost`
    ],
    headline:  `${loc ? loc + ' Builder' : 'Local Builder'} You Can Actually Trust — Fixed Price, No Surprises`,
    subline:   `${offer || 'Extensions, renovations & kitchen fits'} · Fixed-price contracts · Project managed`,
    cta:       `Get a Free Project Quote`,
    ctaLow:    `Want me to pull together a quick outline for your project?`,
    proof:     [`50+ projects completed${at}`, 'Fixed-price contracts', 'Fully insured', '5-star Google reviews'],
    form:      { q1: `What project are you planning? (e.g. extension, loft, kitchen)`, q2: `Do you have a rough budget in mind, or are you still at the quote stage?` }
  };

  /* ── FITNESS / PT / GYM ── */
  if (/gym|fitness|personal train|pt |coach|weight|muscle|fat loss/.test(n)) return {
    type: 'fitness',
    audience: `people who are serious about results but keep hitting the same wall`,
    scenarios: [
      `When you've tried the gym three times this year, got results for about two weeks, then life got in the way and you're back at square one`,
      `When you're training consistently but the weight just isn't shifting — and you can't work out what you're doing wrong`,
      `When you've bought the programme, watched the videos, done everything right — and still don't look like any of the before and afters`
    ],
    painPoints: [
      `Paying for a gym${at ? ' ' + at : ''} you use twice a month and feel guilty about every time`,
      `Training with no real plan — just doing what feels right and hoping it works`,
      `Results that plateau after 3–4 weeks because nothing changes`,
      `Nutrition advice that contradicts itself every time you Google something`
    ],
    outcomes: [
      `Visible body composition change within 8 weeks — or your money back`,
      `A weekly plan that fits around your actual schedule, not a perfect one`,
      `Check-in every week — someone who notices if you've gone off track`,
      `Nutrition that works without weighing everything or cutting out entire food groups`
    ],
    headline:  `Stop Starting Over. Get a Plan Built for You${loc ? ' in ' + loc : ''} That Actually Sticks.`,
    subline:   `${offer || 'Personal training & transformation coaching'} · 8-week results · No contracts`,
    cta:       goal === 'leads' ? `Apply for a Free Strategy Call` : `Book Your Free Consultation`,
    ctaLow:    `Want me to show you what a 12-week plan would look like for your situation?`,
    proof:     [`50+ transformations${at}`, 'Average 8–10kg lost in 12 weeks', 'No lock-in contracts', 'Online & in-person'],
    form:      { q1: `What's your main goal? (e.g. lose fat, build muscle, get consistent)`, q2: `What's stopped you getting the result before?` }
  };

  /* ── CONSULTANT / COACH / FREELANCER ── */
  if (/consult|freelanc|strateg|adviso|coach|mentor/.test(n)) return {
    type: 'consulting',
    audience: `business owners who are working too hard for the revenue they're getting`,
    scenarios: [
      `When you're doing £10–20K a month but working 60 hours a week to hold it together — and you can't see how to grow without it getting worse`,
      `When you know exactly what needs to change in your business but you keep putting it off because there's no time to actually work on it`,
      `When a client ghosts after asking for a proposal and you spend three days wondering what went wrong`
    ],
    painPoints: [
      `Revenue is decent but the margin — after your time — barely makes sense`,
      `No system for getting clients consistently: some months great, some months nothing`,
      `Every new client feels like starting from scratch — no repeatable process`,
      `You're the bottleneck: nothing moves unless you're involved in it`
    ],
    outcomes: [
      `A repeatable client acquisition process that runs without you chasing — within 30 days`,
      `Revenue clarity: know exactly which activities are driving income and cut the rest`,
      `A clear 90-day plan that's specific to your business, not a generic framework`,
      `Reclaim 10+ hours a week by systemising what you're currently doing manually`
    ],
    headline:  `You Shouldn't Have to Work This Hard for This Result. Let's Fix That.`,
    subline:   `${offer || 'Business strategy & growth consulting'} · 30-day results · Built around your business`,
    cta:       `Book a Free 30-Min Strategy Call`,
    ctaLow:    `Happy to map out what's actually holding you back — no prep needed, just a 30-min call`,
    proof:     ['Average 3x ROI in 90 days', 'Former operator — not a theorist', '100% confidential', 'No long-term retainers'],
    form:      { q1: `What's the single biggest thing holding your business back right now?`, q2: `What have you already tried — and why do you think it didn't work?` }
  };

  /* ── MARKETING / AGENCY ── */
  if (/market|agency|seo|ads|social|lead gen|growth|digital/.test(n)) return {
    type: 'agency',
    audience: `business owners who've been burned by agencies before`,
    scenarios: [
      `When you're paying £2,000/month in ads and the agency's monthly report is 6 slides of metrics that don't explain why enquiries are down`,
      `When you hit month four of an SEO retainer and you're still "building domain authority" with nothing to show for it`,
      `When leads come in through the form but nobody calls back within the hour — and by the time someone does, they've moved on`
    ],
    painPoints: [
      `Ad spend going up, cost-per-lead going up, and the agency says "it's the algorithm"`,
      `No clear attribution — impossible to tell which channel is actually bringing in revenue`,
      `Leads from campaigns that don't convert because the follow-up is broken`,
      `Agencies who lock you into 6-month contracts and go quiet after month one`
    ],
    outcomes: [
      `Clear attribution dashboard live within 7 days — know exactly what's working`,
      `Avg 4x ROAS within 60 days or we work at cost until we hit it`,
      `Follow-up automation that contacts new leads within 5 minutes — automatically`,
      `No lock-in — monthly rolling, cancel with 30 days notice`
    ],
    headline:  `Your Last Agency Took Your Money. We Only Win When You Do.`,
    subline:   `${offer || 'Performance marketing & lead generation'} · ROI-focused · No long-term lock-in`,
    cta:       `Get a Free Account Audit`,
    ctaLow:    `Want me to take a quick look at your current setup and tell you what I'd fix first?`,
    proof:     ['£500K+ in ad spend managed', 'Avg 4x ROAS', 'No lock-in contracts', 'Weekly reporting — real numbers'],
    form:      { q1: `What are you currently running and what's it costing you per month?`, q2: `What does a "good result" actually look like for your business?` }
  };

  /* ── SAAS / TECH / AUTOMATION ── */
  if (/saas|software|app|tech|platform|tool|automat/.test(n)) return {
    type: 'saas',
    audience: `founders who are building but not growing fast enough`,
    scenarios: [
      `When you've shipped the product, you've got users, but you can't work out why 60% of them aren't coming back after week one`,
      `When your dev sprint is full but you're not sure half the features on the list are actually what users want`,
      `When you're doing all the right things — content, outreach, product updates — but MRR has been flat for three months`
    ],
    painPoints: [
      `Churn eating growth as fast as acquisition — net revenue barely moves`,
      `Building features users asked for but activation rates aren't improving`,
      `No onboarding system — users sign up, poke around, and leave before seeing value`,
      `Dev time spent on the wrong things because there's no clear signal from users`
    ],
    outcomes: [
      `Onboarding flow rebuilt to hit the "aha moment" within the first session — churn drops within 30 days`,
      `Clear feature priority based on what actually correlates with retention, not gut feel`,
      `Automated email sequences that bring dormant users back without manual effort`,
      `MRR movement within 60 days — or we keep working until it does`
    ],
    headline:  `${offer ? esc(offer) : 'Your Product'} Is Good. Here's Why It's Not Growing Faster.`,
    subline:   `${offer || 'SaaS growth systems & retention automation'} · Churn reduction · Scalable from current stage`,
    cta:       `Book a Free Discovery Call`,
    ctaLow:    `Want me to take a look at your onboarding flow and tell you what I'd change first?`,
    proof:     ['10+ SaaS products scaled', 'Avg 40% churn reduction in 60 days', 'From MVP to Series A', 'No bloated retainers'],
    form:      { q1: `What stage is the product and what's your current MRR?`, q2: `Where are users dropping off — and do you know why yet?` }
  };

  /* ── DEFAULT ── */
  return {
    type: 'general',
    audience: `business owners${at} who are tired of inconsistent results`,
    scenarios: [
      `When you have a great month and think you've cracked it — then the next month is half the revenue and you don't know why`,
      `When a potential client lands on your site, looks around, and leaves without contacting you — and you have no idea it's happening`,
      `When you're doing everything you're "supposed" to do but the pipeline still feels like it's running on luck`
    ],
    painPoints: [
      `Leads come in when you're busy — then dry up the moment you need them`,
      `People visit your site${at} and leave without contacting you — nothing captures them`,
      `No follow-up system: enquiries that don't convert immediately just disappear`,
      `Competitors${at} winning jobs that should be coming to you`
    ],
    outcomes: [
      `A consistent lead flow within 30 days — not dependent on referrals or luck`,
      `Automated follow-up that contacts every enquiry within minutes, not days`,
      `A site that converts visitors into booked calls — not just a digital brochure`,
      `${offer || 'Your service'} positioned to win${at} — priced, presented and promoted properly`
    ],
    headline:  `${offer ? esc(offer) : 'Your Business'}${at} — Built to Get Clients Consistently.`,
    subline:   `Stop relying on referrals. Build a system that fills your pipeline — every month.`,
    cta:       goal === 'bookings' ? `Book a Free Strategy Call` : `Get Your Free Growth Plan`,
    ctaLow:    `Want me to map out what this would look like for your business specifically?`,
    proof:     [`Trusted by ${loc || 'UK'} businesses`, 'Proven system', '14-day delivery', 'Free strategy call'],
    form:      { q1: `What are you trying to achieve in the next 90 days?`, q2: `What's currently in place — and what do you think is missing?` }
  };
}

/* ── IMAGE LOOKUP ── */
function getNicheImage(niche, offer, imgStyle, imgUrl, profileType) {
  if (imgUrl) return imgUrl;
  const n = (niche + ' ' + offer).toLowerCase();

  // High-quality, context-matched images per profile type (auto mode)
  const typeImgs = {
    trade:      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1400&q=80', // tradesperson at work
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80', // real training intensity
    consulting: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80', // clean strategy desk
    agency:     'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&q=80', // marketing/analytics screen
    saas:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',    // developer/code screens
    general:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'  // clean minimal office
  };

  if (imgStyle === 'auto' && profileType && typeImgs[profileType]) {
    return typeImgs[profileType];
  }

  // Manual style override
  const autoStyle = /plumb|pipe|boiler|electric|build|construct|trade|weld|drain/.test(n) ? 'industrial'
                  : /gym|fitness|train|coach|weight|muscle/.test(n) ? 'fitness'
                  : /saas|software|app|tech|digital|automat/.test(n) ? 'tech'
                  : /consult|strateg|freelanc|coach|mentor/.test(n) ? 'corporate'
                  : 'neutral';
  const resolvedStyle = imgStyle === 'auto' ? autoStyle : imgStyle;
  const imgs = {
    industrial: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',  // construction site
    fitness:    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80',  // training intensity
    corporate:  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=80',  // strategy desk
    tech:       'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&q=80',     // dev/code
    neutral:    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80'   // minimal office
  };
  return imgs[resolvedStyle] || imgs.neutral;
}

/* ── THEME PRESETS ── */
const THEMES = {
  dark:     { bg:'#0a0a0f', bg2:'#0d0d14', card:'#121218', text:'#f0f0f5', muted:'#8888a0', border:'rgba(255,255,255,0.06)' },
  light:    { bg:'#f5f5fa', bg2:'#ffffff',  card:'#ffffff', text:'#1a1a2e', muted:'#666680', border:'rgba(0,0,0,0.08)' },
  contrast: { bg:'#000000', bg2:'#111111',  card:'#0d0d0d', text:'#ffffff', muted:'#aaaaaa', border:'rgba(255,255,255,0.12)' }
};

/* ── TONE ADAPTERS ── */
function applyTone(profile, tone) {
  if (tone === 'friendly') {
    return Object.assign({}, profile, {
      cta:    profile.ctaLow || 'Want me to map this out for you?',
      ctaLow: 'Let me show you exactly what this would look like for you',
      headline: profile.headline.replace(/\.$/, '') + ' — Let\'s Fix That Together.'
    });
  }
  if (tone === 'aggressive') {
    return Object.assign({}, profile, {
      cta:    profile.cta.replace('Free', 'Your').replace('Get a', 'Claim Your'),
      headline: profile.headline.toUpperCase().substring(0,1) + profile.headline.substring(1)
    });
  }
  return profile; // professional — default, no change
}

/* ── LANDING PAGE GENERATOR ── */
function buildLandingPage({ name, niche, offer, goal, loc, profile, style }) {
  const p  = applyTone(profile, (style && style.tone) || 'professional');
  const st = style || { primary:'#ff2a2a', accent:'#ffffff', theme:'dark', tone:'professional', imgStyle:'auto', imgUrl:'' };
  const th = THEMES[st.theme] || THEMES.dark;
  const imgSrc = getNicheImage(niche, offer, st.imgStyle, st.imgUrl, profile.type);

  const painHTML  = p.painPoints.map(pt =>
    `<li><span class="x">✕</span> ${esc(pt)}</li>`).join('');
  const outHTML   = p.outcomes.map(ot =>
    `<li><span class="chk">✓</span> ${esc(ot)}</li>`).join('');
  const proofHTML = p.proof.map(pr =>
    `<div class="proof-item"><span class="proof-dot">●</span>${esc(pr)}</div>`).join('');
  const scenariosHTML = (p.scenarios || []).map(s =>
    `<div class="scenario"><span class="sc-q">"</span>${esc(s)}<span class="sc-q">"</span></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)}</title>
<style>
:root{
  --accent:${st.primary};
  --accent2:${st.accent};
  --dark:${th.bg};
  --bg2:${th.bg2};
  --card:${th.card};
  --text:${th.text};
  --muted:${th.muted};
  --border:${th.border};
  --success:#22c55e;
}
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:var(--dark);color:var(--text);line-height:1.6}
header{padding:18px 6%;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);position:sticky;top:0;background:${th.bg}ee;backdrop-filter:blur(10px);z-index:100}
.logo{font-size:1.25rem;font-weight:800;color:var(--text);text-decoration:none;letter-spacing:-.02em}
.logo em{color:var(--accent);font-style:normal}
.btn{display:inline-block;background:var(--accent);color:${st.theme==='light'?'#fff':st.accent};padding:14px 32px;border-radius:28px;text-decoration:none;font-weight:700;font-size:.95rem;letter-spacing:.02em;box-shadow:0 6px 24px color-mix(in srgb,var(--accent) 40%,transparent);transition:all .2s;border:none;cursor:pointer;font-family:inherit}
.btn:hover{transform:translateY(-2px);filter:brightness(1.1);}
/* HERO */
.hero{padding:0;text-align:center;position:relative;overflow:hidden;min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.hero-bg{position:absolute;inset:0;background-image:url('${imgSrc}');background-size:cover;background-position:center;filter:${st.theme==='light'?'brightness(.55) saturate(.8)':'brightness(.25) saturate(.7)'}}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,${th.bg}cc 0%,${th.bg}88 60%,${th.bg}ff 100%)}
.hero-content{position:relative;z-index:2;padding:96px 6% 72px;width:100%}
.eyebrow{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:var(--accent);margin-bottom:18px;opacity:.9}
.hero h1{font-size:clamp(1.9rem,4.5vw,3rem);font-weight:800;line-height:1.15;margin-bottom:18px;max-width:820px;margin-left:auto;margin-right:auto}
.hero h1 em{color:var(--accent);font-style:normal}
.hero .sub{font-size:1.1rem;color:var(--muted);max-width:560px;margin:0 auto 32px}
.proof-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 20px;margin-top:28px;margin-bottom:0}
.proof-item{font-size:.8rem;color:var(--muted);display:flex;align-items:center;gap:6px}
.proof-dot{color:var(--accent);font-size:.5rem}
/* PAIN / OUTCOME */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:900px;margin:0 auto}
.box{background:var(--card);border-radius:12px;padding:28px 24px;border:1px solid rgba(255,255,255,.05)}
.box h3{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px}
.box.pain h3{color:#ff6b6b}
.box.win  h3{color:var(--success)}
.box ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.box ul li{font-size:.88rem;color:var(--muted);display:flex;align-items:flex-start;gap:8px;line-height:1.45}
.x{color:#ff4444;flex-shrink:0;font-weight:700}
.chk{color:var(--success);flex-shrink:0;font-weight:700}
/* FORM */
.form-section{padding:80px 6%;max-width:620px;margin:0 auto;text-align:center}
.form-section h2{font-size:1.8rem;font-weight:800;margin-bottom:12px}
.form-section p{color:var(--muted);margin-bottom:32px;font-size:1rem}
.form-wrap{background:var(--card);border:1px solid rgba(255,42,42,.2);border-radius:14px;padding:32px;text-align:left;display:flex;flex-direction:column;gap:18px}
.form-wrap label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);display:block;margin-bottom:6px}
.form-wrap textarea,.form-wrap input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 14px;color:var(--text);font-size:.9rem;font-family:inherit;outline:none;transition:border .2s;resize:vertical}
.form-wrap textarea:focus,.form-wrap input:focus{border-color:rgba(255,42,42,.4)}
.form-wrap textarea{min-height:80px}
.form-wrap .btn{width:100%;margin-top:4px;font-size:1rem;padding:16px}
.form-note{text-align:center;font-size:.72rem;color:var(--muted);margin-top:10px;opacity:.7}
/* SECTIONS */
.section{padding:72px 6%;}
.section-inner{max-width:1060px;margin:0 auto}
.section h2{font-size:1.8rem;font-weight:800;text-align:center;margin-bottom:44px;position:relative}
.section h2::after{content:'';position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);width:48px;height:3px;background:var(--accent);border-radius:2px}
/* SCENARIOS */
.scenarios{padding:64px 6%;background:var(--bg2,#0d0d14);border-top:1px solid rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)}
.scenarios-inner{max-width:760px;margin:0 auto}
.scenarios h2{font-size:1.55rem;font-weight:800;text-align:center;margin-bottom:36px;color:#fff}
.scenario{background:var(--card);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:18px 22px;margin-bottom:14px;font-size:.95rem;color:var(--muted);line-height:1.6;font-style:italic}
.scenario:last-child{margin-bottom:0}
.sc-q{color:var(--accent);font-style:normal;font-size:1.2rem;line-height:1}
footer{text-align:center;padding:28px 6%;color:var(--muted);font-size:.8rem;border-top:1px solid rgba(255,255,255,.05)}
@media(max-width:640px){.two-col{grid-template-columns:1fr}.hero{padding:76px 5% 56px}.scenarios{padding:48px 5%}}
</style>
</head>
<body>
<header>
  <a class="logo" href="#"><em>${esc(name)}</em></a>
  <a class="btn" href="#capture" style="padding:10px 20px;font-size:.82rem">${esc(p.cta)}</a>
</header>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="eyebrow">For ${esc(p.audience)}</div>
    <h1>${esc(p.headline)}</h1>
    <p class="sub">${esc(p.subline)}</p>
    <a class="btn" href="#capture">${esc(p.cta)}</a>
    <div class="proof-row">${proofHTML}</div>
  </div>
</section>

${scenariosHTML ? `<section class="scenarios"><div class="scenarios-inner"><h2>Sound familiar?</h2>${scenariosHTML}</div></section>` : ''}

<section class="section" style="background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="section-inner">
    <h2>What's broken — and what changes</h2>
    <div class="two-col">
      <div class="box pain">
        <h3>Right now</h3>
        <ul>${painHTML}</ul>
      </div>
      <div class="box win">
        <h3>After working with us</h3>
        <ul>${outHTML}</ul>
      </div>
    </div>
  </div>
</section>

<section class="form-section" id="capture">
  <h2>${esc(p.ctaLow || 'Let\'s map it out.')}</h2>
  <p>Two quick questions. Then a free 30-minute call where we build the plan — specific to your business, not a template.</p>
  <div class="form-wrap">
    <div>
      <label>${esc(p.form.q1)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>${esc(p.form.q2)}</label>
      <textarea placeholder="Your answer..."></textarea>
    </div>
    <div>
      <label>Your name &amp; best contact number</label>
      <input type="text" placeholder="Name · Phone / WhatsApp">
    </div>
    <a class="btn" href="https://calendly.com/thesaassin/build-your-system" target="_blank" rel="noopener">${esc(p.cta)}</a>
    <p class="form-note">No spam. No hard sell. Just a 30-minute call with a clear plan.</p>
  </div>
</section>

<footer>
  &copy; ${new Date().getFullYear()} ${esc(name)}${loc ? ' &middot; ' + esc(loc) : ''}. System by <a href="https://thesaassin.com" style="color:var(--accent);text-decoration:none">TheSaaSsin</a>.
</footer>
</body>
</html>`;
}

/* ── OUTREACH SEQUENCE GENERATOR (5 messages) ── */
function buildOutreachSequence({ name, niche, offer, loc, profile, style }) {
  const p      = profile;
  const tone   = (style && style.tone) || 'professional';
  const at     = loc ? ` in ${loc}` : '';
  const pain0  = p.painPoints[0];
  const pain1  = p.painPoints[1] || p.painPoints[0];
  const win0   = p.outcomes[0];
  const scene  = p.scenarios ? p.scenarios[0] : null;

  // Opener CTA line varies by tone
  const opener_close = tone === 'friendly'
    ? `I'd love to show you what a system built for your setup would look like — no pressure, just a quick look.\n\n15 min? → https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `If you want to fix that this month — reply and I'll send you a preview built specifically for ${name}.\n\nSlot: https://calendly.com/thesaassin/build-your-system`
    : `Worth a 15-min call to see if there's a fit?\n\n→ https://calendly.com/thesaassin/build-your-system`;

  const followup_close = tone === 'friendly'
    ? `Happy to just take a look and tell you honestly what I'd tweak. No prep needed.\n\n→ https://calendly.com/thesaassin/build-your-system`
    : tone === 'aggressive'
    ? `Free audit. 30 minutes. You walk away with a plan either way.\n\nClaim it → https://calendly.com/thesaassin/build-your-system`
    : `30 minutes → https://calendly.com/thesaassin/build-your-system`;

  return [
    {
      label: '1 — Opener',
      body:
`[First Name] — quick one.

Are enquiries coming in consistently${at}, or is it still hit and miss month to month?

I build client acquisition systems for ${niche} businesses — and the most common thing I see is: ${pain0.toLowerCase()}.

${scene ? 'Sound familiar?\n\n"' + scene + '"\n\n' : ''}${opener_close}

— TheSaaSsin`
    },
    {
      label: '2 — Value',
      body:
`[First Name] — following up.

Here's what I actually build for ${niche} businesses like ${name}:

→ ${win0}
→ ${p.outcomes[1]}
→ ${p.outcomes[2] || 'A system that works without you manually chasing it'}

The whole thing is live in 14 days. No retainers, no lock-in.

${tone === 'friendly' ? 'Want me to show you what it looks like for your setup? No obligation.' : tone === 'aggressive' ? 'This is what your competitors are missing. Don\'t wait on it.' : p.ctaLow || 'Want me to show you what it looks like for your setup?'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '3 — System Preview',
      body:
`[First Name].

I've built a system preview specifically for a ${niche} business${at}. Takes me about 20 minutes to put together — I did one for yours.

It includes:
· A landing page written around your actual offer
· A 5-step outreach sequence
· A CRM pipeline with lead scoring
· Automated follow-up that contacts every lead within 5 minutes

I can walk you through the whole thing in 30 minutes. No prep needed from you.

${tone === 'friendly' ? 'If you like it, we can talk next steps. If not, you keep the preview.' : tone === 'aggressive' ? 'This is what\'s currently missing from your pipeline. Let me show you.' : 'If it\'s useful, great. If not, you leave with something concrete either way.'}

→ https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    },
    {
      label: '4 — Follow-Up',
      body:
`[First Name] — haven't heard back, which is fine.

One thing I've noticed with ${niche} businesses${at}: ${pain1.toLowerCase()} — and most people either don't know it's fixable, or they've tried something before that didn't work.

${tone === 'aggressive' ? 'I\'m not here to waste your time — but if this is a real problem, let\'s solve it. 30 minutes is all it takes.' : 'I\'m not going to pitch you. But if you want a second opinion on your current setup, I\'ll give you one for free.'}

${followup_close}

— TheSaaSsin`
    },
    {
      label: '5 — Final Nudge',
      body:
`[First Name] — last message from me.

One question: is getting consistent clients for ${name} a priority right now, or is the focus elsewhere?

If it is — I can help, and I can show you exactly how in 30 minutes.

If it's not the right time — no problem at all. I'll leave you to it.

${tone === 'friendly' ? 'Either way, best of luck with it.' : 'Either way:'} https://calendly.com/thesaassin/build-your-system

— TheSaaSsin`
    }
  ];
}

/* ── PACKAGE SUMMARY ── */
function buildPackageSummary({ name, profile, style }) {
  const s = style.systems || {};
  const tone = style.tone || 'professional';
  const outcome = profile.outcomes[0];
  const toneLabel = { aggressive: '⚡ Aggressive', professional: '◼ Professional', friendly: '● Friendly' }[tone] || 'Professional';

  const components = [
    { id: 'landing',  label: 'Landing Page',        on: s.landing  !== false, icon: 'fa-file-code'      },
    { id: 'crm',      label: 'CRM Pipeline',         on: s.crm      !== false, icon: 'fa-chart-line'     },
    { id: 'outreach', label: 'Outreach Sequence',    on: s.outreach !== false, icon: 'fa-paper-plane'    },
    { id: 'followup', label: 'Follow-up System',     on: s.followup !== false, icon: 'fa-clock-rotate-left' },
    { id: 'booking',  label: 'Booking System',       on: !!s.booking,          icon: 'fa-calendar-check' }
  ];

  const countOn = components.filter(c => c.on).length;
  const expectedResult = countOn >= 4
    ? '5–15 qualified leads/week within 14 days'
    : countOn >= 3
    ? '3–8 qualified leads/week within 21 days'
    : 'Improved online conversion within 14 days';

  return { name, components, outcome, expectedResult, tone, toneLabel, countOn };
}

function showPackageSummary({ name, components, outcome, expectedResult, tone, toneLabel, countOn }) {
  const bar = document.getElementById('pkg-bar');
  if (!bar) return;

  const compHTML = components.map(c => `
    <div class="pkg-item${c.on ? '' : ' off'}">
      <i class="fas ${c.icon}"></i> ${c.label}
    </div>`).join('');

  bar.innerHTML = `
    <div class="pkg-label">System Package</div>
    <div class="pkg-name"><i class="fas fa-bolt"></i> ${esc(name)} — ${countOn} component${countOn !== 1 ? 's' : ''}</div>
    <div class="pkg-grid">${compHTML}</div>
    <div class="pkg-result">
      Expected: <strong>${expectedResult}</strong>
      <div class="pkg-meta">Tone: ${toneLabel} &nbsp;·&nbsp; Outcome: ${esc(outcome)}</div>
    </div>`;
  bar.classList.add('visible');
}

/* ── CRM STRUCTURE GENERATOR ── */
function buildCRMStructure({ name, niche, offer, goal, profile }) {
  return {
    client: name,
    niche,
    pipeline: [
      { stage: 'New',       score: 10, action: 'Send opener message',            auto: true  },
      { stage: 'Contacted', score: 25, action: 'Follow up in 48hrs if no reply', auto: true  },
      { stage: 'Replied',   score: 45, action: 'Book strategy call',             auto: false },
      { stage: 'Called',    score: 65, action: 'Send proposal / system preview', auto: false },
      { stage: 'Qualified', score: 80, action: 'Send invoice + onboarding form', auto: false },
      { stage: 'Booked',    score: 90, action: 'Confirm start date + kickoff',   auto: false },
      { stage: 'Closed',    score: 100, action: 'Deliver system + gather proof', auto: false }
    ],
    scoringRules: [
      { trigger: 'Replied to first message',    points: +15 },
      { trigger: 'Opened link in message',      points: +10 },
      { trigger: 'Booked a call',               points: +25 },
      { trigger: 'No reply after 7 days',       points: -10 },
      { trigger: 'Unsubscribed',                points: -50 }
    ],
    tags: [niche, goal, profile.type, 'thesaassin-generated']
  };
}

/* ── OFFER DEFINITION GENERATOR ── */
function buildOfferDefinition({ name, niche, offer, goal, loc, profile }) {
  return {
    client:      name,
    service:     offer,
    audience:    profile.audience,
    coreOffer:   `${offer} for ${profile.audience}${loc ? ' in ' + loc : ''}`,
    outcome:     profile.outcomes[0],
    mechanism:   'Full done-for-you system: landing page + CRM + automation + outreach',
    timeframe:   '14 days to live',
    guarantee:   'If it\'s not live in 14 days, you don\'t pay',
    price:       goal === 'bookings' ? '£597/mo (Growth) or £247 one-off (Starter)' : '£97–£1,197 depending on scope',
    positioning: `"I don't build websites. I build systems that fill your calendar."`,
    pitch:       `${name} is a ${niche} business struggling with ${profile.painPoints[0].toLowerCase()}. We solve that in 14 days with a full system. Priced from £97.`
  };
}

/* ══════════════════════════════════
   CRM / LEADS
══════════════════════════════════ */
async function loadLeads() {
  try {
    const res  = await fetch(API + '/leads');
    const data = await res.json();
    renderLeads(data.leads || []);
  } catch { renderLeads([]); }
}

function renderLeads(leads) {
  const tbody = document.getElementById('leads-tbody');
  document.getElementById('stat-total').textContent     = leads.length;
  document.getElementById('stat-new').textContent       = leads.filter(l => l.status === 'new').length;
  document.getElementById('stat-contacted').textContent = leads.filter(l => l.status === 'contacted').length;
  document.getElementById('stat-closed').textContent    = leads.filter(l => l.status === 'closed').length;

  if (!leads.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted);font-size:.8rem">No leads yet — add your first one</td></tr>';
    return;
  }
  tbody.innerHTML = leads.map(l => {
    const score = Math.min(100, Math.max(0, l.score || 0));
    const statusBadge = {
      new:       '<span class="badge badge-new">new</span>',
      contacted: '<span class="badge badge-pending">contacted</span>',
      qualified: '<span class="badge badge-active">qualified</span>',
      closed:    '<span class="badge badge-active">closed</span>'
    }[l.status] || '<span class="badge">—</span>';
    const date = l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : '—';
    return `<tr>
      <td>${esc(l.name || '—')}</td>
      <td>${esc(l.business || '—')}</td>
      <td>${statusBadge}</td>
      <td>
        ${score}
        <div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div>
      </td>
      <td>${date}</td>
      <td>
        <select class="field select" style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:4px;padding:4px 8px;color:var(--text);font-size:.75rem;cursor:pointer"
                onchange="updateLeadStatus(${l.id}, this.value)">
          <option value="new"       ${l.status==='new'       ?'selected':''}>New</option>
          <option value="contacted" ${l.status==='contacted' ?'selected':''}>Contacted</option>
          <option value="qualified" ${l.status==='qualified' ?'selected':''}>Qualified</option>
          <option value="closed"    ${l.status==='closed'    ?'selected':''}>Closed</option>
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function updateLeadStatus(id, status) {
  try {
    await fetch(API + '/leads', { method: 'PATCH', body: JSON.stringify({ id, status }) });
    toast('Lead updated', 'ok');
    loadLeads();
  } catch { toast('Update failed', 'err'); }
}

/* ADD LEAD MODAL */
document.getElementById('btn-add-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'flex';
});
document.getElementById('btn-cancel-lead').addEventListener('click', () => {
  document.getElementById('modal-lead').style.display = 'none';
});
document.getElementById('btn-save-lead').addEventListener('click', async () => {
  const name = document.getElementById('lead-name').value.trim();
  if (!name) { toast('Name is required', 'err'); return; }
  const payload = {
    name,
    business: document.getElementById('lead-biz').value.trim(),
    status:   document.getElementById('lead-status').value,
    score:    parseInt(document.getElementById('lead-score').value) || 50
  };
  try {
    await fetch(API + '/leads', { method: 'POST', body: JSON.stringify(payload) });
    document.getElementById('modal-lead').style.display = 'none';
    ['lead-name','lead-biz'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('lead-score').value = 50;
    toast('Lead added', 'ok');
    loadLeads();
  } catch { toast('Could not add lead', 'err'); }
});

/* EXPORT CSV */
document.getElementById('btn-export-csv').addEventListener('click', async () => {
  try {
    const res   = await fetch(API + '/leads');
    const data  = await res.json();
    const leads = data.leads || [];
    if (!leads.length) { toast('No leads to export', 'err'); return; }
    const rows  = [['Name','Business','Status','Score','Added']];
    leads.forEach(l => rows.push([
      l.name || '', l.business || '', l.status || '', l.score || 0,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : ''
    ]));
    const csv  = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'thesaassin-leads.csv';
    a.click();
    toast('CSV exported', 'ok');
  } catch { toast('Export failed', 'err'); }
});

/* ══════════════════════════════════
   OUTREACH QUEUE
══════════════════════════════════ */
let currentOutreachTab = 'pending';

document.querySelectorAll('.out-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.out-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentOutreachTab = tab.dataset.status;
    loadOutreach();
  });
});

async function loadOutreach() {
  try {
    const res  = await fetch(API + '/outreach');
    const data = await res.json();
    renderOutreach(data.queue || []);
  } catch { renderOutreach([]); }
}

function renderOutreach(queue) {
  const list = document.getElementById('out-list');
  const counts = { pending: 0, approved: 0, sent: 0 };
  queue.forEach(q => { if (counts[q.status] !== undefined) counts[q.status]++; });
  document.getElementById('count-pending').textContent  = counts.pending;
  document.getElementById('count-approved').textContent = counts.approved;
  document.getElementById('count-sent').textContent     = counts.sent;

  const filtered = queue.filter(q => q.status === currentOutreachTab);
  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nothing here yet</p></div>';
    return;
  }
  list.innerHTML = filtered.map(q => `
    <div class="out-card">
      <div class="out-card-head">
        <div class="client-avatar" style="font-size:.72rem">${(q.clientName||'?').charAt(0).toUpperCase()}</div>
        <div class="out-card-name">${esc(q.clientName || 'Unknown')}</div>
        <span class="badge ${q.status==='pending'?'badge-new':q.status==='approved'?'badge-active':'badge-pending'}">${q.status}</span>
      </div>
      <div class="out-card-body">${esc(q.message || '')}</div>
      <div class="out-actions">
        ${q.status === 'pending'  ? `<button class="btn btn-success btn-sm" onclick="updateOutreach(${q.id},'approved')"><i class="fas fa-check"></i> Approve</button>` : ''}
        ${q.status === 'approved' ? `<button class="btn btn-primary btn-sm" onclick="showSendEmail(${q.id})"><i class="fas fa-envelope"></i> Send Email</button>` : ''}
        ${q.status === 'approved' ? `<button class="btn btn-secondary btn-sm" onclick="showSendSms(${q.id})"><i class="fas fa-mobile-screen"></i> Send SMS</button>` : ''}
        ${q.status === 'approved' ? `<button class="btn btn-secondary btn-sm" onclick="updateOutreach(${q.id},'sent')"><i class="fas fa-paper-plane"></i> Mark Sent</button>` : ''}
        ${q.status === 'pending'  ? `<button class="btn btn-danger btn-sm"  onclick="updateOutreach(${q.id},'sent')"><i class="fas fa-times"></i> Dismiss</button>` : ''}
      </div>
    </div>`).join('');
}

async function updateOutreach(id, status) {
  try {
    await fetch(API + '/outreach', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    toast('Outreach updated', 'ok');
    loadOutreach();
  } catch { toast('Update failed', 'err'); }
}

function showSendEmail(outreachId) {
  const to = prompt('Recipient email address:');
  if (!to || !to.includes('@')) { toast('Invalid email', 'err'); return; }
  const subject = prompt('Subject line:', 'Quick question for you') || 'Quick question for you';
  sendOutreachEmail(outreachId, to, subject);
}

async function sendOutreachEmail(outreachId, to, subject) {
  toast('Sending...', 'ok');
  try {
    const queue = (await (await fetch(API + '/outreach')).json()).queue || [];
    const item  = queue.find(q => q.id === outreachId);
    if (!item) { toast('Message not found', 'err'); return; }
    const res  = await fetch(API + '/send-outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, message: item.message, outreach_id: outreachId })
    });
    const data = await res.json();
    if (data.ok) { toast('Email sent!', 'ok'); loadOutreach(); }
    else toast(data.error || 'Send failed', 'err');
  } catch { toast('Send failed', 'err'); }
}

/* ── HELPERS ── */
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════════
   LEAD FEED
══════════════════════════════════ */

/* ── LEAD QUALITY FILTERS ── */
const REAL_INTENT = [
  'no clients','no customers','not getting clients','not getting leads',
  'no sales','no bookings','dead','nothing working','tried everything',
  'still not','can\'t get clients','cant get clients','zero clients',
  'struggling to find','can\'t find clients','no one is buying',
  'nothing is working','no enquiries','no response','nobody is',
  'how do i get','how can i get','need more clients','need clients',
  'any advice on getting','slow','quiet','dead month','any tips',
  'no work','where do i find','how to find clients','not working',
  'can\'t seem to','cant seem to','what am i doing wrong'
];

const BUYER_SIGNALS = [
  'clients','customers','leads','bookings','sales','revenue',
  'enquiries','appointments','contracts','jobs','business','freelance'
];

const BUSINESS_SIGNALS = [
  'business','freelance','self-employed','self employed','service','offer',
  'charge','rate','pricing','invoice','contract','client','customer',
  'revenue','income','money','pay','work','project'
];

const HARD_EXCLUDE = [
  'google ads','seo agency','hiring','looking for a job','job posting',
  'career advice','agency advice','employee','salary','interview',
  'apply for','resume','cv','job offer','therapist','therapy','mental health',
  'anxiety','depression','just got hired','got a job','i got a client',
  'landed a client','just closed','i closed','signed a client','won a client',
  'sharing my journey','my story','how i went from','here\'s what worked',
  'i made it','6 figures','i earn','passive income','dropship','amazon fba',
  'print on demand','crypto','nft','affiliate'
];

function hasBusinessContext(t) {
  return BUSINESS_SIGNALS.some(k => t.includes(k));
}

// Softer intent phrases — still relevant, just less explicit pain
const SOFT_INTENT = [
  'how do i','how can i','any advice','struggling','not getting',
  'need help','what should i do','why am i not','anyone else',
  'how to get','help me','where do i','getting nowhere',
  'slow month','quiet period','any tips','looking for clients',
  'find clients','get customers','grow my','build my client',
  'generate leads','attract clients','market my','promote my'
];

function scorePost(title, text, isComment = false) {
  const raw = (title + ' ' + text).toLowerCase();

  // Hard excludes — return 0 immediately
  if (HARD_EXCLUDE.some(k => raw.includes(k))) return 0;

  // Must have business context (comments are already business-context-adjacent)
  if (!isComment && !hasBusinessContext(raw)) return 0;

  let score = 0;
  const hasBuyer = BUYER_SIGNALS.some(k => raw.includes(k));

  // Strong pain signal — high confidence lead (passes alone)
  if (REAL_INTENT.some(k => raw.includes(k))) {
    score += 50;
  } else if (SOFT_INTENT.some(k => raw.includes(k)) && hasBuyer) {
    // Softer intent only counts when combined with a specific buyer keyword
    score += 25;
  } else {
    return 0; // no clear intent + buyer combo → not a lead
  }

  // Buyer context bonus (on top of base)
  if (hasBuyer) score += 20;

  // Active question
  if (title.includes('?') || raw.includes('?')) score += 20;

  // Urgency
  if (/now|today|this week|this month|currently|right now/.test(raw)) score += 10;
  if (/desperate|urgent|asap|really struggling|at a loss|nothing works/.test(raw)) score += 15;

  return Math.max(0, Math.min(score, 100));
}

/* ── ANALYSIS ENGINE ── */
function analyzePost(title, text, preScore) {
  const t = (title + ' ' + text).toLowerCase();
  const urgency = preScore !== undefined ? preScore : scorePost(title, text);

  // Niche detection
  const niche = /plumb|pipe|boiler|heating|gas safe/.test(t)       ? 'Plumber'
    : /electrician|wiring|fuse|eicr|niceic/.test(t)                ? 'Electrician'
    : /builder|construction|renovation|extension|loft/.test(t)     ? 'Builder'
    : /pt |personal train|fitness coach|gym|fat loss|body/.test(t) ? 'PT / Fitness'
    : /consultant|freelanc|strateg|advisor|coach|mentor/.test(t)   ? 'Consultant'
    : /marketing|agency|seo|ads|social media|lead gen/.test(t)     ? 'Marketing Agency'
    : /saas|software|app |platform|startup|founder/.test(t)        ? 'SaaS / Tech'
    : 'Business Owner';

  // Approach
  const approach = urgency >= 70 ? 'Direct offer — they need help now, lead with a result'
    : urgency >= 40              ? 'Empathy first — acknowledge the problem, then offer'
    :                              'Question first — qualify before pitching';

  // Opener
  const opener = urgency >= 70
    ? `Saw your post — I help ${niche.toLowerCase()} businesses fix exactly this. Built a quick preview for you. Worth a 15-min look?`
    : `Saw this and it resonated — most ${niche.toLowerCase()} businesses I work with hit the same wall. Happy to show you what changed for them?`;

  // Tip
  const tip = urgency >= 70 ? 'Message within the hour — high-intent window closes fast'
    : urgency >= 40          ? 'Start with empathy, not a pitch — ask one question first'
    :                          'Low signal — qualify harder before investing time here';

  const urgencyLabel = urgency >= 70 ? 'High' : urgency >= 40 ? 'Medium' : 'Low';
  const urgencyColor = urgency >= 70 ? '#22c55e' : urgency >= 40 ? '#f59e0b' : '#8888a0';

  return { urgency, urgencyLabel, urgencyColor, niche, approach, opener, tip };
}

/* ── KEYWORD PILLS ── */
let activeFeedKw       = 'need clients';
let activeFeedPlatform = 'reddit';

document.querySelectorAll('.kw-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.kw-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFeedKw = btn.dataset.kw;
  });
});

/* ── PLATFORM TABS ── */
document.querySelectorAll('.feed-ptab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.feed-ptab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFeedPlatform = tab.dataset.platform;
  });
});

document.getElementById('btn-feed-refresh').addEventListener('click', () => {
  const custom = document.getElementById('feed-custom-kw').value.trim();
  const kw = custom || activeFeedKw;
  if (activeFeedPlatform === 'twitter')  fetchFeedX(kw);
  else if (activeFeedPlatform === 'linkedin') fetchFeedLinkedIn(kw);
  else fetchFeed(kw);
});

/* ── FETCH + RENDER ── */
async function fetchFeed(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning Reddit for leads...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed?q=' + encodeURIComponent(keyword));
    const data = await res.json();
    if (!data.ok || !data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-inbox"></i><p>No posts found — try a different keyword</p></div>';
      return;
    }

    // Whitelist — only accept posts from target business subs
    const TARGET_SUBS = new Set([
      'smallbusiness','entrepreneur','sidehustle','freelance','sales',
      'startups','sweatystartup','entrepreneurridealong','forhire',
      'entrepreneur_ride_along','businessowners','growmybusiness',
      'digital_marketing','marketinghelp','agency'
    ]);
    const businessPosts = data.posts.filter(p => TARGET_SUBS.has(p.subreddit.toLowerCase()));

    // Score posts
    const scoredPosts = businessPosts
      .map(p => ({ ...p, _score: scorePost(p.title, p.text), _source: 'post' }))
      .filter(p => p._score >= 40);

    // Extract high-signal comments as additional lead candidates
    const commentLeads = [];
    for (const post of businessPosts) {
      if (!post.comments || !post.comments.length) continue;
      for (const comment of post.comments) {
        const cs = scorePost('', comment, true);
        if (cs >= 40) {
          commentLeads.push({
            id:        post.id + '_c' + commentLeads.length,
            title:     post.title,
            text:      comment,
            author:    post.author,
            subreddit: post.subreddit,
            url:       post.url,
            permalink: post.permalink,
            created:   post.created,
            score:     post.score,
            platform:  'reddit',
            _score:    cs,
            _source:   'comment'
          });
        }
      }
    }

    // Merge, deduplicate by post id (keep highest scorer), sort desc
    const seen = new Set();
    const allLeads = [...scoredPosts, ...commentLeads]
      .sort((a, b) => b._score - a._score)
      .filter(l => {
        const key = l.id.split('_c')[0];
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (!allLeads.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-filter"></i><p>No high-intent leads in this batch — try "no clients" or "need more bookings"</p></div>';
      meta.textContent = `${data.posts.length} posts fetched · ${businessPosts.length} from target subs · 0 passed quality filter`;
      return;
    }

    const commentCount = allLeads.filter(l => l._source === 'comment').length;
    meta.textContent = `${allLeads.length} quality leads · ${businessPosts.length}/${data.posts.length} from target subs${commentCount ? ` · ${commentCount} from comments` : ''} · "${keyword}"`;
    grid.innerHTML = allLeads.map(p => renderFeedCard(p)).join('');
  } catch (e) {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>Could not fetch — check server is running</p></div>';
  }
}

function timeAgo(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc;
  if (diff < 3600)   return Math.floor(diff/60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function renderFeedCard(post) {
  const isComment = post._source === 'comment';
  const a   = analyzePost(post.title, post.text, post._score);
  const ago = timeAgo(post.created);
  const fillW = Math.max(4, a.urgency);
  const sourceTag = isComment
    ? `<span style="font-size:.65rem;background:rgba(255,42,42,.15);color:var(--accent);padding:2px 6px;border-radius:4px;margin-left:4px">comment</span>`
    : '';

  return `<div class="feed-card" id="fc-${esc(post.id)}">
    <div class="feed-card-top">
      <span class="feed-platform">r/${esc(post.subreddit)}</span>
      <span class="feed-title">${esc(post.title)}${sourceTag}</span>
      <span class="feed-time">${ago}</span>
    </div>
    ${post.text && post.text !== post.title ? `<div class="feed-snippet">${isComment ? '<i class="fas fa-comment" style="color:var(--accent);margin-right:4px;font-size:.7rem"></i>' : ''}${esc(post.text)}</div>` : ''}
    <div class="feed-analysis">
      <div class="feed-analysis-row">
        <span class="analysis-label">Urgency</span>
        <div class="urgency-bar"><div class="urgency-fill" style="width:${fillW}%;background:${a.urgencyColor}"></div></div>
        <span class="analysis-val" style="color:${a.urgencyColor};font-weight:700">${a.urgencyLabel} (${a.urgency})</span>
      </div>
      <div class="feed-analysis-row">
        <span class="analysis-label">Niche</span>
        <span class="analysis-val">${esc(a.niche)}</span>
      </div>
      <div class="feed-analysis-row">
        <span class="analysis-label">Approach</span>
        <span class="analysis-val">${esc(a.approach)}</span>
      </div>
      <div class="feed-tip">💡 ${esc(a.tip)}</div>
    </div>
    <div class="feed-analysis" style="margin-top:-4px;border-color:rgba(255,42,42,.15)">
      <div class="feed-analysis-row" style="align-items:flex-start">
        <span class="analysis-label" style="color:var(--accent)">Opener</span>
        <span class="analysis-val" style="font-style:italic;color:var(--text)">"${esc(a.opener)}"</span>
      </div>
    </div>
    <div class="feed-actions">
      <button class="btn btn-secondary btn-sm" onclick="saveFeedLead('${esc(post.id)}','${esc(post.author)}','${esc(a.niche)}','${esc(post.url)}','${esc(post.title).replace(/'/g,'')}',${a.urgency})">
        <i class="fas fa-user-plus"></i> Save Lead
      </button>
      <button class="btn btn-secondary btn-sm" id="ai-btn-${esc(post.id)}" onclick="aiScorePost('${esc(post.id)}','${esc(post.title).replace(/'/g,'')}','${esc(post.text).replace(/'/g,'').substring(0,300)}')">
        <i class="fas fa-brain"></i> AI Score
      </button>
      <button class="btn btn-secondary btn-sm" id="email-btn-${esc(post.id)}" onclick="findEmail('${esc(post.id)}','${esc(post.author)}','')">
        <i class="fas fa-at"></i> Find Email
      </button>
      <a class="btn btn-secondary btn-sm" href="${esc(post.url)}" target="_blank" rel="noopener">
        <i class="fas fa-arrow-up-right-from-square"></i> Open Post
      </a>
    </div>
    <div id="ai-result-${esc(post.id)}" style="display:none;margin-top:8px;padding:10px 12px;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.2);border-radius:8px;font-size:.78rem;color:var(--text)"></div>
  </div>`;
}

async function aiScorePost(postId, title, text) {
  const btn    = document.getElementById('ai-btn-' + postId);
  const result = document.getElementById('ai-result-' + postId);
  if (!btn || !result) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Scoring...';
  try {
    const res  = await fetch(API + '/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text })
    });
    const data = await res.json();
    if (data.ok) {
      const color = data.score >= 70 ? '#22c55e' : data.score >= 40 ? '#f59e0b' : '#8888a0';
      result.style.display = 'block';
      result.innerHTML = `<b style="color:${color}">Claude Score: ${data.score}/100</b> · <i>${data.intent}</i><br><span style="color:var(--muted)">${data.reason}</span>${data.suggested_opener ? `<br><span style="color:var(--accent);margin-top:4px;display:block">💬 "${data.suggested_opener}"</span>` : ''}`;
      btn.innerHTML = '<i class="fas fa-check"></i> Scored';
    } else {
      btn.innerHTML = '<i class="fas fa-brain"></i> AI Score';
      btn.disabled = false;
      toast(data.error || 'Score failed — check ANTHROPIC_API_KEY', 'err');
    }
  } catch {
    btn.innerHTML = '<i class="fas fa-brain"></i> AI Score';
    btn.disabled = false;
    toast('AI scoring failed', 'err');
  }
}

async function saveFeedLead(id, author, niche, url, title, score) {
  try {
    await fetch(API + '/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:     'u/' + author,
        business: niche + ' (Reddit)',
        status:   'new',
        score:    score,
        url:      url,
        title:    title,
        platform: 'reddit'
      })
    });
    // Visual feedback — grey out the saved card
    const card = document.getElementById('fc-' + id);
    if (card) {
      card.style.opacity = '0.45';
      card.style.pointerEvents = 'none';
      const btn = card.querySelector('.btn');
      if (btn) btn.innerHTML = '<i class="fas fa-check"></i> Saved';
    }
    toast('Lead saved to CRM', 'ok');
  } catch { toast('Could not save lead', 'err'); }
}

/* ══════════════════════════════════
   API STATUS CHECKER
══════════════════════════════════ */
async function checkApiStatus() {
  try {
    const res  = await fetch(API + '/status');
    const data = await res.json();
    if (!data.ok) return;
    const s = data.services;
    const bar = document.getElementById('api-status-bar');
    if (!bar) return;
    const items = [
      { key: 'supabase',  label: 'DB',       icon: 'fa-database' },
      { key: 'claude',    label: 'AI',        icon: 'fa-brain' },
      { key: 'resend',    label: 'Email',     icon: 'fa-envelope' },
      { key: 'hunter',    label: 'Hunter',    icon: 'fa-magnifying-glass' },
      { key: 'twilio',    label: 'SMS',       icon: 'fa-mobile-screen' },
      { key: 'twitter',   label: 'X/Twitter', icon: 'fa-x-twitter' }
    ];
    bar.innerHTML = items.map(i =>
      `<span class="api-dot ${s[i.key] ? 'api-on' : 'api-off'}" title="${i.label}: ${s[i.key] ? 'connected' : 'key missing'}">
        <i class="fas ${i.icon}"></i> ${i.label}
      </span>`
    ).join('');
  } catch { /* silent */ }
}

/* ── X/Twitter Feed ── */
async function fetchFeedX(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning X/Twitter for leads...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed-x?q=' + encodeURIComponent(keyword));
    const data = await res.json();
    if (!data.ok) {
      grid.innerHTML = `<div class="feed-empty"><i class="fas fa-x-twitter"></i><p>${esc(data.error || 'Twitter unavailable')}</p>${data.hint ? `<p style="font-size:.7rem;opacity:.5">${esc(data.hint)}</p>` : ''}</div>`;
      return;
    }
    if (!data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fas fa-x-twitter"></i><p>No matching posts — try a different keyword</p></div>';
      return;
    }
    meta.textContent = `${data.posts.length} posts from X/Twitter · "${keyword}"`;
    grid.innerHTML = data.posts.map(p => renderFeedCard(p)).join('');
  } catch {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>X/Twitter fetch failed</p></div>';
  }
}

/* ── LinkedIn Dork Feed ── */
async function fetchFeedLinkedIn(keyword) {
  const grid = document.getElementById('feed-grid');
  const meta = document.getElementById('feed-meta');
  const niche = document.getElementById('feed-custom-kw')?.value?.trim() || '';
  grid.innerHTML = '<div class="feed-loading"><i class="fas fa-circle-notch"></i>Scanning LinkedIn via Google...</div>';
  meta.textContent = '';
  try {
    const res  = await fetch(API + '/feed-linkedin?q=' + encodeURIComponent(keyword) + '&niche=' + encodeURIComponent(niche));
    const data = await res.json();
    if (!data.ok) {
      grid.innerHTML = `<div class="feed-empty"><i class="fab fa-linkedin"></i><p>${esc(data.error || 'LinkedIn search unavailable')}</p>${data.hint ? `<p style="font-size:.7rem;opacity:.5">${esc(data.hint)}</p>` : ''}</div>`;
      return;
    }
    if (!data.posts.length) {
      grid.innerHTML = '<div class="feed-empty"><i class="fab fa-linkedin"></i><p>No LinkedIn posts found — try different keywords</p></div>';
      return;
    }
    meta.textContent = `${data.posts.length} LinkedIn posts found · "${keyword}"`;
    grid.innerHTML = data.posts.map(p => renderFeedCard(p)).join('');
  } catch {
    grid.innerHTML = '<div class="feed-empty"><i class="fas fa-triangle-exclamation"></i><p>LinkedIn search failed</p></div>';
  }
}

/* ── Find Email (Hunter.io) ── */
async function findEmail(postId, authorName, domain) {
  const btn = document.getElementById('email-btn-' + postId);
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  try {
    const name   = authorName.replace(/^u\//, '').replace(/_/g, ' ');
    const d      = domain || prompt('Enter their website domain (e.g. plumbingco.co.uk):');
    if (!d) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-at"></i> Find Email'; return; }
    const res    = await fetch(API + '/find-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, domain: d })
    });
    const data = await res.json();
    if (data.ok && data.email) {
      btn.innerHTML = `<i class="fas fa-check"></i> ${esc(data.email)}`;
      btn.style.color = 'var(--success)';
      btn.onclick = () => navigator.clipboard.writeText(data.email).then(() => toast('Email copied', 'ok'));
      toast('Email found: ' + data.email, 'ok');
    } else if (data.ok && data.emails?.length) {
      const e = data.emails[0].email;
      btn.innerHTML = `<i class="fas fa-check"></i> ${esc(e)}`;
      btn.style.color = 'var(--success)';
      btn.onclick = () => navigator.clipboard.writeText(e).then(() => toast('Email copied', 'ok'));
      toast('Email found: ' + e, 'ok');
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-at"></i> Find Email';
      toast(data.error || 'No email found', 'err');
    }
  } catch {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-at"></i> Find Email';
    toast('Email lookup failed', 'err');
  }
}

/* ── Send SMS (Twilio) ── */
function showSendSms(outreachId) {
  const to = prompt('Mobile number (e.g. 07700900000 or +447700900000):');
  if (!to) return;
  sendSms(outreachId, to);
}

async function sendSms(outreachId, to) {
  toast('Sending SMS...', 'ok');
  try {
    const queue = (await (await fetch(API + '/outreach')).json()).queue || [];
    const item  = queue.find(q => q.id === outreachId);
    if (!item) { toast('Message not found', 'err'); return; }
    const res  = await fetch(API + '/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message: item.message, outreach_id: outreachId })
    });
    const data = await res.json();
    if (data.ok) { toast('SMS sent!', 'ok'); loadOutreach(); }
    else toast(data.error || 'SMS failed — check Twilio config', 'err');
  } catch { toast('SMS send failed', 'err'); }
}

/* ── INIT ── */
loadClients();
checkApiStatus();
