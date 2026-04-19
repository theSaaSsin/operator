/**
 * ai/voice.js — BOSS gets a voice.
 *
 * Two layers:
 *   - Layer 1 (always works): browser-native SpeechRecognition + speechSynthesis
 *     handled in operator.js — no backend call needed.
 *   - Layer 2 (optional, premium): server-side TTS via ElevenLabs or OpenAI.
 *     Picks whichever key is set.
 *
 * tts({ text, voice })  → { ok, audioBase64, mime }
 * sttHint()             → tells the client which STT path to use (browser/whisper)
 */
const cfg    = require('../config/boss.config');
const memory = require('./memory');

async function ttsElevenLabs({ text, voice = '21m00Tcm4TlvDq8ikWAM' }) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_turbo_v2', voice_settings: { stability: 0.45, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`elevenlabs ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { audioBase64: buf.toString('base64'), mime: 'audio/mpeg', provider: 'elevenlabs' };
}

async function ttsOpenAI({ text, voice = 'onyx' }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', voice, input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`openai-tts ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { audioBase64: buf.toString('base64'), mime: 'audio/mpeg', provider: 'openai' };
}

async function tts({ text, voice } = {}) {
  if (!text) return { ok: false, error: 'text required' };
  try {
    let out = await ttsElevenLabs({ text, voice });
    if (!out) out = await ttsOpenAI({ text, voice });
    if (!out) return { ok: false, error: 'no TTS provider configured (set ELEVENLABS_API_KEY or OPENAI_API_KEY)' };
    memory.logDecision('voice', `tts ${out.provider} chars=${text.length}`);
    return { ok: true, ...out };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function sttHint() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  return {
    browser: true,                                      // always available
    whisper: hasOpenAI ? '/api/boss/voice/whisper' : null,
    recommended: hasOpenAI ? 'whisper' : 'browser',
  };
}

module.exports = { tts, sttHint };
