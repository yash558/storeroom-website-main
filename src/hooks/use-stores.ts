import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CreateStoreInput, UpdateStoreInput, StoreData } from '@/lib/validation';
import { authFetch } from '@/lib/auth-client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

// Mock data for development/testing
const mockStores: StoreData[] = [
  {
    id: 'mock-store-1',
    brandId: 'mock-brand-1',
    storeCode: 'DEL-CP-001',
    storeName: "Haldiram's Connaught Place",
    storeSlug: 'haldirams-connaught-place',
    email: 'cp@haldirams.com',
    phone: '+91-11-23456789',
    address: {
      line1: '123 Main Street',
      line2: 'Ground Floor',
      locality: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      latitude: '28.6139',
      longitude: '77.2090',
    },
    primaryCategory: 'Restaurant',
    additionalCategories: 'Sweet Shop, Snacks',
    tags: ['Traditional', 'Authentic', 'Popular'],
    amenities: {
      parking: true,
      delivery: true,
    },
    hours: {
      Monday: { open: '09:00', close: '22:00', closed: false },
      Tuesday: { open: '09:00', close: '22:00', closed: false },
      Wednesday: { open: '09:00', close: '22:00', closed: false },
      Thursday: { open: '09:00', close: '22:00', closed: false },
      Friday: { open: '09:00', close: '22:00', closed: false },
      Saturday: { open: '09:00', close: '22:00', closed: false },
      Sunday: { open: '09:00', close: '22:00', closed: false },
    },
    microsite: {
      heroImage: 'https://placehold.co/1200x600.png',
      heroHint: 'store front',
      tagline: 'Traditional Indian Sweets & Snacks',
    },
    socialLinks: {
      facebook: 'https://facebook.com/haldirams',
      instagram: 'https://instagram.com/haldirams',
      website: 'https://haldirams.com',
    },
    seo: {
      title: "Haldiram's Connaught Place | Traditional Indian Sweets",
      description: 'Authentic Indian sweets and snacks in Connaught Place, Delhi. Traditional recipes since 1937.',
      keywords: 'Indian sweets, traditional snacks, Delhi, Connaught Place, Haldirams',
    },
  },
  {
    id: 'mock-store-2',
    brandId: 'mock-brand-2',
    storeCode: 'CHI-DT-001',
    storeName: 'Pizza House Downtown',
    storeSlug: 'pizza-house-downtown',
    email: 'downtown@pizzahouse.com',
    phone: '+1-555-123-4567',
    address: {
      line1: '456 Oak Avenue',
      line2: 'Suite 100',
      locality: 'Downtown',
      city: 'Chicago',
      state: 'Illinois',
      postalCode: '60601',
      country: 'USA',
      latitude: '41.8781',
      longitude: '-87.6298',
    },
    primaryCategory: 'Restaurant',
    additionalCategories: 'Pizza, Italian',
    tags: ['Wood-fired', 'Authentic', 'Downtown'],
    amenities: {
      parking: false,
      delivery: true,
    },
    hours: {
      Monday: { open: '11:00', close: '23:00', closed: false },
      Tuesday: { open: '11:00', close: '23:00', closed: false },
      Wednesday: { open: '11:00', close: '23:00', closed: false },
      Thursday: { open: '11:00', close: '23:00', closed: false },
      Friday: { open: '11:00', close: '00:00', closed: false },
      Saturday: { open: '11:00', close: '00:00', closed: false },
      Sunday: { open: '12:00', close: '22:00', closed: false },
    },
    microsite: {
      heroImage: 'https://placehold.co/1200x600.png',
      heroHint: 'pizza oven',
      tagline: 'Authentic Italian Pizza in Downtown Chicago',
    },
    socialLinks: {
      facebook: 'https://facebook.com/pizzahouse',
      instagram: 'https://instagram.com/pizzahouse',
      website: 'https://pizzahouse.com',
    },
    seo: {
      title: 'Pizza House Downtown | Best Italian Pizza in Chicago',
      description: 'Authentic wood-fired Italian pizza in downtown Chicago. Fresh ingredients, traditional recipes.',
      keywords: 'pizza, Italian food, Chicago, downtown, wood-fired pizza',
    },
  },
];

export function useStores() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create a new store
  const createStore = useCallback(async (storeData: CreateStoreInput): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      if (!storeData.brandId?.trim()) {
        throw new Error('Brand selection is required');
      }
      
      if (!storeData.storeCode?.trim()) {
        throw new Error('Store code is required');
      }
      
      if (!storeData.storeName?.trim()) {
        throw new Error('Store name is required');
      }
      
      if (!storeData.storeSlug?.trim()) {
        throw new Error('Store slug is required');
      }
      
      if (!storeData.address?.line1?.trim()) {
        throw new Error('Address line 1 is required');
      }
      
      if (!storeData.address?.city?.trim()) {
        throw new Error('City is required');
      }
      
      if (!storeData.address?.state?.trim()) {
        throw new Error('State is required');
      }
      
      if (!storeData.address?.postalCode?.trim()) {
        throw new Error('Postal code is required');
      }
      
      if (!storeData.address?.country?.trim()) {
        throw new Error('Country is required');
      }
      
      if (!storeData.address?.latitude?.trim()) {
        throw new Error('Latitude is required');
      }
      
      if (!storeData.address?.longitude?.trim()) {
        throw new Error('Longitude is required');
      }
      
      if (!storeData.primaryCategory?.trim()) {
        throw new Error('Primary category is required');
      }
      
      if (!storeData.seo?.title?.trim()) {
        throw new Error('SEO title is required');
      }
      
      if (!storeData.seo?.description?.trim()) {
        throw new Error('SEO description is required');
      }
      
      if (!storeData.seo?.keywords?.trim()) {
        throw new Error('SEO keywords are required');
      }

      const response = await authFetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        // Handle specific API errors
        if (result.error?.includes('store code already exists')) {
          throw new Error('A store with this code already exists. Please choose a different code.');
        } else if (result.error?.includes('store slug already exists')) {
          throw new Error('A store with this slug already exists. Please choose a different slug.');
        } else if (result.error?.includes('brand not found')) {
          throw new Error('Selected brand not found. Please refresh and try again.');
        } else if (result.error?.includes('validation failed')) {
          throw new Error('Please check your input and ensure all required fields are filled correctly.');
        } else {
          throw new Error(result.error || 'Failed to create store');
        }
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store created successfully',
      });
      
      return result.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create store';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get all stores
  const getStores = useCallback(async (brandId?: string): Promise<StoreData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = brandId ? `/api/stores?brandId=${brandId}` : '/api/stores';
      const response = await authFetch(url);
      
      const result: ApiResponse<StoreData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stores');
      }
      
      return result.data || [];
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      if (brandId) {
        return mockStores.filter(store => store.brandId === brandId);
      }
      return mockStores;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific store
  const getStore = useCallback(async (storeId: string): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/stores/${storeId}`);
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch store');
      }
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      const mockStore = mockStores.find(store => store.id === storeId);
      return mockStore || null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a store
  const updateStore = useCallback(async (storeId: string, updates: UpdateStoreInput): Promise<StoreData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result: ApiResponse<StoreData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update store');
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store updated successfully',
      });
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, updating mock data:', err);
      // Fallback to updating mock data if API fails
      const storeIndex = mockStores.findIndex(store => store.id === storeId);
      if (storeIndex !== -1) {
        const updatedStore = { ...mockStores[storeIndex], ...updates };
        mockStores[storeIndex] = updatedStore;
        
        toast({
          title: 'Success',
          description: 'Store updated successfully (mock mode)',
        });
        
        return updatedStore;
      }
      throw new Error('Store not found');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a store
  const deleteStore = useCallback(async (storeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to delete store: ${storeId}`);
      
      const response = await authFetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });
      
      console.log(`Delete response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete response error:', errorText);
        
        if (response.status === 404) {
          throw new Error('Store not found. It may have already been deleted.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to delete this store.');
        } else if (response.status === 409) {
          throw new Error('Cannot delete store. It may have associated data.');
        } else {
          throw new Error(`Delete failed with status ${response.status}: ${errorText}`);
        }
      }
      
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.warn('Could not parse delete response as JSON:', parseError);
        // If response is not JSON, assume success for DELETE operations
        result = { success: true, message: 'Store deleted successfully' };
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete store');
      }
      
      toast({
        title: 'Success',
        description: result.message || 'Store deleted successfully',
      });
      
      return true;
    } catch (err) {
      console.error('Delete store error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete store';
      setError(errorMessage);
      
      // Don't show toast here as it's handled by the calling component
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Validate store code and slug uniqueness
  const validateStoreData = useCallback(async (storeCode?: string, storeSlug?: string, excludeId?: string): Promise<{ storeCode?: boolean; storeSlug?: boolean }> => {
    try {
      const response = await authFetch('/api/stores/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeCode, storeSlug, excludeId }),
      });
      
      const result: ApiResponse<{ storeCode?: boolean; storeSlug?: boolean }> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to validate store data');
      }
      
      return result.data || {};
    } catch (err) {
      console.warn('API failed, using mock validation:', err);
      // Fallback to mock validation if API fails
      const storeCodeExists = mockStores.some(store => 
        store.storeCode === storeCode && store.id !== excludeId
      );
      const storeSlugExists = mockStores.some(store => 
        store.storeSlug === storeSlug && store.id !== excludeId
      );
      
      return {
        storeCode: !storeCodeExists,
        storeSlug: !storeSlugExists,
      };
    }
  }, []);

  return {
    loading,
    error,
    createStore,
    getStores,
    getStore,
    updateStore,
    deleteStore,
    validateStoreData,
  };
} 