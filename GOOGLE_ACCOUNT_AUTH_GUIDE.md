# Google Account Authentication & Store Management Guide

This guide explains how to use the new Google Account authentication feature in the StoreCom application, allowing users to connect their personal Google accounts and manage stores directly in Google My Business.

## 🎯 **Overview**

The new Google Account tab provides a user-friendly way to:
- **Authenticate** with your personal Google account
- **Access** your Google My Business locations
- **Create** new stores directly in GMB
- **Manage** existing locations
- **Test** store creation workflows

## 🚀 **Features**

### **Three-Tab Interface**

1. **Service Account Tab**: For developers using service account credentials
2. **Google Account Tab**: For users to authenticate with their personal Google account
3. **Testing Tab**: For testing store creation and management

### **Google Account Authentication**

- **OAuth 2.0 Flow**: Secure authentication using Google's OAuth system
- **Token Management**: Automatic token refresh and management
- **User Profile**: Display connected account information
- **Account Selection**: Choose from multiple GMB accounts

## 📋 **Prerequisites**

### **Environment Variables**

Ensure these are set in your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Google Cloud Console Setup**

1. **Enable APIs**:
   - Google My Business API
   - Google+ API (for user profile)

2. **Create OAuth 2.0 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/google-business/auth/callback`

3. **Configure OAuth Consent Screen**:
   - Add required scopes:
     - `https://www.googleapis.com/auth/business.manage`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`

## 🔐 **Authentication Flow**

### **Step 1: Connect Google Account**

1. Navigate to `/test-gmb`
2. Click on the **"Google Account"** tab
3. Click **"🔐 Connect Google Account"**
4. You'll be redirected to Google's OAuth consent screen
5. Grant permissions for the requested scopes
6. You'll be redirected back with authentication tokens

### **Step 2: Select GMB Account**

1. After successful authentication, your Google account will be displayed
2. Click **"🔄 Refresh Accounts"** to load your GMB accounts
3. Select the GMB account you want to manage from the dropdown
4. Click **"📍 Get My Locations"** to fetch existing locations

### **Step 3: Manage Stores**

1. Switch to the **"Testing"** tab
2. Fill in store details in the form
3. Click **"🚀 Create Store in GMB"** to create a new location
4. Or click **"🔌 Test Store Creation API"** to test your application's API

## 🛠 **API Endpoints**

### **Authentication Endpoints**

- **`GET /api/google-business/auth/login`**: Initiates OAuth flow
- **`GET /api/google-business/auth/callback`**: Handles OAuth callback
- **`GET /api/google-business/auth/status`**: Checks authentication status
- **`POST /api/google-business/auth/logout`**: Logs out and clears tokens

### **GMB Management Endpoints**

- **`GET /api/google-business/accounts`**: Retrieves GMB accounts
- **`GET /api/google-business/locations`**: Gets locations for an account
- **`POST /api/google-business/locations`**: Creates/updates locations

## 📱 **User Interface**

### **Google Account Tab**

#### **Not Authenticated State**
- Blue information box explaining the feature
- Large "🔐 Connect Google Account" button
- Clear instructions for users

#### **Authenticated State**
- Green success box showing connected account
- User profile information (email, avatar)
- "Connected" badge
- Account management buttons:
  - "🔄 Refresh Accounts"
  - "❌ Disconnect Account"
- GMB account selection dropdown
- "📍 Get My Locations" button

### **Testing Tab**

- **Location Selection**: Choose from fetched locations
- **Store Data Form**: Comprehensive form for store information
- **Action Buttons**: Create stores in GMB or test API endpoints
- **Results Display**: Shows test results and API responses

## 🔧 **Technical Implementation**

### **OAuth Token Storage**

- **Access Token**: Stored in HTTP-only cookie (`gbp_access_token`)
- **Refresh Token**: Stored in HTTP-only cookie (`gbp_refresh_token`)
- **Security**: Tokens are encrypted and have appropriate expiration times

### **Token Refresh**

- Automatic token refresh when access token expires
- Seamless user experience without re-authentication
- Fallback to service account if OAuth fails

### **Error Handling**

- Comprehensive error messages for different failure scenarios
- User-friendly error display with toast notifications
- Automatic fallback mechanisms

## 🚨 **Security Considerations**

### **Cookie Security**

- **HttpOnly**: Prevents XSS attacks
- **Secure**: HTTPS-only in production
- **SameSite**: Prevents CSRF attacks
- **Expiration**: Appropriate token lifetimes

### **Scope Limitation**

- Only requests necessary scopes for GMB management
- No access to user's personal data beyond what's needed
- Clear consent screen explaining permissions

### **Token Validation**

- Server-side token validation
- Automatic token refresh
- Secure token storage

## 📊 **Usage Examples**

### **Creating a New Store**

1. **Authenticate**: Connect your Google account
2. **Select Account**: Choose your GMB account
3. **Get Locations**: Fetch existing locations
4. **Fill Form**: Enter store details:
   ```json
   {
     "storeName": "My New Store",
     "storeCode": "STORE-001",
     "primaryCategory": "Restaurant",
     "address": {
       "line1": "123 Main Street",
       "city": "New York",
       "state": "NY",
       "postalCode": "10001",
       "country": "US",
       "latitude": "40.7128",
       "longitude": "-74.0060"
     },
     "phone": "+1-555-123-4567",
     "website": "https://mystore.com",
     "description": "A great new store"
   }
   ```
5. **Create Store**: Click "🚀 Create Store in GMB"

### **Testing API Integration**

1. **Prepare Data**: Fill in the store form
2. **Test API**: Click "🔌 Test Store Creation API"
3. **Verify Results**: Check the response and database
4. **Debug Issues**: Review error messages and logs

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Authentication Failed**
- Check Google Cloud Console OAuth configuration
- Verify redirect URI matches exactly
- Ensure required scopes are enabled

#### **No GMB Accounts Found**
- Verify your Google account has GMB access
- Check if you're a manager/owner of any GMB locations
- Ensure the GMB API is enabled in your project

#### **Permission Denied**
- Check your role in the GMB account
- Verify you have location management permissions
- Contact the GMB account owner if needed

#### **Token Expired**
- Tokens automatically refresh, but you can manually reconnect
- Clear browser cookies and re-authenticate
- Check if your Google account has revoked access

### **Debug Information**

- **Console Logs**: Check browser console for detailed information
- **Network Tab**: Monitor API requests and responses
- **Cookie Inspection**: Verify OAuth tokens are properly stored
- **API Responses**: Review error messages from GMB API

## 🔄 **Token Management**

### **Automatic Refresh**

- Access tokens automatically refresh using refresh tokens
- Seamless user experience without re-authentication
- Fallback to service account if refresh fails

### **Manual Refresh**

- Click "🔄 Refresh Accounts" to force token refresh
- Disconnect and reconnect if tokens become invalid
- Clear cookies and re-authenticate if needed

### **Token Expiration**

- **Access Token**: 1 hour (automatically refreshed)
- **Refresh Token**: 30 days (longer validity)
- **Automatic Cleanup**: Expired tokens are automatically cleared

## 📈 **Performance Considerations**

### **API Rate Limits**

- Respect Google's API rate limits
- Implement appropriate caching strategies
- Batch operations when possible

### **Token Efficiency**

- Minimize token refresh operations
- Cache user profile and account information
- Implement smart retry logic

## 🚀 **Next Steps**

### **Production Deployment**

1. **Update Environment Variables**: Set production URLs and credentials
2. **SSL Configuration**: Ensure HTTPS is properly configured
3. **Domain Verification**: Verify your domain in Google Cloud Console
4. **OAuth Consent**: Configure production OAuth consent screen

### **Feature Enhancements**

1. **User Management**: Store user preferences and settings
2. **Bulk Operations**: Support for multiple store creation
3. **Analytics**: Track usage and performance metrics
4. **Notifications**: Alert users about important events

### **Integration**

1. **User Dashboard**: Integrate with main application dashboard
2. **Store Management**: Connect with existing store management workflows
3. **Brand Integration**: Link GMB locations with brand management
4. **Reporting**: Generate reports on GMB performance

## 📚 **Additional Resources**

- [Google My Business API Documentation](https://developers.google.com/my-business)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GMB API Reference](https://developers.google.com/my-business/reference)

## 🆘 **Support**

For additional support:
- Check the troubleshooting section above
- Review console logs and network requests
- Consult Google's official documentation
- Check your Google Cloud Console configuration
- Verify OAuth consent screen settings
