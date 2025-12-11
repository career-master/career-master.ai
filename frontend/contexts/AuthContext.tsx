'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, User } from '@/lib/api';
import { authUtils, AuthTokens } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, name: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();

    // Set up periodic token refresh (check every 5 minutes)
    let isRefreshing = false;
    const refreshInterval = setInterval(async () => {
      // Prevent concurrent refresh attempts
      if (isRefreshing) return;
      
      const token = authUtils.getAccessToken();
      const refreshToken = authUtils.getRefreshToken();
      
      // If token is expired or will expire in the next 2 minutes, refresh it
      if (token && refreshToken) {
        const expiry = localStorage.getItem('tokenExpiry');
        if (expiry) {
          const timeUntilExpiry = parseInt(expiry) - Date.now();
          // Refresh if expired or will expire in next 2 minutes
          if (timeUntilExpiry < 2 * 60 * 1000) {
            isRefreshing = true;
            try {
              const response = await apiService.refreshToken(refreshToken);
              if (response.success && response.data?.tokens) {
                authUtils.saveTokens(response.data.tokens);
              }
            } catch (error: any) {
              // Handle 409 Conflict (token already used) or other errors gracefully
              if (error?.statusCode === 409 || error?.message?.includes('Conflict')) {
                // Token was already refreshed, try to get the new token from storage
                const newToken = authUtils.getAccessToken();
                if (!newToken || authUtils.isTokenExpired()) {
                  // If no valid token, clear auth
                  authUtils.clearAuth();
                  setUser(null);
                }
              } else {
                // Other errors - clear auth
                authUtils.clearAuth();
                setUser(null);
              }
            } finally {
              isRefreshing = false;
            }
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = authUtils.getUser();
      const token = authUtils.getAccessToken();
      const refreshToken = authUtils.getRefreshToken();

      // If we have a refresh token but access token is expired, try to refresh
      if (refreshToken && authUtils.isTokenExpired() && token) {
        try {
          const response = await apiService.refreshToken(refreshToken);
          if (response.success && response.data?.tokens) {
            authUtils.saveTokens(response.data.tokens);
            // Continue with initialization
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          // Refresh failed, clear auth
          authUtils.clearAuth();
          setUser(null);
          setLoading(false);
          return;
        }
      }

      const currentToken = authUtils.getAccessToken();
      if (currentToken && !authUtils.isTokenExpired() && savedUser) {
        setUser(savedUser);
        // Optionally refresh user data from server
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            authUtils.saveUser(response.data.user);
          }
        } catch (error) {
          // If token is invalid, try to refresh once more
          if (refreshToken) {
            try {
              const refreshResponse = await apiService.refreshToken(refreshToken);
              if (refreshResponse.success && refreshResponse.data?.tokens) {
                authUtils.saveTokens(refreshResponse.data.tokens);
                // Retry getting user
                const retryResponse = await apiService.getCurrentUser();
                if (retryResponse.success && retryResponse.data?.user) {
                  setUser(retryResponse.data.user);
                  authUtils.saveUser(retryResponse.data.user);
                }
              }
            } catch (refreshError) {
              authUtils.clearAuth();
              setUser(null);
            }
          } else {
            authUtils.clearAuth();
            setUser(null);
          }
        }
      } else if (!currentToken || authUtils.isTokenExpired()) {
        authUtils.clearAuth();
        setUser(null);
      }
    } catch (error) {
      authUtils.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        authUtils.saveTokens(tokens);
        authUtils.saveUser(user);
        setUser(user);
        router.push('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string) => {
    try {
      const response = await apiService.signup(email);
      if (!response.success) {
        throw new Error(response.error?.message || 'Signup failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    name: string,
    password: string,
    phone?: string
  ) => {
    try {
      const response = await apiService.verifyOtp(email, otp, name, password, phone);
      if (response.success && response.user) {
        // After account creation, automatically log in
        await login(email, password);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authUtils.getRefreshToken();
      if (refreshToken) {
        try {
          await apiService.logout(refreshToken);
        } catch (error) {
          // Continue with logout even if API call fails
        }
      }
      authUtils.clearAuth();
      setUser(null);
      router.push('/login');
    } catch (error) {
      // Clear auth even if logout fails
      authUtils.clearAuth();
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        authUtils.saveUser(response.data.user);
      }
    } catch (error) {
      // If refresh fails, user might be logged out
      authUtils.clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

