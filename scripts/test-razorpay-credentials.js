#!/usr/bin/env node

/**
 * Test Razorpay API credentials directly
 */

import Razorpay from 'razorpay'

console.log('🧪 Testing Razorpay Credentials\n')

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_RnCOjpYVSDEHhT'
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'fZUaV0GlcApszlOHVrJi3UVO'

console.log('Key ID:', keyId)
console.log('Key Secret:', keySecret.substring(0, 10) + '...')
console.log('')

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
})

console.log('✅ Razorpay instance created\n')

// Test 1: Create a customer
console.log('Test 1: Creating a test customer...')
try {
    const customer = await razorpay.customers.create({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        contact: '',
    })
    
    console.log('✅ Customer created successfully!')
    console.log('Customer ID:', customer.id)
    console.log('Customer Email:', customer.email)
    console.log('')
} catch (error) {
    console.error('❌ Failed to create customer')
    console.error('Error Code:', error.error?.code)
    console.error('Error Description:', error.error?.description)
    console.error('Full Error:', error.message)
    console.error('')
    
    // Check if it's an authentication error
    if (error.statusCode === 401) {
        console.error('🚨 AUTHENTICATION ERROR: Invalid API credentials')
        console.error('   - Check if KEY_ID and KEY_SECRET are correct')
        console.error('   - Verify credentials in Razorpay Dashboard')
        console.error('   - Make sure you are using the right mode (test vs live)')
    } else if (error.statusCode === 400) {
        console.error('🚨 BAD REQUEST: Check the request parameters')
    }
    
    process.exit(1)
}

// Test 2: List customers (to verify API access)
console.log('Test 2: Listing customers...')
try {
    const customers = await razorpay.customers.all({ count: 1 })
    console.log('✅ Successfully accessed customers API')
    console.log('Total customers:', customers.count || 'N/A')
    console.log('')
} catch (error) {
    console.error('❌ Failed to list customers')
    console.error('Error:', error.message)
    console.error('')
}

// Test 3: Verify plan exists
console.log('Test 3: Checking if plan exists...')
const planId = process.env.RAZORPAY_PLAN_ID || 'plan_RnD6BgUMt5qDBv'
console.log('Plan ID:', planId)

try {
    const plan = await razorpay.plans.fetch(planId)
    console.log('✅ Plan found!')
    console.log('Plan Name:', plan.item?.name || 'N/A')
    console.log('Plan Amount:', plan.item?.amount / 100 || 'N/A', plan.item?.currency || 'INR')
    console.log('Plan Interval:', plan.interval, plan.period)
    console.log('')
} catch (error) {
    console.error('❌ Plan not found or inaccessible')
    console.error('Error:', error.message)
    console.error('')
    console.error('⚠️  Create a plan in Razorpay Dashboard:')
    console.error('   https://dashboard.razorpay.com/app/subscriptions/plans')
    console.error('')
}

console.log('✅ All tests completed!')
