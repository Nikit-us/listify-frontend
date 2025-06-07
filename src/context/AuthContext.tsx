
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { JwtResponseDto, UserProfileDto } from '@/types/api';
import { getCurrentUserProfile } from '@/lib/mockApi'; // Changed to getCurrentUserProfile

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

  const fetchProfile = useCallback(async (authToken: string) => { // Renamed for clarity
    try {
      const profile = await getCurrentUserProfile(authToken); // Use getCurrentUserProfile
      setUser(profile);
      if (!profile) { // If profile is null (e.g. token invalid, user deleted)
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUserMeta'); // Keep this for consistency if needed elsewhere, though API spec implies JWT is king
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUserMeta');
      }
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    // const storedUserMeta = typeof window !== 'undefined' ? localStorage.getItem('authUserMeta') : null; // User meta might be stale, prefer fetching profile with token
    
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
    // Store only token. User meta (userId, email) is in token and profile will be fetched.
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', authResponse.token);
      // localStorage.setItem('authUserMeta', JSON.stringify({ userId: authResponse.userId, email: authResponse.email })); // Optionally store for quick access but fetchProfile is source of truth
    }
    await fetchProfile(authResponse.token);
    setIsLoading(false);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUserMeta');
    }
    router.push('/login'); // Redirect to login page
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
