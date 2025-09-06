'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedEmpresa = localStorage.getItem('empresa');

      if (token && savedUser && savedEmpresa) {
        setUser(JSON.parse(savedUser));
        setEmpresa(JSON.parse(savedEmpresa));
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, empresaData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('empresa', JSON.stringify(empresaData));
    setUser(userData);
    setEmpresa(empresaData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('empresa');
    setUser(null);
    setEmpresa(null);
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!user && !!empresa && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      empresa,
      loading,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}