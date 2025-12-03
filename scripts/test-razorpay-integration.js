/**
 * Razorpay Integration Test Script
 *
 * This script tests the Razorpay payment integration to ensure:
 * 1. Environment variables are properly configured
 * 2. Database tables exist and are accessible
 * 3. Razorpay API credentials are valid
 * 4. Payment flow endpoints are working
 */

import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
}

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`)
}

function success(message) {
    log(`✅ ${message}`, colors.green)
}

function error(message) {
    log(`❌ ${message}`, colors.red)
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow)
}

function info(message) {
    log(`ℹ️  ${message}`, colors.blue)
}

async function testEnvironmentVariables() {
    log('\n📋 Testing Environment Variables...', colors.bright)

    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'NEXT_PUBLIC_RAZORPAY_KEY_ID',
        'RAZORPAY_PLAN_ID'
    ]

    let allPresent = true
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            success(`${varName} is set`)
        } else {
            error(`${varName} is missing`)
            allPresent = false
        }
    }

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
        success('RAZORPAY_WEBHOOK_SECRET is set (optional)')
    } else {
        warning('RAZORPAY_WEBHOOK_SECRET is not set (optional but recommended)')
    }

    return allPresent
}

async function testSupabaseConnection() {
    log('\n🔌 Testing Supabase Connection...', colors.bright)

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        // Test connection
        const { data, error } = await supabase.from('subscriptions').select('count').limit(1)

        if (error) {
            if (error.message.includes('relation "subscriptions" does not exist')) {
                error('Subscriptions table does not exist. Run the SQL migration first!')
                info('See RAZORPAY-SETUP-GUIDE.md Step 1')
                return false
            }
            throw error
        }

        success('Supabase connection successful')
        success('Subscriptions table exists')

        // Test payments table
        const { error: paymentsError } = await supabase.from('payments').select('count').limit(1)

        if (paymentsError) {
            if (paymentsError.message.includes('relation "payments" does not exist')) {
                error('Payments table does not exist. Run the SQL migration first!')
                return false
            }
            throw paymentsError
        }

        success('Payments table exists')
        return true
    } catch (err) {
        error(`Supabase connection failed: ${err.message}`)
        return false
    }
}

async function testRazorpayCredentials() {
    log('\n🔑 Testing Razorpay Credentials...', colors.bright)

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        // Try to fetch plans to verify credentials
        const plans = await razorpay.plans.all({ count: 1 })

        success('Razorpay credentials are valid')
        success(`Connected to Razorpay account`)

        // Check if the configured plan exists
        try {
            const plan = await razorpay.plans.fetch(process.env.RAZORPAY_PLAN_ID)
            success(`Plan ${process.env.RAZORPAY_PLAN_ID} exists`)
            info(`Plan amount: ₹${plan.item.amount / 100}`)
            info(`Plan interval: ${plan.interval} ${plan.period}`)
        } catch (planError) {
            error(`Plan ${process.env.RAZORPAY_PLAN_ID} not found`)
            warning('Create the plan in Razorpay Dashboard or update RAZORPAY_PLAN_ID')
            return false
        }

        return true
    } catch (err) {
        error(`Razorpay credentials invalid: ${err.message}`)
        return false
    }
}

async function testAPIEndpoints() {
    log('\n🌐 Testing API Endpoints...', colors.bright)

    const endpoints = [
        '/api/razorpay/create-subscription.js',
        '/api/razorpay/verify-payment.js',
        '/api/razorpay/webhook.js',
        '/api/user/subscription-status.js',
    ]

    let allExist = true
    for (const endpoint of endpoints) {
        const path = `./pages${endpoint}`
        try {
            await import(path)
            success(`${endpoint} exists`)
        } catch (err) {
            error(`${endpoint} not found`)
            allExist = false
        }
    }

    return allExist
}

async function runTests() {
    log('🚀 Starting Razorpay Integration Tests', colors.bright)
    log('=' .repeat(50))

    const results = {
        env: await testEnvironmentVariables(),
        supabase: await testSupabaseConnection(),
        razorpay: await testRazorpayCredentials(),
        endpoints: await testAPIEndpoints(),
    }

    log('\n' + '='.repeat(50))
    log('📊 Test Summary', colors.bright)
    log('='.repeat(50))

    const allPassed = Object.values(results).every(result => result === true)

    if (allPassed) {
        success('All tests passed! ✨')
        success('Your Razorpay integration is ready to use!')
        info('\nNext steps:')
        info('1. Visit http://localhost:3000/pricing to test the payment flow')
        info('2. Use test card: 4111 1111 1111 1111')
        info('3. Set up webhook in Razorpay Dashboard (see RAZORPAY-SETUP-GUIDE.md)')
    } else {
        error('Some tests failed. Please fix the issues above.')
        info('\nRefer to RAZORPAY-SETUP-GUIDE.md for detailed setup instructions')
    }

    log('='.repeat(50))
    process.exit(allPassed ? 0 : 1)
}

runTests().catch(err => {
    error(`Test suite failed: ${err.message}`)
    console.error(err)
    process.exit(1)
})
