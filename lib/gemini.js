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
          max_tokens: 512,
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6))
            const content = data.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (parseError) {
            // Skip unparseable chunks
          }
        }
      }
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

    const responseText = data.choices?.[0]?.message?.content || ''
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
