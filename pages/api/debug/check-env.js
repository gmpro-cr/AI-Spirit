export default async function handler(req, res) {
    // Security: Only allow with special header
    if (req.headers['x-debug-key'] !== 'debug-razorpay-2024') {
        return res.status(403).json({ error: 'Forbidden' })
    }

    const envVars = {
        hasRazorpayKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasRazorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        hasNextPublicRazorpayKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        hasRazorpayPlanId: !!process.env.RAZORPAY_PLAN_ID,
        
        // Show first/last 4 characters to verify
        razorpayKeyIdPreview: process.env.RAZORPAY_KEY_ID 
            ? process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...' + process.env.RAZORPAY_KEY_ID.substring(process.env.RAZORPAY_KEY_ID.length - 4)
            : 'NOT SET',
        razorpayKeySecretPreview: process.env.RAZORPAY_KEY_SECRET
            ? process.env.RAZORPAY_KEY_SECRET.substring(0, 4) + '...' + process.env.RAZORPAY_KEY_SECRET.substring(process.env.RAZORPAY_KEY_SECRET.length - 4)
            : 'NOT SET',
        
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
    }

    return res.status(200).json(envVars)
}
