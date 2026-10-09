/**
 * Daily LLM health check (Vercel Cron — see vercel.json)
 *
 * Every chat reply depends on FREE_MODELS in lib/gemini.js, and OpenRouter
 * retires free tiers without notice. That took chat down from 2026-08-24 to
 * 2026-10-10 with nobody noticing. This probes each model with a tiny real
 * completion and emails an alert when a slug is gone (404) or nothing answers.
 *
 * Costs FREE_MODELS.length (+ retries) of the 50 free requests/day.
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 * Manual run: curl -H "Authorization: Bearer $CRON_SECRET" "https://ai-spirit.in/api/cron/llm-health?notify=0"
 */

import { Resend } from 'resend'
import { FREE_MODELS } from '@/lib/gemini'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const ALERT_TO = process.env.ALERT_EMAIL || 'mahalegauravk@gmail.com'
const RETRY_DELAY_MS = 8000

async function probeModel(model) {
  const started = Date.now()
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://ai-spirit.in',
        'X-Title': 'AI Spirit health check',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
        // Reasoning models spend tokens before answering; too small a budget
        // comes back as empty content and would read as a false failure.
        max_tokens: 200,
        reasoning: { exclude: true },
      }),
      signal: AbortSignal.timeout(45000),
    })
    const ms = Date.now() - started

    if (response.ok) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content?.trim()
      return content
        ? { model, status: 'ok', ms }
        : { model, status: 'error', ms, detail: 'empty content' }
    }

    const body = await response.text()
    const detail = `${response.status}: ${body.slice(0, 200)}`
    // 404 = free tier retired (permanent). 429/5xx = congestion (transient).
    if (response.status === 404) return { model, status: 'gone', ms, detail }
    if (response.status === 429 || response.status >= 500) {
      return { model, status: 'rate_limited', ms, detail }
    }
    return { model, status: 'error', ms, detail }
  } catch (error) {
    return { model, status: 'error', ms: Date.now() - started, detail: error.message }
  }
}

async function checkKey() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return { ok: false, detail: `key check HTTP ${response.status}` }
    const { data } = await response.json()
    return { ok: true, freeRequests: data.free_model_daily_requests || null }
  } catch (error) {
    return { ok: false, detail: error.message }
  }
}

async function sendAlert(report) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[LLM Health] RESEND_API_KEY not set — cannot send alert')
    return false
  }
  const rows = report.models
    .map((r) => `${r.status.padEnd(12)} ${r.model}${r.detail ? `\n             ${r.detail}` : ''}`)
    .join('\n')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'AI - Spirit <onboarding@resend.dev>',
    to: ALERT_TO,
    subject: `AI-Spirit LLM health: ${report.reasons.join('; ')}`,
    text: `The daily LLM health check failed for ai-spirit.in.

${report.reasons.map((r) => `- ${r}`).join('\n')}

Per-model results:
${rows}

Key: ${report.key.ok ? `valid, free requests ${JSON.stringify(report.key.freeRequests)}` : report.key.detail}

Fix: update FREE_MODELS in lib/gemini.js (and EXTRACTION_MODELS in lib/memorySystem.js).
Current free models: https://openrouter.ai/models?max_price=0
`,
  })
  if (error) {
    console.error('[LLM Health] Alert email failed:', error)
    return false
  }
  return true
}

export default async function handler(req, res) {
  if (!process.env.CRON_SECRET) {
    return res.status(500).json({ error: 'CRON_SECRET not configured' })
  }
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' })
  }

  const key = await checkKey()

  let models = await Promise.all(FREE_MODELS.map(probeModel))
  // One retry for transient failures so a single congestion blip at check
  // time doesn't page anyone.
  if (models.some((r) => r.status === 'rate_limited' || r.status === 'error')) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    models = await Promise.all(
      models.map((r) => (r.status === 'rate_limited' || r.status === 'error' ? probeModel(r.model) : r))
    )
  }

  const ok = models.filter((r) => r.status === 'ok')
  const gone = models.filter((r) => r.status === 'gone')

  const reasons = []
  if (!key.ok) reasons.push('OpenRouter key check failed')
  if (ok.length === 0) reasons.push('no model answered — chat is DOWN')
  if (gone.length) reasons.push(`${gone.length} model(s) retired from free tier`)

  const report = {
    healthy: reasons.length === 0,
    checkedAt: new Date().toISOString(),
    reasons,
    key,
    models,
  }

  const notify = req.query.notify !== '0'
  if (!report.healthy && notify) {
    report.alertSent = await sendAlert(report)
  }

  console.log(`[LLM Health] ${report.healthy ? 'healthy' : 'UNHEALTHY'}`, {
    ok: ok.length,
    gone: gone.map((r) => r.model),
    reasons,
  })

  return res.status(report.healthy ? 200 : 503).json(report)
}
