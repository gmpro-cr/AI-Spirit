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
    console.error('Groq API Error:', {
      message: error.message,
      name: error.name,
      status: error.status,
      stack: error.stack?.slice(0, 500)
    })

    if (error.message?.toLowerCase().includes('rate limit')) {
      return {
        success: false,
        error: 'AI service is temporarily busy. Please try again in a few minutes.'
      }
    }

    return {
      success: false,
      error: 'The AI is thinking too hard. Try rephrasing your message.'
    }
  }
}
