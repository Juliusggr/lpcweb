import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (cedula, password) => {
    const data = await apiLogin(cedula, password);
    if (data) {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    }
    return null;
  };

  const register = async (userData) => {
    const data = await apiRegister(userData);
    if (data) {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateSessionUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateSessionUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
