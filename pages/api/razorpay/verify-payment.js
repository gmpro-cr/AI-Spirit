import { supabaseAdmin } from '@/lib/supabase'
import { verifyPaymentSignature } from '@/lib/razorpay'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
            userId,
        } = req.body

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' })
        }

        // Verify payment signature
        const isValid = verifyPaymentSignature({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
        })

        if (!isValid) {
            console.error('Invalid payment signature')
            return res.status(400).json({ error: 'Invalid payment signature' })
        }

        // Update subscription status in database
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                updated_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', razorpay_subscription_id)
            .select()
            .single()

        if (subError) {
            console.error('Database error updating subscription:', subError)
            return res.status(500).json({ error: 'Failed to update subscription' })
        }

        // Record payment
        const { error: paymentError } = await supabaseAdmin
            .from('payments')
            .insert({
                user_id: userId || subscription.user_id,
                subscription_id: subscription.id,
                razorpay_payment_id,
                razorpay_order_id: razorpay_subscription_id,
                amount: 49900, // ₹499 in paise
                currency: 'INR',
                status: 'captured',
            })

        if (paymentError) {
            console.error('Database error recording payment:', paymentError)
            // Don't fail the request - subscription is already active
        }

        console.log('✅ Payment verified and subscription activated:', {
            subscriptionId: razorpay_subscription_id,
            paymentId: razorpay_payment_id,
            userId: subscription.user_id,
        })

        return res.status(200).json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                current_period_end: subscription.current_period_end,
            },
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return res.status(500).json({ error: 'Failed to verify payment' })
    }
}
