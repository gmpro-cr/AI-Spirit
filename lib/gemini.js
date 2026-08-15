// OpenRouter API integration (OpenAI-compatible)
// Uses free models via OpenRouter with automatic fallback chain

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Fallback chain of free models — verified working as of July 2026.
// z-ai/glm-4.5-air:free was dropped: OpenRouter retired the free tier for it
// (the slug now 404s and points at the paid `z-ai/glm-4.5-air`).
// openai/gpt-oss-120b:free was dropped 2026-07: same story (404, paid-only now);
// replaced with qwen3-next-80b (instruct, non-reasoning, honors clean output).
const FREE_MODELS = [
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
]

// Appended to every system prompt. Tag-based stripping (below) only catches
// models that mark their reasoning with <think>/<|channel|> tokens. Hybrid
// models like Nemotron sometimes write their internal monologue as plain,
// unmarked prose instead — this instruction is the only lever that reaches them.
const NO_VISIBLE_REASONING_INSTRUCTION =
  '\n\nDo not show your reasoning, internal thoughts, or step-by-step planning. Reply with only the final in-character answer, nothing else.'

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }
  return key
}

/**
 * Strip reasoning-model internal monologue that some free models (e.g. gpt-oss)
 * leak into the content field. Removes <think> blocks and OpenAI "harmony"
 * channel artifacts, keeping only the user-facing final answer.
 *
 * Defense-in-depth: the request also sets reasoning.exclude, but a fallback
 * model may still leak, so we sanitize the text as well.
 */
export function stripReasoning(text) {
  if (!text || typeof text !== 'string') return ''
  let out = text

  // Remove complete <think>...</think> / <reasoning>...</reasoning> blocks
  out = out.replace(/<\s*(think|reasoning|analysis)\s*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')

  // Harmony format (gpt-oss): the only user-facing channel is "final". Everything
  // from the first control token onward is structure (analysis/commentary/headers).
  if (out.includes('<|')) {
    const finalMatch = out.match(/<\|channel\|>\s*final\s*<\|message\|>([\s\S]*?)(?:<\|(?:end|return|start)\|>|$)/i)
    if (finalMatch) {
      // Keep only the final channel's message (text before any harmony token is
      // normally empty; the final message is the real answer).
      out = finalMatch[1]
    } else {
      // No final channel yet — surface only plain text before the harmony structure.
      out = out.slice(0, out.indexOf('<|'))
    }
  }

  // Strip any leftover harmony control tokens
  out = out.replace(/<\|(?:start|end|return|channel|message|constrain)\|>/gi, '')

  // If an unterminated <think> remains (truncated reasoning), drop everything from it on
  out = out.replace(/<\s*(think|reasoning|analysis)\s*>[\s\S]*$/i, '')

  return out.trim()
}

// Phrases that show up in leaked chain-of-thought prose but essentially never in an
// in-character persona reply. Matched case-insensitively.
const REASONING_OPENING_PATTERNS = [
  /^we('| a)re in the \d/i,
  /^(okay|alright)?,?\s*(so\s+)?the user\b/i,
  /^let me (think|clarify|craft)/i,
  /^my response must\b/i,
]
const REASONING_PHRASE_MARKERS = [
  /\bbut wait\b/gi,
  /\bactually,? no\b/gi,
  /\baccording to the rules\b/gi,
  /\bthe user is asking\b/gi,
  /\bi (must|should) respond\b/gi,
  /\blet me clarify\b/gi,
]

/**
 * Detects untagged chain-of-thought leakage that stripReasoning() can't remove
 * because the model didn't wrap it in any recognizable tag/token (seen from
 * hybrid-reasoning free models like Nemotron). This only classifies text as
 * unsafe — callers are expected to retry a different model rather than try to
 * surgically extract an answer from the monologue.
 */
export function looksLikeLeakedReasoning(text) {
  if (!text || typeof text !== 'string') return false
  const opensLikeReasoning = REASONING_OPENING_PATTERNS.some((re) => re.test(text.trim()))
  const markerHits = REASONING_PHRASE_MARKERS.reduce(
    (count, re) => count + (text.match(re) || []).length,
    0
  )
  return opensLikeReasoning || markerHits >= 2
}

/**
 * Returns the prefix of `text` that is safe to stream now, holding back any
 * trailing run starting at a '<' that might still grow into a reasoning marker
 * (harmony token or <think>/<reasoning>/<analysis> tag). The held-back tail is
 * flushed once the stream completes.
 */
function safeEmittablePrefix(text) {
  const lt = text.lastIndexOf('<')
  if (lt === -1) return text
  const tail = text.slice(lt)
  // A closed token/tag ('>' present) is already resolved by stripReasoning — safe.
  if (tail.includes('>')) return text
  // Any unterminated harmony token (e.g. "<|return|", "<|chan") — withhold.
  if (tail.startsWith('<|')) return text.slice(0, lt)
  // A partial <think>/<reasoning>/<analysis> opening (or closing) tag — withhold.
  if (/^<\s*\/?\s*(?:t(?:h(?:i(?:n(?:k)?)?)?)?|r(?:e(?:a(?:s(?:o(?:n(?:i(?:n(?:g)?)?)?)?)?)?)?)?|a(?:n(?:a(?:l(?:y(?:s(?:i(?:s)?)?)?)?)?)?)?|\|?)$/i.test(tail)) {
    return text.slice(0, lt)
  }
  return text
}

/**
 * Makes a non-streaming request to OpenRouter, trying each model in the fallback chain.
 * `excludeModels` lets a caller skip models already tried and found to leak reasoning.
 */
async function callOpenRouter(messages, { stream = false, excludeModels = [] } = {}) {
  const apiKey = getApiKey()
  let lastError = null
  const modelsToTry = FREE_MODELS.filter((model) => !excludeModels.includes(model))

  for (const model of modelsToTry) {
    try {
      console.log(`[OpenRouter] Trying model: ${model}`)
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Spirit',
        },
        body: JSON.stringify({
          model,
          messages,
          // Reasoning models (e.g. gpt-oss) still reason internally; exclude keeps
          // it out of the response so the monologue never reaches the user.
          reasoning: { exclude: true },
          // Higher cap so the final answer survives after internal reasoning tokens.
          max_tokens: 1024,
          temperature: 0.7,
          stream,
        }),
      })

      if (response.status === 429) {
        const errorBody = await response.text()
        console.warn(`[OpenRouter] Rate limited on ${model}, trying next...`)
        lastError = new Error(`Rate limited: ${model}`)
        lastError.status = 429
        continue
      }

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`[OpenRouter] HTTP ${response.status} on ${model}:`, errorBody)
        lastError = new Error(`OpenRouter API error: ${response.status}`)
        lastError.status = response.status
        continue
      }

      // Success — return the response and model used
      return { response, model }
    } catch (error) {
      console.error(`[OpenRouter] Error with ${model}:`, error.message)
      lastError = error
      continue
    }
  }

  // All models failed
  throw lastError || new Error('All OpenRouter free models are currently unavailable')
}

/**
 * Generates a streaming persona response using OpenRouter AI
 * @param {string} systemPrompt - The persona's system prompt
 * @param {Array} messageHistory - Array of message objects with role and content
 * @param {string|null} contextString - Optional context to prepend to system prompt
 * @returns {AsyncGenerator} Async generator that yields text chunks
 */
export async function* generatePersonaResponseStream(systemPrompt, messageHistory, contextString = null) {
  const enhancedSystemPrompt = (contextString ? contextString + systemPrompt : systemPrompt) +
    NO_VISIBLE_REASONING_INSTRUCTION

  const messages = [
    { role: 'system', content: enhancedSystemPrompt },
    ...messageHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))
  ]

  yield* streamWithFallback(messages, [])
}

// How much cleaned text to accumulate before we're willing to judge whether it
// looks like leaked reasoning. Short enough to keep perceived latency low,
// long enough for the opening-phrase / marker-count heuristic to be reliable.
const REASONING_DECISION_BUFFER_LEN = 60

/**
 * Streams from OpenRouter, holding back the first chunk of cleaned output long
 * enough to check for untagged reasoning leakage. If detected, aborts this
 * model's stream and retries with the next model in the fallback chain
 * (nothing was shown to the user yet). If every model leaks, falls back to a
 * short generic line rather than ever surfacing raw internal monologue.
 */
async function* streamWithFallback(messages, excludeModels) {
  try {
    const { response, model } = await callOpenRouter(messages, { stream: true, excludeModels })
    console.log(`[OpenRouter Stream] Using model: ${model}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    // Accumulate raw content and only emit the reasoning-stripped delta, so any
    // leaked <think>/analysis monologue is withheld until (and unless) it resolves.
    let accumulated = ''
    let emitted = ''
    let decided = false // has the leaked-reasoning check for this model run yet?

    while (true) {
      const { done, value } = await reader.read()

      if (value) {
        buffer += decoder.decode(value, { stream: true })
      }

      const lines = buffer.split('\n')
      if (done) {
        buffer = ''
      } else {
        buffer = lines.pop() || ''
      }

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
          try {
            const data = JSON.parse(trimmedLine.slice(6))
            const content = data.choices?.[0]?.delta?.content
            if (content) {
              accumulated += content
              const clean = stripReasoning(accumulated)

              if (!decided) {
                if (clean.length < REASONING_DECISION_BUFFER_LEN && !done) continue
                decided = true
                if (looksLikeLeakedReasoning(clean)) {
                  console.warn(`[OpenRouter Stream] ${model} leaked untagged reasoning, trying next model...`)
                  try { await reader.cancel() } catch { /* stream already closing */ }
                  if (excludeModels.length + 1 < FREE_MODELS.length) {
                    yield* streamWithFallback(messages, [...excludeModels, model])
                    return
                  }
                  // No models left to try — never show the raw monologue.
                  yield "Let's talk about something else — what's on your mind?"
                  return
                }
              }

              // Hold back a trailing partial that could be the start of a marker
              // (e.g. "<|chan" before "<|channel|>"), so we never stream a fragment.
              const emittable = safeEmittablePrefix(clean)
              // Only emit when output strictly extends what we already sent.
              if (emittable.length > emitted.length && emittable.startsWith(emitted)) {
                yield emittable.slice(emitted.length)
                emitted = emittable
              }
            }
          } catch (parseError) {
            // Skip unparseable chunks
          }
        }
      }

      if (done) break
    }

    // Final flush: emit any clean remainder that incremental emission held back.
    const finalClean = stripReasoning(accumulated)
    if (finalClean.startsWith(emitted) && finalClean.length > emitted.length) {
      yield finalClean.slice(emitted.length)
    } else if (!emitted && finalClean) {
      yield finalClean
    }
  } catch (error) {
    console.error('OpenRouter Stream API Error:', {
      message: error.message,
      status: error.status,
    })

    if (error.message?.includes('content filtering') || error.message?.includes('safety')) {
      throw new Error('This topic isn\'t appropriate for this persona. Try asking something else!')
    }

    if (error.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED')
    }

    throw new Error('Unable to process your message. Please try again or rephrase.')
  }
}

/**
 * Generates a persona response using OpenRouter AI
 * @param {string} systemPrompt - The persona's system prompt
 * @param {Array} messageHistory - Array of message objects with role and content
 * @param {Object} metadata - Optional metadata (default: {})
 * @param {string|null} contextString - Optional context to prepend to system prompt
 * @returns {Promise<Object>} Response object with success, response, and metadata
 */
export async function generatePersonaResponse(systemPrompt, messageHistory, metadata = {}, contextString = null) {
  try {
    const enhancedSystemPrompt = (contextString ? contextString + systemPrompt : systemPrompt) +
      NO_VISIBLE_REASONING_INSTRUCTION

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    const startTime = Date.now()
    const excludeModels = []
    let responseText = ''
    let model = null
    let data = null

    // Retry across the fallback chain if a model's output looks like leaked
    // untagged reasoning (stripReasoning can't clean what it can't detect).
    for (let attempt = 0; attempt < FREE_MODELS.length; attempt++) {
      const result = await callOpenRouter(messages, { excludeModels })
      model = result.model
      data = await result.response.json()
      responseText = stripReasoning(data.choices?.[0]?.message?.content || '')

      if (!looksLikeLeakedReasoning(responseText)) break

      console.warn(`[OpenRouter] ${model} leaked untagged reasoning, trying next model...`)
      excludeModels.push(model)
    }

    const duration = Date.now() - startTime
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0

    console.log('[OpenRouter API]', {
      duration: `${duration}ms`,
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    })

    return {
      success: true,
      response: responseText,
      metadata: {
        // Which of FREE_MODELS actually answered. The chain falls through on
        // rate limits and reasoning leaks, so replies from the same request
        // shape can come from very different models — without this, a quality
        // regression cannot be attributed to anything.
        model,
        inputTokens,
        outputTokens,
        duration,
      },
    }
  } catch (error) {
    console.error('OpenRouter API Error:', {
      message: error.message,
      status: error.status,
    })

    if (error.message?.includes('content filtering') || error.message?.includes('safety')) {
      return {
        success: false,
        error: 'This topic isn\'t appropriate for this persona. Try asking something else!'
      }
    }

    if (error.status === 429) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'AI service is temporarily busy. Trying backup service...'
      }
    }

    return {
      success: false,
      error: 'OPENROUTER_ERROR',
      userMessage: 'Unable to process your message. Please try again or rephrase.'
    }
  }
}
