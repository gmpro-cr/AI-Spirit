import { supabaseAdmin } from '@/lib/supabase'
import { createCustomer, createSubscription, PREMIUM_PLAN } from '@/lib/razorpay'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { userId, userEmail, userName } = req.body

        if (!userId || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Check if user already has an active subscription
        const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        if (existing) {
            return res.status(400).json({ error: 'User already has an active subscription' })
        }

        // Create or get Razorpay customer
        let razorpayCustomerId

        // Check if customer already exists in our database
        const { data: existingSubscription } = await supabaseAdmin
            .from('subscriptions')
            .select('razorpay_customer_id')
            .eq('user_id', userId)
            .limit(1)
            .single()

        if (existingSubscription?.razorpay_customer_id) {
            razorpayCustomerId = existingSubscription.razorpay_customer_id
        } else {
            // Create new Razorpay customer
            const customerResult = await createCustomer({
                name: userName || userEmail.split('@')[0],
                email: userEmail,
            })

            if (!customerResult.success) {
                console.error('Failed to create Razorpay customer:', customerResult.error)
                return res.status(500).json({
                    error: 'Failed to create customer',
                    details: customerResult.error,
                    debug: {
                        userName: userName || 'not provided',
                        userEmail: userEmail,
                        hasEmail: !!userEmail
                    }
                })
            }

            razorpayCustomerId = customerResult.customer.id
        }

        // Create Razorpay subscription using direct API
        const subscriptionResult = await createSubscription(
            razorpayCustomerId,
            process.env.RAZORPAY_PLAN_ID || 'plan_premium_monthly'
        )

        if (!subscriptionResult.success) {
            console.error('Failed to create Razorpay subscription:', subscriptionResult.error)
            return res.status(500).json({ error: 'Failed to create subscription' })
        }

        const subscription = subscriptionResult.subscription

        // Store subscription in database
        const { data: dbSubscription, error: dbError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: userId,
                razorpay_subscription_id: subscription.id,
                razorpay_customer_id: razorpayCustomerId,
                plan_id: 'premium_monthly',
                status: 'created',
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            return res.status(500).json({ error: 'Failed to store subscription' })
        }

        return res.status(200).json({
            success: true,
            subscription: {
                id: subscription.id,
                short_url: subscription.short_url,
                razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            },
        })
    } catch (error) {
        console.error('Create subscription error:', error)
        return res.status(500).json({ error: 'Failed to create subscription' })
    }
}
