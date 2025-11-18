/**
 * API Client Tests
 * Tests for retry logic, error handling, and request functionality
 */

import { apiClient, APIError, ErrorType, handleAPIError, toAppError } from '@/lib/api/client';

// Mock fetch globally
global.fetch = jest.fn();

describe('APIClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('request', () => {
    it('should make a successful request', async () => {
      const mockData = { message: 'success' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.request('/test');
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' }),
      });

      await expect(apiClient.request('/test')).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.request('/test')).rejects.toThrow(APIError);
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 35000))
      );

      const promise = apiClient.request('/test', { timeout: 1000 });
      
      jest.advanceTimersByTime(1000);
      
      await expect(promise).rejects.toThrow(APIError);
    });
  });

  describe('retry logic', () => {
    it('should retry on retryable errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ detail: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ detail: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'success' }),
        });

      const promise = apiClient.request('/test');
      
      // Fast-forward through retry delays
      await jest.runAllTimersAsync();
      
      const result = await promise;
      expect(result).toEqual({ message: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Bad request' }),
      });

      await expect(apiClient.request('/test')).rejects.toThrow(APIError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should respect skipRetry option', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ detail: 'Service unavailable' }),
      });

      await expect(apiClient.request('/test', { skipRetry: true })).rejects.toThrow(APIError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('APIError', () => {
    it('should create error with correct type for network errors', () => {
      const error = new APIError('Network error', 0);
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should create error with correct type for timeout', () => {
      const error = new APIError('Timeout', 408);
      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR);
    });

    it('should create error with correct type for validation errors', () => {
      const error = new APIError('Bad request', 400);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
    });

    it('should create error with correct type for server errors', () => {
      const error = new APIError('Server error', 500);
      expect(error.type).toBe(ErrorType.API_ERROR);
    });

    it('should convert to AppError format', () => {
      const error = new APIError('Test error', 400, 'TEST_CODE', { extra: 'data' });
      const appError = error.toAppError();
      
      expect(appError).toEqual({
        type: ErrorType.VALIDATION_ERROR,
        message: 'Test error',
        code: 'TEST_CODE',
        statusCode: 400,
        details: { extra: 'data' },
      });
    });
  });

  describe('handleAPIError', () => {
    it('should return user-friendly message for 400', () => {
      const error = new APIError('Bad request', 400);
      expect(handleAPIError(error)).toContain('Invalid request');
    });

    it('should return user-friendly message for 429', () => {
      const error = new APIError('Too many requests', 429);
      expect(handleAPIError(error)).toContain('Too many requests');
    });

    it('should return user-friendly message for 500', () => {
      const error = new APIError('Server error', 500);
      expect(handleAPIError(error)).toContain('Server error');
    });

    it('should return user-friendly message for network errors', () => {
      const error = new APIError('Network error', 0);
      expect(handleAPIError(error)).toContain('Network error');
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      expect(handleAPIError(error)).toBe('Generic error');
    });

    it('should handle unknown errors', () => {
      expect(handleAPIError('string error')).toBe('An unexpected error occurred');
    });
  });

  describe('toAppError', () => {
    it('should convert APIError to AppError', () => {
      const error = new APIError('Test', 400);
      const appError = toAppError(error);
      
      expect(appError.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(appError.message).toBe('Test');
    });

    it('should convert generic Error to AppError', () => {
      const error = new Error('Generic');
      const appError = toAppError(error);
      
      expect(appError.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(appError.message).toBe('Generic');
    });

    it('should handle unknown error types', () => {
      const appError = toAppError('unknown');
      
      expect(appError.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(appError.message).toBe('An unexpected error occurred');
    });
  });
});
