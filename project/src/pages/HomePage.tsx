import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Store, 
  UtensilsCrossed, 
  DollarSign, 
  PiggyBank, 
  Settings 
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: t('navigation.products'),
      icon: Store,
      path: '/products',
      color: 'bg-blue-500',
    },
    {
      title: t('navigation.restaurant'),
      icon: UtensilsCrossed,
      path: '/restaurant',
      color: 'bg-green-500',
    },
    {
      title: t('navigation.sales'),
      icon: DollarSign,
      path: '/sales',
      color: 'bg-yellow-500',
    },
    {
      title: t('navigation.cashFlow'),
      icon: PiggyBank,
      path: '/cash-flow',
      color: 'bg-purple-500',
    },
    {
      title: t('navigation.settings'),
      icon: Settings,
      path: '/settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`${item.color} text-white p-8 rounded-lg shadow-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-4`}
          >
            <item.icon size={48} />
            <span className="text-xl font-semibold">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};