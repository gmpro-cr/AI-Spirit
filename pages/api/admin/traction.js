// GTM traction dashboard data
// Returns per-category signup + engagement + retention numbers so we can see
// quietly which persona categories are pulling weight and shift content there.
//
// Auth: requires x-admin-token header matching process.env.ADMIN_TOKEN in prod.
// In dev (NODE_ENV !== 'production') auth is skipped.

import { supabaseAdmin } from '@/lib/supabase'
import { INITIAL_PERSONAS } from '@/data/personas'

const DAY_MS = 24 * 60 * 60 * 1000

function isAuthorized(req) {
  if (process.env.NODE_ENV !== 'production') return true
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return false
  return req.headers['x-admin-token'] === expected
}

function categoryFor(slug, dbPersonaMap) {
  const seed = INITIAL_PERSONAS.find((p) => p.slug === slug)
  if (seed?.category) return seed.category
  if (dbPersonaMap.has(slug)) return dbPersonaMap.get(slug)
  return 'Uncategorized'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isAuthorized(req)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client unavailable' })
  }

  try {
    const days = Math.max(1, Math.min(180, parseInt(req.query.days, 10) || 30))
    const sinceISO = new Date(Date.now() - days * DAY_MS).toISOString()
    const day1ISO = new Date(Date.now() - 1 * DAY_MS).toISOString()
    const day7ISO = new Date(Date.now() - 7 * DAY_MS).toISOString()

    // 1. user_profiles within window
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, created_at')
      .gte('created_at', sinceISO)
    if (profErr) throw profErr

    // 2. conversations within window
    const { data: conversations, error: convErr } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id, persona_slug, created_at')
      .gte('created_at', sinceISO)
    if (convErr) throw convErr

    const convIds = conversations.map((c) => c.id)

    // 3. messages within window (capped — large tables are expensive)
    let messages = []
    if (convIds.length > 0) {
      // Paginate in chunks of 500 conversation IDs to stay under PostgREST limits
      const chunkSize = 500
      for (let i = 0; i < convIds.length; i += chunkSize) {
        const chunk = convIds.slice(i, i + chunkSize)
        const { data, error: msgErr } = await supabaseAdmin
          .from('messages')
          .select('conversation_id, role, created_at')
          .in('conversation_id', chunk)
          .gte('created_at', sinceISO)
        if (msgErr) throw msgErr
        messages.push(...(data || []))
      }
    }

    // 4. Backfill category map for custom (DB) personas
    const slugs = Array.from(new Set(conversations.map((c) => c.persona_slug).filter(Boolean)))
    const dbPersonaMap = new Map()
    const unseededSlugs = slugs.filter((s) => !INITIAL_PERSONAS.find((p) => p.slug === s))
    if (unseededSlugs.length > 0) {
      const { data: dbPersonas } = await supabaseAdmin
        .from('personas')
        .select('slug, category')
        .in('slug', unseededSlugs)
      ;(dbPersonas || []).forEach((p) => dbPersonaMap.set(p.slug, p.category || 'Uncategorized'))
    }

    // ---------- aggregate ----------

    // Earliest conversation per user → first-touch category
    const firstConvByUser = new Map()
    for (const c of conversations) {
      if (!c.user_id) continue
      const existing = firstConvByUser.get(c.user_id)
      if (!existing || new Date(c.created_at) < new Date(existing.created_at)) {
        firstConvByUser.set(c.user_id, c)
      }
    }

    // Messages-by-user (user messages only — assistant msgs are auto-generated)
    const convToUser = new Map(conversations.map((c) => [c.id, c.user_id]))
    const userMessageCount = new Map()
    const userFirstMessageAt = new Map()
    const userLastMessageAt = new Map()
    for (const m of messages) {
      if (m.role !== 'user') continue
      const uid = convToUser.get(m.conversation_id)
      if (!uid) continue
      userMessageCount.set(uid, (userMessageCount.get(uid) || 0) + 1)
      const ts = new Date(m.created_at).getTime()
      const first = userFirstMessageAt.get(uid)
      if (!first || ts < first) userFirstMessageAt.set(uid, ts)
      const last = userLastMessageAt.get(uid)
      if (!last || ts > last) userLastMessageAt.set(uid, ts)
    }

    // Per-category aggregation
    const byCategory = new Map()
    const ensure = (cat) => {
      if (!byCategory.has(cat)) {
        byCategory.set(cat, {
          category: cat,
          users: 0,
          conversations: 0,
          messages: 0,
          retainedDay2: 0,
        })
      }
      return byCategory.get(cat)
    }

    // signups + retention (anchored on first-touch persona category)
    for (const [userId, firstConv] of firstConvByUser) {
      const cat = categoryFor(firstConv.persona_slug, dbPersonaMap)
      const bucket = ensure(cat)
      bucket.users += 1
      const first = userFirstMessageAt.get(userId)
      const last = userLastMessageAt.get(userId)
      if (first && last && last - first >= DAY_MS) {
        bucket.retainedDay2 += 1
      }
    }

    // conversations + messages per category (counts every conversation, not just first-touch)
    for (const c of conversations) {
      const cat = categoryFor(c.persona_slug, dbPersonaMap)
      const bucket = ensure(cat)
      bucket.conversations += 1
    }
    for (const m of messages) {
      if (m.role !== 'user') continue
      const uid = convToUser.get(m.conversation_id)
      const conv = conversations.find((c) => c.id === m.conversation_id)
      if (!conv) continue
      const cat = categoryFor(conv.persona_slug, dbPersonaMap)
      const bucket = ensure(cat)
      bucket.messages += 1
    }

    // Convert + sort
    const byCategoryArr = Array.from(byCategory.values())
      .map((b) => ({
        ...b,
        retentionPct: b.users > 0 ? Math.round((b.retainedDay2 / b.users) * 100) : 0,
        msgsPerUser: b.users > 0 ? Math.round((b.messages / b.users) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.users - a.users)

    // Totals
    const activeUsers1d = new Set()
    const activeUsers7d = new Set()
    for (const m of messages) {
      if (m.role !== 'user') continue
      const uid = convToUser.get(m.conversation_id)
      if (!uid) continue
      const ts = m.created_at
      if (ts >= day1ISO) activeUsers1d.add(uid)
      if (ts >= day7ISO) activeUsers7d.add(uid)
    }

    const totals = {
      signups: profiles.length,
      activeUsers1d: activeUsers1d.size,
      activeUsers7d: activeUsers7d.size,
      totalConversations: conversations.length,
      totalUserMessages: messages.filter((m) => m.role === 'user').length,
      windowDays: days,
      generatedAt: new Date().toISOString(),
    }

    return res.status(200).json({ totals, byCategory: byCategoryArr })
  } catch (error) {
    console.error('[Traction API] Error:', error)
    return res.status(500).json({ error: error.message || 'Internal error' })
  }
}
