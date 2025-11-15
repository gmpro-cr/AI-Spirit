import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

export async function generatePersonaResponse(systemPrompt, messageHistory, metadata = {}) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-05-20',
      systemInstruction: systemPrompt,
      safetySettings: SAFETY_SETTINGS,
    })

    const chat = model.startChat({
      history: messageHistory.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    })

    const lastMessage = messageHistory[messageHistory.length - 1]
    const startTime = Date.now()
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response.text()
    const duration = Date.now() - startTime

    // Extract token usage from response (if available)
    const usageMetadata = result.response.usageMetadata || {}
    const inputTokens = usageMetadata.promptTokenCount || 0
    const outputTokens = usageMetadata.candidatesTokenCount || 0

    // Log performance metrics
    console.log('[Gemini API]', {
      duration: `${duration}ms`,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
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
    console.error('Gemini API Error:', error)

    if (error.message?.includes('SAFETY')) {
      return {
        success: false,
        error: 'This topic isn\'t appropriate for this persona. Try asking something else!'
      }
    }

    return {
      success: false,
      error: 'The AI is thinking too hard. Try rephrasing your message.'
    }
  }
}
