import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (credentials: Pick<User, 'name'> & { password?: string }) => Promise<void>;
  register: (userInfo: Pick<User, 'name'> & { password?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: Pick<User, 'name'> & { password?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.login(credentials);
      const userData = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userInfo: Pick<User, 'name'> & { password?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const data = await api.register(userInfo);
        const userData = { ...data.user, token: data.token };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    } catch (err: any) {
        setError(err.message);
        throw err;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = { user, login, register, logout, isLoading, error };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};