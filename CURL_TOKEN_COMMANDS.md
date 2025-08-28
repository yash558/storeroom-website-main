# 🔐 CURL Commands for Getting Google Business Profile API Tokens

## Quick Token Testing Commands

### 1. Test Google Business OAuth Authentication
```bash
# This will redirect to Google OAuth if not authenticated
curl -v "http://localhost:3000/api/google-business/auth?returnTo=/reviews"
```

### 2. Test Google Business Accounts (requires auth)
```bash
# Getting accounts list (requires valid token)
curl -s "http://localhost:3000/api/google-business/accounts"
```

### 3. Test Store Reviews API
```bash
# Basic store reviews (uses mock data if no auth)
curl -s "http://localhost:3000/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027"
```

### 4. Test Direct API Call
```bash
# Direct API call (attempts real Google API)
curl -s "http://localhost:3000/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027&direct=true"
```

## 🔑 Manual Token Exchange Commands

### 5. Create JWT Token (requires service account)
```bash
# You need to create a JWT token with your service account credentials
# This requires the jsonwebtoken library and your private key
```

### 6. Exchange JWT for Access Token
```bash
# Exchange JWT for access token
curl -X POST "https://oauth2.googleapis.com/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=YOUR_JWT_TOKEN"
```

### 7. Test Google API with Access Token
```bash
# Use the access token to call Google Business Profile API
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://mybusiness.googleapis.com/v4/accounts/16058076381455815546/locations/11007263269570993027/reviews"
```

## 🚀 Run Complete Test Scripts

### Run Full API Flow Test
```bash
./test-api-flow.sh
```

### Run Token Authentication Test
```bash
./get-token-commands.sh
```

## 📋 Required Environment Variables

Create a `.env.local` file with:
```bash
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 🔗 Useful Links

- **Google OAuth Playground**: https://developers.google.com/oauthplayground/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Google Business Profile API**: https://developers.google.com/my-business/reference/rest

## 📝 Current Status

✅ **API Endpoints Working**: Store reviews API is functional  
✅ **Mock Data Fallback**: Returns your playground data when real API fails  
❌ **Real API Access**: Requires proper Google API credentials and quotas  
🔄 **Authentication Flow**: OAuth and service account methods available
