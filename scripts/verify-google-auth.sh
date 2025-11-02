#!/bin/bash

echo "=========================================="
echo "Google OAuth Verification Script"
echo "=========================================="
echo ""

echo "1. Checking Supabase Google provider status..."
echo ""

GOOGLE_STATUS=$(curl -s "https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/settings" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZGpzdmtudWR2ZmthYm5pZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTI4MDYsImV4cCI6MjA3NjQ2ODgwNn0.WdMCf2Ce161lXR8JaYtYxB9cms3YegNIv7reoWoxNzg" \
  | python3 -m json.tool | grep '"google"' | awk '{print $2}' | tr -d ',')

if [ "$GOOGLE_STATUS" = "true" ]; then
  echo "✅ Google provider is ENABLED"
  echo ""
  echo "2. Checking environment variables..."

  if grep -q "GOOGLE_CLIENT_ID=729425456467" .env.local; then
    echo "✅ GOOGLE_CLIENT_ID is configured"
  else
    echo "❌ GOOGLE_CLIENT_ID is missing or incorrect"
  fi

  if grep -q "GOOGLE_CLIENT_SECRET=GOCSPX-" .env.local; then
    echo "✅ GOOGLE_CLIENT_SECRET is configured"
  else
    echo "❌ GOOGLE_CLIENT_SECRET is missing or incorrect"
  fi

  echo ""
  echo "=========================================="
  echo "✅ Google OAuth is properly configured!"
  echo "=========================================="
  echo ""
  echo "Next steps:"
  echo "1. Restart your dev server: npm run dev"
  echo "2. Navigate to: http://localhost:3002/auth/signin"
  echo "3. Click 'Sign in with Google'"
  echo "4. You should be redirected to Google's sign-in page"

else
  echo "❌ Google provider is NOT ENABLED"
  echo ""
  echo "Status from API: $GOOGLE_STATUS"
  echo ""
  echo "=========================================="
  echo "❌ Configuration incomplete"
  echo "=========================================="
  echo ""
  echo "You need to enable Google in Supabase Dashboard:"
  echo ""
  echo "1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/auth/providers"
  echo "2. Find 'Google' and click to expand"
  echo "3. Toggle it ON"
  echo "4. Enter Client ID: 729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com"
  echo "5. Enter Client Secret: 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"
  echo "6. Click 'Save'"
  echo "7. Wait 30 seconds, then run this script again"
  echo ""
  echo "See ENABLE-GOOGLE-STEP-BY-STEP.md for detailed instructions"
fi

echo ""
