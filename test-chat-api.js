#!/usr/bin/env node

/**
 * Test the /api/chat endpoint with a real persona slug
 */

async function testChatAPI() {
  console.log('🧪 Testing Chat API...\n')

  const testPayload = {
    personaId: 'shah-rukh-khan',  // Using slug
    message: 'Hello! How are you?',
    isGuest: true
  }

  console.log('Sending request to: http://localhost:3002/api/chat')
  console.log('Payload:', JSON.stringify(testPayload, null, 2))
  console.log('')

  try {
    const response = await fetch('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    })

    console.log('Response status:', response.status, response.statusText)

    const data = await response.json()
    console.log('Response body:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ SUCCESS: Chat API is working!')
      console.log('AI Response:', data.response.substring(0, 100) + '...')
      return 0
    } else {
      console.log('\n❌ FAILED: API returned error')
      return 1
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    return 1
  }
}

testChatAPI().then(code => process.exit(code))
