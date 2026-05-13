// Razorpay webhook handler. Verifies the signature against the raw request body
// (HMAC-SHA256 with RAZORPAY_WEBHOOK_SECRET), then upserts subscription state into
// the `subscriptions` table so chat API can gate premium messages.
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export const config = {
    api: { bodyParser: false },
}

function readRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', () => resolve(Buffer.concat(chunks)))
        req.on('error', reject)
    })
}

async function fetchSubscription(subscriptionId) {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const response = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${subscriptionId}`,
        { headers: { Authorization: `Basic ${auth}` } }
    )
    if (!response.ok) {
        throw new Error(`Failed to fetch subscription ${subscriptionId}: ${response.status}`)
    }
    return response.json()
}

async function upsertSubscription(sub) {
    const userId = sub.notes?.user_id
    if (!userId) {
        console.error('[Webhook] Missing user_id on subscription notes:', sub.id)
        return
    }

    const toIso = (epoch) => (epoch ? new Date(epoch * 1000).toISOString() : null)

    const row = {
        user_id: userId,
        razorpay_subscription_id: sub.id,
        razorpay_customer_id: sub.customer_id || null,
        razorpay_plan_id: sub.plan_id || null,
        status: sub.status,
        current_period_start: toIso(sub.current_start),
        current_period_end: toIso(sub.current_end),
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert(row, { onConflict: 'razorpay_subscription_id' })

    if (error) {
        console.error('[Webhook] Failed to upsert subscription:', error)
        throw error
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
        console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured')
        return res.status(500).json({ error: 'Webhook not configured' })
    }

    let rawBody
    try {
        rawBody = await readRawBody(req)
    } catch (err) {
        return res.status(400).json({ error: 'Invalid body' })
    }

    const signature = req.headers['x-razorpay-signature']
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

    if (!signature || signature !== expected) {
        console.warn('[Webhook] Signature mismatch')
        return res.status(400).json({ error: 'Invalid signature' })
    }

    let event
    try {
        event = JSON.parse(rawBody.toString('utf8'))
    } catch {
        return res.status(400).json({ error: 'Invalid JSON' })
    }

    try {
        const eventType = event.event
        const subscriptionEntity = event.payload?.subscription?.entity
        const paymentEntity = event.payload?.payment?.entity

        switch (eventType) {
            case 'subscription.activated':
            case 'subscription.charged':
            case 'subscription.updated':
            case 'subscription.resumed':
            case 'subscription.authenticated':
                if (subscriptionEntity) {
                    await upsertSubscription(subscriptionEntity)
                }
                break

            case 'subscription.cancelled':
            case 'subscription.completed':
            case 'subscription.halted':
            case 'subscription.paused':
                if (subscriptionEntity) {
                    await upsertSubscription(subscriptionEntity)
                }
                break

            case 'payment.authorized':
            case 'payment.captured':
                // For initial payment, fetch the subscription and upsert.
                if (paymentEntity?.subscription_id) {
                    const sub = await fetchSubscription(paymentEntity.subscription_id)
                    await upsertSubscription(sub)
                }
                break

            default:
                console.log('[Webhook] Ignoring event:', eventType)
        }

        return res.status(200).json({ ok: true })
    } catch (error) {
        console.error('[Webhook] Handler error:', error)
        return res.status(500).json({ error: 'Webhook processing failed' })
    }
}
