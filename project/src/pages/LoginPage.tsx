import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { LanguageSelector } from '../components/LanguageSelector';
import { Store } from 'lucide-react';

const DEFAULT_PASSWORD = 'demo123';
const RESTAURANT_NAMES = [
  'La Bella Italia',
  'El Rincón Mexicano',
  'Golden Dragon',
  'Le Petit Bistro',
  'The Cozy Kitchen',
  'Sushi Master',
  'Mediterranean Delight',
  'Spice Paradise',
  'The Hungry Bear',
  'Ocean Breeze'
];

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateRestaurantInfo } = useStore();
  
  const [restaurantName, setRestaurantName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const getRandomRestaurantName = () => {
    const randomIndex = Math.floor(Math.random() * RESTAURANT_NAMES.length);
    return RESTAURANT_NAMES[randomIndex];
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantName.trim()) {
      setError(t('login.errorRestaurantName'));
      return;
    }

    if (password === DEFAULT_PASSWORD) {
      updateRestaurantInfo({
        name: restaurantName,
        password: password
      });
      navigate('/');
    } else {
      setError(t('login.errorPassword'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <Store className="w-16 h-16 text-[#2271b1] mx-auto" />
        <h1 className="text-3xl font-medium text-[#1d2327] mt-4">
          RestauranteDemoFree
        </h1>
      </div>

      <div className="w-full max-w-[350px] bg-white rounded shadow-md p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[#1d2327] text-sm mb-2">
              {t('settings.restaurantName')}
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3 py-2 border border-[#8c8f94] rounded bg-[#fff] focus:border-[#2271b1] focus:outline-none focus:shadow-[0_0_0_1px_#2271b1]"
              placeholder={getRandomRestaurantName()}
            />
          </div>

          <div>
            <label className="block text-[#1d2327] text-sm mb-2">
              {t('settings.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#8c8f94] rounded bg-[#fff] focus:border-[#2271b1] focus:outline-none focus:shadow-[0_0_0_1px_#2271b1]"
                placeholder={DEFAULT_PASSWORD}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2271b1] hover:text-[#135e96] text-sm"
              >
                {showPassword ? t('login.hidePassword') : t('login.showPassword')}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-[#fcf0f1] text-[#d63638] rounded text-sm">
              {error}
            </div>
          )}

          <div className="bg-[#f6f7f7] border border-[#c3c4c7] rounded p-4 text-sm">
            <h3 className="text-[#1d2327] font-medium mb-2">{t('login.demoCredentials')}</h3>
            <ul className="space-y-1 text-[#50575e]">
              <li>{t('login.defaultPassword')}: <code className="bg-[#e5e5e5] px-1 rounded">{DEFAULT_PASSWORD}</code></li>
              <li>{t('login.sampleName')}: <code className="bg-[#e5e5e5] px-1 rounded">{getRandomRestaurantName()}</code></li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <LanguageSelector />
            </div>
            <button
              type="submit"
              className="bg-[#2271b1] text-white px-4 py-2 rounded border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96] focus:shadow-[0_0_0_1px_#fff,0_0_0_3px_#2271b1] transition-colors"
            >
              {t('login.enter')}
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-8 text-center text-[#50575e] text-sm">
        <p>Powered by <span className="text-[#2271b1]">Victor Gonzalez</span></p>
      </footer>
    </div>
  );
};