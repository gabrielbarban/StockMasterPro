import Link from 'next/link';
import { Package, LayoutDashboard, Tags, Users, TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Produtos', href: '/produtos', icon: Package },
  { name: 'Categorias', href: '/categorias', icon: Tags },
  { name: 'Fornecedores', href: '/fornecedores', icon: Users },
  { name: 'Movimentações', href: '/movimentacoes', icon: TrendingUp },
];

export default function SimpleLayout({ children, currentPage = '' }) {
  const { user, empresa, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">StockMaster Pro</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
              <p className="text-xs text-gray-500">{empresa?.nome}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.name;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {children}
      </div>
    </div>
  );
}