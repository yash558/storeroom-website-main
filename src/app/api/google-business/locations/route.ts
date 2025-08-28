import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';
import { googleBusinessAPI } from '@/lib/google-business-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountIdParam = searchParams.get('accountId');
    let accountName = searchParams.get('accountName');
    const locationName = searchParams.get('locationName');

    // Allow callers to pass either accountName (accounts/{id}) or accountId (numeric)
    if (!accountName && accountIdParam) {
      accountName = accountIdParam.startsWith('accounts/') ? accountIdParam : `accounts/${accountIdParam}`;
    }

    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' }, 
        { status: 400 }
      );
    }

    // Prefer OAuth via cookies
    const rawRefresh = request.cookies.get('gbp_refresh_token')?.value;
    const rawAccess = request.cookies.get('gbp_access_token')?.value;
    const refreshToken = rawRefresh;
    const accessToken = rawAccess;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        if (locationName) {
          const location = await googleBusinessAPI.getLocation(locationName);
          return NextResponse.json({ success: true, location });
        } else {
          const locations = await googleBusinessAPI.getLocations(accountName);
          return NextResponse.json({ success: true, locations });
        }
      } catch (oauthErr: any) {
        // fall through to service account or require auth
      }
    }

    // Fallback: service account
    if (locationName) {
      const location = await googleBusinessServiceAccountAPI.getLocation(locationName);
      return NextResponse.json({ success: true, location });
    }
    const locations = await googleBusinessServiceAccountAPI.getLocations(accountName);
    return NextResponse.json({ success: true, locations });

  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get('locationName');

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' }, 
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        const updatedLocation = await googleBusinessAPI.updateLocation(locationName, updateData);
        return NextResponse.json({ success: true, location: updatedLocation });
      } catch (oauthErr) {
        // fall through
      }
    }

    const updatedLocation = await googleBusinessServiceAccountAPI.updateLocation(locationName, updateData);
    return NextResponse.json({ success: true, location: updatedLocation });

  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountName, locationData, action = 'create' } = body;

    if (!accountName) {
      return NextResponse.json(
        { error: 'Account name is required' }, 
        { status: 400 }
      );
    }

    if (!locationData) {
      return NextResponse.json(
        { error: 'Location data is required' }, 
        { status: 400 }
      );
    }

    // Extract account ID from account name if it's in "accounts/{id}" format
    let accountId = accountName;
    if (accountName.startsWith('accounts/')) {
      accountId = accountName.replace('accounts/', '');
    } else if (!accountName.includes('/')) {
      // If it's just a number, format it as accounts/{id}
      accountId = `accounts/${accountName}`;
    }

    console.log('Processing location creation/update:', { 
      originalAccountName: accountName, 
      processedAccountId: accountId,
      action 
    });

    // Prefer OAuth
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    
    if (refreshToken || accessToken) {
      try {
        googleBusinessAPI.setAuthMode('oauth');
        if (refreshToken) {
          googleBusinessAPI.setRefreshToken(refreshToken);
        } else if (accessToken) {
          googleBusinessAPI.setCredentials({ access_token: accessToken } as any);
        }
        
        let result;
        if (action === 'create') {
          result = await googleBusinessAPI.createLocation(accountId, locationData);
        } else {
          // For update, we need to construct the location name
          const locationName = `${accountId}/locations/${locationData.storeCode || 'new-location'}`;
          result = await googleBusinessAPI.updateLocation(locationName, locationData);
        }
        
        return NextResponse.json({ success: true, location: result });
      } catch (oauthErr) {
        console.error('OAuth location creation failed:', oauthErr);
        // fall through to service account
      }
    }

    // Fallback: service account
    let result;
    if (action === 'create') {
      result = await googleBusinessServiceAccountAPI.createLocation(accountId, locationData);
    } else {
      // For update, we need to construct the location name
      const locationName = `${accountId}/locations/${locationData.storeCode || 'new-location'}`;
      result = await googleBusinessServiceAccountAPI.updateLocation(locationName, locationData);
    }
    
    return NextResponse.json({ success: true, location: result });

  } catch (error) {
    console.error('Error creating/updating location:', error);
    
    // Provide more specific error messages
    if ((error as any)?.response?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid location data. Please check all required fields.' }, 
        { status: 400 }
      );
    } else if ((error as any)?.response?.status === 403) {
      return NextResponse.json(
        { error: 'Permission denied. You may not have rights to create locations in this account.' }, 
        { status: 403 }
      );
    } else if ((error as any)?.response?.status === 409) {
      return NextResponse.json(
        { error: 'Location already exists or conflicts with existing data.' }, 
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        { error: `Failed to create/update location: ${(error as any)?.message || 'Unknown error'}` }, 
        { status: 500 }
      );
    }
  }
} 