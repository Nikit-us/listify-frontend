
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtResponseDto, UserProfileDto } from '@/types/api';
import { getCurrentUserProfile } from '@/lib/mockApi';

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

  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const newProfile = await getCurrentUserProfile(authToken);
      setUser(prevUser => {
        // Shallow compare to prevent unnecessary reference change if data is identical
        if (prevUser && newProfile &&
            prevUser.id === newProfile.id &&
            prevUser.email === newProfile.email &&
            prevUser.fullName === newProfile.fullName &&
            prevUser.avatarUrl === newProfile.avatarUrl &&
            prevUser.cityId === newProfile.cityId &&
            prevUser.cityName === newProfile.cityName &&
            prevUser.phoneNumber === newProfile.phoneNumber &&
            prevUser.registeredAt === newProfile.registeredAt &&
            prevUser.totalActiveAdvertisements === newProfile.totalActiveAdvertisements
        ) {
          return prevUser;
        }
        return newProfile; // This can be newProfile object or null
      });

      if (!newProfile) { // If profile fetch failed or returned null (e.g. token invalid)
        setToken(null);
        setUser(null); // Ensure user is also null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = async (authResponse: JwtResponseDto) => {
    setIsLoading(true);
    setToken(authResponse.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', authResponse.token);
    }
    await fetchProfile(authResponse.token);
    setIsLoading(false);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
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

