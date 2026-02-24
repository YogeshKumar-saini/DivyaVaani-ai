/**
 * API Client for DivyaVaani Mobile App
 * Handles HTTP requests with error handling, retry logic, and secure token storage
 */

import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

const TOKEN_KEY = 'divyavaani_auth_token';

// ─── Token Management ───────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        return null;
    }
}

export async function setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── Error Types ────────────────────────────────────────────────────────────

export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public details?: unknown,
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// ─── API Client ─────────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
    timeout?: number;
    skipRetry?: boolean;
    skipAuth?: boolean;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core API request function
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<T> {
    const {
        timeout = 30000,
        skipRetry = false,
        skipAuth = false,
        ...fetchOptions
    } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Attach auth token if available
    if (!skipAuth) {
        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const makeRequest = async (): Promise<T> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `Request failed with status ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }
                throw new APIError(errorMessage, response.status);
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof APIError) throw error;

            if (error instanceof Error && error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }

            throw new APIError(
                error instanceof Error ? error.message : 'Network error',
                0,
            );
        }
    };

    // Retry logic (max 2 retries for server errors)
    if (skipRetry) return makeRequest();

    let lastError: APIError | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await makeRequest();
        } catch (error) {
            if (error instanceof APIError) {
                lastError = error;
                const retryable =
                    error.statusCode === 0 ||
                    error.statusCode === 408 ||
                    error.statusCode === 429 ||
                    error.statusCode >= 500;
                if (!retryable || attempt === 2) throw error;
                await sleep(1000 * Math.pow(2, attempt));
            } else {
                throw error;
            }
        }
    }
    throw lastError || new APIError('Max retries exceeded', 0);
}

/**
 * Upload a file (e.g., profile image)
 */
export async function apiUpload(
    endpoint: string,
    formData: FormData,
): Promise<Response> {
    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        try {
            const err = await response.json();
            errorMessage = err.detail || errorMessage;
        } catch { }
        throw new APIError(errorMessage, response.status);
    }

    return response;
}

/**
 * Friendly error message for display
 */
export function handleAPIError(error: unknown): string {
    if (error instanceof APIError) {
        switch (error.statusCode) {
            case 0:
                return 'Network error. Check your connection.';
            case 401:
                return 'Session expired. Please log in again.';
            case 403:
                return 'Access denied.';
            case 404:
                return 'Not found.';
            case 408:
                return 'Request timed out. Try again.';
            case 429:
                return 'Too many requests. Wait a moment.';
            case 500:
                return 'Server error. Try again later.';
            default:
                return error.message;
        }
    }
    return error instanceof Error ? error.message : 'Something went wrong.';
}
