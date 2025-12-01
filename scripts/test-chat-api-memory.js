// Built-in fetch used

const BASE_URL = 'http://localhost:3000/api/chat'
const USER_ID = 'f7ddbd3c-089b-4068-8722-de0fea30d335' // Gaurav
const PERSONA_SLUG = 'astro-guide'

const PERSONA_OBJ = {
    name: "Astro Guide",
    slug: "astro-guide",
    category: "Spiritual",
    description: "Vedic Astrology Advisor",
    system_prompt: "You are a knowledgeable Astro Guide specializing in Vedic astrology...",
    language: "en"
}

async function testMemory() {
    console.log('🚀 Testing Chat Memory...\n')

    // Step 1: Send first message
    console.log('1️⃣ Sending first message: "My birth date is January 1st, 1990"')

    const res1 = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            persona: PERSONA_OBJ,
            personaId: PERSONA_SLUG,
            message: "My birth date is January 1st, 1990",
            conversationHistory: [],
            isGuest: false,
            userId: USER_ID,
            userProfile: { name: 'Gaurav' }
        })
    })

    const data1 = await res1.json()

    if (!res1.ok) {
        console.error('❌ Error in request 1:', data1)
        return
    }

    console.log('✅ Response 1 received:', data1.response.substring(0, 50) + '...')

    const conversationId = data1.conversationId
    console.log('📝 Conversation ID:', conversationId)

    if (!conversationId) {
        console.error('❌ No conversation ID returned! Memory will fail.')
        return
    }

    // Step 2: Send second message with conversation ID
    console.log('\n2️⃣ Sending second message: "What is my birth date?"')

    const res2 = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            persona: PERSONA_OBJ,
            personaId: PERSONA_SLUG,
            message: "What is my birth date?",
            conversationHistory: [
                { role: 'user', content: "My birth date is January 1st, 1990" },
                { role: 'assistant', content: data1.response }
            ],
            conversationId: conversationId,
            isGuest: false,
            userId: USER_ID,
            userProfile: { name: 'Gaurav' }
        })
    })

    const data2 = await res2.json()

    if (!res2.ok) {
        console.error('❌ Error in request 2:', data2)
        return
    }

    console.log('✅ Response 2 received:', data2.response)

    // Check if response contains the date
    if (data2.response.includes('1990') || data2.response.includes('January')) {
        console.log('\n🎉 SUCCESS: Memory is working!')
    } else {
        console.log('\n❌ FAILURE: Memory is NOT working. The AI did not recall the date.')
    }
}

testMemory()
