'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestStoreData {
  storeName: string;
  storeCode: string;
  primaryCategory: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: string;
    longitude: string;
  };
  phone: string;
  website: string;
  description: string;
}

interface GoogleAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  state: string;
  profilePhotoUri?: string;
  accountNumber?: string;
}

export function GMBStoreTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('service-account');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAccounts, setUserAccounts] = useState<GoogleAccount[]>([]);
  const [selectedUserAccount, setSelectedUserAccount] = useState<string>('');

  const [testStoreData, setTestStoreData] = useState<TestStoreData>({
    storeName: 'Test Store - GMB API',
    storeCode: 'GMB-TEST-001',
    primaryCategory: 'Restaurant',
    address: {
      line1: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'US',
      latitude: '40.7128',
      longitude: '-74.0060'
    },
    phone: '+1-555-123-4567',
    website: 'https://teststore.example.com',
    description: 'This is a test store created via GMB API for validation purposes.'
  });

  // Ensure component only runs on client side
  useEffect(() => {
    setIsClient(true);
    checkGoogleAuthStatus();
    checkUrlParameters();
  }, []);

  // Check URL parameters for authentication results
  const checkUrlParameters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
      toast({
        title: 'Authentication Successful',
        description: success,
      });
      setTestResult(`✅ ${success}`);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refresh auth status
      checkGoogleAuthStatus();
    }
    
    if (error) {
      toast({
        title: 'Authentication Failed',
        description: error,
        variant: 'destructive',
      });
      setTestResult(`❌ ${error}`);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Check if user is authenticated with Google
  const checkGoogleAuthStatus = async () => {
    try {
      const response = await fetch('/api/google-business/auth/status');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setIsAuthenticated(result.isAuthenticated);
        if (result.isAuthenticated) {
          setUserProfile(result.userProfile);
          await loadUserAccounts();
        }
      }
    } catch (error) {
      console.log('Auth status check failed:', error);
    }
  };

  // Load user's Google accounts
  const loadUserAccounts = async () => {
    try {
      const response = await fetch('/api/google-business/accounts?type=user');
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUserAccounts(result.accounts || []);
        if (result.accounts && result.accounts.length > 0) {
          setSelectedUserAccount(result.accounts[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to load user accounts:', error);
    }
  };

  // Authenticate with Google
  const authenticateWithGoogle = async () => {
    setLoading(true);
    setTestResult('Redirecting to Google for authentication...');
    
    try {
      // Redirect to Google OAuth
      window.location.href = '/api/google-business/auth/login';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setTestResult(`❌ Google authentication failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  // Disconnect Google account
  const disconnectGoogle = async () => {
    setLoading(true);
    setTestResult('Disconnecting Google account...');
    
    try {
      const response = await fetch('/api/google-business/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUserProfile(null);
        setUserAccounts([]);
        setSelectedUserAccount('');
        setTestResult('✅ Google account disconnected successfully');
        
        toast({
          title: 'Account Disconnected',
          description: 'Google account has been disconnected',
        });
      } else {
        throw new Error('Failed to disconnect account');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Disconnection failed';
      setTestResult(`❌ Failed to disconnect: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Test GMB API connection and get accounts (Service Account)
  const testGMBConnection = async () => {
    setLoading(true);
    setTestResult('Testing GMB API connection...');
    
    try {
      console.log('Testing GMB API connection...');
      
      // Call the API endpoint instead of importing the library directly
      const response = await fetch('/api/google-business/accounts');
      const result = await response.json();
      
      if (response.ok && result.success) {
        const gmbAccounts = result.accounts || [];
        
        if (gmbAccounts.length > 0) {
          setAccounts(gmbAccounts);
          setSelectedAccount(gmbAccounts[0].name);
          setTestResult(`✅ GMB API connection successful! Found ${gmbAccounts.length} account(s):\n${gmbAccounts.map((acc: any) => `- ${acc.accountName} (${acc.type})`).join('\n')}`);
          
          toast({
            title: 'GMB Connection Successful',
            description: `Found ${gmbAccounts.length} account(s)`,
          });
        } else {
          setTestResult('⚠️ GMB API connection successful but no accounts found. Please check your GMB setup.');
          toast({
            title: 'GMB Connection Warning',
            description: 'No accounts found',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error(result.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ GMB API connection failed: ${errorMessage}`);
      console.error('GMB connection test failed:', error);
      
      toast({
        title: 'GMB Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get locations for selected account
  const getLocations = async () => {
    const accountName = activeTab === 'user-account' ? selectedUserAccount : selectedAccount;
    
    if (!accountName) {
      setTestResult('❌ Please select an account first');
      return;
    }

    setLoading(true);
    setTestResult('Fetching locations...');
    
    try {
      console.log('Fetching locations for account:', accountName);
      
      const response = await fetch(`/api/google-business/locations?accountName=${encodeURIComponent(accountName)}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        const gmbLocations = result.locations || [];
        
        if (gmbLocations.length > 0) {
          setLocations(gmbLocations);
          setSelectedLocation(gmbLocations[0].name);
          setTestResult(`✅ Found ${gmbLocations.length} location(s):\n${gmbLocations.map((loc: any) => `- ${loc.locationName} (${loc.primaryCategory?.displayName || 'No category'})`).join('\n')}`);
          
          toast({
            title: 'Locations Retrieved',
            description: `Found ${gmbLocations.length} location(s)`,
          });
        } else {
          setTestResult('⚠️ No locations found for this account. You may need to create a location first.');
          toast({
            title: 'No Locations Found',
            description: 'This account has no locations',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error(result.error || 'Failed to fetch locations');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Failed to fetch locations: ${errorMessage}`);
      console.error('Location fetch failed:', error);
      
      toast({
        title: 'Location Fetch Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test store creation in GMB
  const testStoreCreation = async () => {
    const accountName = activeTab === 'user-account' ? selectedUserAccount : selectedAccount;
    
    if (!accountName) {
      setTestResult('❌ Please select an account first');
      return;
    }

    setLoading(true);
    setTestResult('Testing store creation in GMB...');
    
    try {
      console.log('Testing store creation with data:', testStoreData);
      
      // Prepare GMB location data
      const gmbLocationData = {
        locationName: testStoreData.storeName,
        primaryCategory: {
          displayName: testStoreData.primaryCategory,
          categoryId: testStoreData.primaryCategory.toLowerCase().replace(/\s+/g, '_')
        },
        categories: [
          {
            displayName: testStoreData.primaryCategory,
            categoryId: testStoreData.primaryCategory.toLowerCase().replace(/\s+/g, '_')
          }
        ],
        websiteUri: testStoreData.website,
        latlng: {
          latitude: parseFloat(testStoreData.address.latitude),
          longitude: parseFloat(testStoreData.address.longitude)
        },
        profile: {
          description: testStoreData.description,
          phoneNumbers: {
            primaryPhone: testStoreData.phone
          },
          websiteUri: testStoreData.website
        }
      };

      // Call the API endpoint for location creation
      const response = await fetch('/api/google-business/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName: accountName,
          locationData: gmbLocationData,
          action: 'create' // or 'update'
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        const gmbLocation = result.location;
        setTestResult(`✅ Store creation successful! New location created.\n\nLocation Details:\n- Name: ${gmbLocation.locationName}\n- ID: ${gmbLocation.name}\n- Category: ${gmbLocation.primaryCategory?.displayName}\n- Website: ${gmbLocation.websiteUri}\n- Phone: ${gmbLocation.profile?.phoneNumbers?.primaryPhone}\n- Coordinates: ${gmbLocation.latlng?.latitude}, ${gmbLocation.latlng?.longitude}`);
        
        toast({
          title: 'Store Creation Successful',
          description: 'New GMB location created successfully',
        });

        // Refresh locations list
        await getLocations();
      } else {
        throw new Error(result.error || 'Failed to create location');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Store creation/update failed: ${errorMessage}\n\nThis might be expected if:\n- You don't have permission to create/update locations\n- The API requires different parameters\n- The location data format is incorrect\n- The GMB account has restrictions`);
      console.error('Store creation/update failed:', error);
      
      toast({
        title: 'Store Creation/Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test actual store creation API endpoint
  const testStoreCreationAPI = async () => {
    const accountName = activeTab === 'user-account' ? selectedUserAccount : selectedAccount;
    
    if (!accountName) {
      setTestResult('❌ Please select an account first');
      return;
    }

    setLoading(true);
    setTestResult('Testing store creation via API endpoint...');
    
    try {
      console.log('Testing store creation API with data:', testStoreData);
      
      // Prepare store data for the API
      const apiStoreData = {
        brandId: 'test-brand-id', // This would normally come from the selected brand
        storeCode: testStoreData.storeCode,
        storeName: testStoreData.storeName,
        storeSlug: testStoreData.storeCode.toLowerCase().replace(/\s+/g, '-'),
        primaryCategory: testStoreData.primaryCategory,
        address: testStoreData.address,
        phone: testStoreData.phone,
        website: testStoreData.website,
        description: testStoreData.description,
        googleBusiness: {
          isConnected: true,
          accountId: accountName,
          locationId: null // Will be set after creation
        }
      };

      // Call the store creation API
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiStoreData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTestResult(`✅ Store creation API test successful!\n\nStore Details:\n- ID: ${result.data._id}\n- Name: ${result.data.storeName}\n- Code: ${result.data.storeCode}\n- Category: ${result.data.primaryCategory}\n- Address: ${result.data.address.line1}, ${result.data.address.city}\n- GMB Connected: ${result.data.googleBusiness?.isConnected ? 'Yes' : 'No'}`);
        
        toast({
          title: 'Store Creation API Test Successful',
          description: 'Store created successfully via API',
        });
      } else {
        throw new Error(result.error || `API returned status ${response.status}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Store creation API test failed: ${errorMessage}\n\nThis might be expected if:\n- The API endpoint is not implemented\n- Required fields are missing\n- Database connection issues\n- Authentication problems`);
      console.error('Store creation API test failed:', error);
      
      toast({
        title: 'Store Creation API Test Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test location retrieval
  const testLocationRetrieval = async () => {
    if (!selectedLocation) {
      setTestResult('❌ Please select a location first');
      return;
    }

    setLoading(true);
    setTestResult('Testing location retrieval...');
    
    try {
      console.log('Testing location retrieval for:', selectedLocation);
      
      const response = await fetch(`/api/google-business/locations?locationName=${encodeURIComponent(selectedLocation)}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        const location = result.location;
        setTestResult(`✅ Location retrieval successful!\n\nLocation Details:\n- Name: ${location.locationName}\n- Category: ${location.primaryCategory?.displayName}\n- Website: ${location.websiteUri}\n- Phone: ${location.profile?.phoneNumbers?.primaryPhone}\n- Description: ${location.profile?.description}\n- Coordinates: ${location.latlng?.latitude}, ${location.latlng?.longitude}`);
        
        toast({
          title: 'Location Retrieval Successful',
          description: 'Location data retrieved successfully',
        });
        
      } else {
        throw new Error(result.error || 'Failed to retrieve location');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Location retrieval failed: ${errorMessage}`);
      console.error('Location retrieval failed:', error);
      
      toast({
        title: 'Location Retrieval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Test location insights
  const testLocationInsights = async () => {
    if (!selectedLocation) {
      setTestResult('❌ Please select a location first');
      return;
    }

    setLoading(true);
    setTestResult('Testing location insights...');
    
    try {
      console.log('Testing location insights for:', selectedLocation);
      
      // Get insights for the last 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(`/api/google-business/insights?locationName=${encodeURIComponent(selectedLocation)}&startDate=${startDate}&endDate=${endDate}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        const insights = result.performance;
        setTestResult(`✅ Location insights successful!\n\nInsights Data:\n${JSON.stringify(insights, null, 2)}`);
        
        toast({
          title: 'Location Insights Successful',
          description: 'Insights data retrieved successfully',
        });
        
      } else {
        throw new Error(result.error || 'Failed to retrieve insights');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResult(`❌ Location insights failed: ${errorMessage}`);
      console.error('Location insights failed:', error);
      
      toast({
        title: 'Location Insights Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading GMB Test Component...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="service-account">Service Account</TabsTrigger>
          <TabsTrigger value="user-account">Google Account</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Service Account Tab */}
        <TabsContent value="service-account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Account GMB Testing</CardTitle>
              <p className="text-sm text-gray-600">
                Test GMB API using service account credentials (configured in environment variables)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testGMBConnection} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Testing...' : 'Test GMB Connection'}
                </Button>
                
                <Button 
                  onClick={getLocations} 
                  disabled={loading || !selectedAccount}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Fetching...' : 'Get Locations'}
                </Button>
              </div>

              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label>Select GMB Account:</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.name} value={account.name}>
                          {account.accountName} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Account Tab */}
        <TabsContent value="user-account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Account Authentication</CardTitle>
              <p className="text-sm text-gray-600">
                Connect your personal Google account to manage GMB locations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      Connect your Google account to access and manage your Google My Business locations.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={authenticateWithGoogle} 
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Connecting...' : '🔐 Connect Google Account'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {userProfile?.email?.charAt(0).toUpperCase() || 'G'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-green-800">
                            {userProfile?.email || 'Google Account'}
                          </p>
                          <p className="text-sm text-green-600">
                            Connected to Google My Business
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={loadUserAccounts} 
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? 'Loading...' : '🔄 Refresh Accounts'}
                    </Button>
                    
                    <Button 
                      onClick={disconnectGoogle} 
                      disabled={loading}
                      className="w-full"
                      variant="destructive"
                    >
                      {loading ? 'Disconnecting...' : '❌ Disconnect Account'}
                    </Button>
                  </div>

                  {userAccounts.length > 0 && (
                    <div className="space-y-2">
                      <Label>Select Your GMB Account:</Label>
                      <Select value={selectedUserAccount} onValueChange={setSelectedUserAccount}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                          {userAccounts.map((account) => (
                            <SelectItem key={account.name} value={account.name}>
                              {account.accountName} ({account.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedUserAccount && (
                    <Button 
                      onClick={getLocations} 
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? 'Fetching...' : '📍 Get My Locations'}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Creation Testing</CardTitle>
              <p className="text-sm text-gray-600">
                Test creating stores in your selected GMB account
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Location:</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.name} value={location.name}>
                          {location.locationName} ({location.primaryCategory?.displayName || 'No category'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedLocation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={testLocationRetrieval} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    {loading ? 'Testing...' : 'Test Location Retrieval'}
                  </Button>
                  
                  <Button 
                    onClick={testLocationInsights} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    {loading ? 'Testing...' : 'Test Location Insights'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Store Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name:</Label>
                  <Input
                    value={testStoreData.storeName}
                    onChange={(e) => setTestStoreData(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder="Test Store Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Store Code:</Label>
                  <Input
                    value={testStoreData.storeCode}
                    onChange={(e) => setTestStoreData(prev => ({ ...prev, storeCode: e.target.value }))}
                    placeholder="GMB-TEST-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Category:</Label>
                  <Input
                    value={testStoreData.primaryCategory}
                    onChange={(e) => setTestStoreData(prev => ({ ...prev, primaryCategory: e.target.value }))}
                    placeholder="Restaurant"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phone:</Label>
                  <Input
                    value={testStoreData.phone}
                    onChange={(e) => setTestStoreData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Website:</Label>
                <Input
                  value={testStoreData.website}
                  onChange={(e) => setTestStoreData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://teststore.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Description:</Label>
                <Textarea
                  value={testStoreData.description}
                  onChange={(e) => setTestStoreData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Store description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address Line 1:</Label>
                  <Input
                    value={testStoreData.address.line1}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line1: e.target.value }
                    }))}
                    placeholder="123 Test Street"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>City:</Label>
                  <Input
                    value={testStoreData.address.city}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="Test City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>State:</Label>
                  <Input
                    value={testStoreData.address.state}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="TS"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Postal Code:</Label>
                  <Input
                    value={testStoreData.address.postalCode}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    placeholder="12345"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Country:</Label>
                  <Input
                    value={testStoreData.address.country}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    placeholder="US"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude:</Label>
                  <Input
                    value={testStoreData.address.latitude}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, latitude: e.target.value }
                    }))}
                    placeholder="40.7128"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Longitude:</Label>
                  <Input
                    value={testStoreData.address.longitude}
                    onChange={(e) => setTestStoreData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, longitude: e.target.value }
                    }))}
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testStoreCreation} 
                  disabled={loading || (!selectedAccount && !selectedUserAccount)}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Testing Store Creation...' : '🚀 Create Store in GMB'}
                </Button>
                
                <Button 
                  onClick={testStoreCreationAPI} 
                  disabled={loading || (!selectedAccount && !selectedUserAccount)}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {loading ? 'Testing API...' : '🔌 Test Store Creation API'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-md">
              <pre className="text-sm whitespace-pre-wrap font-mono">{testResult}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations Display Section */}
      {locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📍 GMB Locations ({locations.length})
              <Button 
                onClick={getLocations} 
                size="sm" 
                variant="outline"
                disabled={loading}
              >
                🔄 Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locations.map((location, index) => (
                <Card key={location.name || index} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{location.locationName || 'Unnamed Location'}</span>
                      <Badge variant={location.openInfo?.status === 'OPEN' ? 'default' : 'secondary'}>
                        {location.openInfo?.status || 'UNKNOWN'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      ID: {location.name} | Store Code: {location.storeCode || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Primary Category</Label>
                          <p className="text-sm">
                            {location.primaryCategory?.displayName || 'No category'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p className="text-sm">
                            {location.profile?.phoneNumbers?.primaryPhone || 'No phone'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                          <p className="text-sm">
                            {location.websiteUri || location.profile?.websiteUri || 'No website'}
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                          <p className="text-sm">
                            {location.profile?.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                          <p className="text-sm">
                            {location.latlng ? 
                              `${location.latlng.latitude}, ${location.latlng.longitude}` : 
                              'No coordinates'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Labels</Label>
                          <div className="flex flex-wrap gap-1">
                            {location.labels && location.labels.length > 0 ? 
                              location.labels.map((label, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))
                              : 
                              <span className="text-sm text-muted-foreground">No labels</span>
                            }
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                          <div className="flex flex-wrap gap-1">
                            {location.categories && location.categories.length > 0 ? 
                              location.categories.map((cat, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {cat.displayName}
                                </Badge>
                              ))
                              : 
                              <span className="text-sm text-muted-foreground">No categories</span>
                            }
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant={location.openInfo?.status === 'OPEN' ? 'default' : 'secondary'}>
                              {location.openInfo?.status || 'UNKNOWN'}
                            </Badge>
                            {location.openInfo?.canReopen && (
                              <Badge variant="outline">Can Reopen</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Map Preview */}
                    {location.latlng && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">Location on Map</Label>
                        <div className="w-full h-48 bg-muted border rounded-md flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📍</div>
                            <p className="text-sm text-muted-foreground">
                              {location.latlng.latitude}, {location.latlng.longitude}
                            </p>
                            <a 
                              href={`https://www.google.com/maps?q=${location.latlng.latitude},${location.latlng.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                            >
                              View on Google Maps →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
