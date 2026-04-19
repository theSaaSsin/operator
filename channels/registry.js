/**
 * channels/registry.js — multi-channel surface for B.O.S.S
 *
 * One shape, many platforms. Every channel exports the same interface:
 *
 *   {
 *     id, label, kind: 'messaging'|'social',
 *     configured(): boolean,        // env present?
 *     send({to, text, attachments?}): Promise<result>,
 *     ingest(payload): {chatId, userId, text, raw}    // normalises inbound
 *     setupNote: string,            // shown in UI when not configured
 *   }
 *
 * The Operator UI reads this list to render the Channels panel; the
 * inbound webhook router (server.js) dispatches /api/channels/<id>/webhook
 * to channel.ingest() then BOSS chat.
 *
 * "Spin up an agent per channel" = each channel can carry its own persona
 * override stored in memory/channels/<id>.json (see channels/agents.js).
 */

const telegram  = require('./telegram');
const x         = require('./x');
const linkedin  = require('./linkedin');
const instagram = require('./instagram');
const discord   = require('./discord');
const slack     = require('./slack');

const ALL = [telegram, x, linkedin, instagram, discord, slack];

function get(id) { return ALL.find(c => c.id === id); }

function publicList() {
  return ALL.map(c => ({
    id: c.id, label: c.label, kind: c.kind,
    configured: c.configured(),
    setupNote: c.setupNote,
    capabilities: c.capabilities || [],
  }));
}

module.exports = { ALL, get, publicList };
