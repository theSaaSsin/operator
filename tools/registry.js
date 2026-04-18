/**
 * Operator Tool Kit — Integration Registry
 * ==========================================
 * Central catalogue of installable AI tools that plug into Operator.
 * Each entry powers:
 *   - The Tool Kit sidebar panel (status, connect button, quick-run UI)
 *   - /api/tools/:id/* proxy routes in server.js
 *   - Discovery in the upcoming Playground panel
 *
 * Add a tool here → Operator picks it up automatically.
 */
module.exports = {
  tools: [

    // ──────────────────────────────────────────────────────
    // Local Pinokio sidecars (run on your machine)
    // ──────────────────────────────────────────────────────
    {
      id: 'scrapling',
      kind: 'pinokio',
      label: 'Scrapling',
      tagline: 'Stealth web scraper — powers Lead Feed sources',
      healthUrl: 'http://127.0.0.1:5001/health',
      baseUrl:   'http://127.0.0.1:5001',
      install:   { pinokio: 'tools/scrapling/pinokio.js', pypi: 'scrapling[fetchers]' },
      icon: 'fa-satellite-dish',
      capabilities: ['scan.generic', 'scan.google-maps', 'scan.yell', 'scan.reddit'],
      docs: 'https://github.com/D4Vinci/Scrapling',
    },

    // ──────────────────────────────────────────────────────
    // Cloud APIs (single key → many capabilities)
    // ──────────────────────────────────────────────────────
    {
      id: 'modelslab',
      kind: 'cloud',
      label: 'ModelsLab',
      tagline: 'One API key → image gen, video, voice, upscale, face-swap, 50+ models',
      healthUrl: null, // cloud; verified via /api/tools/modelslab/ping
      baseUrl:   'https://modelslab.com/api/v6',
      envKey:    'MODELSLAB_API_KEY',
      icon: 'fa-wand-sparkles',
      capabilities: [
        'image.text-to-image',      // SDXL / Flux / Realistic Vision
        'image.image-to-image',
        'image.inpaint',
        'image.upscale',
        'image.face-swap',
        'video.text-to-video',
        'video.image-to-video',
        'voice.text-to-speech',
        'voice.voice-clone',
      ],
      docs: 'https://docs.modelslab.com/',
      useCases: [
        'Hero imagery for landing templates',
        'Social post visuals (IG / LinkedIn / X)',
        'Pitch deck illustrations',
        'Product demo videos',
      ],
    },
    {
      id: 'groq',
      kind: 'cloud',
      label: 'Groq',
      tagline: 'Sub-second Llama-3 inference for landing copy & outreach',
      baseUrl: 'https://api.groq.com/openai/v1',
      envKey:  'GROQ_API_KEY',
      icon: 'fa-bolt',
      capabilities: ['text.completion', 'text.streaming', 'text.json-mode'],
      docs: 'https://console.groq.com/docs/',
    },
    {
      id: 'anthropic',
      kind: 'cloud',
      label: 'Claude',
      tagline: 'Structured work: brand guidelines, pitch docs, high-reasoning tasks',
      baseUrl: 'https://api.anthropic.com/v1',
      envKey:  'ANTHROPIC_API_KEY',
      icon: 'fa-brain',
      capabilities: ['text.completion', 'text.tool-use', 'text.long-context'],
      docs: 'https://docs.anthropic.com/',
    },
    {
      id: 'unsplash',
      kind: 'cloud',
      label: 'Unsplash',
      tagline: 'Free high-res stock imagery for templates & socials',
      baseUrl: 'https://api.unsplash.com',
      envKey:  'UNSPLASH_ACCESS_KEY',
      icon: 'fa-image',
      capabilities: ['image.search', 'image.download'],
      docs: 'https://unsplash.com/documentation',
    },
    {
      id: 'fal',
      kind: 'cloud',
      label: 'Fal.ai',
      tagline: 'Fast hosted Flux / SDXL — premium hero imagery',
      baseUrl: 'https://fal.run',
      envKey:  'FAL_API_KEY',
      icon: 'fa-rocket',
      capabilities: ['image.text-to-image', 'image.realtime'],
      docs: 'https://fal.ai/docs',
    },
  ],

  /** Look up a tool by id */
  get(id) { return this.tools.find(t => t.id === id); },

  /** List tools serialisable to the frontend (strip secrets) */
  publicList(env = process.env) {
    return this.tools.map(t => ({
      id: t.id,
      kind: t.kind,
      label: t.label,
      tagline: t.tagline,
      icon: t.icon,
      capabilities: t.capabilities,
      docs: t.docs,
      useCases: t.useCases || [],
      healthUrl: t.healthUrl || null,
      configured: t.envKey ? !!env[t.envKey] : null,
      envKey: t.envKey || null,
    }));
  },
};
