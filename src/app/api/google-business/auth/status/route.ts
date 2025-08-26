import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check for Google OAuth cookies
    const refreshToken = request.cookies.get('gbp_refresh_token')?.value;
    const accessToken = request.cookies.get('gbp_access_token')?.value;
    
    if (!refreshToken && !accessToken) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        userProfile: null
      });
    }

    // If we have tokens, try to get user profile
    try {
      let userProfile = null;
      
      if (accessToken) {
        // Try to get user info with access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (userInfoResponse.ok) {
          userProfile = await userInfoResponse.json();
        }
      }
      
      return NextResponse.json({
        success: true,
        isAuthenticated: true,
        userProfile: userProfile || { email: 'Authenticated User' }
      });
      
    } catch (profileError) {
      console.error('Failed to get user profile:', profileError);
      
      // Return authenticated but without profile
      return NextResponse.json({
        success: true,
        isAuthenticated: true,
        userProfile: { email: 'Authenticated User' }
      });
    }
    
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check authentication status',
        isAuthenticated: false,
        userProfile: null
      },
      { status: 500 }
    );
  }
}
