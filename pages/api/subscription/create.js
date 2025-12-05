// Simple Razorpay subscription creation API
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { userEmail, userName } = req.body

        if (!userEmail) {
            return res.status(400).json({ error: 'Email is required' })
        }

        // Get credentials from environment
        const keyId = process.env.RAZORPAY_KEY_ID
        const keySecret = process.env.RAZORPAY_KEY_SECRET
        const planId = process.env.RAZORPAY_PLAN_ID

        if (!keyId || !keySecret || !planId) {
            console.error('Missing Razorpay configuration')
            return res.status(500).json({ error: 'Payment system not configured' })
        }

        // Create Basic Auth header
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

        // Step 1: Create customer
        const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: userName || userEmail.split('@')[0],
                email: userEmail,
            }),
        })

        if (!customerResponse.ok) {
            const error = await customerResponse.json()
            console.error('Customer creation failed:', error)
            return res.status(500).json({ error: 'Failed to create customer' })
        }

        const customer = await customerResponse.json()

        // Step 2: Create subscription
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
            }),
        })

        if (!subscriptionResponse.ok) {
            const error = await subscriptionResponse.json()
            console.error('Subscription creation failed:', error)
            return res.status(500).json({ error: 'Failed to create subscription' })
        }

        const subscription = await subscriptionResponse.json()

        // Return subscription details with proper structure for Razorpay checkout
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
