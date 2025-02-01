import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { 
  Store, 
  UtensilsCrossed, 
  DollarSign, 
  PiggyBank, 
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import { useStore } from '../store';

export const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, settings } = useStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: Home, label: t('navigation.home') },
    { path: '/products', icon: Store, label: t('navigation.products') },
    { path: '/restaurant', icon: UtensilsCrossed, label: t('navigation.restaurant') },
    { path: '/sales', icon: DollarSign, label: t('navigation.sales') },
    { path: '/cash-flow', icon: PiggyBank, label: t('navigation.cashFlow') },
    { path: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-6">
              <Store className="w-6 h-6 text-blue-600" />
              <span className="ml-2 font-semibold text-gray-900">{settings.restaurantInfo.name}</span>
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <item.icon className="w-5 h-5 mr-1.5" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('navigation.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};