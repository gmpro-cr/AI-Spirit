// Test Razorpay API connection
const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_RnGy8r5BvRNIut'
const keySecret = process.env.RAZORPAY_KEY_SECRET || '0Fj6JLx5CfijQhMMkAdzyo06'
const planId = process.env.RAZORPAY_PLAN_ID || 'plan_RnaQqhDBBbiAFu'

console.log('Testing Razorpay credentials...')
console.log('Key ID:', keyId)
console.log('Plan ID:', planId)

const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

// Test 1: Create customer
async function testCustomerCreation() {
    console.log('\n📝 Test 1: Creating customer...')

    try {
        const response = await fetch('https://api.razorpay.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('❌ Customer creation failed:')
            console.error('Status:', response.status)
            console.error('Error:', data)
            return null
        }

        console.log('✅ Customer created successfully!')
        console.log('Customer ID:', data.id)
        return data.id
    } catch (error) {
        console.error('❌ Exception:', error.message)
        return null
    }
}

// Test 2: Create subscription
async function testSubscriptionCreation(customerId) {
    if (!customerId) {
        console.log('\n⏭️  Skipping subscription test (no customer ID)')
        return
    }

    console.log('\n📝 Test 2: Creating subscription...')

    try {
        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: planId,
                customer_id: customerId,
                total_count: 12,
                customer_notify: 1,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('❌ Subscription creation failed:')
            console.error('Status:', response.status)
            console.error('Error:', data)
            return
        }

        console.log('✅ Subscription created successfully!')
        console.log('Subscription ID:', data.id)
    } catch (error) {
        console.error('❌ Exception:', error.message)
    }
}

// Run tests
async function runTests() {
    const customerId = await testCustomerCreation()
    await testSubscriptionCreation(customerId)
    console.log('\n✅ Tests complete!')
}

runTests()
