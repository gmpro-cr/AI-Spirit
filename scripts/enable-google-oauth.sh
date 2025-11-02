#!/bin/bash

# Supabase Management API to enable Google OAuth
# Project reference from your Supabase URL
PROJECT_REF="exdjsvknudvfkabnifrg"

# You'll need your Supabase access token
# Get it from: https://supabase.com/dashboard/account/tokens

echo "=========================================="
echo "Enabling Google OAuth via Supabase API"
echo "=========================================="
echo ""

# First, let's check if we have an access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN environment variable not set"
  echo ""
  echo "To get your access token:"
  echo "1. Go to: https://supabase.com/dashboard/account/tokens"
  echo "2. Click 'Generate new token'"
  echo "3. Copy the token"
  echo "4. Run: export SUPABASE_ACCESS_TOKEN='your_token_here'"
  echo "5. Then run this script again"
  exit 1
fi

echo "Using Project: $PROJECT_REF"
echo ""
echo "Updating auth configuration..."

# Update auth config to enable Google
RESPONSE=$(curl -s -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "EXTERNAL_GOOGLE_ENABLED": true,
    "EXTERNAL_GOOGLE_CLIENT_ID": "729425456467-g254fun3shqr3q57pnbptnovklf0a4et.apps.googleusercontent.com",
    "EXTERNAL_GOOGLE_SECRET": "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",
    "EXTERNAL_GOOGLE_REDIRECT_URI": "https://exdjsvknudvfkabnifrg.supabase.co/auth/v1/callback"
  }')

echo "$RESPONSE" | python3 -m json.tool

echo ""
echo "Waiting 30 seconds for changes to propagate..."
sleep 30

echo ""
echo "Verifying Google is enabled..."
bash scripts/verify-google-auth.sh
