import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance
let razorpayInstance = null

export function getRazorpayInstance() {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials not configured')
        }

        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
    }

    return razorpayInstance
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
    const razorpay = getRazorpayInstance()

    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 12, // 12 months
            quantity: 1,
        })

        return {
            success: true,
            subscription,
        }
    } catch (error) {
        console.error('Razorpay subscription creation error:', error)
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
    const razorpay = getRazorpayInstance()

    try {
        const customer = await razorpay.customers.create({
            name: customerData.name,
            email: customerData.email,
            contact: customerData.contact || '',
        })

        return {
            success: true,
            customer,
        }
    } catch (error) {
        console.error('Razorpay customer creation error:', error)
        return {
            success: false,
            error: error.message,
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
