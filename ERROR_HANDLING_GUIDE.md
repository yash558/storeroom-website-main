# Error Handling Guide

This guide covers the comprehensive error handling implemented in the Storecom application for both brand and store creation, as well as Firebase image upload CORS resolution.

## Overview

The application now includes robust error handling at multiple levels:
- **Client-side validation** - Prevents invalid data submission
- **API-level validation** - Server-side data validation
- **User-friendly error messages** - Clear feedback for users
- **CORS resolution** - Firebase image upload issues resolved
- **Error boundaries** - Graceful error handling throughout the app

## Brand Creation Error Handling

### Client-Side Validation
- **Required Fields**: Brand name, slug, email, industry, primary category
- **Address Validation**: All address fields must be filled
- **Coordinate Validation**: Latitude (-90 to 90) and longitude (-180 to 180)
- **Format Validation**: Email format, slug format (lowercase, hyphens, no spaces)

### API Error Handling
- **Duplicate Slug**: "A brand with this slug already exists"
- **Validation Failed**: "Please check your input and ensure all required fields are filled correctly"
- **Brand Not Found**: "Brand not found. Please refresh and try again"
- **Has Stores**: "Cannot delete brand. Please remove all associated stores first"

### Error Display
- Toast notifications with specific error messages
- Form validation errors displayed below each field
- Console logging for debugging
- User-friendly error descriptions

## Store Creation Error Handling

### Client-Side Validation
- **Required Fields**: Brand selection, store code, name, slug, address, category, SEO
- **Store Code Format**: Uppercase letters, numbers, hyphens only
- **Store Slug Format**: Lowercase letters, numbers, hyphens only
- **Address Validation**: Complete address information required
- **Coordinate Validation**: Valid latitude and longitude values

### API Error Handling
- **Duplicate Code**: "A store with this code already exists"
- **Duplicate Slug**: "A store with this slug already exists"
- **Brand Not Found**: "Selected brand not found. Please refresh and try again"
- **Validation Failed**: "Please check your input and try again"

### Form Validation
- Real-time validation feedback
- Field-specific error messages
- Prevents form submission with errors
- Maintains form state on validation failure

## Firebase Image Upload CORS Resolution

### Configuration Updates
1. **Next.js Config**: Added Firebase domains to image patterns
2. **CORS Headers**: Added to API routes
3. **Firebase Config**: Created firebase.json with CORS settings
4. **Storage Rules**: Proper security rules with CORS support

### Firebase Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null;
    }
  }
}
```

### Image Upload Features
- **File Validation**: Type, size, and format checking
- **Progress Tracking**: Real-time upload progress
- **Error Handling**: Specific error messages for different failure types
- **Retry Logic**: Graceful handling of network issues
- **File Size Limits**: 5MB maximum per file
- **Supported Formats**: JPEG, PNG, GIF, WebP

## Error Types and Solutions

### Network Errors
- **Connection Failed**: Check internet connection
- **Timeout**: Retry the operation
- **CORS Issues**: Verify Firebase configuration

### Validation Errors
- **Required Fields**: Fill in all marked fields
- **Format Errors**: Check input format requirements
- **Duplicate Values**: Choose unique names/slugs

### Firebase Errors
- **Unauthorized**: Check authentication status
- **Quota Exceeded**: Contact support for storage limits
- **Object Not Found**: File may have been deleted
- **Permission Denied**: Verify user permissions

## User Experience Improvements

### Error Messages
- **Clear and Specific**: Users know exactly what went wrong
- **Actionable**: Users know how to fix the issue
- **Non-Technical**: User-friendly language
- **Contextual**: Errors appear near relevant fields

### Form Handling
- **No Data Loss**: Form retains user input on validation errors
- **Progressive Validation**: Real-time feedback as users type
- **Smart Submission**: Prevents invalid data submission
- **Error Recovery**: Easy to fix and retry

### Loading States
- **Progress Indicators**: Show upload progress
- **Disabled States**: Prevent multiple submissions
- **Loading Messages**: Clear status updates
- **Success Feedback**: Confirm successful operations

## Debugging and Monitoring

### Console Logging
- **Error Details**: Full error information for developers
- **User Actions**: Track user interactions
- **API Responses**: Monitor server responses
- **Performance Metrics**: Track operation timing

### Error Tracking
- **Error Categories**: Group similar errors
- **Frequency Analysis**: Identify common issues
- **User Impact**: Measure error impact on users
- **Resolution Time**: Track error resolution

## Best Practices

### For Developers
1. **Always validate input** before sending to API
2. **Provide specific error messages** for different failure types
3. **Log errors with context** for debugging
4. **Handle edge cases** gracefully
5. **Test error scenarios** thoroughly

### For Users
1. **Read error messages carefully** to understand the issue
2. **Check required fields** before submitting
3. **Use supported file formats** for uploads
4. **Contact support** if errors persist
5. **Provide feedback** on error messages

## Troubleshooting Common Issues

### Image Upload Fails
1. Check file size (must be under 5MB)
2. Verify file format (JPEG, PNG, GIF, WebP)
3. Ensure stable internet connection
4. Check Firebase configuration
5. Verify user authentication

### Form Validation Errors
1. Fill in all required fields
2. Check format requirements (email, coordinates)
3. Ensure unique values for codes/slugs
4. Verify address completeness
5. Check coordinate ranges

### API Errors
1. Verify network connection
2. Check authentication status
3. Ensure valid input data
4. Check server status
5. Review error logs

## Future Improvements

### Planned Enhancements
- **Retry Mechanisms**: Automatic retry for failed operations
- **Offline Support**: Handle operations when offline
- **Error Analytics**: Better error tracking and reporting
- **User Guidance**: Inline help and suggestions
- **Accessibility**: Screen reader friendly error messages

### Monitoring Tools
- **Error Tracking**: Sentry or similar service integration
- **Performance Monitoring**: Track operation success rates
- **User Analytics**: Monitor user behavior and errors
- **Alert Systems**: Notify developers of critical errors

## Conclusion

The comprehensive error handling system ensures a robust and user-friendly experience for brand and store creation. Users receive clear feedback on issues, developers have detailed error information for debugging, and the application gracefully handles various failure scenarios.

The CORS resolution for Firebase image uploads eliminates common upload issues and provides a smooth image management experience. Combined with proper validation and error handling, the application now provides a professional and reliable user experience.
