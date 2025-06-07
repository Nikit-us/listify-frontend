
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtResponseDto, UserProfileDto } from '@/types/api';
import { getUserProfile } from '@/lib/mockApi';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfileDto | null;
  token: string | null;
  isLoading: boolean;
  login: (authResponse: JwtResponseDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (userId: number, authToken: string) => {
    try {
      // In a real app, you'd pass the token to getUserProfile or it would be handled by an interceptor
      const profile = await getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Potentially logout if profile fetch fails due to auth error
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const storedUserMeta = typeof window !== 'undefined' ? localStorage.getItem('authUserMeta') : null;
    
    if (storedToken && storedUserMeta) {
      const parsedUserMeta: { userId: number; email: string } = JSON.parse(storedUserMeta);
      setToken(storedToken);
      // Fetch full profile using stored user ID
      fetchUserProfile(parsedUserMeta.userId, storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (authResponse: JwtResponseDto) => {
    setIsLoading(true);
    setToken(authResponse.token);
    const userMeta = { userId: authResponse.userId, email: authResponse.email };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', authResponse.token);
      localStorage.setItem('authUserMeta', JSON.stringify(userMeta));
    }
    await fetchUserProfile(authResponse.userId, authResponse.token);
    setIsLoading(false);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUserMeta');
      localStorage.removeItem('authUser'); // old key, ensure removal
    }
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token && !!user, user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
