import { NextRequest, NextResponse } from 'next/server';
import { testGoogleAPIs } from '@/lib/test-google-apis';

export async function GET(request: NextRequest) {
  try {
    console.log('[GBP Test] Starting Google APIs test...');
    
    // Run the test
    await testGoogleAPIs();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Google APIs test completed. Check server logs for details.' 
    });
    
  } catch (error) {
    console.error('[GBP Test] Test failed:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
