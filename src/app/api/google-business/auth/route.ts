import { NextRequest, NextResponse } from 'next/server';
import { googleBusinessAPI } from '@/lib/google-business-api';
import { googleBusinessServiceAccountAPI } from '@/lib/google-business-service-account';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const check = searchParams.get('check');
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    console.log('[GBP Auth][GET]', {
      mode,
      check: Boolean(check),
      hasCode: Boolean(code),
      hasError: Boolean(error),
      hasReturnTo: Boolean(searchParams.get('returnTo')),
      statePresent: Boolean(searchParams.get('state')),
    });

    if (error) {
      console.error('[GBP Auth] OAuth error from Google:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
    }

    // If Google redirected back with an auth code, exchange it FIRST
    if (code) {
      console.log('[GBP Auth] Exchanging authorization code for tokens');
      const tokens = await googleBusinessAPI.getTokensFromCode(code);
      // Switch API instance to OAuth mode and persist ONLY refresh token to avoid oversized cookies
      googleBusinessAPI.setAuthMode('oauth');
      // Prefer an explicit return path from OAuth state, fallback to the Google Business page
      const rawState = searchParams.get('state');
      let returnTo = '/google-business';
      if (rawState) {
        try {
          const decoded = decodeURIComponent(rawState);
          // Prevent open redirects; only allow internal absolute paths
          returnTo = decoded.startsWith('/') ? decoded : '/google-business';
        } catch {
          returnTo = '/google-business';
        }
      }
      const hasRefreshToken = Boolean((tokens as any)?.refresh_token);
      const hasAccessToken = Boolean((tokens as any)?.access_token);
      const expiryDateMs: number | undefined = (tokens as any)?.expiry_date;
      console.log('[GBP Auth] Token exchange success', {
        hasRefreshToken,
        hasAccessToken,
        hasExpiry: Boolean(expiryDateMs),
        redirectingTo: returnTo,
      });
      const res = NextResponse.redirect(new URL(returnTo, request.url));
      const refreshToken = (tokens as any)?.refresh_token;
      if (refreshToken) {
        res.cookies.set('gbp_refresh_token', refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });
      }
      // Also set a short-lived access token cookie to cover cases where refresh_token is not returned
      const accessToken = (tokens as any)?.access_token;
      const expiryDateMs2: number | undefined = (tokens as any)?.expiry_date;
      const maxAge = expiryDateMs2 ? Math.max(1, Math.floor((expiryDateMs2 - Date.now()) / 1000)) : 60 * 5; // default 5m
      if (accessToken) {
        res.cookies.set('gbp_access_token', accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge,
        });
      }
      // Remove any legacy cookie if present
      res.cookies.set('gbp_tokens', '', { maxAge: 0, path: '/' });
      return res;
    }

    // If client explicitly requests OAuth, return the OAuth URL regardless of service account presence
    if (mode === 'oauth') {
      // Allow callers to specify where to return after auth via `returnTo`, passed through OAuth `state`
      const returnTo = searchParams.get('returnTo');
      let authUrl = googleBusinessAPI.generateAuthUrl();
      
      // If this is a login request, redirect to our custom callback route
      if (returnTo === '/login') {
        authUrl = authUrl.replace(
          process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google-business/auth',
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`
        );
      }
      
      if (returnTo) {
        try {
          const url = new URL(authUrl);
          url.searchParams.set('state', returnTo);
          authUrl = url.toString();
          console.log('[GBP Auth] Generated OAuth URL with state', { state: returnTo });
        } catch {
          // fall back silently if URL parsing fails
        }
      }
      return NextResponse.json({ authUrl, message: 'Redirect user to this URL for authentication', mode: 'oauth' });
    }

    // If this is a lightweight check request, first prefer OAuth cookies to reflect user login status
    if (check) {
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
          // Do a tiny call to validate auth; accounts.list is lightweight
          await googleBusinessAPI.getAccounts();
          return NextResponse.json({ success: true, mode: 'oauth' });
        } catch (oauthErr) {
          // fall through to service account or oauth prompt
        }
      }
    }

    // If service account credentials are configured
    if (process.env.GOOGLE_CLIENT_EMAIL && (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_JSON)) {
      // Optionally validate the service account has permissions by attempting a lightweight call
      if (check) {
        try {
          await googleBusinessServiceAccountAPI.getAccounts();
          console.log('[GBP Auth] Service account check succeeded');
          return NextResponse.json({ success: true, mode: 'service_account' });
        } catch (saErr: any) {
          const details = saErr?.message || 'Unknown service account error';
          const authUrl = googleBusinessAPI.generateAuthUrl();
          console.error('[GBP Auth] Service account check failed', { details });
          return NextResponse.json({ success: false, mode: 'service_account', requireAuth: true, authUrl, details }, { status: 401 });
        }
      }
      // Default: just report configured mode (no network test)
      console.log('[GBP Auth] Service account configured; returning mode only');
      return NextResponse.json({ success: true, mode: 'service_account' });
    }

    // Generate authorization URL (OAuth mode)
    const authUrl = googleBusinessAPI.generateAuthUrl();
    console.log('[GBP Auth] No credentials configured; returning OAuth URL');
    
    return NextResponse.json({ 
      authUrl,
      message: 'Please redirect user to this URL for authentication'
    });

  } catch (error) {
    console.error('[GBP Auth] Handler error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokens } = body;

    if (!tokens) {
      return NextResponse.json(
        { error: 'Tokens are required' }, 
        { status: 400 }
      );
    }

    // Set credentials for the API instance and switch to OAuth mode
    googleBusinessAPI.setCredentials(tokens);
    googleBusinessAPI.setAuthMode('oauth');

    return NextResponse.json({ 
      success: true, 
      message: 'Credentials set successfully' 
    });

  } catch (error) {
    console.error('Error setting credentials:', error);
    return NextResponse.json(
      { error: 'Failed to set credentials' }, 
      { status: 500 }
    );
  }
} 