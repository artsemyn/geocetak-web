// src/services/lkpdFileService.ts
import { supabase } from './supabase';

export interface FileUploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export class LKPDFileService {
  private static BUCKET_NAME = 'lkpd-files';

  /**
   * Upload a file to Supabase Storage
   * @param projectId - The LKPD project ID
   * @param stage - Stage number (1-6)
   * @param file - File to upload
   * @param fileType - Type of file (sketch, stl, result_photo)
   * @returns Upload result with public URL
   */
  static async uploadFile(
    projectId: string,
    stage: number,
    file: File,
    fileType: 'sketch' | 'stl' | 'result_photo' | 'other'
  ): Promise<FileUploadResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileType}_${timestamp}.${fileExt}`;

      // Create file path: {student_id}/{project_id}/stage{N}/{filename}
      const filePath = `${user.id}/${projectId}/stage${stage}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        path: filePath,
        name: file.name,
        size: file.size
      };

    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload multiple images (for Stage 2 sketches or Stage 5 photos)
   * @param projectId - The LKPD project ID
   * @param stage - Stage number
   * @param files - Array of image files
   * @param fileType - Type of images
   * @returns Array of upload results
   */
  static async uploadImages(
    projectId: string,
    stage: number,
    files: File[],
    fileType: 'sketch' | 'result_photo'
  ): Promise<FileUploadResult[]> {
    try {
      const uploadPromises = files.map(file =>
        this.uploadFile(projectId, stage, file, fileType)
      );

      const results = await Promise.all(uploadPromises);
      return results;

    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  /**
   * Upload STL file (for Stage 4)
   * @param projectId - The LKPD project ID
   * @param file - STL file
   * @returns Upload result
   */
  static async uploadSTL(
    projectId: string,
    file: File
  ): Promise<FileUploadResult> {
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.stl')) {
      throw new Error('File must be an STL file');
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    return this.uploadFile(projectId, 4, file, 'stl');
  }

  /**
   * Delete a file from Supabase Storage
   * @param filePath - Path to file in storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   * @param filePaths - Array of file paths to delete
   */
  static async deleteFiles(filePaths: string[]): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filePaths);

      if (error) {
        throw error;
      }

    } catch (error: any) {
      console.error('Error deleting files:', error);
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  /**
   * Convert base64 to File object (helper for migration from localStorage)
   * @param base64String - Base64 encoded string
   * @param fileName - File name
   * @returns File object
   */
  static base64ToFile(base64String: string, fileName: string): File {
    // Extract content type and data
    const arr = base64String.split(',');
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const bstr = atob(arr[1] || '');
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  }

  /**
   * Get file size in human-readable format
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Validate image file
   * @param file - File to validate
   * @param maxSizeMB - Maximum size in MB
   * @returns Validation result
   */
  static validateImageFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image (JPG, PNG, etc.)' };
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }
}

export default LKPDFileService;
