#!/bin/bash

echo "🔐 Getting Authentication Tokens from Google Business Profile API"
echo "=============================================================="

# Base URL
BASE_URL="http://localhost:3000"

# Test parameters
BUSINESS_PROFILE_ID="16058076381455815546"
STORE_ID="11007263269570993027"

echo ""
echo "1️⃣ Testing Google Business OAuth Authentication"
echo "----------------------------------------------"
echo "This will redirect to Google OAuth if not authenticated:"
curl -v "${BASE_URL}/api/google-business/auth?returnTo=/reviews" 2>&1 | grep -E "(Location|HTTP|GET|POST)"

echo ""
echo "2️⃣ Testing Google Business Accounts (requires auth)"
echo "------------------------------------------------"
echo "Getting accounts list (requires valid token):"
curl -s "${BASE_URL}/api/google-business/accounts" | jq '.'

echo ""
echo "3️⃣ Testing Direct Google API Token Exchange"
echo "------------------------------------------"
echo "Note: This requires valid service account credentials in .env.local"

# Test if we can get a token directly
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found, testing direct token exchange..."
    
    # Source environment variables
    source .env.local
    
    if [ ! -z "$GOOGLE_CLIENT_EMAIL" ] && [ ! -z "$GOOGLE_PRIVATE_KEY" ]; then
        echo "✅ Service account credentials found"
        echo "🔑 Client Email: ${GOOGLE_CLIENT_EMAIL}"
        echo "🔑 Private Key: ${GOOGLE_PRIVATE_KEY:0:50}..."
        
        # Create JWT token and exchange for access token
        echo ""
        echo "4️⃣ Creating JWT Token and Exchanging for Access Token"
        echo "---------------------------------------------------"
        
        # This would require the JWT creation logic
        echo "To get a token manually, you need to:"
        echo "1. Create a JWT token with your service account"
        echo "2. Exchange it for an access token"
        echo "3. Use the access token to call Google APIs"
        
    else
        echo "❌ Service account credentials not found in .env.local"
        echo "Please add:"
        echo "GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com"
        echo "GOOGLE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\""
    fi
else
    echo "❌ .env.local file not found"
    echo "Please create .env.local with your Google API credentials"
fi

echo ""
echo "5️⃣ Testing Store Reviews with Token (if available)"
echo "------------------------------------------------"
echo "Testing store reviews endpoint:"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=${BUSINESS_PROFILE_ID}&storeId=${STORE_ID}" | jq '.'

echo ""
echo "6️⃣ Manual Token Testing Commands"
echo "-------------------------------"
echo ""
echo "To manually test with a token, use:"
echo "curl -H \"Authorization: Bearer YOUR_ACCESS_TOKEN\" \\"
echo "     \"https://mybusiness.googleapis.com/v4/accounts/${BUSINESS_PROFILE_ID}/locations/${STORE_ID}/reviews\""
echo ""
echo "To get a token manually from Google:"
echo "1. Go to Google Cloud Console"
echo "2. Enable Google Business Profile API"
echo "3. Create service account or OAuth2 credentials"
echo "4. Use the credentials to get an access token"
echo ""
echo "🔗 Google OAuth Playground: https://developers.google.com/oauthplayground/"
echo "🔗 Google Cloud Console: https://console.cloud.google.com/"
echo ""
echo "✅ Token Testing Complete!"
echo "========================"
