import { GMBStoreTest } from '@/components/ui/gmb-store-test';

export default function TestGMBPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google My Business API Testing</h1>
        <p className="text-gray-600">
          Test store creation and management using Google My Business APIs. This page allows you to:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
          <li>Test GMB API connection and authentication</li>
          <li>Retrieve GMB accounts and locations</li>
          <li>Test store creation/update in Google My Business</li>
          <li>Validate location data retrieval and insights</li>
          <li>Debug API responses and error handling</li>
        </ul>
      </div>

      <GMBStoreTest />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li><strong>Test GMB Connection:</strong> First, test if the GMB API is properly configured and accessible</li>
          <li><strong>Get Locations:</strong> After successful connection, retrieve available locations for testing</li>
          <li><strong>Customize Test Data:</strong> Modify the store data below to match your test requirements</li>
          <li><strong>Test Store Creation:</strong> Attempt to create/update a store location in GMB</li>
          <li><strong>Verify Results:</strong> Check the test results and console logs for detailed information</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This test uses the <code>updateLocation</code> API method, which can create new locations 
            or update existing ones. If a location doesn't exist, the API may return an error, which is expected behavior 
            for testing purposes.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Prerequisites</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>Google My Business API must be enabled in your Google Cloud Console</li>
          <li>Service account credentials must be properly configured</li>
          <li>Required environment variables must be set (see FIREBASE_SETUP.md)</li>
          <li>GMB account must have appropriate permissions for location management</li>
        </ul>
      </div>
    </div>
  );
}
