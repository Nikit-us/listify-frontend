
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

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }, []);

  const fetchAndSetFullProfile = useCallback(async (authToken: string) => {
    try {
      const fullProfile = await getCurrentUserProfile(authToken);
      if (fullProfile) {
        setUser(prevUser => ({
          ...(prevUser as UserProfileDto), // Keep initial data like roles
          ...fullProfile,                // Overwrite with full data
        }));
      } else {
        // This case handles an invalid token on initial load
        handleLogout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile, logging out:', error);
      handleLogout();
    }
  }, [handleLogout]);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (storedToken) {
      setToken(storedToken);
      fetchAndSetFullProfile(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchAndSetFullProfile]);

  const login = async (authResponse: JwtResponseDto) => {
    setIsLoading(true);

    // 1. Set token immediately
    const newAuthToken = authResponse.token;
    setToken(newAuthToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', newAuthToken);
    }

    // 2. Create a partial user from login response to log in instantly
    const partialUser: UserProfileDto = {
      id: authResponse.userId,
      email: authResponse.email,
      roles: authResponse.roles,
      // Fill with placeholder data, to be enriched
      fullName: '',
      avatarUrl: '',
      cityId: 0,
      cityName: '',
      phoneNumber: '',
      registeredAt: new Date().toISOString(),
      totalActiveAdvertisements: 0,
    };
    setUser(partialUser);

    // 3. Fetch full profile in the background to enrich the data
    try {
      const fullProfile = await getCurrentUserProfile(newAuthToken);
      if (fullProfile) {
        // Merge the full profile with the essential data (like roles) from the partial profile
        setUser(prevUser => ({
          ...(prevUser as UserProfileDto),
          ...fullProfile
        }));
      }
      // If this fetch fails, the user remains logged in with partial data, which is better than being logged out.
    } catch (error) {
      console.error("Could not enrich profile after login, but user is logged in.", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = useCallback(() => {
    handleLogout();
    router.push('/login');
  }, [handleLogout, router]);

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
