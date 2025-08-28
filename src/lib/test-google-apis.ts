import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Test script to debug Google APIs
export async function testGoogleAPIs() {
  try {
    console.log('Testing Google APIs availability...');
    
    // Check what's available in the google object
    console.log('Available Google APIs:', Object.keys(google));
    
    // Check if specific APIs exist
    const apisToCheck = [
      'mybusinessaccountmanagement',
      'mybusinessbusinessinformation',
      'mybusiness',
      'mybusinessnotifications',
      'mybusinessverifications'
    ];
    
    for (const apiName of apisToCheck) {
      try {
        if ((google as any)[apiName]) {
          console.log(`✅ ${apiName} API is available`);
          const api = (google as any)[apiName]();
          console.log(`   - API object:`, api);
          console.log(`   - Available versions:`, api.getAvailableVersions ? api.getAvailableVersions() : 'No version info');
        } else {
          console.log(`❌ ${apiName} API is NOT available`);
        }
      } catch (error) {
        console.log(`❌ ${apiName} API error:`, error);
      }
    }
    
    // Test service account authentication
    console.log('\nTesting service account authentication...');
    
    const serviceAccountConfig = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID || '',
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || '',
      private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: '',
      universe_domain: 'googleapis.com',
    };
    
    console.log('Service account config:', {
      hasEmail: !!serviceAccountConfig.client_email,
      hasPrivateKey: !!serviceAccountConfig.private_key,
      hasProjectId: !!serviceAccountConfig.project_id,
      email: serviceAccountConfig.client_email
    });
    
    const serviceAccountClient = new JWT({
      email: serviceAccountConfig.client_email,
      key: serviceAccountConfig.private_key,
      scopes: ['https://www.googleapis.com/auth/business.manage']
    });
    
    console.log('Service account client created:', {
      hasClient: !!serviceAccountClient,
      email: serviceAccountClient.email,
      projectId: serviceAccountClient.projectId
    });
    
    // Try to authorize
    console.log('Attempting to authorize service account...');
    await serviceAccountClient.authorize();
    console.log('✅ Service account authorized successfully');
    
    // Try to get access token
    console.log('Getting access token...');
    const tokenResp = await serviceAccountClient.getAccessToken();
    const accessToken = tokenResp?.token || tokenResp;
    console.log('Access token obtained:', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length,
      tokenStart: accessToken?.substring(0, 20)
    });
    
    // Test direct API call
    console.log('\nTesting direct API call...');
    const url = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
    
    console.log('Direct API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API call successful:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Direct API call failed:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in other files
export default testGoogleAPIs;
