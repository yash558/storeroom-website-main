import { googleBusinessAPI } from './google-business-api';

// Example usage of the corrected Google Business API endpoints

export async function exampleUsage() {
  try {
    // Example 1: Get locations using the corrected endpoint
    // Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations?readMask=name,title
    const accountId = '112022557985287772374';
    console.log('Fetching locations for account:', accountId);
    
    // Using the direct API method
    const locations = await googleBusinessAPI.getLocationsDirect(accountId);
    console.log('Locations found:', locations.length);
    
    // Using the regular method
    const locationsRegular = await googleBusinessAPI.getLocations(`accounts/${accountId}`);
    console.log('Locations found (regular method):', locationsRegular.length);
    
    // Example 2: Get reviews using the corrected endpoint
    // Endpoint: https://mybusiness.googleapis.com/v4/accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}/reviews?orderBy=updateTime%20desc&pageSize=50
    if (locations.length > 0) {
      const locationId = locations[0].name.split('/').pop(); // Extract location ID from full name
      console.log('Fetching reviews for location:', locationId);
      
      // Using the direct API method
      const reviews = await googleBusinessAPI.getLocationReviewsDirect(accountId, locationId!);
      console.log('Reviews found:', reviews.length);
      
      // Using the regular method
      const reviewsRegular = await googleBusinessAPI.getLocationReviews(accountId, locationId!);
      console.log('Reviews found (regular method):', reviewsRegular.length);
    }
    
  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// Example of how to use the API with proper error handling
export async function safeApiUsage() {
  try {
    const accountId = '112022557985287772374';
    
    // Get locations with error handling
    try {
      const locations = await googleBusinessAPI.getLocationsDirect(accountId);
      console.log(`Successfully fetched ${locations.length} locations`);
      
      // Process each location
      for (const location of locations) {
        console.log(`Location: ${location.title || location.locationName}`);
        console.log(`Store Code: ${location.storeCode || 'N/A'}`);
        console.log(`Phone: ${location.profile?.phoneNumbers?.primaryPhone || 'N/A'}`);
        console.log(`Website: ${location.websiteUri || location.profile?.websiteUri || 'N/A'}`);
        console.log('---');
      }
      
    } catch (locationError) {
      console.error('Failed to fetch locations:', locationError);
    }
    
    // Get reviews for a specific location
    try {
      const locationId = '16058076381455815546'; // From your example
      const reviews = await googleBusinessAPI.getLocationReviewsDirect(accountId, locationId);
      console.log(`Successfully fetched ${reviews.length} reviews`);
      
      // Process each review
      for (const review of reviews) {
        console.log(`Review by: ${review.reviewer?.displayName || 'Anonymous'}`);
        console.log(`Rating: ${review.starRating || 'N/A'}`);
        console.log(`Comment: ${review.comment || 'No comment'}`);
        console.log(`Time: ${review.createTime || 'N/A'}`);
        console.log('---');
      }
      
    } catch (reviewError) {
      console.error('Failed to fetch reviews:', reviewError);
    }
    
  } catch (error) {
    console.error('Error in safe API usage:', error);
  }
}

// Example of setting up authentication
export async function setupAuthentication() {
  try {
    // Set authentication mode (service account or OAuth)
    googleBusinessAPI.setAuthMode('service_account');
    
    // If using OAuth, you would set credentials like this:
    // googleBusinessAPI.setAuthMode('oauth');
    // googleBusinessAPI.setCredentials({
    //   access_token: 'your_access_token',
    //   refresh_token: 'your_refresh_token'
    // });
    
    console.log('Authentication setup complete');
    
  } catch (error) {
    console.error('Error setting up authentication:', error);
  }
}
