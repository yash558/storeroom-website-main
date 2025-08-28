import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessProfileId = searchParams.get('businessProfileId');
    const storeId = searchParams.get('storeId');
    const direct = searchParams.get('direct') === 'true';

    if (!businessProfileId || !storeId) {
      return NextResponse.json(
        { error: 'Business Profile ID and Store ID are required' }, 
        { status: 400 }
      );
    }

    // Use the exact endpoints provided by the user
    const accountId = businessProfileId; // 16058076381455815546
    const locationId = storeId; // 11007263269570993027
    
    // API endpoints from user's playground
    const locationEndpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title,storeCode,phoneNumbers,websiteUri,metadata`;
    const reviewsEndpoint = `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews?orderBy=updateTime%20desc&pageSize=50`;
    
    // Check for OAuth tokens first (user authentication)
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    
    // Try to fetch data using environment variables (service account)
    const apiKey = process.env.GOOGLE_API_KEY;
    const serviceAccountEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    let accessTokenFromServiceAccount = null;
    
    // If we have service account credentials, try to get an access token
    if (serviceAccountEmail && privateKey) {
      try {
        console.log('Attempting to get access token with service account...');
        
        // Create JWT token for service account
        const jwt = require('jsonwebtoken');
        const now = Math.floor(Date.now() / 1000);
        
        const payload = {
          iss: serviceAccountEmail,
          scope: 'https://www.googleapis.com/auth/business.manage',
          aud: 'https://oauth2.googleapis.com/token',
          exp: now + 3600,
          iat: now
        };
        
        const token = jwt.sign(payload, privateKey.replace(/\\n/g, '\n'), { algorithm: 'RS256' });
        
        // Exchange JWT for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-content-type-options'
          },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token
          })
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          accessTokenFromServiceAccount = tokenData.access_token;
          console.log('Successfully obtained access token from service account');
        } else {
          console.log('Failed to get access token from service account:', tokenResponse.status, tokenResponse.statusText);
        }
      } catch (error) {
        console.error('Error getting access token from service account:', error);
      }
    }
    
    // Try to fetch reviews data
    let reviewsData = null;
    let locationData = null;
    let authenticationMethod = 'none';
    
    // Priority 1: Try with OAuth access token (user authentication)
    if (accessToken) {
      try {
        console.log('Attempting to fetch data with OAuth access token...');
        
        const reviewsResponse = await fetch(reviewsEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (reviewsResponse.ok) {
          reviewsData = await reviewsResponse.json();
          console.log('Successfully fetched reviews data with OAuth token');
          authenticationMethod = 'OAuth (User)';
        } else {
          console.log('OAuth token failed:', reviewsResponse.status, reviewsResponse.statusText);
        }
        
        // Fetch location data
        const locationResponse = await fetch(locationEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (locationResponse.ok) {
          locationData = await locationResponse.json();
          console.log('Successfully fetched location data with OAuth token');
        }
        
      } catch (error) {
        console.error('Error fetching data with OAuth token:', error);
      }
    }
    
    // Priority 2: Try with service account access token
    if (!reviewsData && accessTokenFromServiceAccount) {
      try {
        console.log('Attempting to fetch data with service account access token...');
        
        const reviewsResponse = await fetch(reviewsEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessTokenFromServiceAccount}`,
            'Accept': 'application/json'
          }
        });
        
        if (reviewsResponse.ok) {
          reviewsData = await reviewsResponse.json();
          console.log('Successfully fetched reviews data with service account');
          authenticationMethod = 'Service Account';
        } else {
          console.log('Service account token failed:', reviewsResponse.status, reviewsResponse.statusText);
        }
        
        // Fetch location data
        const locationResponse = await fetch(locationEndpoint, {
          headers: {
            'Authorization': `Bearer ${accessTokenFromServiceAccount}`,
            'Accept': 'application/json'
          }
        });
        
        if (locationResponse.ok) {
          locationData = await locationResponse.json();
          console.log('Successfully fetched location data with service account');
        }
        
      } catch (error) {
        console.error('Error fetching data with service account token:', error);
      }
    }
    
    // Priority 3: Try with API key (limited access)
    if (!reviewsData && apiKey) {
      try {
        console.log('Attempting to fetch reviews with API key...');
        
        const reviewsResponse = await fetch(`${reviewsEndpoint}&key=${apiKey}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (reviewsResponse.ok) {
          reviewsData = await reviewsResponse.json();
          console.log('Successfully fetched reviews with API key');
          authenticationMethod = 'API Key';
        } else {
          console.log('API key method failed:', reviewsResponse.status, reviewsResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching with API key:', error);
      }
    }
    
    // If we still don't have data, return mock data for testing
    if (!reviewsData) {
      console.log('No real data available, returning mock data for testing');
      
      const mockReviewsData = {
        reviews: [
          {
            comment: "Its a IT consulting firm", 
            updateTime: "2025-08-12T07:59:05.538037Z", 
            name: `accounts/${accountId}/locations/${locationId}/reviews/AbFvOqmMfjpnaBX5oEeMxQhLwm4D2yRsm6ErB496u3mGG3qOwEb29mfOGhtCEBg5BXzMCkgOFOUsgw`, 
            reviewId: "AbFvOqmMfjpnaBX5oEeMxQhLwm4D2yRsm6ErB496u3mGG3qOwEb29mfOGhtCEBg5BXzMCkgOFOUsgw", 
            starRating: "FIVE", 
            reviewer: {
              profilePhotoUrl: "https://lh3.googleusercontent.com/a/ACg8ocIYkb_lt18nUvNtwrQkGA6pvwAY6i4RFDEvWMzT2--sU1Qt=s120-c-rp-mo-br100", 
              displayName: "product"
            }, 
            reviewReply: {
              comment: "ok", 
              updateTime: "2025-08-19T12:58:16.490771Z"
            }, 
            createTime: "2025-08-12T07:59:05.538037Z"
          }, 
          {
            updateTime: "2024-12-24T07:17:14.362349Z", 
            name: `accounts/${accountId}/locations/${locationId}/reviews/AbFvOqmosZ-Cmvf_lMR_cialxc2UKhX5sBqs2AYH5O9CtkGbfbCc5VBDTlxuU1XWUw1M-2hN1jNmWA`, 
            reviewId: "AbFvOqmosZ-Cmvf_lMR_cialxc2UKhX5sBqs2AYH5O9CtkGbfbCc5VBDTlxuU1XWUw1M-2hN1jNmWA", 
            starRating: "FIVE", 
            reviewer: {
              profilePhotoUrl: "https://lh3.googleusercontent.com/a/ACg8ocKFxLjnuEkDEV9pMyQfQ3VG9cGEKqTGpeZgPHXss_YNhRqnvw=s120-c-rp-mo-br100", 
              displayName: "Ayesha Aziz Khan"
            }, 
            createTime: "2024-12-24T07:17:14.362349Z"
          }
        ], 
        totalReviewCount: 2, 
        averageRating: 5
      };
      
      // Provide detailed authentication guidance
      const authStatus = {
        oauth: {
          hasRefreshToken: !!refreshToken,
          hasAccessToken: !!accessToken,
          status: refreshToken ? 'Authenticated' : 'Not Authenticated'
        },
        serviceAccount: {
          hasEmail: !!serviceAccountEmail,
          hasPrivateKey: !!privateKey,
          status: (serviceAccountEmail && privateKey) ? 'Configured' : 'Not Configured'
        },
        apiKey: {
          hasKey: !!apiKey,
          status: apiKey ? 'Configured' : 'Not Configured'
        }
      };
      
      return NextResponse.json({
        success: true,
        businessProfileId: accountId,
        storeId: locationId,
        message: 'Using mock data for testing (real API not accessible)',
        data: {
          reviews: mockReviewsData,
          totalReviews: mockReviewsData.totalReviewCount,
          averageRating: mockReviewsData.averageRating
        },
        source: 'Mock data (real API not accessible)',
        method: 'Mock data fallback',
        authentication: authStatus,
        apis: {
          location: {
            endpoint: locationEndpoint,
            method: 'GET',
            description: 'Get location details using Business Information API v1',
            scope: 'https://www.googleapis.com/auth/business.manage'
          },
          reviews: {
            endpoint: reviewsEndpoint,
            method: 'GET',
            description: 'Get reviews using Google Business Profile API v4.9',
            scope: 'https://www.googleapis.com/auth/business.manage'
          }
        },
        nextSteps: [
          'Go to the "Google Live" tab and authenticate with Google Business Profile',
          'Check if Google Business Profile API v4.9 is enabled in Google Cloud Console',
          'Verify the Business Profile ID and Store ID are correct',
          'Ensure proper authentication credentials are configured in .env.local',
          'Check API quotas and billing status'
        ],
        troubleshooting: {
          oauth: 'Visit /reviews and click "Connect Google" in the Google Live tab',
          serviceAccount: 'Set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local',
          apiKey: 'Set GOOGLE_API_KEY in .env.local for limited API access'
        }
      });
    }
    
    // Return real data if we have it
    return NextResponse.json({
      success: true,
      businessProfileId: accountId,
      storeId: locationId,
      message: 'Real-time data from Google Business Profile APIs',
      data: {
        location: locationData,
        reviews: reviewsData,
        totalReviews: reviewsData?.reviews?.length || 0,
        averageRating: reviewsData?.averageRating || 'N/A'
      },
      source: 'Google Business Profile API v4.9 + Business Information API v1',
      method: authenticationMethod,
      authentication: {
        oauth: {
          hasRefreshToken: !!refreshToken,
          hasAccessToken: !!accessToken,
          status: refreshToken ? 'Authenticated' : 'Not Authenticated'
        },
        serviceAccount: {
          hasEmail: !!serviceAccountEmail,
          hasPrivateKey: !!privateKey,
          status: (serviceAccountEmail && privateKey) ? 'Configured' : 'Not Configured'
        },
        apiKey: {
          hasKey: !!apiKey,
          status: apiKey ? 'Configured' : 'Not Configured'
        }
      }
    });

  } catch (error) {
    console.error('Error in store-reviews API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while processing request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
