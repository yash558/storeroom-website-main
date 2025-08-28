import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Prefer environment-based configuration. Supports either a full JSON blob or individual env vars.
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : null;

const SERVICE_ACCOUNT_CONFIG = SERVICE_ACCOUNT_JSON ?? {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID ?? '',
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID ?? '',
  private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL ?? '',
  client_id: process.env.GOOGLE_CLIENT_ID ?? '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: '',
  universe_domain: 'googleapis.com',
};

// Google Business API scopes (request only what's needed)
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage'
];

export interface GoogleBusinessAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  state: string;
  profilePhotoUri?: string;
  accountNumber?: string;
}

export interface GoogleBusinessLocation {
  name: string;
  locationName: string;
  primaryCategory: {
    displayName: string;
    categoryId: string;
  };
  categories: Array<{
    displayName: string;
    categoryId: string;
  }>;
  storeCode?: string;
  websiteUri?: string;
  regularHours?: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  };
  specialHours?: {
    specialHourPeriods: Array<{
      startDate: {
        year: number;
        month: number;
        day: number;
      };
      endDate: {
        year: number;
        month: number;
        day: number;
      };
      openTime: string;
      closeTime: string;
      closed: boolean;
    }>;
  };
  serviceArea?: {
    businessType: string;
    places: {
      placeInfos: Array<{
        name: string;
        placeId: string;
      }>;
    };
  };
  labels?: string[];
  adWordsLocationExtensions?: {
    adPhone?: string;
  };
  latlng?: {
    latitude: number;
    longitude: number;
  };
  openInfo?: {
    status: string;
    canReopen: boolean;
    openingDate?: {
      year: number;
      month: number;
      day: number;
    };
  };
  locationKey?: {
    placeId: string;
    plusPageId?: string;
  };
  profile?: {
    description?: string;
    phoneNumbers?: {
      primaryPhone?: string;
      additionalPhones?: string[];
    };
    websiteUri?: string;
    regularHours?: {
      periods: Array<{
        openDay: string;
        openTime: string;
        closeDay: string;
        closeTime: string;
      }>;
    };
    specialHours?: {
      specialHourPeriods: Array<{
        startDate: {
          year: number;
          month: number;
          day: number;
        };
        endDate: {
          year: number;
          month: number;
          day: number;
        };
        openTime: string;
        closeTime: string;
        closed: boolean;
      }>;
    };
    serviceArea?: {
      businessType: string;
      places: {
        placeInfos: Array<{
          name: string;
          placeId: string;
        }>;
      };
    };
    labels?: string[];
    adWordsLocationExtensions?: {
      adPhone?: string;
    };
    latlng?: {
      latitude: number;
      longitude: number;
    };
    openInfo?: {
      status: string;
      canReopen: boolean;
      openingDate?: {
        year: number;
        month: number;
        day: number;
      };
    };
    locationKey?: {
      placeId: string;
      plusPageId?: string;
    };
  };
  metadata?: {
    duplicate?: {
      locationName: string;
    };
    mapsUri?: string;
    newReviewUri?: string;
  };
  relationshipData?: {
    parentChain?: {
      chainNames: Array<{
        displayName: string;
        languageCode: string;
      }>;
    };
  };
  moreHours?: Array<{
    hoursTypeId: string;
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  }>;
}

export interface GoogleBusinessInsights {
  locationMetrics: Array<{
    locationName: string;
    timeZone: string;
    metricValues: Array<{
      metric: string;
      dimensionalValues: Array<{
        dimension: string;
        value: string;
        metricValues: Array<{
          metric: string;
          value: string;
        }>;
      }>;
    }>;
  }>;
}

export interface GoogleBusinessPost {
  name: string;
  summary?: string;
  callToAction?: {
    actionType: string;
    url?: string;
  };
  media?: Array<{
    mediaFormat: string;
    googleUrl?: string;
  }>;
  topicType: string;
  languageCode?: string;
  createTime?: string;
  updateTime?: string;
  state: string;
  alertType?: string;
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
    offerType: string;
    title: string;
    summary?: string;
  };
  event?: {
    title: string;
    summary?: string;
    startTime?: string;
    endTime?: string;
  };
}

class GoogleBusinessServiceAccountAPI {
  private serviceAccountClient: JWT;
  private mybusinessaccount: any;
  private mybusinessbusinessinformation: any;

  constructor() {
    // Initialize service account client
    this.serviceAccountClient = new JWT({
      email: SERVICE_ACCOUNT_CONFIG.client_email,
      key: SERVICE_ACCOUNT_CONFIG.private_key,
      scopes: SCOPES
    });
  }

    // Initialize the API clients
  private async initializeAPIs() {
    try {
      console.log('[Service Account] Initializing APIs...');
      console.log('[Service Account] Service account config:', {
        hasEmail: !!SERVICE_ACCOUNT_CONFIG.client_email,
        hasPrivateKey: !!SERVICE_ACCOUNT_CONFIG.private_key,
        hasProjectId: !!SERVICE_ACCOUNT_CONFIG.project_id,
        email: SERVICE_ACCOUNT_CONFIG.client_email
      });
      
      // Authorize the service account client
      console.log('[Service Account] Authorizing service account client...');
      await this.serviceAccountClient.authorize();
      console.log('[Service Account] Service account authorized successfully');
      
      // Initialize only the APIs we actually need
      if (!this.mybusinessaccount) {
        console.log('[Service Account] Initializing mybusinessaccountmanagement API for accounts...');
        try {
          if ((google as any).mybusinessaccountmanagement) {
            this.mybusinessaccount = (google as any).mybusinessaccountmanagement({ version: 'v1', auth: this.serviceAccountClient });
            console.log('[Service Account] mybusinessaccountmanagement API initialized successfully');
          } else {
            throw new Error('mybusinessaccountmanagement API is not available');
          }
        } catch (apiError) {
          console.error('[Service Account] Failed to initialize mybusinessaccountmanagement API:', apiError);
          throw new Error(`Failed to initialize mybusinessaccountmanagement API: ${apiError}`);
        }
      }
      
      if (!this.mybusinessbusinessinformation) {
        console.log('[Service Account] Initializing mybusinessbusinessinformation API for locations...');
        try {
          if ((google as any).mybusinessbusinessinformation) {
            this.mybusinessbusinessinformation = (google as any).mybusinessbusinessinformation({ version: 'v1', auth: this.serviceAccountClient });
            console.log('[Service Account] mybusinessbusinessinformation API initialized successfully');
          } else {
            throw new Error('mybusinessbusinessinformation API is not available');
          }
        } catch (apiError) {
          console.error('[Service Account] Failed to initialize mybusinessbusinessinformation API:', apiError);
          throw new Error(`Failed to initialize mybusinessbusinessinformation API: ${apiError}`);
        }
      }
      
      console.log('[Service Account] Required APIs initialized successfully');
    } catch (error) {
      console.error('[Service Account] Error initializing APIs:', error);
      throw error;
    }
  }

  // Get all accounts
  async getAccounts(): Promise<GoogleBusinessAccount[]> {
    try {
      console.log('[Service Account] Attempting to fetch accounts...');
      
      // Try the Google client library first
      try {
        await this.initializeAPIs();
        
        console.log('[Service Account] Service account client:', {
          hasClient: !!this.serviceAccountClient,
          email: this.serviceAccountClient?.email,
          projectId: this.serviceAccountClient?.projectId
        });
        
        const response = await this.mybusinessaccount.accounts.list({
          auth: this.serviceAccountClient
        });
        
        console.log('[Service Account] Accounts response:', response.data);
        return response.data.accounts || [];
      } catch (clientError) {
        console.warn('[Service Account] Google client library failed, trying direct API call...', clientError);
        
        // Fallback to direct API call
        return await this.getAccountsDirect();
      }
    } catch (error) {
      console.error('[Service Account] Error fetching accounts:', error);
      const details = (error as any)?.response?.data || (error as any)?.message || String(error);
      console.error('[Service Account] Error details:', details);
      throw new Error(`Failed to fetch Google Business accounts: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
    }
  }

  // Direct API call method for accounts
  async getAccountsDirect(): Promise<GoogleBusinessAccount[]> {
    try {
      console.log('[Service Account] Making direct API call to fetch accounts...');
      
      // Get access token
      const tokenResp = await this.serviceAccountClient.getAccessToken();
      const accessToken = tokenResp?.token || tokenResp;
      
      if (!accessToken) {
        throw new Error('Unable to acquire access token for Accounts API');
      }

      // Use the exact endpoint: https://mybusinessaccountmanagement.googleapis.com/v1/accounts
      const url = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
      
      console.log('[Service Account] Calling accounts API:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Service Account] Accounts API error:', response.status, errorText);
        
        if (response.status === 400) {
          throw new Error('Invalid request parameters');
        } else if (response.status === 401) {
          throw new Error('Authentication failed');
        } else if (response.status === 403) {
          throw new Error('Permission denied');
        } else if (response.status === 404) {
          throw new Error('Accounts not found');
        } else {
          throw new Error(`Accounts API error: ${response.status} ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('[Service Account] Accounts fetched successfully via direct API:', data);
      return data.accounts || [];
    } catch (error) {
      console.error('[Service Account] Error in direct API call:', error);
      throw error;
    }
  }

  // Get locations for an account
  async getLocations(accountName: string): Promise<GoogleBusinessLocation[]> {
    await this.initializeAPIs();
    
    try {
      console.log('Fetching locations for account:', accountName);
      
      // Use the My Business Business Information API for locations
      // Correct endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations?readMask=name,title
      const response = await this.mybusinessbusinessinformation.accounts.locations.list({
        parent: accountName,
        readMask: 'name,title',
        auth: this.serviceAccountClient
      });
      
      console.log('Locations fetched successfully:', response.data);
      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      
      // Provide more specific error messages
      if ((error as any)?.response?.status === 400) {
        throw new Error('Invalid account ID or parameters');
      } else if ((error as any)?.response?.status === 403) {
        throw new Error('Permission denied. You may not have rights to access this account.');
      } else if ((error as any)?.response?.status === 404) {
        throw new Error('Account not found or no locations exist.');
      } else {
        throw new Error(`Failed to fetch locations: ${(error as any)?.message || 'Unknown error'}`);
      }
    }
  }

  // Get a specific location
  async getLocation(locationName: string): Promise<GoogleBusinessLocation> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessbusinessinformation.accounts.locations.get({
        name: locationName,
        auth: this.serviceAccountClient
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location');
    }
  }

  // Update location information
  async updateLocation(locationName: string, updateData: Partial<GoogleBusinessLocation>) {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessbusinessinformation.accounts.locations.patch({
        name: locationName,
        requestBody: updateData,
        updateMask: Object.keys(updateData).join(','),
        auth: this.serviceAccountClient
      });
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location');
    }
  }

  // Create a new location
  async createLocation(accountName: string, locationData: Partial<GoogleBusinessLocation>) {
    await this.initializeAPIs();
    
    try {
      console.log('Creating new location for account:', accountName);
      console.log('Location data:', locationData);
      
      // Use the My Business Business Information API for creating locations
      // Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{ACCOUNT_ID}/locations
      const response = await this.mybusinessbusinessinformation.accounts.locations.create({
        parent: accountName,
        requestBody: locationData,
        auth: this.serviceAccountClient
      });
      
      console.log('Location created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      
      // Provide more specific error messages
      if ((error as any)?.response?.status === 400) {
        throw new Error('Invalid location data. Please check all required fields.');
      } else if ((error as any)?.response?.status === 403) {
        throw new Error('Permission denied. You may not have rights to create locations in this account.');
      } else if ((error as any)?.response?.status === 409) {
        throw new Error('Location already exists or conflicts with existing data.');
      } else {
        throw new Error(`Failed to create location: ${(error as any)?.message || 'Unknown error'}`);
      }
    }
  }

  // Get location reviews (v4 My Business API)
  async getLocationReviews(accountId: string, locationId: string): Promise<any[]> {
    await this.initializeAPIs();
    
    try {
      console.log('Fetching reviews for location:', locationId);
      
      // Use the My Business API v4 for reviews
      // Endpoint: GET https://mybusiness.googleapis.com/v4/accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}/reviews
      // Note: Reviews require the location to be verified
      const response = await this.mybusinessaccount.accounts.locations.reviews.list({
        parent: `${accountId}/locations/${locationId}`,
        auth: this.serviceAccountClient
      });
      
      console.log('Reviews fetched successfully:', response.data);
      return response.data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Provide specific error messages for reviews
      if ((error as any)?.response?.status === 400) {
        throw new Error('Invalid location ID or parameters');
      } else if ((error as any)?.response?.status === 403) {
        throw new Error('Permission denied or location not verified');
      } else if ((error as any)?.response?.status === 404) {
        throw new Error('Location not found');
      } else {
        throw new Error(`Failed to fetch reviews: ${(error as any)?.message || 'Unknown error'}`);
      }
    }
  }

  // Get location insights
  async getLocationInsights(locationName: string, startDate: string, endDate: string): Promise<GoogleBusinessInsights> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reportInsights({
        location: locationName,
        requestBody: {
          locationNames: [locationName],
          basicRequest: {
            metricRequests: [
              { metric: 'QUERIES_DIRECT' },
              { metric: 'QUERIES_INDIRECT' },
              { metric: 'VIEWS_MAPS' },
              { metric: 'VIEWS_SEARCH' },
              { metric: 'ACTIONS_WEBSITE' },
              { metric: 'ACTIONS_PHONE' },
              { metric: 'ACTIONS_DRIVING_DIRECTIONS' },
              { metric: 'PHOTOS_VIEWS_MERCHANT' },
              { metric: 'PHOTOS_VIEWS_CUSTOMERS' },
              { metric: 'PHOTOS_COUNT_MERCHANT' },
              { metric: 'PHOTOS_COUNT_CUSTOMERS' },
              { metric: 'LOCAL_POST_VIEWS' },
              { metric: 'LOCAL_POST_ACTIONS' }
            ],
            timeRange: {
              startTime: startDate,
              endTime: endDate
            }
          }
        },
        auth: this.serviceAccountClient
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw new Error('Failed to fetch location insights');
    }
  }

  // Create a post
  async createPost(locationName: string, postData: Partial<GoogleBusinessPost>): Promise<GoogleBusinessPost> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.localPosts.create({
        parent: locationName,
        requestBody: postData,
        auth: this.serviceAccountClient
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  // Get posts for a location
  async getPosts(locationName: string): Promise<GoogleBusinessPost[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.localPosts.list({
        parent: locationName,
        auth: this.serviceAccountClient
      });
      return response.data.localPosts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  // Delete a post
  async deletePost(postName: string): Promise<void> {
    await this.initializeAPIs();
    
    try {
      await this.mybusinessaccount.accounts.locations.localPosts.delete({
        name: postName,
        auth: this.serviceAccountClient
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Get reviews for a location
  async getReviews(locationName: string): Promise<any[]> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reviews.list({
        parent: locationName,
        auth: this.serviceAccountClient
      });
      return response.data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  // Reply to a review
  async replyToReview(reviewName: string, comment: string): Promise<any> {
    await this.initializeAPIs();
    
    try {
      const response = await this.mybusinessaccount.accounts.locations.reviews.updateReply({
        name: reviewName,
        requestBody: {
          comment: comment
        },
        auth: this.serviceAccountClient
      });
      return response.data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw new Error('Failed to reply to review');
    }
  }



  // Performance API: fetch multiple daily metrics time series using service account
  async getLocationPerformanceMetrics(
    locationName: string,
    metrics: string[],
    startDateISO: string,
    endDateISO: string
  ): Promise<any> {
    await this.initializeAPIs();

    // Ensure a fresh access token for service account
    await this.serviceAccountClient.authorize();
    const tokenResp = await (this.serviceAccountClient as any).getAccessToken();
    const accessToken = tokenResp?.token || tokenResp;
    if (!accessToken) {
      throw new Error('Unable to acquire access token for Performance API');
    }

    // Extract locationId from accounts/{aid}/locations/{lid}
    const match = /\/locations\/([^/]+)/.exec(locationName);
    const locationId = match?.[1] || locationName;

    // Convert ISO -> date parts
    const start = new Date(startDateISO);
    const end = new Date(endDateISO);
    const qp = new URLSearchParams();
    for (const m of metrics) qp.append('dailyMetrics', m);
    qp.append('dailyRange.start_date.year', String(start.getUTCFullYear()));
    qp.append('dailyRange.start_date.month', String(start.getUTCMonth() + 1));
    qp.append('dailyRange.start_date.day', String(start.getUTCDate()));
    qp.append('dailyRange.end_date.year', String(end.getUTCFullYear()));
    qp.append('dailyRange.end_date.month', String(end.getUTCMonth() + 1));
    qp.append('dailyRange.end_date.day', String(end.getUTCDate()));

    const url = `https://businessprofileperformance.googleapis.com/v1/locations/${encodeURIComponent(
      locationId
    )}:fetchMultiDailyMetricsTimeSeries?${qp.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    } as any);

    const data = await res.json();
    if (!res.ok) {
      const details = (data && (data.error?.message || JSON.stringify(data))) || res.statusText;
      throw new Error(`Performance API error: ${details}`);
    }
    return data;
  }
}

// Create a singleton instance
export const googleBusinessServiceAccountAPI = new GoogleBusinessServiceAccountAPI(); 