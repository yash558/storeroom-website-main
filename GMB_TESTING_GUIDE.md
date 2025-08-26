# Google My Business Store Creation Testing Guide

This guide explains how to test store creation using Google My Business (GMB) APIs in the StoreCom application.

## Overview

The GMB testing functionality allows you to:
- Test GMB API connectivity and authentication
- Validate store data format and structure
- Test actual store creation in Google My Business
- Verify location data retrieval and insights
- Debug API responses and error handling

## Prerequisites

Before testing, ensure you have:

1. **Google Cloud Console Setup**
   - Google My Business API enabled
   - Service account created with appropriate permissions
   - API credentials configured

2. **Environment Variables**
   ```bash
   GOOGLE_SERVICE_ACCOUNT_JSON=your_service_account_json
   # OR individual variables:
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_PRIVATE_KEY_ID=your_private_key_id
   GOOGLE_PRIVATE_KEY=your_private_key
   GOOGLE_CLIENT_EMAIL=your_client_email
   GOOGLE_CLIENT_ID=your_client_id
   ```

3. **GMB Account Access**
   - GMB account with location management permissions
   - At least one GMB account accessible via API

## Testing Components

### 1. GMBStoreTest Component

Located at: `src/components/ui/gmb-store-test.tsx`

This component provides a comprehensive testing interface for:
- GMB API connection testing
- Account and location retrieval
- Store creation/update testing
- API endpoint testing

### 2. Test Page

Located at: `src/app/test-gmb/page.tsx`

Access the testing interface by navigating to `/test-gmb` in your application.

## Testing Workflow

### Step 1: Test GMB Connection

1. Click "Test GMB Connection"
2. Verify the API can authenticate and retrieve accounts
3. Check console logs for detailed connection information

**Expected Result**: List of available GMB accounts

**Common Issues**:
- Missing or invalid service account credentials
- API not enabled in Google Cloud Console
- Insufficient permissions

### Step 2: Retrieve Locations

1. Select a GMB account from the dropdown
2. Click "Get Locations"
3. Verify existing locations are retrieved

**Expected Result**: List of existing GMB locations

**Common Issues**:
- Account has no locations
- Permission restrictions
- API rate limiting

### Step 3: Test Store Creation

1. Customize the test store data as needed
2. Click "Test Store Creation in GMB"
3. Monitor console logs for detailed API calls

**Expected Result**: New location created or existing location updated

**Common Issues**:
- Invalid location data format
- Permission denied for location creation
- Location already exists (for creation attempts)

### Step 4: Test API Endpoint

1. Click "Test Store Creation API"
2. Verify the application's store creation API works
3. Check database for created store records

**Expected Result**: Store created in application database

**Common Issues**:
- API endpoint not implemented
- Database connection issues
- Validation errors

## Test Data Configuration

### Default Test Store Data

```typescript
{
  storeName: 'Test Store - GMB API',
  storeCode: 'GMB-TEST-001',
  primaryCategory: 'Restaurant',
  address: {
    line1: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    postalCode: '12345',
    country: 'US',
    latitude: '40.7128',
    longitude: '-74.0060'
  },
  phone: '+1-555-123-4567',
  website: 'https://teststore.example.com',
  description: 'This is a test store created via GMB API for validation purposes.'
}
```

### Customizing Test Data

Modify the form fields to test different scenarios:
- **Store Names**: Test with special characters, long names, etc.
- **Categories**: Test with various business categories
- **Addresses**: Test with different address formats and coordinates
- **Phone Numbers**: Test with various phone number formats
- **Websites**: Test with different URL formats

## API Testing Details

### GMB API Calls

The testing component makes the following GMB API calls:

1. **getAccounts()**: Retrieves available GMB accounts
2. **getLocations(accountName)**: Gets locations for a specific account
3. **createLocation(accountName, locationData)**: Creates new location
4. **updateLocation(locationName, updateData)**: Updates existing location
5. **getLocation(locationName)**: Retrieves specific location details
6. **getLocationInsights(locationName, startDate, endDate)**: Gets performance metrics

### Store Creation API

Tests the application's `/api/stores` endpoint:
- POST request with store data
- Validates API response handling
- Checks database integration

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
   - Invalid service account credentials
   - Expired tokens
   - Insufficient permissions

2. **Data Validation Errors**
   - Missing required fields
   - Invalid data formats
   - Business rule violations

3. **API Errors**
   - Rate limiting
   - Service unavailable
   - Network issues

### Error Response Format

```typescript
{
  success: false,
  error: 'Detailed error message',
  details?: 'Additional error information'
}
```

## Debugging

### Console Logs

Enable detailed logging by checking the browser console:
- API request/response details
- Error stack traces
- Authentication status

### Network Tab

Monitor network requests in browser dev tools:
- API call timing
- Request/response payloads
- HTTP status codes

### GMB API Response Codes

- `200`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized (authentication failed)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (resource already exists)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## Best Practices

### Testing Strategy

1. **Start Small**: Test with minimal data first
2. **Incremental Testing**: Add complexity gradually
3. **Error Simulation**: Test error conditions intentionally
4. **Data Validation**: Verify data integrity at each step

### Data Management

1. **Use Test Data**: Avoid testing with production data
2. **Clean Up**: Remove test locations after testing
3. **Unique Identifiers**: Use unique store codes for each test
4. **Coordinate Validation**: Ensure coordinates are valid

### Performance Considerations

1. **Rate Limiting**: Respect GMB API rate limits
2. **Batch Operations**: Group related API calls when possible
3. **Caching**: Cache frequently accessed data
4. **Error Retry**: Implement retry logic for transient failures

## Troubleshooting

### Connection Issues

```bash
# Check environment variables
echo $GOOGLE_SERVICE_ACCOUNT_JSON
echo $GOOGLE_PROJECT_ID

# Verify API enablement
# Visit: https://console.cloud.google.com/apis/library
# Search for "Google My Business API"
```

### Permission Issues

1. **Service Account Permissions**
   - Verify service account has GMB API access
   - Check IAM roles and permissions
   - Ensure proper OAuth scopes

2. **GMB Account Access**
   - Verify account ownership/access
   - Check location management permissions
   - Ensure account is not suspended

### Data Format Issues

1. **Required Fields**
   - All address fields must be provided
   - Coordinates must be valid numbers
   - Phone numbers must be in E.164 format

2. **Category Validation**
   - Use valid GMB business categories
   - Ensure category ID format is correct
   - Check for category restrictions

## Next Steps

After successful testing:

1. **Integration**: Integrate GMB creation into store creation workflow
2. **Error Handling**: Implement comprehensive error handling
3. **Monitoring**: Add logging and monitoring for production use
4. **Validation**: Add data validation before GMB API calls
5. **Testing**: Create automated tests for GMB integration

## Support

For additional support:
- Check Google My Business API documentation
- Review application logs and console output
- Consult Google Cloud Console for API status
- Review service account configuration
