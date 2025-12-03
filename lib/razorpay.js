import crypto from 'crypto'

// Get Razorpay credentials
function getCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_RnGy8r5BvRNIut'
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '0Fj6JLx5CfijQhMMkAdzyo06'

    console.log('🔍 Razorpay credentials:', {
        hasEnvKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasEnvKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        keyIdPreview: keyId.substring(0, 12) + '...' + keyId.substring(keyId.length - 4),
        mode: keyId.includes('test') ? 'TEST' : 'LIVE'
    })

    return { keyId, keySecret }
}

// Make authenticated request to Razorpay API
async function razorpayRequest(endpoint, method = 'GET', data = null) {
    const { keyId, keySecret } = getCredentials()
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const options = {
        method,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data)
    }

    const url = `https://api.razorpay.com/v1${endpoint}`

    console.log(`📡 Razorpay API ${method} ${endpoint}`)

    const response = await fetch(url, options)
    const responseData = await response.json()

    if (!response.ok) {
        console.error('❌ Razorpay API error:', {
            status: response.status,
            error: responseData.error
        })
        throw Object.assign(new Error(responseData.error?.description || 'Razorpay API error'), {
            statusCode: response.status,
            error: responseData.error
        })
    }

    console.log(`✅ Razorpay API success`)
    return responseData
}

// Premium plan configuration
export const PREMIUM_PLAN = {
    amount: 49900, // ₹499 in paise
    currency: 'INR',
    period: 'monthly',
    interval: 1,
}

/**
 * Create a Razorpay subscription
 * @param {string} customerId - Razorpay customer ID
 * @param {string} planId - Razorpay plan ID
 * @returns {Promise<Object>} Subscription details
 */
export async function createSubscription(customerId, planId) {
    try {
        const subscription = await razorpayRequest('/subscriptions', 'POST', {
            plan_id: planId,
            customer_id: customerId,
            customer_notify: 1,
            total_count: 12,
            quantity: 1,
        })

        return {
            success: true,
            subscription,
        }
    } catch (error) {
        console.error('❌ Subscription creation error:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Create a Razorpay customer
 * @param {Object} customerData - Customer details {name, email, contact}
  * @returns {Promise<Object>} Customer details
 */
export async function createCustomer(customerData) {
    try {
        console.log('Creating Razorpay customer via direct API:', {
            name: customerData.name,
            email: customerData.email,
            hasContact: !!customerData.contact
        })

        const customer = await razorpayRequest('/customers', 'POST', {
            name: customerData.name,
            email: customerData.email,
            contact: customerData.contact || '',
        })

        console.log('✅ Customer created successfully:', customer.id)

        return {
            success: true,
            customer,
        }
    } catch (error) {
        console.error('❌ Customer creation error:', {
            message: error.message,
            statusCode: error.statusCode,
            error: error.error
        })

        return {
            success: false,
            error: error.message,
            statusCode: error.statusCode,
            errorDetails: error.error
        }
    }
}

/**
 * Verify Razorpay payment signature
 * @param {Object} params - {razorpay_payment_id, razorpay_subscription_id, razorpay_signature}
 * @returns {boolean} Whether signature is valid
 */
export function verifyPaymentSignature(params) {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = params

    const body = razorpay_subscription_id + '|' + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex')

    return expectedSignature === razorpay_signature
}

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Webhook request body
 * @param {string} signature - Razorpay signature from headers
 * @returns {boolean} Whether webhook is authentic
 */
export function verifyWebhookSignature(body, signature) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.warn('Webhook secret not configured')
        return false
    }

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

    return expectedSignature === signature
}

/**
 * Cancel a subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelSubscription(subscriptionId) {
    const razorpay = getRazorpayInstance()

    try {
        const subscription = await razorpay.subscriptions.cancel(subscriptionId)

        return {
            success: true,
            subscription,
        }
    } catch (error) {
        console.error('Razorpay subscription cancellation error:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

/**
 * Fetch subscription details
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export async function fetchSubscription(subscriptionId) {
    const razorpay = getRazorpayInstance()

    try {
        const subscription = await razorpay.subscriptions.fetch(subscriptionId)

        return {
            success: true,
            subscription,
        }
    } catch (error) {
        console.error('Razorpay subscription fetch error:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}
