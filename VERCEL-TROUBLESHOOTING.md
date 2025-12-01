# Vercel Deployment Troubleshooting

## Local Build Status

✅ **Local build succeeded** - Code is correct

```
npm run build
✓ Compiled successfully
✓ Generating static pages (10/10)
```

## Common Vercel Deployment Issues

### 1. Missing Environment Variables

Check in Vercel Dashboard → Settings → Environment Variables:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

### 2. Build Settings

**Build Command:** `next build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Node Version:** 18.x or higher

### 3. Database Tables

Ensure you ran the SQL from `MEMORY-SYSTEM-SETUP.md`:
- `user_profiles` table exists
- `conversation_memories` table exists
- RLS policies are set

### 4. Check Deployment Logs

1. Go to Vercel Dashboard
2. Click on failed deployment
3. View build logs
4. Look for error message

### 5. Common Errors & Fixes

**Error: "Module not found"**
- Run `npm install` locally
- Check if all dependencies are in `package.json`
- Commit `package-lock.json`

**Error: "Environment variable not found"**
- Add missing variables in Vercel dashboard
- Redeploy after adding variables

**Error: "Build timeout"**
- Increase build timeout in Vercel settings
- Or optimize build (remove unused dependencies)

**Error: "Database connection failed"**
- Check Supabase URL is correct
- Check Supabase keys are valid
- Verify RLS policies allow access

## How to Get Error Details

1. Open Vercel Dashboard
2. Go to Deployments tab
3. Click the failed deployment
4. Scroll to "Build Logs" or "Runtime Logs"
5. Copy the error message
6. Share with me to fix

## Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] Database tables created in Supabase
- [ ] RLS policies configured
- [ ] Build command is `next build`
- [ ] Node version is 18.x+
- [ ] All dependencies in package.json
- [ ] No TypeScript errors
- [ ] No ESLint errors (warnings are OK)
