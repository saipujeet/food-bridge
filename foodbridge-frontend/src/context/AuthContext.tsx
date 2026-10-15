import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authService, type LoginParams, type RegisterParams } from '../services/authService';
import { storage } from '../utils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<User>;
  register: (params: RegisterParams) => Promise<{ user: User; requiresVerification: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (partialUser: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getUser<User>());
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = storage.getToken();
      if (savedToken) {
        try {
          const current = await authService.getCurrentUser();
          if (current) {
            setUser(current);
          } else {
            // Token expired or invalid
            storage.clear();
            setUser(null);
            setToken(null);
          }
        } catch {
          // If offline, trust saved user
          const savedUser = storage.getUser<User>();
          if (savedUser) setUser(savedUser);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (params: LoginParams): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(params);
      setUser(res.user);
      setToken(res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setIsLoading(true);
    try {
      const res = await authService.register(params);
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string): Promise<User> => {
    setIsLoading(true);
    try {
      const verifiedUser = await authService.verifyOtp(email, otp);
      setUser(verifiedUser);
      setToken(storage.getToken());
      return verifiedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (partialUser: Partial<User>): Promise<User> => {
    const updated = await authService.updateProfile(partialUser);
    setUser(updated);
    return updated;
  }, []);

  const refreshUser = useCallback(async () => {
    const current = await authService.getCurrentUser();
    if (current) setUser(current);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
