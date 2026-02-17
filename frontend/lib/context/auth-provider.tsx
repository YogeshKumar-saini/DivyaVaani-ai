"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, authService, LoginData, RegisterData } from '../api/auth-service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
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

  const login = async (data: LoginData) => {
    const { access_token } = await authService.login(data);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const userData = await authService.me(access_token);
    setUser(userData);
    router.push('/');
  };

  const googleLogin = async (googleToken: string) => {
    const { access_token } = await authService.googleLogin(googleToken);
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const userData = await authService.me(access_token);
    setUser(userData);
    router.push('/');
  }

  const register = async (data: RegisterData) => {
    await authService.register(data);
    // After registration, user can login
    router.push('/');
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
