'use strict';
// Storage abstraction — wraps Supabase.
// Swap this module's internals to migrate to SQLite / Postgres / JSON files
// without touching server.js routes.

function makeStorage(supabase) {

  // ── camelCase shims ──────────────────────────────────────
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

  // ── Public API ───────────────────────────────────────────
  return {
    clients: {
      async list() {
        const { data, error } = await supabase
          .from('clients').select('*').order('created_at', { ascending: false });
        return { data: (data || []).map(dbToClient), error };
      },
      async create(record) {
        const { data, error } = await supabase.from('clients').insert(record).select().single();
        return { data: dbToClient(data), error };
      },
      async update(id, record) {
        const { data, error } = await supabase.from('clients').update(record).eq('id', id).select().single();
        return { data: dbToClient(data), error };
      }
    },

    leads: {
      async list() {
        const { data, error } = await supabase
          .from('leads').select('*').order('score', { ascending: false });
        return { data: (data || []).map(dbToLead), error };
      },
      async create(record) {
        const { data, error } = await supabase.from('leads').insert(record).select().single();
        return { data: dbToLead(data), error };
      },
      async update(id, record) {
        const { error } = await supabase.from('leads').update(record).eq('id', id);
        return { error };
      }
    },

    outreach: {
      async list() {
        const { data, error } = await supabase
          .from('outreach_queue').select('*').order('created_at', { ascending: false });
        return { data: (data || []).map(dbToOutreach), error };
      },
      async create(record) {
        const { data, error } = await supabase.from('outreach_queue').insert(record).select().single();
        return { data: dbToOutreach(data), error };
      },
      async update(id, record) {
        const { error } = await supabase.from('outreach_queue').update(record).eq('id', id);
        return { error };
      }
    }
  };
}

module.exports = makeStorage;
