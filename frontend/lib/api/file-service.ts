/**
 * File Upload Service
 * Handles file uploads with progress tracking and validation
 */

import { APIError, API_BASE_URL } from './client';

export interface FileUploadRequest {
  file: File;
  language?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

export interface FileUploadResponse {
  success: boolean;
  file_id: string;
  message: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type ProgressCallback = (progress: UploadProgress) => void;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  // Documents
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

class FileService {
  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not supported`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFile(
    request: FileUploadRequest,
    onProgress?: ProgressCallback
  ): Promise<FileUploadResponse> {
    const { file, language, user_id, metadata } = request;

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new APIError(validation.error || 'Invalid file', 400);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Append file
      formData.append('file', file);

      // Append optional fields
      if (language) formData.append('language', language);
      if (user_id) formData.append('user_id', user_id);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new APIError('Invalid response from server', xhr.status));
          }
        } else {
          let errorMessage = `Upload failed with status ${xhr.status}`;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            errorMessage = xhr.statusText || errorMessage;
          }
          reject(new APIError(errorMessage, xhr.status));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new APIError('Network error during upload', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new APIError('Upload cancelled', 0));
      });

      // Send request
      // Send request
      xhr.open('POST', `${API_BASE_URL}/upload`);
      xhr.send(formData);
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: Omit<FileUploadRequest, 'file'>,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<FileUploadResponse[]> {
    const results: FileUploadResponse[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressCallback = onProgress
        ? (progress: UploadProgress) => onProgress(i, progress)
        : undefined;

      try {
        const result = await this.uploadFile(
          { ...options, file },
          progressCallback
        );
        results.push(result);
      } catch {
        console.error(`Failed to upload file ${file.name}`);
        throw new Error(`Failed to upload file ${file.name}`);
      }
    }

    return results;
  }

  /**
   * Get human-readable file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file type is supported
   */
  isFileTypeSupported(fileType: string): boolean {
    return ALLOWED_FILE_TYPES.includes(fileType);
  }

  /**
   * Get allowed file extensions
   */
  getAllowedExtensions(): string[] {
    return [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.mp3', '.wav', '.ogg', '.webm',
      '.mp4', '.webm', '.ogg',
      '.pdf', '.txt', '.doc', '.docx',
    ];
  }

  /**
   * Get max file size in MB
   */
  getMaxFileSizeMB(): number {
    return MAX_FILE_SIZE / (1024 * 1024);
  }
}

export const fileService = new FileService();
