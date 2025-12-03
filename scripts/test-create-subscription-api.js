#!/usr/bin/env node

/**
 * Test the create-subscription API endpoint
 */

console.log('🧪 Testing /api/razorpay/create-subscription endpoint\n')

const testUserId = 'test-user-' + Date.now()
const testEmail = 'test@example.com'
const testName = 'Test User'

const payload = {
  userId: testUserId,
  userEmail: testEmail,
  userName: testName
}

console.log('Test payload:')
console.log(JSON.stringify(payload, null, 2))
console.log('')

// Make request to production API
fetch('https://ai-spirit.in/api/razorpay/create-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
  .then(async (response) => {
    console.log('Response status:', response.status)
    console.log('Response status text:', response.statusText)
    console.log('')
    
    const data = await response.json()
    
    console.log('Response data:')
    console.log(JSON.stringify(data, null, 2))
    console.log('')
    
    if (data.success) {
      console.log('✅ API call succeeded!')
    } else {
      console.log('❌ API call failed!')
      console.log('Error:', data.error)
    }
  })
  .catch((error) => {
    console.error('❌ Network error:', error.message)
  })
