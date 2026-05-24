import Groq from 'groq-sdk'

const MODEL = 'llama-3.3-70b-versatile'
const MAX_TOKENS = 1024

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
  const client = getGroqClient()
  const stream = await client.chat.completions.create({
    messages: buildMessages(systemPrompt, messageHistory),
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
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
    })

    const response = completion.choices[0]?.message?.content || ''
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
      metadata: { inputTokens, outputTokens, duration },
    }
  } catch (error) {
    console.error('Groq API Error:', error.message)

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
