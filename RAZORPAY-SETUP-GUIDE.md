# Razorpay Payment Setup Guide

## Step 1: Create Database Tables

Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new):

```sql
-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR(255) UNIQUE,
    razorpay_customer_id VARCHAR(255),
    plan_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'created',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_order_id VARCHAR(255),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription_id ON subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments"
    ON payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments"
    ON payments FOR ALL
    USING (auth.role() = 'service_role');

-- Create updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 2: Verify Environment Variables

Make sure these are set in your `.env.local`:

```bash
RAZORPAY_KEY_ID=rzp_live_RnCOjpYVSDEHhT
RAZORPAY_KEY_SECRET=fZUaV0GlcApszlOHVrJi3UVO
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RnCOjpYVSDEHhT
RAZORPAY_PLAN_ID=plan_RnD6BgUMt5qDBv
```

## Step 3: Setup Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://ai-spirit.in/api/razorpay/webhook`
3. Select events to listen:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.paused`
   - `subscription.expired`
4. Generate webhook secret and add to `.env.local`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## Step 4: Test the Payment Flow

1. Visit https://ai-spirit.in/pricing
2. Click "Get Premium Access"
3. Complete payment with test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

## Step 5: Verify Everything Works

Run this test script:

```bash
node scripts/test-razorpay-integration.js
```

## Troubleshooting

### Issue: "Failed to create subscription"
- Check Razorpay credentials in `.env.local`
- Verify plan_id exists in Razorpay dashboard

### Issue: "Table subscriptions does not exist"
- Run the SQL from Step 1 in Supabase SQL Editor

### Issue: "Payment verification failed"
- Check webhook signature verification
- Ensure RAZORPAY_WEBHOOK_SECRET is set correctly

## Features Implemented

✅ Subscription creation with Razorpay
✅ Payment verification
✅ Webhook handling for subscription events
✅ Database storage for subscriptions and payments
✅ RLS policies for data security
✅ Premium status checking
✅ Pricing page with beautiful UI

## Next Steps

1. Add premium features gating in the app
2. Show premium badge in user profile
3. Add subscription management page
4. Implement usage tracking for free tier limits
