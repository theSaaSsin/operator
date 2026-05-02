/**
 * ai/memory-manager.js — B.O.S.S Persistent Intelligence Layer
 *
 * Gives B.O.S.S real memory across sessions:
 * - Conversation summaries (not full history — summarised for token efficiency)
 * - Market intelligence (niches scanned, pain points found)
 * - Pitch performance (what angles worked, what didn't)
 * - Lead patterns (who bites, who doesn't)
 * - Active opportunities (markets currently being worked)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, '..', 'data', 'boss-memory.json');

const DEFAULT = {
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  // What markets/niches have been explored
  markets: [],           // [{ niche, scanned_at, pain_points[], best_channels[], note }]

  // Pitch intelligence
  pitches: [],           // [{ target, variant, copy, sent_at, result: 'sent'|'replied'|'closed' }]

  // Key insights the operator has learned
  insights: [],          // [{ topic, insight, confidence: 1-10, date }]

  // Conversation context (rolling summary — not full transcripts)
  conversation_summary: '',

  // Active opportunities being worked right now
  active_opportunities: [],  // [{ market, offer, stage, next_action, started_at }]

  // Token usage tracking
  token_usage: {
    today: 0,
    today_date: '',
    total: 0,
    by_provider: { groq: 0, glm: 0, openrouter: 0, anthropic: 0, ollama: 0 },
  },
};

function read() {
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  } catch (_) {
    return { ...DEFAULT, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  }
}

function write(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  return data;
}

// Add or update a market entry
function rememberMarket(niche, data = {}) {
  const mem = read();
  const existing = mem.markets.find(m => m.niche.toLowerCase() === niche.toLowerCase());
  if (existing) {
    Object.assign(existing, data, { last_scanned: new Date().toISOString() });
  } else {
    mem.markets.unshift({ niche, scanned_at: new Date().toISOString(), ...data });
    if (mem.markets.length > 20) mem.markets = mem.markets.slice(0, 20);
  }
  write(mem);
}

// Log a pitch that was generated/sent
function rememberPitch(pitch) {
  const mem = read();
  mem.pitches.unshift({ ...pitch, created_at: new Date().toISOString() });
  if (mem.pitches.length > 100) mem.pitches = mem.pitches.slice(0, 100);
  write(mem);
}

// Save an insight (things B.O.S.S learns about what works)
function addInsight(topic, insight, confidence = 7) {
  const mem = read();
  mem.insights.unshift({ topic, insight, confidence, date: new Date().toISOString() });
  if (mem.insights.length > 50) mem.insights = mem.insights.slice(0, 50);
  write(mem);
}

// Update conversation summary (keep short — max 500 chars)
function updateConversationSummary(newContext) {
  const mem = read();
  const combined = `${mem.conversation_summary}\n${newContext}`.slice(-1000);
  mem.conversation_summary = combined;
  write(mem);
}

// Track token usage
function trackTokens(provider, count) {
  const mem = read();
  const today = new Date().toISOString().split('T')[0];
  if (mem.token_usage.today_date !== today) {
    mem.token_usage.today = 0;
    mem.token_usage.today_date = today;
  }
  mem.token_usage.today += count;
  mem.token_usage.total += count;
  mem.token_usage.by_provider[provider] = (mem.token_usage.by_provider[provider] || 0) + count;
  write(mem);
  return mem.token_usage;
}

// Build context string to inject into system prompt (token-efficient)
function buildContext(maxChars = 800) {
  const mem = read();
  const parts = [];

  // Recent markets scanned
  if (mem.markets.length > 0) {
    const recent = mem.markets.slice(0, 3).map(m => m.niche).join(', ');
    parts.push(`Markets explored: ${recent}`);
  }

  // Active opportunities
  if (mem.active_opportunities.length > 0) {
    const opp = mem.active_opportunities[0];
    parts.push(`Active opportunity: ${opp.market} → ${opp.offer} (stage: ${opp.stage})`);
  }

  // Key insights
  if (mem.insights.length > 0) {
    const top = mem.insights.filter(i => i.confidence >= 7).slice(0, 2)
      .map(i => `• ${i.insight}`).join('\n');
    if (top) parts.push(`What's working:\n${top}`);
  }

  // Conversation summary
  if (mem.conversation_summary) {
    parts.push(`Session context: ${mem.conversation_summary.slice(-300)}`);
  }

  // Pitches sent
  const sent = mem.pitches.filter(p => p.result === 'sent').length;
  const replies = mem.pitches.filter(p => p.result === 'replied').length;
  if (sent > 0) parts.push(`Pitches: ${sent} sent, ${replies} replied`);

  return parts.join('\n').slice(0, maxChars);
}

// Get/reset token usage for today
function getTokenUsage() {
  const mem = read();
  const today = new Date().toISOString().split('T')[0];
  if (mem.token_usage.today_date !== today) {
    return { today: 0, today_date: today, total: mem.token_usage.total, by_provider: mem.token_usage.by_provider };
  }
  return mem.token_usage;
}

function resetDailyTokens() {
  const mem = read();
  mem.token_usage.today = 0;
  mem.token_usage.today_date = new Date().toISOString().split('T')[0];
  write(mem);
}

module.exports = {
  read, write,
  rememberMarket, rememberPitch, addInsight,
  updateConversationSummary, buildContext,
  trackTokens, getTokenUsage, resetDailyTokens,
};
