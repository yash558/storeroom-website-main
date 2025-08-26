import { useState, useCallback } from 'react';
import type { BrandData } from '@/lib/validation';
import { CreateBrandInput, UpdateBrandInput } from '@/lib/validation';
import { authFetch } from '@/lib/auth-client';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
  count?: number;
}

// Mock data for development/testing
const mockBrands: BrandData[] = [
  {
    _id: 'mock-brand-1' as any,
    brandName: "Haldiram's",
    brandSlug: "haldirams",
    description: "Traditional Indian sweets and snacks",
    logo: "https://placehold.co/100x100.png",
    website: "https://haldirams.com",
    email: "info@haldirams.com",
    phone: "+91-11-23456789",
    industry: "Food & Beverage",
    primaryCategory: "Restaurant",
    additionalCategories: ["Sweet Shop", "Snacks"],
    address: {
      line1: "123 Main Street",
      line2: "Ground Floor",
      locality: "Connaught Place",
      city: "New Delhi",
      state: "Delhi",
      postalCode: "110001",
      country: "India",
      latitude: "28.6139",
      longitude: "77.2090",
    },
    branding: {
      primaryColor: "#FF6B35",
      accentColor: "#FFD23F",
      backgroundColor: "#FFF8E1",
      fontFamily: "Inter",
      template: "classic",
    },
    content: {
      aboutSection: "Haldiram's is a renowned name in traditional Indian sweets and snacks. Founded in 1937, we have been serving authentic flavors for generations.",
      missionStatement: "To preserve and promote traditional Indian culinary heritage",
      valueProposition: "Authentic taste, quality ingredients, and traditional recipes",
    },
    products: [
      {
        name: "Gulab Jamun",
        category: "Sweets",
        price: "$5.99",
        image: "https://placehold.co/100x100.png",
        description: "Traditional Indian sweet made with milk solids",
      },
      {
        name: "Samosa",
        category: "Snacks",
        price: "$3.99",
        image: "https://placehold.co/100x100.png",
        description: "Crispy pastry filled with spiced potatoes and peas",
      },
      {
        name: "Rasgulla",
        category: "Sweets",
        price: "$4.99",
        image: "https://placehold.co/100x100.png",
        description: "Soft cottage cheese balls in sugar syrup",
      },
    ],
    gallery: [
      {
        src: "https://placehold.co/400x300.png",
        alt: "Store front",
        caption: "Our flagship store in Connaught Place",
      },
      {
        src: "https://placehold.co/400x300.png",
        alt: "Sweet display",
        caption: "Fresh sweets prepared daily",
      },
      {
        src: "https://placehold.co/400x300.png",
        alt: "Traditional sweets",
        caption: "Authentic recipes passed down through generations",
      },
    ],
    socialLinks: {
      facebook: "https://facebook.com/haldirams",
      twitter: "https://twitter.com/haldirams",
      instagram: "https://instagram.com/haldirams",
    },
    seo: {
      title: "Haldiram's - Traditional Indian Sweets & Snacks",
      description: "Authentic Indian sweets and snacks since 1937. Visit our stores for traditional flavors and quality ingredients.",
      keywords: "Indian sweets, traditional snacks, gulab jamun, samosa, rasgulla",
    },
    googleBusiness: {
      isConnected: true,
      accountId: "mock-gmb-account",
      locationId: "mock-gmb-location",
      lastSync: new Date(),
    },
    settings: {
      autoSyncWithGMB: true,
      reviewNotifications: true,
      postNotifications: true,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    status: 'active',
  },
  {
    _id: 'mock-brand-2',
    brandName: "Pizza House",
    brandSlug: "pizza-house",
    description: "Artisanal pizza and Italian cuisine",
    logo: "https://placehold.co/100x100.png",
    website: "https://pizzahouse.com",
    email: "hello@pizzahouse.com",
    phone: "+1-555-123-4567",
    industry: "Food & Beverage",
    primaryCategory: "Restaurant",
    additionalCategories: ["Pizza", "Italian"],
    address: {
      line1: "456 Oak Avenue",
      line2: "Suite 100",
      locality: "Downtown",
      city: "Chicago",
      state: "Illinois",
      postalCode: "60601",
      country: "USA",
      latitude: "41.8781",
      longitude: "-87.6298",
    },
    branding: {
      primaryColor: "#D32F2F",
      accentColor: "#FFC107",
      backgroundColor: "#FFF3E0",
      fontFamily: "Inter",
      template: "modern",
    },
    content: {
      aboutSection: "Pizza House brings authentic Italian flavors to Chicago. Our wood-fired pizzas are made with fresh ingredients and traditional recipes.",
      missionStatement: "To serve the best Italian pizza experience in Chicago",
      valueProposition: "Fresh ingredients, wood-fired cooking, authentic taste",
    },
    products: [
      {
        name: "Margherita Pizza",
        category: "Pizza",
        price: "$18.99",
        image: "https://placehold.co/100x100.png",
        description: "Classic tomato sauce, mozzarella, and basil",
      },
      {
        name: "Pepperoni Pizza",
        category: "Pizza",
        price: "$21.99",
        image: "https://placehold.co/100x100.png",
        description: "Spicy pepperoni with melted cheese",
      },
      {
        name: "Garlic Bread",
        category: "Sides",
        price: "$6.99",
        image: "https://placehold.co/100x100.png",
        description: "Fresh baked garlic bread with herbs",
      },
    ],
    gallery: [
      {
        src: "https://placehold.co/400x300.png",
        alt: "Pizza oven",
        caption: "Our wood-fired pizza oven",
      },
      {
        src: "https://placehold.co/400x300.png",
        alt: "Fresh pizza",
        caption: "Freshly baked pizzas",
      },
      {
        src: "https://placehold.co/400x300.png",
        alt: "Restaurant interior",
        caption: "Cozy dining atmosphere",
      },
    ],
    socialLinks: {
      facebook: "https://facebook.com/pizzahouse",
      instagram: "https://instagram.com/pizzahouse",
    },
    seo: {
      title: "Pizza House - Authentic Italian Pizza in Chicago",
      description: "Best wood-fired pizza in Chicago. Fresh ingredients, authentic Italian recipes, and cozy atmosphere.",
      keywords: "pizza, Italian food, Chicago pizza, wood-fired pizza, restaurant",
    },
    googleBusiness: {
      isConnected: false,
    },
    settings: {
      autoSyncWithGMB: false,
      reviewNotifications: true,
      postNotifications: false,
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    status: 'active',
  },
];

export const useBrands = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all brands
  const getBrands = useCallback(async (): Promise<BrandData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch('/api/brands');
      const result: ApiResponse<BrandData[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch brands');
      }
      
      setBrands(result.data || []);
      return result.data || [];
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      setBrands(mockBrands);
      return mockBrands;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific brand
  const getBrand = useCallback(async (brandId: string): Promise<BrandData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/brands/${brandId}`);
      const result: ApiResponse<BrandData> = await response.json();
      
      if (!result.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(result.error || 'Failed to fetch brand');
      }
      
      return result.data || null;
    } catch (err) {
      console.warn('API failed, using mock data:', err);
      // Fallback to mock data if API fails
      const mockBrand = mockBrands.find(brand => brand._id === brandId);
      return mockBrand || null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new brand
  const createBrand = useCallback(async (brandData: CreateBrandInput): Promise<BrandData> => {
    setLoading(true);
    setError(null);
    
    try {
      // Client-side validation
      if (!brandData.brandName?.trim()) {
        throw new Error('Brand name is required');
      }
      
      if (!brandData.brandSlug?.trim()) {
        throw new Error('Brand slug is required');
      }
      
      if (!brandData.email?.trim()) {
        throw new Error('Email is required');
      }
      
      if (!brandData.industry?.trim()) {
        throw new Error('Industry is required');
      }
      
      if (!brandData.primaryCategory?.trim()) {
        throw new Error('Primary category is required');
      }
      
      if (!brandData.address?.line1?.trim()) {
        throw new Error('Address line 1 is required');
      }
      
      if (!brandData.address?.city?.trim()) {
        throw new Error('City is required');
      }
      
      if (!brandData.address?.state?.trim()) {
        throw new Error('State is required');
      }
      
      if (!brandData.address?.postalCode?.trim()) {
        throw new Error('Postal code is required');
      }
      
      if (!brandData.address?.country?.trim()) {
        throw new Error('Country is required');
      }
      
      if (!brandData.address?.latitude?.trim()) {
        throw new Error('Latitude is required');
      }
      
      if (!brandData.address?.longitude?.trim()) {
        throw new Error('Longitude is required');
      }

      const response = await authFetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      });
      
      const result: ApiResponse<BrandData> = await response.json();
      
      if (!result.success) {
        // Handle specific API errors
        if (result.error?.includes('brand slug already exists')) {
          throw new Error('A brand with this slug already exists. Please choose a different slug.');
        } else if (result.error?.includes('validation failed')) {
          throw new Error('Please check your input and ensure all required fields are filled correctly.');
        } else {
          throw new Error(result.error || 'Failed to create brand');
        }
      }
      
      // Add the new brand to the list
      setBrands(prev => [...prev, result.data!]);
      
      return result.data!;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create brand';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a brand
  const updateBrand = useCallback(async (brandId: string, updates: UpdateBrandInput): Promise<BrandData> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Updating brand ${brandId} with:`, updates);
      
      // Client-side validation for updates
      if (updates.brandName !== undefined && !updates.brandName.trim()) {
        throw new Error('Brand name cannot be empty');
      }
      
      if (updates.brandSlug !== undefined && !updates.brandSlug.trim()) {
        throw new Error('Brand slug cannot be empty');
      }
      
      if (updates.email !== undefined && updates.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await authFetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      console.log(`Update response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update response error:', errorText);
        
        if (response.status === 404) {
          throw new Error('Brand not found. Please refresh and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to update this brand.');
        } else if (response.status === 409) {
          throw new Error('A brand with this slug already exists. Please choose a different slug.');
        } else {
          throw new Error(`Update failed with status ${response.status}: ${errorText}`);
        }
      }
      
      const result: ApiResponse<BrandData> = await response.json();
      
      if (!result.success) {
        // Handle specific API errors
        if (result.error?.includes('brand not found')) {
          throw new Error('Brand not found. Please refresh and try again.');
        } else if (result.error?.includes('brand slug already exists')) {
          throw new Error('A brand with this slug already exists. Please choose a different slug.');
        } else if (result.error?.includes('validation failed')) {
          throw new Error('Please check your input and ensure all required fields are filled correctly.');
        } else {
          throw new Error(result.error || 'Failed to update brand');
        }
      }
      
      console.log('Brand update successful:', result.data);
      
      // Update the brand in the list
      setBrands(prev => prev.map(brand => 
        (brand as any).id === brandId || (brand as any)._id === brandId 
          ? result.data! 
          : brand
      ));
      
      return result.data!;
    } catch (err) {
      console.error('Update brand error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a brand
  const deleteBrand = useCallback(async (brandId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        // Handle specific API errors
        if (result.error?.includes('brand not found')) {
          throw new Error('Brand not found. It may have already been deleted.');
        } else if (result.error?.includes('has stores')) {
          throw new Error('Cannot delete brand. Please remove all associated stores first.');
        } else {
          throw new Error(result.error || 'Failed to delete brand');
        }
      }
      
      // Remove the brand from the list
      setBrands(prev => prev.filter(brand => 
        (brand as any).id !== brandId && (brand as any)._id !== brandId
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete brand';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect brand to Google My Business
  const connectToGoogleBusiness = useCallback(async (brandId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleBusiness: {
            isConnected: true
          }
        }),
      });
      
      const result: ApiResponse<BrandData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect to Google My Business');
      }
      
      // Update the brand in the list
      setBrands(prev => prev.map(brand => 
        brand._id === brandId ? result.data! : brand
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Google My Business';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect brand from Google My Business
  const disconnectFromGoogleBusiness = useCallback(async (brandId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleBusiness: {
            isConnected: false
          }
        }),
      });
      
      const result: ApiResponse<BrandData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect from Google My Business');
      }
      
      // Update the brand in the list
      setBrands(prev => prev.map(brand => 
        brand._id === brandId ? result.data! : brand
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from Google My Business';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync brand with Google My Business
  const syncWithGoogleBusiness = useCallback(async (brandId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch(`/api/brands/${brandId}/sync-gmb`, {
        method: 'POST',
      });
      
      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sync with Google My Business');
      }
      
      // Refresh the brands list to get updated sync status
      await getBrands();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with Google My Business';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getBrands]);

  return {
    brands,
    loading,
    error,
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    connectToGoogleBusiness,
    disconnectFromGoogleBusiness,
    syncWithGoogleBusiness,
  };
}; 