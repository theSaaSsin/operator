/* ════════════════════════════════════════════
   STUDIO CANVAS (beta) — TheSaaSsin Operator
   Infinite canvas + timeline + beat detection
   + 3D perspective + GSAP keyframe animation.
══════════════════════════════════════════════ */
(function () {
  if (window.__studioCanvasInit) return;
  window.__studioCanvasInit = true;

  const STATE_KEY = 'tss_studio_canvas_v2';

  // ── State ──────────────────────────────────
  const state = {
    pan: { x: 0, y: 0 },
    zoom: 1,
    layers: [],         // {id, type, x, y, z, w, h, rot, src, text, fontSize, color, weight, italic, align, filter, kfs:[]}
    selected: null,
    timeline: { dur: 12, time: 0, playing: false, beats: [], audioBuf: null, audioSrc: null },
    background: {       // v2 — canvas background controls
      type: 'grid',     // solid | gradient | grid | dots | noise | image
      color1: '#0a0a0f',
      color2: '#1a1a22',
      imageSrc: null,
      gridColor: 'rgba(255,255,255,0.025)',
      gridSize: 40
    },
    nextId: 1
  };

  // ── Glow + FX palette (v2) ─────────────────
  const GLOW_PALETTE = [
    { name: 'None',    fx: '',                                           swatch: 'transparent' },
    { name: 'Blur',    fx: 'blur(8px)',                                  swatch: '#888' },
    { name: 'Mono',    fx: 'grayscale(1) contrast(1.1)',                 swatch: '#aaa' },
    { name: 'Crush',   fx: 'brightness(0.5) contrast(1.4)',              swatch: '#222' },
    { name: 'Filmic',  fx: 'saturate(0.4) brightness(.85)',              swatch: '#5a5440' },
    { name: 'Red',     fx: 'drop-shadow(0 0 24px rgba(255,42,42,0.7))',  swatch: '#ff2a2a' },
    { name: 'Cyan',    fx: 'drop-shadow(0 0 24px rgba(0,229,255,0.7))',  swatch: '#00e5ff' },
    { name: 'Amber',   fx: 'drop-shadow(0 0 24px rgba(255,180,0,0.7))',  swatch: '#ffb400' },
    { name: 'Purple',  fx: 'drop-shadow(0 0 24px rgba(168,85,247,0.7))', swatch: '#a855f7' },
    { name: 'Green',   fx: 'drop-shadow(0 0 24px rgba(34,197,94,0.7))',  swatch: '#22c55e' },
    { name: 'Blue',    fx: 'drop-shadow(0 0 24px rgba(59,130,246,0.7))', swatch: '#3b82f6' },
    { name: 'White',   fx: 'drop-shadow(0 0 24px rgba(240,240,245,0.8))', swatch: '#f0f0f5' },
    { name: 'Orange',  fx: 'drop-shadow(0 0 24px rgba(255,107,42,0.7))', swatch: '#ff6b2a' },
    { name: 'Pink',    fx: 'drop-shadow(0 0 24px rgba(236,72,153,0.7))', swatch: '#ec4899' },
    { name: 'Teal',    fx: 'drop-shadow(0 0 24px rgba(20,184,166,0.7))', swatch: '#14b8a6' },
    { name: 'Multi',   fx: 'drop-shadow(0 0 18px rgba(255,42,42,0.6)) drop-shadow(0 0 18px rgba(0,229,255,0.5))', swatch: 'linear-gradient(135deg,#ff2a2a,#00e5ff)' }
  ];

  const BG_PRESETS = [
    { id: 'grid',     label: 'Grid',     gen: (c1, c2) => `${c1};background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:40px 40px` },
    { id: 'dots',     label: 'Dots',     gen: (c1, c2) => `${c1};background-image:radial-gradient(rgba(255,255,255,0.08) 1.2px,transparent 1.2px);background-size:30px 30px` },
    { id: 'solid',    label: 'Solid',    gen: (c1, c2) => `${c1}` },
    { id: 'gradient', label: 'Gradient', gen: (c1, c2) => `linear-gradient(135deg,${c1} 0%,${c2} 100%)` },
    { id: 'radial',   label: 'Radial',   gen: (c1, c2) => `radial-gradient(circle at 50% 50%,${c2} 0%,${c1} 70%)` },
    { id: 'noise',    label: 'Noise',    gen: (c1, c2) => `${c1};background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")` },
    { id: 'lines',    label: 'Lines',    gen: (c1, c2) => `${c1};background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.025) 20px,rgba(255,255,255,0.025) 21px)` }
  ];

  // ── Persistence ────────────────────────────
  function save() {
    try {
      const snap = {
        layers: state.layers,
        timeline: { dur: state.timeline.dur, beats: state.timeline.beats, audioSrc: state.timeline.audioSrc },
        background: state.background
      };
      localStorage.setItem(STATE_KEY, JSON.stringify(snap));
    } catch (e) { /* ignore */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (snap.layers) {
        state.layers = snap.layers;
        state.nextId = Math.max(0, ...state.layers.map(l => l.id || 0)) + 1;
      }
      if (snap.timeline) {
        state.timeline.dur = snap.timeline.dur || 12;
        state.timeline.beats = snap.timeline.beats || [];
        state.timeline.audioSrc = snap.timeline.audioSrc || null;
      }
      if (snap.background) {
        Object.assign(state.background, snap.background);
      }
    } catch (e) { /* ignore */ }
  }

  // ── Apply canvas background (v2) ──────────
  function applyBackground() {
    if (!canvasEl) return;
    const bg = state.background;
    if (bg.type === 'image' && bg.imageSrc) {
      canvasEl.style.background = `url(${bg.imageSrc}) center/cover no-repeat, ${bg.color1}`;
      canvasEl.style.backgroundImage = `url(${bg.imageSrc})`;
      canvasEl.style.backgroundSize = 'cover';
      return;
    }
    const preset = BG_PRESETS.find(p => p.id === bg.type) || BG_PRESETS[0];
    const css = preset.gen(bg.color1, bg.color2);
    if (css.includes('background-image')) {
      const [bgCol, bgImg] = css.split(';background-image:');
      canvasEl.style.background = bgCol.startsWith('linear') || bgCol.startsWith('radial') ? bgCol : bgCol;
      canvasEl.style.backgroundImage = bgImg;
      canvasEl.style.backgroundSize = '';
    } else {
      canvasEl.style.background = css;
      canvasEl.style.backgroundImage = '';
    }
  }

  // ── DOM refs (set in init) ────────────────
  let canvasEl, worldEl, layerListEl, propsEl, timelineEl, playheadEl, beatTrackEl, audioEl, timeReadoutEl, audioCtx;

  // ── Render world (layers in 3D space) ─────
  function renderWorld() {
    if (!worldEl) return;
    const z = state.zoom;
    worldEl.style.transform = `translate(${state.pan.x}px, ${state.pan.y}px) scale(${z})`;
    worldEl.innerHTML = '';
    state.layers.forEach(layer => {
      const el = document.createElement('div');
      el.className = 'sc-layer' + (state.selected === layer.id ? ' sc-selected' : '');
      el.dataset.id = layer.id;
      el.style.left = layer.x + 'px';
      el.style.top  = layer.y + 'px';
      el.style.width  = layer.w + 'px';
      el.style.height = layer.h + 'px';
      el.style.transform = `translateZ(${layer.z || 0}px) rotate(${layer.rot || 0}deg)`;
      if (layer.filter) el.style.filter = layer.filter;
      if (layer.opacity != null) el.style.opacity = layer.opacity;

      if (layer.type === 'image') {
        el.innerHTML = `<img src="${layer.src}" draggable="false" style="width:100%;height:100%;object-fit:cover;">`;
      } else if (layer.type === 'video') {
        el.innerHTML = `<video src="${layer.src}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"></video>`;
      } else if (layer.type === 'text' || layer.type === 'kanji') {
        const c = layer.color || (layer.type === 'kanji' ? '#ff2a2a' : '#f0f0f5');
        const fs = layer.fontSize || (layer.type === 'kanji' ? 120 : 36);
        const weight = layer.weight || (layer.type === 'kanji' ? 900 : 800);
        const italic = layer.italic ? 'italic' : 'normal';
        const align = layer.align || 'center';
        const flex = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
        const ls = layer.type === 'kanji' ? '-.04em' : '-.02em';
        const defaultText = layer.type === 'kanji' ? '暗殺' : '';
        el.innerHTML = `<div class="sc-text-content" data-layer-id="${layer.id}" style="width:100%;height:100%;display:flex;align-items:center;justify-content:${flex};font-size:${fs}px;font-weight:${weight};font-style:${italic};color:${c};text-align:${align};line-height:1.1;letter-spacing:${ls};padding:6px;outline:none;">${escapeHtml(layer.text || defaultText)}</div>`;
      }
      worldEl.appendChild(el);
    });
    renderLayerList();
  }

  function renderLayerList() {
    if (!layerListEl) return;
    if (!state.layers.length) {
      layerListEl.innerHTML = '<div class="sc-empty">No layers yet — add an image, video, text, or kanji from the toolbar.</div>';
      return;
    }
    layerListEl.innerHTML = state.layers.slice().reverse().map(l => {
      const sel = state.selected === l.id ? ' sc-layer-row-sel' : '';
      const icon = l.type === 'image' ? 'fa-image' : l.type === 'video' ? 'fa-film' : l.type === 'kanji' ? 'fa-bolt' : 'fa-font';
      const label = l.type === 'text' || l.type === 'kanji' ? (l.text || '').slice(0,20) : (l.src || '').split('/').pop().slice(0,22);
      return `<div class="sc-layer-row${sel}" data-id="${l.id}">
        <i class="fas ${icon}"></i>
        <span class="sc-layer-label">${escapeHtml(label || l.type)}</span>
        <span class="sc-layer-z">z${l.z||0}</span>
        <button class="sc-mini-btn" data-action="dup" data-id="${l.id}" title="Duplicate"><i class="fas fa-clone"></i></button>
        <button class="sc-mini-btn" data-action="up"  data-id="${l.id}" title="Bring forward"><i class="fas fa-arrow-up"></i></button>
        <button class="sc-mini-btn" data-action="del" data-id="${l.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </div>`;
    }).join('');
  }

  function backgroundSection() {
    const bg = state.background;
    return `
      <div class="sc-bg-section">
        <div class="sc-section-title">CANVAS BACKGROUND</div>
        <div class="sc-bg-presets">
          ${BG_PRESETS.map(p => `<button class="sc-bg-btn${bg.type === p.id ? ' sc-bg-btn-on' : ''}" data-bg-type="${p.id}">${p.label}</button>`).join('')}
          <button class="sc-bg-btn${bg.type === 'image' ? ' sc-bg-btn-on' : ''}" data-bg-type="image"><i class="fas fa-image"></i> Image</button>
        </div>
        <div class="sc-props-grid" style="margin-top:8px">
          <label>Colour 1<input type="color" data-bg-prop="color1" value="${bg.color1}"></label>
          <label>Colour 2<input type="color" data-bg-prop="color2" value="${bg.color2}"></label>
        </div>
        ${bg.imageSrc ? `<button class="sc-bg-btn" data-bg-action="clear-image" style="width:100%;margin-top:8px"><i class="fas fa-times"></i> Clear background image</button>` : ''}
      </div>
    `;
  }

  function renderProps() {
    if (!propsEl) return;
    const layer = state.layers.find(l => l.id === state.selected);
    if (!layer) {
      propsEl.innerHTML = backgroundSection() + '<div class="sc-empty" style="padding-top:14px">Select a layer to edit its properties + keyframes.</div>';
      return;
    }
    propsEl.innerHTML = backgroundSection() + `
      <div class="sc-section-title" style="margin-top:14px">LAYER PROPERTIES</div>`;
    propsEl.innerHTML += `
      <div class="sc-props-grid">
        <label>X<input type="number" data-prop="x" value="${layer.x}"></label>
        <label>Y<input type="number" data-prop="y" value="${layer.y}"></label>
        <label>Z (depth)<input type="number" data-prop="z" value="${layer.z||0}"></label>
        <label>W<input type="number" data-prop="w" value="${layer.w}"></label>
        <label>H<input type="number" data-prop="h" value="${layer.h}"></label>
        <label>Rot°<input type="number" data-prop="rot" value="${layer.rot||0}"></label>
        <label>Opacity<input type="number" step="0.1" min="0" max="1" data-prop="opacity" value="${layer.opacity ?? 1}"></label>
      </div>
      ${layer.type === 'text' || layer.type === 'kanji' ? `
        <label class="sc-full">Text<input type="text" data-prop="text" value="${escapeHtml(layer.text || '')}"></label>
        <div class="sc-props-grid">
          <label>Font px<input type="number" data-prop="fontSize" value="${layer.fontSize||36}"></label>
          <label>Weight<select data-prop="weight">${[300,400,500,600,700,800,900].map(w => `<option value="${w}"${(layer.weight||(layer.type==='kanji'?900:800))===w?' selected':''}>${w}</option>`).join('')}</select></label>
          <label>Color<input type="color" data-prop="color" value="${layer.color||(layer.type==='kanji'?'#ff2a2a':'#f0f0f5')}"></label>
          <label>Italic<select data-prop="italic"><option value="">Normal</option><option value="1"${layer.italic?' selected':''}>Italic</option></select></label>
          <label class="sc-full">Align
            <div class="sc-align-row">
              <button class="sc-align-btn${(layer.align||'center')==='left'?' sc-align-btn-on':''}" data-prop="align" data-val="left"><i class="fas fa-align-left"></i></button>
              <button class="sc-align-btn${(layer.align||'center')==='center'?' sc-align-btn-on':''}" data-prop="align" data-val="center"><i class="fas fa-align-center"></i></button>
              <button class="sc-align-btn${(layer.align||'center')==='right'?' sc-align-btn-on':''}" data-prop="align" data-val="right"><i class="fas fa-align-right"></i></button>
            </div>
          </label>
        </div>
      ` : ''}
      <div class="sc-fx">
        <span class="sc-fx-label">GLOW + EFFECTS</span>
        ${GLOW_PALETTE.map(g => `
          <button class="sc-fx-btn${(layer.filter||'') === g.fx ? ' sc-fx-btn-on' : ''}" data-fx="${g.fx}" title="${g.name}">
            <span class="sc-fx-swatch" style="background:${g.swatch}"></span>${g.name}
          </button>`).join('')}
        <label class="sc-fx-custom" title="Custom glow color">
          <span class="sc-fx-label" style="margin:0">CUSTOM</span>
          <input type="color" data-prop="customGlow" value="${layer.customGlow || '#ff2a2a'}" style="width:32px;height:24px;border:none;background:transparent;cursor:pointer;">
        </label>
      </div>
      <div class="sc-kf-bar">
        <div class="sc-kf-label">KEYFRAMES @ ${state.timeline.time.toFixed(2)}s</div>
        <button class="sc-mini-btn sc-kf-add" data-action="kf-add"><i class="fas fa-plus"></i> ADD KF</button>
        <button class="sc-mini-btn sc-kf-snap" data-action="kf-snap" title="Add KF at nearest beat"><i class="fas fa-bolt"></i> SNAP TO BEAT</button>
      </div>
      <div class="sc-kf-list">${(layer.kfs||[]).map((kf, i) => `
        <div class="sc-kf-row"><span>${kf.t.toFixed(2)}s</span><span class="sc-kf-vals">x:${kf.x} y:${kf.y} z:${kf.z||0} rot:${kf.rot||0}° op:${kf.opacity ?? 1}</span><button class="sc-mini-btn" data-action="kf-del" data-i="${i}"><i class="fas fa-trash"></i></button></div>
      `).join('') || '<div class="sc-empty">No keyframes — set the playhead, change properties, click ADD KF.</div>'}</div>
    `;
  }

  function renderTimeline() {
    if (!playheadEl || !beatTrackEl || !timeReadoutEl) return;
    const w = timelineEl.offsetWidth;
    playheadEl.style.left = (state.timeline.time / state.timeline.dur * w) + 'px';
    timeReadoutEl.textContent = `${state.timeline.time.toFixed(2)} / ${state.timeline.dur.toFixed(1)}s` + (state.timeline.beats.length ? ` · ${state.timeline.beats.length} beats` : '');
    beatTrackEl.innerHTML = state.timeline.beats.map(b => {
      const left = (b / state.timeline.dur * w) + 'px';
      return `<div class="sc-beat" style="left:${left}"></div>`;
    }).join('') + (state.selected ? (state.layers.find(l => l.id === state.selected)?.kfs || []).map(kf => `<div class="sc-kf-mark" style="left:${(kf.t / state.timeline.dur * w)}px" title="${kf.t.toFixed(2)}s"></div>`).join('') : '');
  }

  // ── Layer creation ────────────────────────
  function addLayer(type, opts = {}) {
    const layer = Object.assign({
      id: state.nextId++,
      type,
      x: -opts.w/2 + window.innerWidth*0.4,
      y: -opts.h/2 + 200,
      z: 0, w: opts.w || 320, h: opts.h || 180, rot: 0, opacity: 1, kfs: []
    }, opts);
    state.layers.push(layer);
    state.selected = layer.id;
    save(); renderWorld(); renderProps(); renderTimeline();
  }

  // ── File import ───────────────────────────
  function importFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const w = Math.min(480, img.width);
          const h = w / img.width * img.height;
          addLayer('image', { src: dataUrl, w, h });
        };
        img.src = dataUrl;
      } else if (file.type.startsWith('video/')) {
        addLayer('video', { src: dataUrl, w: 480, h: 270 });
      } else if (file.type.startsWith('audio/')) {
        importAudio(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Audio + beat detection ────────────────
  async function importAudio(dataUrl) {
    state.timeline.audioSrc = dataUrl;
    if (audioEl) {
      audioEl.src = dataUrl;
      audioEl.load();
    }
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const res = await fetch(dataUrl);
      const arr = await res.arrayBuffer();
      const buf = await audioCtx.decodeAudioData(arr);
      state.timeline.audioBuf = buf;
      state.timeline.dur = Math.max(state.timeline.dur, buf.duration);
      detectBeats(buf);
      save(); renderTimeline();
      toast('Audio imported · ' + state.timeline.beats.length + ' beats', 'ok');
    } catch (e) {
      toast('Audio decode failed: ' + e.message, 'err');
    }
  }

  function detectBeats(buf) {
    // Energy-based onset detection: compute RMS over 1024-sample windows
    // on channel 0, then peak-pick where RMS exceeds local-mean * threshold.
    const data = buf.getChannelData(0);
    const sampleRate = buf.sampleRate;
    const win = 1024;
    const hop = 512;
    const rms = [];
    for (let i = 0; i + win < data.length; i += hop) {
      let s = 0;
      for (let j = 0; j < win; j++) {
        const v = data[i + j];
        s += v * v;
      }
      rms.push(Math.sqrt(s / win));
    }
    // Local mean window for adaptive threshold
    const beats = [];
    const lookback = 32;
    const minGapSec = 0.18; // suppress closer than 180ms
    let lastBeatTime = -Infinity;
    for (let i = lookback; i < rms.length - 1; i++) {
      let local = 0;
      for (let j = i - lookback; j < i; j++) local += rms[j];
      local /= lookback;
      const isPeak = rms[i] > rms[i-1] && rms[i] > rms[i+1] && rms[i] > local * 1.6 && rms[i] > 0.04;
      if (isPeak) {
        const t = (i * hop) / sampleRate;
        if (t - lastBeatTime > minGapSec) {
          beats.push(+t.toFixed(3));
          lastBeatTime = t;
        }
      }
    }
    state.timeline.beats = beats;
  }

  // ── Playback ──────────────────────────────
  let playStart = 0, playOffset = 0, rafId = null;
  function play() {
    if (state.timeline.playing) return;
    state.timeline.playing = true;
    playStart = performance.now();
    playOffset = state.timeline.time;
    if (audioEl && audioEl.src) {
      audioEl.currentTime = state.timeline.time;
      audioEl.play().catch(() => {});
    }
    document.getElementById('sc-play').innerHTML = '<i class="fas fa-pause"></i>';
    const tick = () => {
      if (!state.timeline.playing) return;
      const t = playOffset + (performance.now() - playStart) / 1000;
      if (t >= state.timeline.dur) { stop(); return; }
      state.timeline.time = t;
      applyKeyframesAtTime(t);
      renderTimeline();
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }
  function stop() {
    state.timeline.playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (audioEl) audioEl.pause();
    document.getElementById('sc-play').innerHTML = '<i class="fas fa-play"></i>';
  }
  function seek(t) {
    state.timeline.time = Math.max(0, Math.min(state.timeline.dur, t));
    if (audioEl) audioEl.currentTime = state.timeline.time;
    applyKeyframesAtTime(state.timeline.time);
    renderTimeline();
    renderProps();
  }

  function applyKeyframesAtTime(t) {
    state.layers.forEach(layer => {
      if (!layer.kfs || !layer.kfs.length) return;
      const sorted = layer.kfs.slice().sort((a,b) => a.t - b.t);
      let prev = null, next = null;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].t <= t) prev = sorted[i];
        if (sorted[i].t >= t && !next) next = sorted[i];
      }
      if (!prev && !next) return;
      const target = prev || next;
      if (prev && next && next.t > prev.t) {
        const k = (t - prev.t) / (next.t - prev.t);
        const e = ease(k);
        layer.x = lerp(prev.x, next.x, e);
        layer.y = lerp(prev.y, next.y, e);
        layer.z = lerp(prev.z||0, next.z||0, e);
        layer.rot = lerp(prev.rot||0, next.rot||0, e);
        layer.opacity = lerp(prev.opacity ?? 1, next.opacity ?? 1, e);
      } else if (target) {
        layer.x = target.x; layer.y = target.y;
        layer.z = target.z || 0; layer.rot = target.rot || 0;
        layer.opacity = target.opacity ?? 1;
      }
    });
    renderWorld();
  }
  function ease(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Helpers ───────────────────────────────
  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  function duplicateLayer(src) {
    const dup = JSON.parse(JSON.stringify(src));
    dup.id = state.nextId++;
    dup.x = (src.x || 0) + 24;
    dup.y = (src.y || 0) + 24;
    dup.kfs = []; // don't carry keyframes
    state.layers.push(dup);
    state.selected = dup.id;
    save(); renderWorld(); renderProps(); renderTimeline();
    toast('Layer duplicated', 'ok');
  }

  function nudgeSelected(dx, dy) {
    const layer = state.layers.find(l => l.id === state.selected);
    if (!layer) return;
    layer.x = (layer.x || 0) + dx;
    layer.y = (layer.y || 0) + dy;
    save(); renderWorld(); renderProps();
  }

  function deleteSelected() {
    if (state.selected == null) return;
    state.layers = state.layers.filter(l => l.id !== state.selected);
    state.selected = null;
    save(); renderWorld(); renderProps(); renderTimeline();
  }
  function toast(msg, kind) {
    const t = document.getElementById('toast');
    if (!t) { console.log(msg); return; }
    t.textContent = msg;
    t.className = kind === 'err' ? 'toast-err' : 'toast-ok';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = '', 3000);
  }

  // ── Init ──────────────────────────────────
  function init() {
    canvasEl = document.getElementById('sc-canvas');
    if (!canvasEl) return;
    worldEl = document.getElementById('sc-world');
    layerListEl = document.getElementById('sc-layer-list');
    propsEl = document.getElementById('sc-props');
    timelineEl = document.getElementById('sc-timeline');
    playheadEl = document.getElementById('sc-playhead');
    beatTrackEl = document.getElementById('sc-beat-track');
    audioEl = document.getElementById('sc-audio');
    timeReadoutEl = document.getElementById('sc-time-readout');

    load();
    applyBackground();
    renderWorld(); renderProps(); renderTimeline();

    // Pan with middle-mouse / space+drag, zoom with wheel
    let panning = false, panStart = null, spaceDown = false;
    canvasEl.addEventListener('mousedown', e => {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        panning = true;
        panStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
        canvasEl.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    window.addEventListener('mousemove', e => {
      if (!panning) return;
      state.pan.x = e.clientX - panStart.x;
      state.pan.y = e.clientY - panStart.y;
      renderWorld();
    });
    window.addEventListener('mouseup', () => { panning = false; canvasEl.style.cursor = ''; });

    // ── Keyboard shortcuts (only when canvas has focus / is visible) ──
    function panelActive() {
      const p = document.getElementById('panel-studio-canvas');
      return p && p.classList.contains('active');
    }
    function inEditableField(target) {
      const t = (target.tagName || '').toUpperCase();
      return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || target.isContentEditable;
    }
    window.addEventListener('keydown', e => {
      if (!panelActive()) return;
      if (e.key === ' ' && !inEditableField(e.target)) { spaceDown = true; canvasEl.style.cursor = 'grab'; e.preventDefault(); return; }
      if (inEditableField(e.target)) return;
      // Delete selected layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selected != null) {
        e.preventDefault(); deleteSelected();
      }
      // Duplicate Cmd/Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && state.selected != null) {
        e.preventDefault();
        const layer = state.layers.find(l => l.id === state.selected);
        if (layer) duplicateLayer(layer);
      }
      // Arrow nudges (1px / 10px with Shift)
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); nudgeSelected(-step, 0); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSelected( step, 0); }
      if (e.key === 'ArrowUp')    { e.preventDefault(); nudgeSelected(0, -step); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); nudgeSelected(0,  step); }
      // Esc to deselect
      if (e.key === 'Escape' && state.selected != null) { state.selected = null; renderWorld(); renderProps(); }
    });
    window.addEventListener('keyup',   e => { if (e.key === ' ') { spaceDown = false; canvasEl.style.cursor = ''; } });
    canvasEl.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = canvasEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1/1.1;
      const newZoom = Math.max(0.1, Math.min(4, state.zoom * factor));
      // Zoom around mouse position
      state.pan.x = mx - (mx - state.pan.x) * (newZoom / state.zoom);
      state.pan.y = my - (my - state.pan.y) * (newZoom / state.zoom);
      state.zoom = newZoom;
      renderWorld();
    }, { passive: false });

    // Layer click to select + drag to move
    let dragging = null, dragStart = null;
    worldEl.addEventListener('mousedown', e => {
      // Don't intercept clicks on a contenteditable text being edited
      if (e.target.isContentEditable) return;
      const layerEl = e.target.closest('.sc-layer');
      if (!layerEl || spaceDown) return;
      const id = +layerEl.dataset.id;
      state.selected = id;
      const layer = state.layers.find(l => l.id === id);
      if (!layer) return;
      dragging = layer;
      dragStart = { x: e.clientX, y: e.clientY, lx: layer.x, ly: layer.y };
      e.stopPropagation();
      renderWorld(); renderProps();
    });

    // Click empty canvas to deselect
    canvasEl.addEventListener('click', e => {
      if (panning || spaceDown) return;
      if (e.target === canvasEl || e.target === worldEl) {
        if (state.selected != null) {
          state.selected = null;
          renderWorld(); renderProps();
        }
      }
    });

    // Double-click text/kanji layers to edit in-place
    worldEl.addEventListener('dblclick', e => {
      const textEl = e.target.closest('.sc-text-content');
      if (!textEl) return;
      const id = +textEl.dataset.layerId;
      const layer = state.layers.find(l => l.id === id);
      if (!layer || (layer.type !== 'text' && layer.type !== 'kanji')) return;
      textEl.contentEditable = 'true';
      textEl.focus();
      // Select all
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(textEl);
      sel.removeAllRanges();
      sel.addRange(range);
      const finish = () => {
        textEl.contentEditable = 'false';
        layer.text = textEl.textContent.trim();
        textEl.removeEventListener('blur', finish);
        textEl.removeEventListener('keydown', onKey);
        save(); renderWorld(); renderProps();
      };
      const onKey = ev => {
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finish(); }
        if (ev.key === 'Escape') { ev.preventDefault(); finish(); }
        ev.stopPropagation();
      };
      textEl.addEventListener('blur', finish);
      textEl.addEventListener('keydown', onKey);
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = (e.clientX - dragStart.x) / state.zoom;
      const dy = (e.clientY - dragStart.y) / state.zoom;
      dragging.x = dragStart.lx + dx;
      dragging.y = dragStart.ly + dy;
      renderWorld(); renderProps();
    });
    window.addEventListener('mouseup', () => { if (dragging) { save(); dragging = null; } });

    // Toolbar buttons
    document.getElementById('sc-add-text')?.addEventListener('click', () => {
      addLayer('text', { text: 'AUTOMATE.', x: 100, y: 100, w: 420, h: 80, fontSize: 56, color: '#f0f0f5' });
    });
    document.getElementById('sc-add-kanji')?.addEventListener('click', () => {
      addLayer('kanji', { text: '暗殺', x: 200, y: 200, w: 200, h: 200, fontSize: 160, color: '#ff2a2a' });
    });
    document.getElementById('sc-add-img')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-add-vid')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'video/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-add-audio')?.addEventListener('click', () => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'audio/*';
      i.onchange = ev => { const f = ev.target.files[0]; if (f) importFile(f); };
      i.click();
    });
    document.getElementById('sc-clear')?.addEventListener('click', () => {
      if (!confirm('Clear the canvas?')) return;
      state.layers = []; state.selected = null;
      state.timeline.beats = []; state.timeline.audioSrc = null;
      if (audioEl) audioEl.removeAttribute('src');
      save(); renderWorld(); renderProps(); renderTimeline();
    });
    document.getElementById('sc-zoom-fit')?.addEventListener('click', () => {
      state.pan = { x: canvasEl.offsetWidth / 2, y: canvasEl.offsetHeight / 2 };
      state.zoom = 1;
      renderWorld();
    });

    // Layer list interactions
    layerListEl.addEventListener('click', e => {
      const row = e.target.closest('.sc-layer-row');
      const btn = e.target.closest('.sc-mini-btn');
      if (btn) {
        const id = +btn.dataset.id;
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return;
        if (btn.dataset.action === 'del') {
          state.layers = state.layers.filter(l => l.id !== id);
          if (state.selected === id) state.selected = null;
        } else if (btn.dataset.action === 'up') {
          layer.z = (layer.z || 0) + 50;
        } else if (btn.dataset.action === 'dup') {
          duplicateLayer(layer);
        }
        save(); renderWorld(); renderProps();
        e.stopPropagation();
        return;
      }
      if (row) {
        state.selected = +row.dataset.id;
        renderWorld(); renderProps();
      }
    });

    // Props panel interactions — input changes (props + bg colours + bg image upload)
    propsEl.addEventListener('input', e => {
      // Background colour change
      const bgProp = e.target.dataset.bgProp;
      if (bgProp) {
        state.background[bgProp] = e.target.value;
        save(); applyBackground();
        return;
      }
      // Custom glow colour — synthesise drop-shadow filter
      if (e.target.dataset.prop === 'customGlow') {
        const layer = state.layers.find(l => l.id === state.selected);
        if (!layer) return;
        const c = e.target.value;
        const r = parseInt(c.slice(1,3), 16), g = parseInt(c.slice(3,5), 16), b = parseInt(c.slice(5,7), 16);
        layer.customGlow = c;
        layer.filter = `drop-shadow(0 0 28px rgba(${r},${g},${b},0.75))`;
        save(); renderWorld();
        return;
      }
      // Layer property
      const layer = state.layers.find(l => l.id === state.selected);
      if (!layer) return;
      const prop = e.target.dataset.prop;
      if (!prop) return;
      const val = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
      layer[prop] = val;
      save(); renderWorld();
    });
    propsEl.addEventListener('click', e => {
      // Background type buttons
      const bgBtn = e.target.closest('[data-bg-type]');
      if (bgBtn) {
        const t = bgBtn.dataset.bgType;
        if (t === 'image') {
          const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
          i.onchange = ev => {
            const f = ev.target.files[0]; if (!f) return;
            const reader = new FileReader();
            reader.onload = re => {
              state.background.imageSrc = re.target.result;
              state.background.type = 'image';
              save(); applyBackground(); renderProps();
            };
            reader.readAsDataURL(f);
          };
          i.click();
        } else {
          state.background.type = t;
          save(); applyBackground(); renderProps();
        }
        return;
      }
      // Clear bg image
      if (e.target.closest('[data-bg-action="clear-image"]')) {
        state.background.imageSrc = null;
        state.background.type = 'grid';
        save(); applyBackground(); renderProps();
        return;
      }
      // Alignment buttons
      const alignBtn = e.target.closest('.sc-align-btn');
      if (alignBtn) {
        const layer = state.layers.find(l => l.id === state.selected);
        if (!layer) return;
        layer.align = alignBtn.dataset.val;
        save(); renderWorld(); renderProps();
        return;
      }
      const fxBtn = e.target.closest('.sc-fx-btn');
      if (fxBtn) {
        const layer = state.layers.find(l => l.id === state.selected);
        if (!layer) return;
        layer.filter = fxBtn.dataset.fx;
        save(); renderWorld(); renderProps();
      }
      const action = e.target.closest('[data-action]')?.dataset.action;
      const layer = state.layers.find(l => l.id === state.selected);
      if (!layer) return;
      if (action === 'kf-add') {
        layer.kfs = layer.kfs || [];
        layer.kfs.push({ t: state.timeline.time, x: layer.x, y: layer.y, z: layer.z||0, rot: layer.rot||0, opacity: layer.opacity ?? 1 });
        save(); renderProps(); renderTimeline();
      } else if (action === 'kf-snap') {
        if (!state.timeline.beats.length) { toast('Import audio first to detect beats', 'err'); return; }
        const t = state.timeline.time;
        const nearest = state.timeline.beats.reduce((a,b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
        layer.kfs = layer.kfs || [];
        layer.kfs.push({ t: nearest, x: layer.x, y: layer.y, z: layer.z||0, rot: layer.rot||0, opacity: layer.opacity ?? 1 });
        seek(nearest);
        save(); renderProps(); renderTimeline();
        toast('KF added @ beat ' + nearest.toFixed(2) + 's', 'ok');
      } else if (action === 'kf-del') {
        const i = +e.target.closest('[data-i]').dataset.i;
        layer.kfs.splice(i, 1);
        save(); renderProps(); renderTimeline();
      }
    });

    // Timeline scrub
    timelineEl.addEventListener('mousedown', e => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      const rect = timelineEl.getBoundingClientRect();
      const t = (e.clientX - rect.left) / rect.width * state.timeline.dur;
      seek(t);
      const onMove = ev => {
        const t2 = (ev.clientX - rect.left) / rect.width * state.timeline.dur;
        seek(t2);
      };
      const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    document.getElementById('sc-play')?.addEventListener('click', () => {
      state.timeline.playing ? stop() : play();
    });
    document.getElementById('sc-rewind')?.addEventListener('click', () => seek(0));

    // Audio playback element
    if (state.timeline.audioSrc) {
      audioEl.src = state.timeline.audioSrc;
    }

    // Centre canvas initially
    setTimeout(() => {
      if (state.layers.length === 0) {
        state.pan = { x: canvasEl.offsetWidth / 2, y: canvasEl.offsetHeight / 2 };
        renderWorld();
      }
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
