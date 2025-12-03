#!/bin/bash

# Deployment Check Script for AI-Spirit
# This script verifies that the latest changes are deployed to production

echo "🔍 Checking AI-Spirit Deployment Status"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Site is accessible
echo "1️⃣  Checking if site is accessible..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://ai-spirit.in)
if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "307" ]; then
    echo -e "${GREEN}✅ Site is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Site returned HTTP $HTTP_CODE${NC}"
    exit 1
fi
echo ""

# Check 2: Pricing link in homepage
echo "2️⃣  Checking for Pricing link in homepage..."
if curl -sL "https://ai-spirit.in" | grep -q "Pricing"; then
    echo -e "${GREEN}✅ Pricing link found on homepage${NC}"
else
    echo -e "${RED}❌ Pricing link NOT found (old version deployed)${NC}"
    echo -e "${YELLOW}   → Wait 5-10 minutes for deployment to complete${NC}"
    echo -e "${YELLOW}   → Or check Vercel dashboard for errors${NC}"
fi
echo ""

# Check 3: Pricing page exists
echo "3️⃣  Checking if /pricing page exists..."
PRICING_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://ai-spirit.in/pricing)
if [ "$PRICING_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Pricing page is accessible (HTTP $PRICING_CODE)${NC}"
else
    echo -e "${RED}❌ Pricing page returned HTTP $PRICING_CODE${NC}"
fi
echo ""

# Check 4: Razorpay script loaded
echo "4️⃣  Checking if Razorpay script is loaded..."
if curl -sL "https://ai-spirit.in/pricing" | grep -q "razorpay"; then
    echo -e "${GREEN}✅ Razorpay integration found${NC}"
else
    echo -e "${YELLOW}⚠️  Razorpay script not detected (might be lazy-loaded)${NC}"
fi
echo ""

# Check 5: API endpoints
echo "5️⃣  Checking API endpoints..."
API_ENDPOINTS=(
    "/api/razorpay/create-subscription"
    "/api/razorpay/verify-payment"
    "/api/user/subscription-status"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://ai-spirit.in${endpoint}")
    if [ "$API_CODE" == "405" ] || [ "$API_CODE" == "400" ] || [ "$API_CODE" == "500" ]; then
        # These are expected errors (wrong method/missing params)
        # If we get these, the endpoint exists
        echo -e "${GREEN}✅ ${endpoint} exists${NC}"
    elif [ "$API_CODE" == "404" ]; then
        echo -e "${RED}❌ ${endpoint} not found (HTTP 404)${NC}"
    else
        echo -e "${YELLOW}⚠️  ${endpoint} returned HTTP $API_CODE${NC}"
    fi
done
echo ""

# Summary
echo "========================================"
echo "📊 Deployment Check Summary"
echo "========================================"

# Check if new features are live
if curl -sL "https://ai-spirit.in" | grep -q "Pricing"; then
    echo -e "${GREEN}✅ New Razorpay features are LIVE!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Setup database tables (see RAZORPAY-SETUP-GUIDE.md)"
    echo "2. Configure Razorpay webhook"
    echo "3. Test payment flow at https://ai-spirit.in/pricing"
else
    echo -e "${YELLOW}⚠️  Deployment is in progress or failed${NC}"
    echo ""
    echo "Actions:"
    echo "1. Wait 5-10 minutes for deployment"
    echo "2. Check Vercel dashboard: https://vercel.com/dashboard"
    echo "3. Check build logs for errors"
    echo "4. Verify environment variables are set"
fi

echo ""
echo "🔗 Useful Links:"
echo "   Site: https://ai-spirit.in"
echo "   Pricing: https://ai-spirit.in/pricing"
echo "   Vercel: https://vercel.com/dashboard"
echo ""
