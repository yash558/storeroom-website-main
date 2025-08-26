import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    });

    // Clear OAuth cookies
    response.cookies.set('gbp_access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('gbp_refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
    
  } catch (error) {
    console.error('Google OAuth logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to logout' 
      },
      { status: 500 }
    );
  }
}
