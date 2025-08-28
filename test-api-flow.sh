#!/bin/bash

echo "🚀 Testing StoreCom Google Business Profile API Flow"
echo "=================================================="

# Base URL
BASE_URL="http://localhost:3000"

# Test parameters
BUSINESS_PROFILE_ID="16058076381455815546"
STORE_ID="11007263269570993027"

echo ""
echo "1️⃣ Testing Store Reviews API (Basic)"
echo "-----------------------------------"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=${BUSINESS_PROFILE_ID}&storeId=${STORE_ID}" | jq '.'

echo ""
echo "2️⃣ Testing Store Reviews API (Direct Call)"
echo "------------------------------------------"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=${BUSINESS_PROFILE_ID}&storeId=${STORE_ID}&direct=true" | jq '.'

echo ""
echo "3️⃣ Testing Google Business Accounts API"
echo "--------------------------------------"
curl -s "${BASE_URL}/api/google-business/accounts" | jq '.'

echo ""
echo "4️⃣ Testing Google Business Locations API"
echo "---------------------------------------"
curl -s "${BASE_URL}/api/google-business/locations?accountName=accounts/${BUSINESS_PROFILE_ID}" | jq '.'

echo ""
echo "5️⃣ Testing Google Business Reviews API"
echo "-------------------------------------"
curl -s "${BASE_URL}/api/google-business/reviews?locationName=accounts/${BUSINESS_PROFILE_ID}/locations/${STORE_ID}" | jq '.'

echo ""
echo "6️⃣ Testing Store Reviews with Different Parameters"
echo "------------------------------------------------"
echo "Testing with pageSize=10:"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=${BUSINESS_PROFILE_ID}&storeId=${STORE_ID}&pageSize=10" | jq '.'

echo ""
echo "7️⃣ Testing Error Cases"
echo "---------------------"
echo "Testing without businessProfileId:"
curl -s "${BASE_URL}/api/store-reviews?storeId=${STORE_ID}" | jq '.'

echo ""
echo "Testing without storeId:"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=${BUSINESS_PROFILE_ID}" | jq '.'

echo ""
echo "8️⃣ Testing with Invalid IDs"
echo "---------------------------"
curl -s "${BASE_URL}/api/store-reviews?businessProfileId=invalid&storeId=invalid" | jq '.'

echo ""
echo "✅ API Flow Testing Complete!"
echo "============================"
echo ""
echo "📊 Summary of Endpoints Tested:"
echo "• Store Reviews API (Basic)"
echo "• Store Reviews API (Direct)"
echo "• Google Business Accounts"
echo "• Google Business Locations"
echo "• Google Business Reviews"
echo "• Error Handling"
echo "• Parameter Validation"
echo ""
echo "🔗 Base URL: ${BASE_URL}"
echo "🏢 Business Profile ID: ${BUSINESS_PROFILE_ID}"
echo "🏪 Store ID: ${STORE_ID}"
