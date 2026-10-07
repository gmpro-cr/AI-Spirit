import Groq from 'groq-sdk'
import { stripReasoning } from '@/lib/gemini'

// llama-3.3-70b-versatile was shut down on the free/developer tier on
// 2026-08-16; every call to it now fails, which silently killed this fallback.
// gpt-oss-120b is Groq's recommended production replacement. GROQ_MODEL lets
// the next retirement be handled from the dashboard instead of a deploy.
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const MAX_TOKENS = 1024

// gpt-oss is a reasoning model: keep its reasoning out of the content and keep
// the effort low, since persona replies are one to three sentences. Other
// models reject these fields, so only send them where they apply.
const REASONING_PARAMS = MODEL.startsWith('openai/gpt-oss')
  ? { include_reasoning: false, reasoning_effort: 'low' }
  : {}

let groq = null

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groq
}

function buildMessages(systemPrompt, messageHistory) {
  return [
    { role: 'system', content: systemPrompt },
    ...messageHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
  ]
}

export async function* generateGroqResponseStream(systemPrompt, messageHistory) {
  try {
    const client = getGroqClient()
    const stream = await client.chat.completions.create({
      messages: buildMessages(systemPrompt, messageHistory),
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      stream: true,
      ...REASONING_PARAMS,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) yield content
    }
  } catch (error) {
    console.error('[Groq Stream Error]:', { model: MODEL, status: error.status, message: error.message })
    // Yield nothing on error — caller's !fullResponse check triggers next fallback
  }
}

export async function generateGroqResponse(systemPrompt, messageHistory, metadata = {}) {
  try {
    const client = getGroqClient()
    const startTime = Date.now()
    const completion = await client.chat.completions.create({
      messages: buildMessages(systemPrompt, messageHistory),
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      stream: false,
      ...REASONING_PARAMS,
    })

    const response = stripReasoning(completion.choices[0]?.message?.content || '')
    const finishReason = completion.choices[0]?.finish_reason
    if (finishReason === 'length') {
      console.warn('[Groq API] Response truncated at token limit — consider raising MAX_TOKENS')
    }
    const duration = Date.now() - startTime
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0

    console.log('[Groq API]', { duration: `${duration}ms`, model: MODEL, inputTokens, outputTokens })

    return {
      success: true,
      response,
      metadata: { model: MODEL, inputTokens, outputTokens, duration },
    }
  } catch (error) {
    console.error('Groq API Error:', { model: MODEL, status: error.status, message: error.message })

    if (error.message?.toLowerCase().includes('rate limit')) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'Both AI services are busy right now. Please try again in a minute.',
      }
    }

    if (error.message?.toLowerCase().includes('api key') || error.status === 401) {
      return {
        success: false,
        error: 'API_KEY_ERROR',
        userMessage: 'AI service configuration error. Please contact support.',
      }
    }

    return {
      success: false,
      error: 'GROQ_ERROR',
      userMessage: 'Unable to process your message right now. Please try again.',
    }
  }
}
