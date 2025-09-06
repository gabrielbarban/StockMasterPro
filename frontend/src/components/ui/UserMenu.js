'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useTheme } from '@/components/theme/ThemeContext';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, empresa, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeToggle = () => {
    console.log('🎨 Toggle theme clicked - isDark atual:', isDark);
    toggleTheme();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botão do usuário */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.nome}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{empresa?.nome}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
          
          {/* Header do menu */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.nome}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{empresa?.nome}</p>
          </div>

          {/* Opções do menu */}
          <div className="py-1">
            {/* Logout */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}