import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { User } from '../types/index.js';
import { DEMO_USERS } from '../services/demoStore.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('eduhelp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('eduhelp_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('eduhelp_token');
      if (storedToken) {
        if (storedToken.startsWith('demo-token-')) {
          const savedUser = localStorage.getItem('eduhelp_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
            return;
          }
        }

        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('eduhelp_user', JSON.stringify(res.data.data));
        } catch (err: any) {
          const savedUser = localStorage.getItem('eduhelp_user');
          if (savedUser && (!err.response || err.message === 'Network Error')) {
            // Keep user in offline / demo mode
            setUser(JSON.parse(savedUser));
          } else {
            localStorage.removeItem('eduhelp_token');
            localStorage.removeItem('eduhelp_user');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data.data;

      localStorage.setItem('eduhelp_token', receivedToken);
      localStorage.setItem('eduhelp_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (err: any) {
      // Offline / GitHub Pages fallback
      const isNetError = !err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK';
      if (isNetError) {
        const demoUser = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (demoUser && password === 'password123') {
          const fakeToken = `demo-token-${demoUser.role.toLowerCase()}`;
          localStorage.setItem('eduhelp_token', fakeToken);
          localStorage.setItem('eduhelp_user', JSON.stringify(demoUser));
          setToken(fakeToken);
          setUser(demoUser);
          return demoUser;
        }
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('eduhelp_token');
    localStorage.removeItem('eduhelp_user');
    setUser(null);
    setToken(null);
    window.location.hash = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      localStorage.setItem('eduhelp_user', JSON.stringify(res.data.data));
    } catch (err) {
      // Keep existing user in demo mode
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
