import Groq from 'groq-sdk'

// Lazy initialization - only create client when needed
let groq = null

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  }
  return groq
}

export async function generateGroqResponse(systemPrompt, messageHistory, metadata = {}) {
  try {
    const client = getGroqClient()
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    const startTime = Date.now()
    const completion = await client.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    })

    const response = completion.choices[0]?.message?.content || ''
    const duration = Date.now() - startTime

    // Extract token usage
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0

    // Log performance metrics
    console.log('[Groq API]', {
      duration: `${duration}ms`,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model: 'llama-3.1-8b-instant'
    })

    return {
      success: true,
      response,
      metadata: {
        inputTokens,
        outputTokens,
        duration,
      },
    }
  } catch (error) {
    console.error('Groq API Error:', {
      message: error.message,
      name: error.name,
      status: error.status,
      stack: error.stack?.slice(0, 500)
    })

    if (error.message?.toLowerCase().includes('rate limit')) {
      return {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        userMessage: 'Both AI services are busy right now. Please try again in a minute.'
      }
    }

    // Check if API key is missing or invalid
    if (error.message?.toLowerCase().includes('api key') || error.status === 401) {
      return {
        success: false,
        error: 'API_KEY_ERROR',
        userMessage: 'AI service configuration error. Please contact support.'
      }
    }

    return {
      success: false,
      error: 'GROQ_ERROR',
      userMessage: 'Unable to process your message right now. Please try again.'
    }
  }
}
