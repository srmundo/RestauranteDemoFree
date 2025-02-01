import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { OrderSystem } from '../components/OrderSystem';
import { Plus } from 'lucide-react';

export const RestaurantPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeOrders, setActiveOrders] = useState<string[]>([]);

  const addNewOrder = () => {
    const orderId = crypto.randomUUID();
    setActiveOrders([...activeOrders, orderId]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('orders.title')}
        </h1>
        <button
          onClick={addNewOrder}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('orders.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeOrders.map((orderId) => (
          <OrderSystem
            key={orderId}
            orderId={orderId}
            onComplete={() => {
              setActiveOrders(activeOrders.filter(id => id !== orderId));
            }}
          />
        ))}
      </div>
    </div>
  );
};