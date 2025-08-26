'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage, deleteImage, generatePreviewURL, revokePreviewURL, validateImageFile } from '@/lib/firebase-storage';
import type { UploadResult } from '@/lib/firebase-storage';

interface ImageUploadProps {
  onImagesUploaded: (images: UploadResult[]) => void;
  onImagesRemoved?: (imagePaths: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  folder?: string;
  existingImages?: string[];
  className?: string;
}

export function ImageUpload({
  onImagesUploaded,
  onImagesRemoved,
  multiple = true,
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSize = 5, // 5MB
  folder = 'images',
  existingImages = [],
  className = ''
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Clear previous errors
    setErrors({});
    
    // Validate file types
    const invalidFiles = fileArray.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      const errorMessage = `Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}. Please select only ${acceptedTypes.join(', ')} files.`;
      setErrors({ fileType: errorMessage });
      toast({
        title: "Invalid file type",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const errorMessage = `File(s) too large: ${oversizedFiles.map(f => f.name).join(', ')}. Files must be smaller than ${maxSize}MB.`;
      setErrors({ fileSize: errorMessage });
      toast({
        title: "File too large",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Check max files limit
    if (uploadedImages.length + fileArray.length > maxFiles) {
      const errorMessage = `Too many files. Maximum ${maxFiles} files allowed.`;
      setErrors({ maxFiles: errorMessage });
      toast({
        title: "Too many files",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Generate previews
      const previews = fileArray.map(file => generatePreviewURL(file));
      setPreviewImages(prev => [...prev, ...previews]);

      // Upload to Firebase with progress tracking
      const results: UploadResult[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileName = file.name;
        
        try {
          console.log(`Starting upload for ${fileName}`, { file, folder });
          
          // Validate file before upload
          const validation = validateImageFile(file);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }

          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));
          
          // Upload file
          const result = await uploadImage(file, folder);
          console.log(`Upload successful for ${fileName}:`, result);
          results.push(result);
          
          // Update progress to 100%
          setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
          
        } catch (uploadError) {
          console.error(`Failed to upload ${fileName}:`, uploadError);
          
          // Remove preview for failed upload
          const previewIndex = previews.findIndex((_, index) => index === i);
          if (previewIndex !== -1) {
            setPreviewImages(prev => prev.filter((_, index) => index !== previewIndex));
          }
          
          // Show specific error for this file
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed';
          setErrors(prev => ({ ...prev, [fileName]: errorMessage }));
          
          toast({
            title: `Upload failed: ${fileName}`,
            description: errorMessage,
            variant: "destructive",
          });
        }
      }

      // Add successful uploads to state
      if (results.length > 0) {
        setUploadedImages(prev => [...prev, ...results]);
        
        // Call the callback
        onImagesUploaded(results);
        
        toast({
          title: "Upload successful",
          description: `${results.length} image(s) uploaded successfully!`,
        });
      } else {
        toast({
          title: "Upload failed",
          description: "No images were uploaded successfully. Please check the errors above.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
      setErrors({ general: errorMessage });
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [acceptedTypes, maxSize, maxFiles, uploadedImages.length, folder, onImagesUploaded, toast]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove image
  const removeImage = async (index: number) => {
    try {
      const imageToRemove = uploadedImages[index];
      
      // Remove from Firebase Storage
      if (imageToRemove.path) {
        await deleteImage(imageToRemove.path);
      }
      
      // Remove from local state
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
      
      // Call callback
      if (onImagesRemoved) {
        onImagesRemoved([imageToRemove.path]);
      }
      
      toast({
        title: "Image removed",
        description: "Image deleted successfully",
      });
      
    } catch (error) {
      console.error('Error removing image:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove image";
      
      toast({
        title: "Remove failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors({});
  };

  // Get total upload progress
  const getTotalProgress = () => {
    const progressValues = Object.values(uploadProgress);
    if (progressValues.length === 0) return 0;
    return Math.round(progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Upload Errors</h4>
                {Object.entries(errors).map(([key, message]) => (
                  <p key={key} className="text-sm text-red-700">
                    {key === 'general' ? message : `${key}: ${message}`}
                  </p>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearErrors}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading images...</span>
                <span>{getTotalProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getTotalProgress()}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="flex justify-between">
                    <span className="truncate">{fileName}</span>
                    <span>{progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive ? 'Drop images here' : 'Upload images'}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSize}MB • Max files: {maxFiles}
            </p>
          </div>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {/* Progress indicator */}
                {uploadProgress[uploadedImages[index]?.name || ''] !== undefined && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-600 h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress[uploadedImages[index]?.name || '']}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Existing Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      // Handle existing image removal if needed
                      if (onImagesRemoved) {
                        onImagesRemoved([imageUrl]);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


