"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, authService, LoginData, RegisterData } from '../api/auth-service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData, options?: { redirectTo?: string | false }) => Promise<void>;
  googleLogin: (token: string, options?: { redirectTo?: string | false }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authService.me(storedToken);
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: LoginData, options?: { redirectTo?: string | false }) => {
    const { access_token } = await authService.login(data);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const userData = await authService.me(access_token);
    setUser(userData);
    // redirectTo: false = no redirect; undefined = default '/'; string = custom path
    if (options?.redirectTo !== false) {
      router.push(options?.redirectTo ?? '/');
    }
  };

  const googleLogin = async (googleToken: string, options?: { redirectTo?: string | false }) => {
    const { access_token } = await authService.googleLogin(googleToken);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const userData = await authService.me(access_token);
    setUser(userData);
    if (options?.redirectTo !== false) {
      router.push(options?.redirectTo ?? '/');
    }
  };

  const register = async (data: RegisterData) => {
    // Just call the API – callers (register page / auth modal) handle
    // post-registration UX (success screen, tab switch, redirect to login).
    await authService.register(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
