'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Verificar se há tema salvo no localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        const darkMode = savedTheme === 'dark';
        setIsDark(darkMode);
        // Aplicar imediatamente
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Usar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(prefersDark);
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
    }
  }, []);

  const toggleTheme = () => {
    console.log('🎨 ThemeContext - toggleTheme chamado, isDark atual:', isDark);
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    // Aplicar classe imediatamente
    if (typeof window !== 'undefined') {
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        console.log('✅ Aplicado tema DARK');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        console.log('✅ Aplicado tema LIGHT');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}