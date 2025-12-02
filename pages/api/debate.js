import { supabaseAdmin } from '@/lib/supabase'
import { generatePersonaResponse } from '@/lib/gemini'
import { generateGroqResponse } from '@/lib/groq'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { personaA, personaB, topic, debateHistory, currentRound } = req.body

        if (!personaA || !personaB || !topic) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Determine whose turn it is
        const isPersonaATurn = debateHistory.length % 2 === 0
        const currentPersona = isPersonaATurn ? personaA : personaB
        const opponentPersona = isPersonaATurn ? personaB : personaA

        // Build debate context from history
        const debateContext = debateHistory.map(entry => ({
            role: entry.speaker === currentPersona.slug ? 'model' : 'user',
            content: `${entry.speaker === currentPersona.slug ? currentPersona.name : opponentPersona.name}: ${entry.message}`
        }))

        // Determine debate stage
        let stage = 'opening'
        if (currentRound > 2 && currentRound <= 4) stage = 'argument'
        else if (currentRound > 4 && currentRound <= 6) stage = 'rebuttal'
        else if (currentRound > 6) stage = 'closing'

        // Build system prompt for current speaker
        const debatePrompt = `You are ${currentPersona.name} in a formal debate against ${opponentPersona.name}.

DEBATE TOPIC: "${topic}"

DEBATE RULES:
- Stay completely in character as ${currentPersona.name}
- Present arguments from YOUR unique perspective and expertise
- Keep responses to 2-3 sentences maximum (this is critical - be concise!)
- Be respectful but firm in your position
- Reference your philosophy, expertise, or historical context
- Do NOT break character or mention you're an AI

CURRENT STAGE: ${stage.toUpperCase()}
ROUND: ${currentRound}

${stage === 'opening' ? 'Present your opening statement on this topic.' : ''}
${stage === 'argument' ? 'Present a strong argument supporting your position.' : ''}
${stage === 'rebuttal' ? 'Rebut your opponent\'s previous argument.' : ''}
${stage === 'closing' ? 'Present your closing statement. Summarize your position.' : ''}

${currentPersona.system_prompt}

Remember: 2-3 sentences maximum. Be concise and impactful.`

        // Add opponent's last statement if exists
        const lastOpponentStatement = debateHistory.length > 0
            ? debateHistory[debateHistory.length - 1]
            : null

        const messageHistory = lastOpponentStatement
            ? [{ role: 'user', content: `${opponentPersona.name} just said: "${lastOpponentStatement.message}"\n\nNow present your ${stage}.` }]
            : [{ role: 'user', content: `Present your ${stage} statement on the topic: "${topic}"` }]

        // Generate response using existing AI infrastructure
        let result = await generatePersonaResponse(debatePrompt, messageHistory, {})

        // Fallback to Groq if Gemini fails
        if (!result.success) {
            console.log('[Debate] Gemini failed, trying Groq...')
            result = await generateGroqResponse(debatePrompt, messageHistory)
        }

        if (!result.success) {
            return res.status(500).json({ error: 'Failed to generate debate response' })
        }

        // Return the debate response
        return res.status(200).json({
            success: true,
            speaker: currentPersona.slug,
            speakerName: currentPersona.name,
            message: result.response,
            round: currentRound,
            stage
        })

    } catch (error) {
        console.error('Debate API Error:', error)
        return res.status(500).json({
            error: 'An error occurred during the debate',
            details: error.message
        })
    }
}
