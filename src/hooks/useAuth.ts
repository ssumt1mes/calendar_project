import { useEffect, useState } from 'react';
import {
  AUTH_EVENT_KEY,
  getCurrentUser,
  loginWithPassword,
  logout as performLogout,
  registerWithPassword,
} from '../services/auth';
import { AuthResult, AuthUser } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  useEffect(() => {
    const refresh = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener(AUTH_EVENT_KEY, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(AUTH_EVENT_KEY, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const result = await registerWithPassword(name, email, password);
    setUser(getCurrentUser());
    return result;
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const result = await loginWithPassword(email, password);
    setUser(getCurrentUser());
    return result;
  };

  const logout = () => {
    performLogout();
    setUser(null);
  };

  return {
    user,
    login,
    register,
    logout,
  };
};
