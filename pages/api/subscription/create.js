// Razorpay subscription creation API.
// Auth is verified via Bearer token in the Authorization header (more reliable than cookies in production).
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Verify session via Bearer token (avoids cookie-based auth issues in PWA/production)
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

        if (!token) {
            return res.status(401).json({ error: 'Sign in required to subscribe.' })
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' })
        }

        const userId = user.id
        const userEmail = user.email
        const userName =
            req.body?.userName ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (userEmail ? userEmail.split('@')[0] : 'User')

        if (!userEmail) {
            return res.status(400).json({ error: 'No email on session' })
        }

        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        const planId = process.env.RAZORPAY_PLAN_ID

        if (!keyId || !keySecret || !planId) {
            console.error('❌ Missing Razorpay configuration')
            return res.status(500).json({ error: 'Payment system not configured' })
        }

        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

        // Step 1: Find or create customer
        let customer
        const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: userName, email: userEmail }),
        })

        if (!customerResponse.ok) {
            const error = await customerResponse.json()

            if (error.error?.description?.includes('Customer already exists')) {
                const fetchResponse = await fetch(
                    `https://api.razorpay.com/v1/customers?email=${encodeURIComponent(userEmail)}`,
                    { method: 'GET', headers: { 'Authorization': `Basic ${auth}` } }
                )
                const fetchData = await fetchResponse.json()
                if (fetchData.items && fetchData.items.length > 0) {
                    customer = fetchData.items[0]
                } else {
                    return res.status(500).json({ error: 'Customer lookup failed' })
                }
            } else {
                console.error('❌ Customer creation failed:', error)
                return res.status(500).json({ error: 'Failed to create customer' })
            }
        } else {
            customer = await customerResponse.json()
        }

        // Step 2: Create subscription. `notes.user_id` is the only reliable way for the
        // webhook to bind a Razorpay subscription back to the Supabase user.
        const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                plan_id: planId,
                customer_id: customer.id,
                total_count: 12,
                customer_notify: 1,
                notes: {
                    user_id: userId,
                    user_email: userEmail,
                },
            }),
        })

        if (!subscriptionResponse.ok) {
            const error = await subscriptionResponse.json()
            console.error('❌ Subscription creation failed:', error)
            return res.status(500).json({ error: 'Failed to create subscription' })
        }

        const subscription = await subscriptionResponse.json()

        return res.status(200).json({
            success: true,
            subscription: {
                id: subscription.id,
                razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            },
        })
    } catch (error) {
        console.error('Subscription creation error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
