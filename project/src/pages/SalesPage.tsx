import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useStore } from '../store';
import { Order } from '../types';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export const SalesPage: React.FC = () => {
  const { t } = useTranslation();
  const { getDailySales } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const dailySales = getDailySales(selectedDate);
  const totalSales = dailySales.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('navigation.sales')}
        </h1>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          {t('common.total')}: ${totalSales.toFixed(2)}
        </h2>

        <div className="space-y-4">
          {dailySales.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {order.type === 'dineIn' 
                      ? `${t('common.dineIn')} - ${t('common.tableNumber')} ${order.tableNumber}`
                      : `${t('common.takeaway')} - ${order.customerName}`
                    }
                  </p>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(order.createdAt), 'HH:mm')}
                    </span>
                  </div>
                </div>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">{t('receipt.orderDetails')}</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 font-semibold flex justify-between">
                <span>{t('common.total')}</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};