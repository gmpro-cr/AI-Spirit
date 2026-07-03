// OpenRouter API integration (OpenAI-compatible)
// Uses free models via OpenRouter with automatic fallback chain

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Fallback chain of free models — verified working as of May 2026
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'z-ai/glm-4.5-air:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
]

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
 * Makes a non-streaming request to OpenRouter, trying each model in the fallback chain
 */
async function callOpenRouter(messages, { stream = false } = {}) {
  const apiKey = getApiKey()
  let lastError = null

  for (const model of FREE_MODELS) {
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
  try {
    const enhancedSystemPrompt = contextString
      ? contextString + systemPrompt
      : systemPrompt

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    const { response, model } = await callOpenRouter(messages, { stream: true })
    console.log(`[OpenRouter Stream] Using model: ${model}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    // Accumulate raw content and only emit the reasoning-stripped delta, so any
    // leaked <think>/analysis monologue is withheld until (and unless) it resolves.
    let accumulated = ''
    let emitted = ''

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
    const enhancedSystemPrompt = contextString
      ? contextString + systemPrompt
      : systemPrompt

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    const startTime = Date.now()
    const { response, model } = await callOpenRouter(messages)
    const data = await response.json()
    const duration = Date.now() - startTime

    const responseText = stripReasoning(data.choices?.[0]?.message?.content || '')
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
