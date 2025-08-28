# 🔐 Authentication Token & Refresh Token Troubleshooting Guide

## 🚨 Common Issues

### 1. "Auth token or refresh token is not getting" Error

This error typically occurs when:
- OAuth tokens are missing or expired
- Service account credentials are not configured
- Environment variables are missing
- Google API is not properly enabled

## 🔍 Diagnosis Steps

### Step 1: Check Current Authentication Status

Visit the `/reviews` page and check the "Store Reviews" tab. Look for:
- Authentication status indicators
- Error messages with detailed information
- Current token status

### Step 2: Verify Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Required for OAuth flow
GOOGLE_CLIENT_ID=your_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_oauth_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Required for service account (alternative)
GOOGLE_CLIENT_EMAIL=service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional for limited API access
GOOGLE_API_KEY=your_api_key_here

# Required for JWT
JWT_SECRET=your_jwt_secret_here
```

### Step 3: Check Google Cloud Console

1. **Enable Required APIs:**
   - Google Business Profile API
   - Google My Business API
   - Google+ API

2. **Verify OAuth Consent Screen:**
   - Configure authorized domains
   - Add required scopes

3. **Check Credentials:**
   - OAuth 2.0 Client IDs
   - Service Account Keys

## 🛠️ Solutions

### Solution 1: OAuth Authentication (Recommended)

1. **Go to `/reviews` page**
2. **Click "Google Live" tab**
3. **Click "Connect Google"**
4. **Complete OAuth flow**
5. **Verify tokens are set in cookies**

### Solution 2: Service Account Authentication

1. **Create Service Account:**
   ```bash
   # In Google Cloud Console
   # IAM & Admin > Service Accounts > Create Service Account
   ```

2. **Download JSON key file**

3. **Set environment variables:**
   ```bash
   GOOGLE_CLIENT_EMAIL=service@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Solution 3: API Key Authentication (Limited)

1. **Create API Key in Google Cloud Console**
2. **Set environment variable:**
   ```bash
   GOOGLE_API_KEY=your_api_key_here
   ```

## 🔧 Testing Commands

### Test OAuth Flow
```bash
curl -v "http://localhost:3000/api/google-business/auth?returnTo=/reviews"
```

### Test Store Reviews API
```bash
curl -s "http://localhost:3000/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027"
```

### Test Direct API Call
```bash
curl -s "http://localhost:3000/api/store-reviews?businessProfileId=16058076381455815546&storeId=11007263269570993027&direct=true"
```

## 📋 Troubleshooting Checklist

- [ ] `.env.local` file exists with required variables
- [ ] Google Cloud Console APIs are enabled
- [ ] OAuth consent screen is configured
- [ ] Credentials are properly set up
- [ ] Application is running on correct port
- [ ] Cookies are enabled in browser
- [ ] No CORS issues
- [ ] Network requests are reaching the server

## 🚀 Quick Fix Commands

### 1. Restart Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Clear Browser Cookies
- Open DevTools > Application > Cookies
- Clear all cookies for localhost:3000

### 3. Check Server Logs
```bash
# Look for authentication errors in terminal
# Check browser console for client-side errors
```

## 📱 Browser-Specific Issues

### Chrome/Edge
- Check if cookies are blocked
- Verify third-party cookies are allowed
- Check for CORS errors in console

### Firefox
- Check privacy settings
- Verify cookie permissions
- Check network tab for failed requests

### Safari
- Check privacy settings
- Verify cross-site tracking prevention
- Check for CORS issues

## 🔒 Security Considerations

1. **Never commit `.env.local` to version control**
2. **Use environment variables for sensitive data**
3. **Rotate API keys regularly**
4. **Monitor API usage and quotas**
5. **Use least privilege principle for service accounts**

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the error logs in your terminal**
2. **Review browser console for client-side errors**
3. **Verify all environment variables are set correctly**
4. **Ensure Google Cloud Console is properly configured**
5. **Check if the issue is browser-specific**

## 🔄 Token Refresh Issues

### OAuth Token Expired
- Tokens automatically refresh via refresh token
- If refresh fails, user needs to re-authenticate
- Check if refresh token is still valid

### Service Account Token Expired
- Service account tokens expire after 1 hour
- Application should automatically refresh
- Check service account permissions

### API Key Issues
- API keys don't expire but can be restricted
- Check API quotas and billing
- Verify API key has correct permissions

## 📊 Monitoring & Debugging

### Enable Debug Logging
```bash
# Set in .env.local
DEBUG=true
NODE_ENV=development
```

### Check Token Status
```bash
# Visit this endpoint to check current auth status
curl "http://localhost:3000/api/google-business/auth/status"
```

### Monitor API Calls
- Check Network tab in browser DevTools
- Monitor server logs for API requests
- Verify response status codes and error messages
