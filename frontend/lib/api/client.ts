/**
 * API Client for DivyaVaani Backend
 * Handles all HTTP requests with error handling, retry logic, and type safety
 */

// ─── How the base URL is resolved ────────────────────────────────────────────
//
// Browser  → always '/api'  (Next.js route handler proxies to backend)
//            The browser NEVER uses an absolute backend URL.
//            This prevents "mixed active content" blocks on HTTPS pages.
//
// Server   → process.env.BACKEND_URL  (server-only, no NEXT_PUBLIC_ prefix)
//            Set in Vercel dashboard → Environment Variables for production.
//            Set in frontend/.env.local for local development.
//
// ⚠️  NEVER set NEXT_PUBLIC_API_BASE_URL — Next.js inlines NEXT_PUBLIC_*
//     values into the client bundle at build time. A plain-HTTP value there
//     will cause mixed-content blocks in every browser.
// ─────────────────────────────────────────────────────────────────────────────

const _isBrowser = typeof window !== 'undefined';

/**
 * Returns the correct API base URL for the current runtime context.
 * Called once at module load time (see API_BASE_URL export below).
 */
function resolveApiBaseUrl(): string {
  if (_isBrowser) {
    // Browser: always use the relative proxy path.
    return '/api';
  }

  // Server: read the environment variable — no hardcoded server IP.
  const serverUrl = (process.env.BACKEND_URL ?? '').trim();
  if (!serverUrl) {
    console.error(
      '[client.ts] BACKEND_URL is not set. ' +
      'Add it to frontend/.env.local for local dev or ' +
      'Vercel dashboard → Environment Variables for production.'
    );
    return 'http://localhost:8000'; // safe fallback — only used server-side
  }
  return serverUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl();

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export class APIError extends Error {
  public type: ErrorType;
  public details?: unknown;

  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    this.details = details;

    // Determine error type based on status code
    if (statusCode === 0) {
      this.type = ErrorType.NETWORK_ERROR;
    } else if (statusCode === 408 || statusCode === 504) {
      this.type = ErrorType.TIMEOUT_ERROR;
    } else if (statusCode >= 400 && statusCode < 500) {
      this.type = ErrorType.VALIDATION_ERROR;
    } else if (statusCode >= 500) {
      this.type = ErrorType.API_ERROR;
    } else {
      this.type = ErrorType.UNKNOWN_ERROR;
    }
  }

  toAppError(): AppError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

class APIClient {
  private baseURL: string;
  private retryConfig: RetryConfig;
  private defaultTimeout: number = 30000; // 30 seconds

  constructor(baseURL: string, retryConfig: Partial<RetryConfig> = {}) {
    this.baseURL = baseURL;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: APIError): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.statusCode === 0 ||
      error.statusCode === 408 ||
      error.statusCode === 429 ||
      error.statusCode === 503 ||
      error.statusCode === 504 ||
      (error.statusCode >= 500 && error.statusCode < 600)
    );
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.retryConfig.maxRetries
  ): Promise<T> {
    let lastError: APIError | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof APIError) {
          lastError = error;

          // Don't retry if error is not retryable or we've exhausted retries
          if (!this.isRetryableError(error) || attempt === retries) {
            throw error;
          }

          // Wait before retrying with exponential backoff
          const delay = this.calculateDelay(attempt);
          console.log(`Request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`);
          await this.sleep(delay);
        } else {
          // Non-APIError, don't retry
          throw error;
        }
      }
    }

    throw lastError || new APIError('Max retries exceeded', 0);
  }

  /**
   * Make a JSON request to the API with timeout and retry logic
   */
  async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number; skipRetry?: boolean } = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, skipRetry = false, ...fetchOptions } = options;

    const makeRequest = async (): Promise<T> => {
      const url = `${this.baseURL}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          let errorDetails = null;

          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
            errorDetails = errorData;
          } catch {
            // If error response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }

          throw new APIError(errorMessage, response.status, undefined, errorDetails);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof APIError) {
          throw error;
        }

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }

        // Network or other errors
        throw new APIError(
          error instanceof Error ? error.message : 'Network error occurred',
          0
        );
      }
    };

    if (skipRetry) {
      return makeRequest();
    }

    return this.executeWithRetry(makeRequest);
  }

  /**
   * Upload a file to the API
   */
  async uploadFile(
    endpoint: string,
    file: File | Blob,
    additionalData?: Record<string, string>
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append('audio_file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new APIError(errorMessage, response.status);
    }

    return response;
  }
}

export const apiClient = new APIClient(API_BASE_URL);

/**
 * Handle API errors and return user-friendly messages
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'System is initializing. Please wait a moment...';
      case 504:
        return 'Gateway timeout. The server took too long to respond.';
      case 0:
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Convert error to AppError format
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof APIError) {
    return error.toAppError();
  }

  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message,
    };
  }

  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
  };
}
