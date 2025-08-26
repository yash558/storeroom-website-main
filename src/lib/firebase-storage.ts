import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export interface ImageFile {
  file: File;
  preview?: string;
  name: string;
  size: number;
}

/**
 * Upload a single image to Firebase Storage
 */
export async function uploadImage(
  file: File, 
  folder: string = 'images',
  customName?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    const fileName = customName || `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Add metadata for better CORS handling
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000', // 1 year cache
    };
    
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('storage/unauthorized')) {
        throw new Error('Upload failed: Unauthorized access. Please check your Firebase configuration.');
      } else if (error.message.includes('storage/quota-exceeded')) {
        throw new Error('Upload failed: Storage quota exceeded. Please contact support.');
      } else if (error.message.includes('storage/network-request-failed')) {
        throw new Error('Upload failed: Network error. Please check your internet connection and try again.');
      } else if (error.message.includes('storage/canceled')) {
        throw new Error('Upload was canceled.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Upload multiple images to Firebase Storage
 */
export async function uploadMultipleImages(
  files: File[], 
  folder: string = 'images'
): Promise<UploadResult[]> {
  try {
    // Validate all files first
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} must be an image`);
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} must be less than 5MB`);
      }
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error; // Re-throw the specific error
  }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('storage/object-not-found')) {
        throw new Error('Image not found. It may have already been deleted.');
      } else if (error.message.includes('storage/unauthorized')) {
        throw new Error('Delete failed: Unauthorized access.');
      } else {
        throw new Error(`Delete failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to delete image');
  }
}

/**
 * Get download URL for an image
 */
export async function getImageURL(imagePath: string): Promise<string> {
  try {
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error getting image URL:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('storage/object-not-found')) {
        throw new Error('Image not found. It may have been deleted or moved.');
      } else if (error.message.includes('storage/unauthorized')) {
        throw new Error('Access denied. You may not have permission to view this image.');
      } else {
        throw new Error(`Failed to get image URL: ${error.message}`);
      }
    }
    
    throw new Error('Failed to get image URL');
  }
}

/**
 * List all images in a folder
 */
export async function listImages(folder: string = 'images'): Promise<string[]> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const urls = await Promise.all(
      result.items.map(itemRef => getDownloadURL(itemRef))
    );
    
    return urls;
  } catch (error) {
    console.error('Error listing images:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('storage/unauthorized')) {
        throw new Error('Access denied. You may not have permission to list images in this folder.');
      } else {
        throw new Error(`Failed to list images: ${error.message}`);
      }
    }
    
    throw new Error('Failed to list images');
  }
}

/**
 * Generate a preview URL for an image file
 */
export function generatePreviewURL(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'File type not supported. Please use JPG, PNG, GIF, or WebP.' };
  }

  return { isValid: true };
}


