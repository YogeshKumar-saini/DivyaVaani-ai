import { API_BASE_URL, APIError } from './client';

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

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export const authService = {
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {
        // ignore JSON parse error
      }
      throw new APIError(errorMessage, response.status);
    }
    return response.json();
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {
        // ignore JSON parse error
      }
      throw new APIError(errorMessage, response.status);
    }
    return response.json();
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        let errorMessage = 'Google Login failed';
        try {
          const error = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
          // ignore JSON parse error
        }
        throw new APIError(errorMessage, response.status);
      }
      return response.json();
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  },

  async me(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new APIError('Failed to send reset email', response.status);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    if (!response.ok) throw new APIError('Failed to reset password', response.status);
  },

  async updateProfile(token: string, data: { full_name?: string; avatar_url?: string }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new APIError('Failed to update profile', response.status);
    return response.json();
  },

  async updatePassword(token: string, data: { old_password: string; new_password: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update password';
      try {
        const error = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch { }
      throw new APIError(errorMessage, response.status);
    }
  },
};
