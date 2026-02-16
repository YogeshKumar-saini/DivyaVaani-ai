import { API_BASE_URL, APIError } from './client';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  role: string;
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

  async me(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
};
