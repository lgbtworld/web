import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../interfaces/user';
import { api } from '../services/api';
import { useSSRData } from './SSRDataContext';



interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token:string | null;
  login: (token:string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ssrData = useSSRData();
  const [token, setToken] = useState<string | null>(ssrData?.authToken || null);
  const [user, setUser] = useState<User | null>(
    ssrData?.authToken ? ((ssrData?.authUser as User) || null) : null
  );

  // Auto-login on mount if token exists in localStorage
  useEffect(() => {
    const getCookieToken = (): string | null => {
      if (typeof document === 'undefined') return null;
      const item = document.cookie
        .split(';')
        .map((v) => v.trim())
        .find((v) => v.startsWith('authToken='));
      return item ? decodeURIComponent(item.split('=')[1] || '') : null;
    };

    const autoLogin = async () => {
      try {
        const savedToken = localStorage.getItem("authToken") || getCookieToken() || ssrData?.authToken || null;
        if (savedToken) {
          // Set token first
          setToken(savedToken);
          localStorage.setItem("authToken", savedToken);
          document.cookie = `authToken=${encodeURIComponent(savedToken)}; Path=/; Max-Age=31536000; SameSite=Lax`;

          if (!ssrData?.authUser) {
            // Fetch user only if SSR didn't already provide it.
            const response = await api.getUserInfo();
            if (response?.user) {
              setUser(response.user);
            } else if (response) {
              setUser(response as User);
            }
          }
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        // If token is invalid, remove it
        localStorage.removeItem("authToken");
        document.cookie = "authToken=; Path=/; Max-Age=0; SameSite=Lax";
        setToken(null);
        setUser(null)
      }
    };

    autoLogin();
  }, [ssrData?.authToken, ssrData?.authUser]);

  const login = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("authToken", token);
    document.cookie = `authToken=${encodeURIComponent(token)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    document.cookie = "authToken=; Path=/; Max-Age=0; SameSite=Lax";
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{
        user,
        isAuthenticated: !!token,
        token,
        login,
        logout,
        updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
