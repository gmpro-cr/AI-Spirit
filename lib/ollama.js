// Ollama API integration — self-hosted, no API key required
// Ollama exposes an OpenAI-compatible endpoint at /v1/chat/completions
// Set OLLAMA_URL=http://<your-oracle-vm-ip>:11434 in env vars

const DEFAULT_MODEL = 'llama3.2:3b'

function getOllamaUrl() {
  const url = process.env.OLLAMA_URL
  if (!url) throw new Error('OLLAMA_URL environment variable is not set')
  return url.replace(/\/$/, '') // strip trailing slash
}

function getModel() {
  return process.env.OLLAMA_MODEL || DEFAULT_MODEL
}

/**
 * Generates a persona response using self-hosted Ollama
 */
export async function generateOllamaResponse(systemPrompt, messageHistory, contextString = null) {
  try {
    const baseUrl = getOllamaUrl()
    const model = getModel()

    const enhancedSystemPrompt = contextString
      ? contextString + systemPrompt
      : systemPrompt

    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    ]

    console.log(`[Ollama] Sending request to ${baseUrl}, model: ${model}`)
    const startTime = Date.now()

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
      }),
      signal: AbortSignal.timeout(60000), // 60s timeout
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Ollama] HTTP ${response.status}:`, errorBody)
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const duration = Date.now() - startTime
    const responseText = data.choices?.[0]?.message?.content || ''
    const inputTokens = data.usage?.prompt_tokens || 0
    const outputTokens = data.usage?.completion_tokens || 0

    console.log('[Ollama]', { duration: `${duration}ms`, model, inputTokens, outputTokens })

    return {
      success: true,
      response: responseText,
      metadata: { inputTokens, outputTokens, duration },
    }
  } catch (error) {
    console.error('[Ollama] Error:', error.message)
    return {
      success: false,
      error: 'OLLAMA_ERROR',
      userMessage: 'Local AI is unavailable. Trying backup service...',
    }
  }
}

/**
 * Streaming version for SSE responses
 */
export async function* generateOllamaResponseStream(systemPrompt, messageHistory, contextString = null) {
  const baseUrl = getOllamaUrl()
  const model = getModel()

  const enhancedSystemPrompt = contextString
    ? contextString + systemPrompt
    : systemPrompt

  const messages = [
    { role: 'system', content: enhancedSystemPrompt },
    ...messageHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
  ]

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!response.ok) {
    throw new Error(`Ollama streaming error: ${response.status}`)
  }

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
          if (content) yield content
        } catch {
          // skip unparseable chunks
        }
      }
    }
  }
}
