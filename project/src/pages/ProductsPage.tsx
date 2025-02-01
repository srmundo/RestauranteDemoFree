import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductList } from '../components/ProductList';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {t('products.title')}
      </h1>
      <ProductList />
    </div>
  );
};