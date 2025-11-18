/**
 * File Service Tests
 * Tests for file upload, validation, and progress tracking
 */

import { fileService } from '@/lib/api/file-service';
import { APIError } from '@/lib/api/client';

describe('FileService', () => {
  describe('validateFile', () => {
    it('should validate file size', () => {
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });

      const result = fileService.validateFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should validate file type', () => {
      const invalidFile = new File(['content'], 'file.exe', {
        type: 'application/x-msdownload',
      });

      const result = fileService.validateFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not supported');
    });

    it('should accept valid files', () => {
      const validFile = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const result = fileService.validateFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('uploadFile', () => {
    let mockXHR: any;

    beforeEach(() => {
      mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        upload: {
          addEventListener: jest.fn(),
        },
        addEventListener: jest.fn(),
        status: 200,
        responseText: JSON.stringify({
          success: true,
          file_id: 'file_123',
          message: 'Upload successful',
        }),
      };

      (global as any).XMLHttpRequest = jest.fn(() => mockXHR);
    });

    it('should reject invalid files', async () => {
      const invalidFile = new File(['content'], 'file.exe', {
        type: 'application/x-msdownload',
      });

      await expect(
        fileService.uploadFile({ file: invalidFile })
      ).rejects.toThrow(APIError);
    });

    it('should upload valid file', async () => {
      const validFile = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadPromise = fileService.uploadFile({ file: validFile });

      // Simulate successful upload
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'load'
      )[1];
      loadHandler();

      const result = await uploadPromise;
      expect(result.success).toBe(true);
      expect(result.file_id).toBe('file_123');
    });

    it('should track upload progress', async () => {
      const validFile = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const progressCallback = jest.fn();
      const uploadPromise = fileService.uploadFile(
        { file: validFile },
        progressCallback
      );

      // Simulate progress event
      const progressHandler = mockXHR.upload.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'progress'
      )[1];
      progressHandler({ lengthComputable: true, loaded: 50, total: 100 });

      expect(progressCallback).toHaveBeenCalledWith({
        loaded: 50,
        total: 100,
        percentage: 50,
      });

      // Complete upload
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'load'
      )[1];
      loadHandler();

      await uploadPromise;
    });

    it('should handle upload errors', async () => {
      const validFile = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadPromise = fileService.uploadFile({ file: validFile });

      // Simulate error
      mockXHR.status = 500;
      mockXHR.responseText = JSON.stringify({ detail: 'Server error' });
      
      const loadHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'load'
      )[1];
      loadHandler();

      await expect(uploadPromise).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      const validFile = new File(['content'], 'image.jpg', {
        type: 'image/jpeg',
      });

      const uploadPromise = fileService.uploadFile({ file: validFile });

      // Simulate network error
      const errorHandler = mockXHR.addEventListener.mock.calls.find(
        (call: any) => call[0] === 'error'
      )[1];
      errorHandler();

      await expect(uploadPromise).rejects.toThrow('Network error');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(fileService.formatFileSize(0)).toBe('0 Bytes');
      expect(fileService.formatFileSize(1024)).toBe('1 KB');
      expect(fileService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(fileService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('isFileTypeSupported', () => {
    it('should check if file type is supported', () => {
      expect(fileService.isFileTypeSupported('image/jpeg')).toBe(true);
      expect(fileService.isFileTypeSupported('audio/mp3')).toBe(true);
      expect(fileService.isFileTypeSupported('application/pdf')).toBe(true);
      expect(fileService.isFileTypeSupported('application/x-msdownload')).toBe(false);
    });
  });

  describe('getMaxFileSizeMB', () => {
    it('should return max file size in MB', () => {
      expect(fileService.getMaxFileSizeMB()).toBe(50);
    });
  });

  describe('getAllowedExtensions', () => {
    it('should return array of allowed extensions', () => {
      const extensions = fileService.getAllowedExtensions();
      expect(extensions).toContain('.jpg');
      expect(extensions).toContain('.pdf');
      expect(extensions).toContain('.mp3');
    });
  });
});
