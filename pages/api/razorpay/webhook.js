import { supabaseAdmin } from '@/lib/supabase'
import { verifyWebhookSignature } from '@/lib/razorpay'

export const config = {
    api: {
        bodyParser: false,
    },
}

async function buffer(req) {
    const chunks = []
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const rawBody = await buffer(req)
        const signature = req.headers['x-razorpay-signature']

        // Verify webhook signature
        const isValid = verifyWebhookSignature(rawBody, signature)

        if (!isValid) {
            console.error('[Webhook] Invalid signature')
            return res.status(400).json({ error: 'Invalid signature' })
        }

        const event = JSON.parse(rawBody)
        const { entity, event: eventType } = event

        console.log('[Webhook] Received event:', eventType)

        // Handle different webhook events
        switch (eventType) {
            case 'subscription.activated':
            case 'subscription.charged':
                await handleSubscriptionActivated(entity.subscription)
                break

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(entity.subscription)
                break

            case 'subscription.completed':
            case 'subscription.expired':
                await handleSubscriptionExpired(entity.subscription)
                break

            case 'payment.captured':
                await handlePaymentCaptured(entity.payment)
                break

            case 'payment.failed':
                await handlePaymentFailed(entity.payment)
                break

            default:
                console.log('[Webhook] Unhandled event type:', eventType)
        }

        return res.status(200).json({ received: true })
    } catch (error) {
        console.error('[Webhook] Error:', error)
        return res.status(500).json({ error: 'Webhook processing failed' })
    }
}

async function handleSubscriptionActivated(subscription) {
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'active',
            current_period_start: new Date(subscription.current_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (error) {
        console.error('[Webhook] Failed to activate subscription:', error)
    } else {
        console.log('[Webhook] ✅ Subscription activated:', subscription.id)
    }
}

async function handleSubscriptionCancelled(subscription) {
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (error) {
        console.error('[Webhook] Failed to cancel subscription:', error)
    } else {
        console.log('[Webhook] ✅ Subscription cancelled:', subscription.id)
    }
}

async function handleSubscriptionExpired(subscription) {
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
        })
        .eq('razorpay_subscription_id', subscription.id)

    if (error) {
        console.error('[Webhook] Failed to expire subscription:', error)
    } else {
        console.log('[Webhook] ✅ Subscription expired:', subscription.id)
    }
}

async function handlePaymentCaptured(payment) {
    const { error } = await supabaseAdmin
        .from('payments')
        .update({
            status: 'captured',
        })
        .eq('razorpay_payment_id', payment.id)

    if (error) {
        console.error('[Webhook] Failed to update payment:', error)
    } else {
        console.log('[Webhook] ✅ Payment captured:', payment.id)
    }
}

async function handlePaymentFailed(payment) {
    const { error } = await supabaseAdmin
        .from('payments')
        .update({
            status: 'failed',
        })
        .eq('razorpay_payment_id', payment.id)

    if (error) {
        console.error('[Webhook] Failed to update payment:', error)
    } else {
        console.log('[Webhook] ⚠️ Payment failed:', payment.id)
    }
}
