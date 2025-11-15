import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function generateGroqResponse(systemPrompt, messageHistory, metadata = {}) {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ]

    const startTime = Date.now()
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
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
      model: 'llama-3.3-70b-versatile'
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
    console.error('Groq API Error:', error)

    if (error.message?.includes('rate limit')) {
      return {
        success: false,
        error: 'Too many requests. Please try again in a moment.'
      }
    }

    return {
      success: false,
      error: 'The AI is thinking too hard. Try rephrasing your message.'
    }
  }
}
