/**
 * Auth Service — handles login, register, profile management
 */

import { apiRequest, apiUpload, setToken, removeToken, APIError } from './api-client';

export interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    role: string;
    avatar_url?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export const authService = {
    async register(data: { email: string; password: string; full_name?: string }): Promise<User> {
        return apiRequest<User>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
            skipAuth: true,
        });
    },

    async login(data: { email: string; password: string }): Promise<AuthResponse> {
        const result = await apiRequest<AuthResponse>('/auth/token', {
            method: 'POST',
            body: JSON.stringify({ email: data.email, password: data.password }),
            skipAuth: true,
        });
        await setToken(result.access_token);
        return result;
    },

    async googleLogin(token: string): Promise<AuthResponse> {
        const result = await apiRequest<AuthResponse>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token }),
            skipAuth: true,
        });
        await setToken(result.access_token);
        return result;
    },

    async me(): Promise<User> {
        return apiRequest<User>('/auth/me');
    },

    async forgotPassword(email: string): Promise<void> {
        await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
            skipAuth: true,
        });
    },

    async updateProfile(data: { full_name?: string; avatar_url?: string }): Promise<User> {
        return apiRequest<User>('/auth/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async uploadProfileImage(uri: string): Promise<User> {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri,
            name: filename,
            type,
        } as any);

        const response = await apiUpload('/auth/users/profile-image', formData);
        return response.json();
    },

    async updatePassword(data: { old_password: string; new_password: string }): Promise<void> {
        await apiRequest('/auth/users/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async logout(): Promise<void> {
        await removeToken();
    },
};
