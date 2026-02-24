import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, User } from '../services/auth-service';
import { getToken, removeToken } from '../services/api-client';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Ensure the auth session closes correctly on web
WebBrowser.maybeCompleteAuthSession();

// Prefer Expo-style public env var, but keep NEXT_PUBLIC_* fallback for
// existing local setups.
const GOOGLE_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '8832500585-r2p759jqaka789gr0v2l3dnahs2rpc8c.apps.googleusercontent.com';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    googleLogin?: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Setup expo-auth-session Google Provider
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CLIENT_ID,
        iosClientId: GOOGLE_CLIENT_ID, // Add iOS/Android specific IDs later if needed
        androidClientId: GOOGLE_CLIENT_ID,
    });

    // Handle Google Auth Response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                // We successfully got the Google token, now pass it to our backend
                (async () => {
                    try {
                        setLoading(true);
                        const { access_token } = await authService.googleLogin(authentication.accessToken);
                        setTokenState(access_token);
                        const userData = await authService.me();
                        setUser(userData);
                    } catch (error) {
                        console.error("Backend Google Login Failed", error);
                    } finally {
                        setLoading(false);
                    }
                })();
            }
        }
    }, [response]);

    // Bootstrap: load stored token and validate
    useEffect(() => {
        (async () => {
            try {
                const storedToken = await getToken();
                if (storedToken) {
                    setTokenState(storedToken);
                    const userData = await authService.me();
                    setUser(userData);
                }
            } catch {
                await removeToken();
                setTokenState(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const { access_token } = await authService.login({ email: normalizedEmail, password });
        setTokenState(access_token);
        const userData = await authService.me();
        setUser(userData);
    }, []);

    const register = useCallback(
        async (email: string, password: string, fullName?: string) => {
            const normalizedEmail = email.trim().toLowerCase();
            await authService.register({ email: normalizedEmail, password, full_name: fullName });
        },
        [],
    );

    const googleLogin = useCallback(async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error("Google Auth Prompt Error", error);
            throw new Error("Failed to initialize Google Authentication.");
        }
    }, [promptAsync]);

    const logout = useCallback(async () => {
        await authService.logout();
        setTokenState(null);
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const userData = await authService.me();
            setUser(userData);
        } catch { }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, googleLogin, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
