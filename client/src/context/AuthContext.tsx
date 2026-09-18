import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'BROKER' | 'AGENT' | 'ADMIN';
  userType: 'OWNER' | 'BROKER' | 'AGENT';
  verificationStatus: 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  avatar?: string | null;
  companyName?: string | null;
  licenseNumber?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isBrokerOrAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('bb_auth_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('bb_user', JSON.stringify(res.data.user));
      }
    } catch {
      setUser(null);
      localStorage.removeItem('bb_auth_token');
      localStorage.removeItem('bb_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem('bb_auth_token', res.data.token);
      localStorage.setItem('bb_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success && res.data.token) {
      localStorage.setItem('bb_auth_token', res.data.token);
      localStorage.setItem('bb_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('bb_auth_token');
    localStorage.removeItem('bb_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isBrokerOrAgent = user?.role === 'BROKER' || user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isBrokerOrAgent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
