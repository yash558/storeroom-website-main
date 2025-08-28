# Google Business API Endpoints - Corrected

This document outlines the corrected Google Business API endpoints and their usage in the StoreCom application.

## Corrected API Endpoints

### 1. Locations API
**Endpoint:** `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations?readMask=name,title`

**Purpose:** Fetch business locations for a specific account with essential information.

**Parameters:**
- `{ACCOUNT_ID}`: The Google Business account ID (e.g., `112022557985287772374`)
- `readMask`: Specifies which fields to return
  - `name`: Location resource name
  - `title`: Business title/name

**Example Usage:**
```typescript
// Using the direct API method
const locations = await googleBusinessAPI.getLocationsDirect('112022557985287772374');

// Using the regular method
const locations = await googleBusinessAPI.getLocations('accounts/112022557985287772374');

// The readMask will return only 'name' and 'title' fields
```

### 2. Reviews API
**Endpoint:** `https://mybusiness.googleapis.com/v4/accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}/reviews?orderBy=updateTime%20desc&pageSize=50`

**Purpose:** Fetch customer reviews for a specific business location.

**Parameters:**
- `{ACCOUNT_ID}`: The Google Business account ID (e.g., `112022557985287772374`)
- `{LOCATION_ID}`: The specific location ID (e.g., `16058076381455815546`)
- `orderBy`: Sort order for reviews (`updateTime desc` for newest first)
- `pageSize`: Number of reviews to return (max 50)

**Example Usage:**
```typescript
// Using the direct API method
const reviews = await googleBusinessAPI.getLocationReviewsDirect(
  '112022557985287772374', 
  '16058076381455815546'
);

// Using the regular method
const reviews = await googleBusinessAPI.getLocationReviews(
  '112022557985287772374', 
  '16058076381455815546'
);
```

## API Methods Available

### Direct API Methods
These methods make direct HTTP calls to the Google APIs:

1. **`getLocationsDirect(accountId: string)`**
   - Makes a direct call to the locations endpoint
   - Returns `GoogleBusinessLocation[]`
   - Includes comprehensive error handling

2. **`getLocationReviewsDirect(accountId: string, locationId: string)`**
   - Makes a direct call to the reviews endpoint
   - Returns review data array
   - Includes comprehensive error handling

### Regular API Methods
These methods use the Google APIs client library:

1. **`getLocations(accountName: string)`**
   - Uses the Google APIs client
   - Returns `GoogleBusinessLocation[]`
   - Requires account name in format `accounts/{ACCOUNT_ID}`

2. **`getLocationReviews(accountId: string, locationId: string)`**
   - Uses the Google APIs client
   - Returns review data array
   - Automatically handles authentication

## Authentication

The API supports two authentication modes:

### Service Account Authentication
```typescript
googleBusinessAPI.setAuthMode('service_account');
```
- Uses service account credentials from environment variables
- Suitable for server-side applications
- Requires `GOOGLE_SERVICE_ACCOUNT_JSON` or individual credential env vars

### OAuth2 Authentication
```typescript
googleBusinessAPI.setAuthMode('oauth');
googleBusinessAPI.setCredentials({
  access_token: 'your_access_token',
  refresh_token: 'your_refresh_token'
});
```
- Uses OAuth2 flow for user authentication
- Suitable for user-specific operations
- Requires user consent and authorization

## Error Handling

All API methods include comprehensive error handling:

- **400 Bad Request**: Invalid parameters or account ID
- **403 Forbidden**: Permission denied or location not verified
- **404 Not Found**: Account or location not found
- **Other errors**: Generic error messages with details

## Example Implementation

```typescript
import { googleBusinessAPI } from './google-business-api';

async function fetchBusinessData() {
  try {
    // Set authentication mode
    googleBusinessAPI.setAuthMode('service_account');
    
    // Fetch locations
    const accountId = '112022557985287772374';
    const locations = await googleBusinessAPI.getLocationsDirect(accountId);
    console.log(`Found ${locations.length} locations`);
    
    // Fetch reviews for first location
    if (locations.length > 0) {
      const locationId = locations[0].name.split('/').pop();
      const reviews = await googleBusinessAPI.getLocationReviewsDirect(accountId, locationId!);
      console.log(`Found ${reviews.length} reviews`);
    }
    
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

## Environment Variables

Required environment variables for service account authentication:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# OR individual variables:
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY=your-private-key
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_CLIENT_ID=your-client-id
```

## Notes

- The locations API uses the Business Information API (v1)
- The reviews API uses the My Business API (v4)
- Both endpoints require proper authentication and permissions
- The `readMask` parameter is set to `name,title` for minimal data retrieval
- Reviews are ordered by update time (newest first) and limited to 50 per request
- All methods include logging for debugging purposes
- Authentication scope: `https://www.googleapis.com/auth/business.manage`
