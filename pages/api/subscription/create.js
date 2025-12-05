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

        console.log('🔑 Razorpay credentials check:', {
            hasKeyId: !!keyId,
            hasKeySecret: !!keySecret,
            hasPlanId: !!planId,
            keyIdPrefix: keyId?.substring(0, 8)
        })

        if (!keyId || !keySecret || !planId) {
            console.error('❌ Missing Razorpay configuration')
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

        let customer
        if (!customerResponse.ok) {
            const error = await customerResponse.json()

            // Check if customer already exists
            if (error.error?.description?.includes('Customer already exists')) {
                console.log('ℹ️  Customer already exists, fetching existing customer...')

                // Fetch existing customer by email
                const fetchResponse = await fetch(`https://api.razorpay.com/v1/customers?email=${encodeURIComponent(userEmail)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                    },
                })

                const fetchData = await fetchResponse.json()
                if (fetchData.items && fetchData.items.length > 0) {
                    customer = fetchData.items[0]
                    console.log('✅ Found existing customer:', customer.id)
                } else {
                    console.error('❌ Could not find existing customer')
                    return res.status(500).json({ error: 'Customer lookup failed' })
                }
            } else {
                console.error('❌ Customer creation failed:', {
                    status: customerResponse.status,
                    statusText: customerResponse.statusText,
                    error: error
                })
                return res.status(500).json({
                    error: 'Failed to create customer',
                    details: error
                })
            }
        } else {
            customer = await customerResponse.json()
            console.log('✅ New customer created:', customer.id)
        }

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
            console.error('❌ Subscription creation failed:', {
                status: subscriptionResponse.status,
                statusText: subscriptionResponse.statusText,
                error: error
            })
            return res.status(500).json({
                error: 'Failed to create subscription',
                details: error
            })
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
