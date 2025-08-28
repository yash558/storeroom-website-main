#!/bin/bash

# 🔐 Authentication Testing Script for StoreCom
# This script helps diagnose authentication token and refresh token issues

echo "🔐 StoreCom Authentication Test Script"
echo "======================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    source .env.local
    
    # Check for required environment variables
    echo ""
    echo "📋 Environment Variables Status:"
    echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:+✅ Set} ${GOOGLE_CLIENT_ID:-❌ Missing}"
    echo "  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:+✅ Set} ${GOOGLE_CLIENT_SECRET:-❌ Missing}"
    echo "  GOOGLE_CLIENT_EMAIL: ${GOOGLE_CLIENT_EMAIL:+✅ Set} ${GOOGLE_CLIENT_EMAIL:-❌ Missing}"
    echo "  GOOGLE_PRIVATE_KEY: ${GOOGLE_PRIVATE_KEY:+✅ Set} ${GOOGLE_PRIVATE_KEY:-❌ Missing}"
    echo "  GOOGLE_API_KEY: ${GOOGLE_API_KEY:+✅ Set} ${GOOGLE_API_KEY:-❌ Missing}"
    echo "  JWT_SECRET: ${JWT_SECRET:+✅ Set} ${JWT_SECRET:-❌ Missing}"
else
    echo "❌ .env.local file not found"
    echo "   Please create .env.local with your Google API credentials"
    echo "   See env.example for required variables"
fi

echo ""
echo "🌐 Testing API Endpoints..."
echo ""

# Test base URL
BASE_URL="http://localhost:3000"
echo "Testing base URL: $BASE_URL"

# Test 1: Check if server is running
echo ""
echo "1️⃣ Testing server connectivity..."
if curl -s "$BASE_URL" > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not running or not accessible"
    echo "   Please start the development server with: npm run dev"
    exit 1
fi

# Test 2: Check authentication status
echo ""
echo "2️⃣ Testing authentication status..."
AUTH_STATUS=$(curl -s "$BASE_URL/api/google-business/auth/status")
if [ $? -eq 0 ]; then
    echo "   ✅ Authentication status endpoint accessible"
    echo "   Response: $AUTH_STATUS"
else
    echo "   ❌ Authentication status endpoint failed"
fi

# Test 3: Test OAuth flow initiation
echo ""
echo "3️⃣ Testing OAuth flow initiation..."
OAUTH_RESPONSE=$(curl -s -I "$BASE_URL/api/google-business/auth?returnTo=/reviews")
if echo "$OAUTH_RESPONSE" | grep -q "302\|200"; then
    echo "   ✅ OAuth flow initiation successful"
else
    echo "   ❌ OAuth flow initiation failed"
    echo "   Response: $OAUTH_RESPONSE"
fi

# Test 4: Test store reviews API
echo ""
echo "4️⃣ Testing store reviews API..."
REVIEWS_RESPONSE=$(curl -s "$BASE_URL/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027")
if [ $? -eq 0 ]; then
    echo "   ✅ Store reviews API accessible"
    
    # Check if response contains authentication info
    if echo "$REVIEWS_RESPONSE" | grep -q "authentication"; then
        echo "   ✅ Authentication status included in response"
    else
        echo "   ⚠️  Authentication status not found in response"
    fi
    
    # Check if using mock data
    if echo "$REVIEWS_RESPONSE" | grep -q "Mock data"; then
        echo "   ⚠️  Using mock data (real API not accessible)"
    else
        echo "   ✅ Real data from Google API"
    fi
else
    echo "   ❌ Store reviews API failed"
fi

# Test 5: Test direct API call
echo ""
echo "5️⃣ Testing direct API call..."
DIRECT_RESPONSE=$(curl -s "$BASE_URL/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027&direct=true")
if [ $? -eq 0 ]; then
    echo "   ✅ Direct API call successful"
else
    echo "   ❌ Direct API call failed"
fi

echo ""
echo "🔍 Diagnosis Summary:"
echo "====================="

# Check for common issues
if [ ! -f ".env.local" ]; then
    echo "❌ Missing .env.local file - Create this with your Google API credentials"
fi

if [ -z "$GOOGLE_CLIENT_ID" ] && [ -z "$GOOGLE_CLIENT_EMAIL" ] && [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ No authentication credentials found - Set up OAuth, service account, or API key"
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "⚠️  OAuth not configured - Users won't be able to authenticate with Google"
fi

if [ -z "$GOOGLE_CLIENT_EMAIL" ] || [ -z "$GOOGLE_PRIVATE_KEY" ]; then
    echo "⚠️  Service account not configured - Limited API access"
fi

if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  API key not configured - Some features may not work"
fi

echo ""
echo "🚀 Next Steps:"
echo "==============="

if [ ! -f ".env.local" ]; then
    echo "1. Copy env.example to .env.local"
    echo "2. Fill in your Google API credentials"
    echo "3. Restart the development server"
elif [ -z "$GOOGLE_CLIENT_ID" ] && [ -z "$GOOGLE_CLIENT_EMAIL" ] && [ -z "$GOOGLE_API_KEY" ]; then
    echo "1. Set up Google Cloud Console project"
    echo "2. Enable required APIs"
    echo "3. Create OAuth credentials or service account"
    echo "4. Update .env.local with credentials"
    echo "5. Restart the development server"
else
    echo "1. Visit /reviews page"
    echo "2. Go to 'Google Live' tab"
    echo "3. Click 'Connect Google' to authenticate"
    echo "4. Check 'Store Reviews' tab for real data"
fi

echo ""
echo "📚 For more help, see:"
echo "  - AUTHENTICATION_TROUBLESHOOTING.md"
echo "  - GOOGLE_ACCOUNT_AUTH_GUIDE.md"
echo "  - CURL_TOKEN_COMMANDS.md"
echo ""
echo "🔐 Authentication test completed!"
