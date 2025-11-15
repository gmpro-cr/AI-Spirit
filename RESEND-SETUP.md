# Resend Email Setup Guide (Alternative to Gmail)

Resend is a modern email API that's much easier to set up than Gmail SMTP. It's free for up to 100 emails per day and 3,000 emails per month.

## Quick Setup (5 minutes)

### Step 1: Create Resend Account

1. Go to: https://resend.com/signup
2. Sign up with your email (can use mahalegauravk@gmail.com)
3. Verify your email address

### Step 2: Get API Key

1. After signing in, you'll be on the dashboard
2. Click on **"API Keys"** in the left sidebar
3. Click **"Create API Key"**
4. Name it: "AI-Spirit Contact Form"
5. Choose: **"Sending access"**
6. Click **"Add"**
7. **Copy the API key** (starts with `re_...`)

### Step 3: Add API Key to .env.local

Open `.env.local` and add:

```env
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test

1. Go to http://localhost:3000
2. Click "Contact Us"
3. Fill in the form and submit
4. Check mahalegauravk@gmail.com inbox

## What's Different from Gmail?

✅ **Easier**: Just one API key, no App Passwords or 2-Step Verification
✅ **Faster**: Better delivery rates
✅ **Free tier**: 100 emails/day, 3,000/month
⚠️ **Test domain**: By default uses `onboarding@resend.dev` as sender

## Using Your Own Domain (Optional)

To send from `contact@ai-spirit.com` instead of `onboarding@resend.dev`:

1. Add your domain in Resend dashboard
2. Add DNS records they provide
3. Update the code to use your domain

For now, the test domain works perfectly fine!

## Current Setup

- ✅ Resend package installed
- ✅ API endpoint created: `/api/contact-resend`
- ✅ ContactModal updated to use Resend
- ⏳ Need to add RESEND_API_KEY to .env.local

## Troubleshooting

**If emails don't send:**
1. Check API key is correct in `.env.local`
2. Verify you copied the full API key (starts with `re_`)
3. Restart the dev server
4. Check server logs for errors

**Resend vs Gmail:**
- Resend is recommended for production apps
- Gmail SMTP is more complex and has daily limits
- Both work, but Resend is simpler to set up
