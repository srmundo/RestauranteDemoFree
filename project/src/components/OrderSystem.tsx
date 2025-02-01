import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, UtensilsCrossed, Printer } from 'lucide-react';
import { useStore } from '../store';
import { Order, OrderItem, PaymentMethodType } from '../types';
import { PaymentModal } from './PaymentModal';
import { format } from 'date-fns';
import { getCurrencySymbol } from '../utils/currency';

interface OrderSystemProps {
  orderId: string;
  onComplete: () => void;
}

export const OrderSystem: React.FC<OrderSystemProps> = ({ orderId, onComplete }) => {
  const { t, i18n } = useTranslation();
  const { products, addOrder, getOrderTotal, settings } = useStore();
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'dineIn' | 'takeaway'>('dineIn');
  const [showPayment, setShowPayment] = useState(false);
  const [tableNumber, setTableNumber] = useState<number>();
  const [customerName, setCustomerName] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderStarted, setOrderStarted] = useState(false);
  const [receiptWindow, setReceiptWindow] = useState<Window | null>(null);

  const currencySymbol = getCurrencySymbol(settings.currency);

  useEffect(() => {
    return () => {
      if (receiptWindow) {
        receiptWindow.close();
      }
    };
  }, [receiptWindow]);

  useEffect(() => {
    if (receiptWindow && !receiptWindow.closed) {
      updateReceiptContent(receiptWindow, currentOrder);
    }
  }, [i18n.language]);

  const addToOrder = (product: OrderItem) => {
    const existing = currentOrder.find(item => item.id === product.id);
    if (existing) {
      setCurrentOrder(currentOrder.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...product, quantity: 1 }]);
    }
  };

  const removeFromOrder = (productId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== productId));
  };

  const handleOrderTypeSelect = (type: 'dineIn' | 'takeaway') => {
    setOrderType(type);
    setShowOrderDetails(true);
  };

  const handleOrderDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOrderDetails(false);
    setOrderStarted(true);
  };

  const generateOrderCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const getReceiptHeader = () => `
    <div class="header">
      <h2>${settings.restaurantInfo.name}</h2>
      <p>${settings.restaurantInfo.address}</p>
      <p>${t('receipt.phone')}: ${settings.restaurantInfo.phone}</p>
      <p>${t('receipt.date')}: ${format(new Date(), 'dd/MM/yyyy')}</p>
      <p>${t('receipt.time')}: ${format(new Date(), 'HH:mm')}</p>
      <p>${t('receipt.orderNumber')}: ${orderId.slice(0, 8).toUpperCase()}</p>
    </div>
  `;

  const getReceiptStyles = () => `
    <style>
      @media print {
        body { margin: 0; padding: 20px; }
        .no-print { display: none; }
      }
      body { 
        font-family: 'Courier New', monospace; 
        line-height: 1.5;
        max-width: 300px;
        margin: 0 auto;
      }
      .header, .order-details { 
        margin-bottom: 20px;
        text-align: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
      }
      th, td {
        text-align: left;
        padding: 5px;
      }
      .total-line {
        border-top: 1px solid #000;
        margin-top: 10px;
        padding-top: 10px;
      }
      .print-button {
        display: block;
        width: 100%;
        padding: 10px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        margin-top: 20px;
        cursor: pointer;
      }
    </style>
  `;

  const getOrderDetailsTable = (items: OrderItem[]) => `
    <div class="order-details">
      <h3>${t('receipt.orderDetails')}:</h3>
      <table>
        <thead>
          <tr>
            <th>${t('receipt.quantity')}</th>
            <th>${t('receipt.description')}</th>
            <th>${t('receipt.unitPrice')}</th>
            <th>${t('receipt.total')}</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.quantity}</td>
              <td>${item.name}</td>
              <td>${currencySymbol}${item.price.toFixed(2)}</td>
              <td>${currencySymbol}${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-line">
        <p><strong>${t('receipt.totalToPay')}: ${currencySymbol}${getOrderTotal(items).toFixed(2)}</strong></p>
      </div>
    </div>
  `;

  const updateReceiptContent = (win: Window, items: OrderItem[]) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('receipt.title')}</title>
          ${getReceiptStyles()}
        </head>
        <body>
          ${getReceiptHeader()}
          ${getOrderDetailsTable(items)}
          <button onclick="window.print(); window.close();" class="print-button no-print">
            ${t('receipt.print')}
          </button>
        </body>
      </html>
    `;

    win.document.open();
    win.document.write(receiptContent);
    win.document.close();
  };

  const printPreviewReceipt = () => {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;

    setReceiptWindow(win);
    updateReceiptContent(win, currentOrder);
  };

  const printFullReceipt = (order: Order) => {
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;

    updateReceiptContent(win, order.items);
    win.print();
    win.close();
  };

  const handleCompleteOrder = (paymentMethod: PaymentMethodType) => {
    const order: Order = {
      id: orderId,
      items: currentOrder,
      type: orderType,
      status: 'completed',
      total: getOrderTotal(currentOrder),
      paymentMethod,
      createdAt: new Date(),
      tableNumber: orderType === 'dineIn' ? tableNumber : undefined,
      customerName: customerName || undefined,
      orderCode: orderType === 'takeaway' ? generateOrderCode() : undefined,
    };
    
    addOrder(order);
    printFullReceipt(order);
    setCurrentOrder([]);
    setShowPayment(false);
    onComplete();
  };

  if (!orderStarted) {
    return (
      <div className="grid grid-cols-2 gap-6 p-6 border rounded-lg bg-white">
        <div className="flex gap-4">
          <button
            onClick={() => handleOrderTypeSelect('dineIn')}
            className="flex-1 p-4 rounded-lg flex items-center justify-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <UtensilsCrossed />
            {t('common.dineIn')}
          </button>
          <button
            onClick={() => handleOrderTypeSelect('takeaway')}
            className="flex-1 p-4 rounded-lg flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600"
          >
            <ShoppingBag />
            {t('common.takeaway')}
          </button>
        </div>

        {showOrderDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <form onSubmit={handleOrderDetailsSubmit} className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">
                {orderType === 'dineIn' ? t('orders.tableDetails') : t('orders.customerDetails')}
              </h3>
              
              {orderType === 'dineIn' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.tableNumber')}
                  </label>
                  <input
                    type="number"
                    value={tableNumber || ''}
                    onChange={(e) => setTableNumber(parseInt(e.target.value))}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.customerName')}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={orderType === 'takeaway'}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {t('common.confirm')}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 border rounded-lg bg-white">
      <div>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">
            {orderType === 'dineIn' 
              ? `${t('common.dineIn')} - ${t('common.tableNumber')}: ${tableNumber}`
              : `${t('common.takeaway')} - ${t('common.customerName')}: ${customerName}`
            }
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addToOrder(product)}
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p>{currencySymbol}{product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('orders.title')}</h2>
        <div className="space-y-4 mb-6">
          {currentOrder.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {currencySymbol}{item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <button
                onClick={() => removeFromOrder(item.id)}
                className="text-red-500"
              >
                {t('common.remove')}
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>{t('common.total')}:</span>
            <span>{currencySymbol}{getOrderTotal(currentOrder).toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={printPreviewReceipt}
              disabled={currentOrder.length === 0}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              {t('orders.printReceipt')}
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={currentOrder.length === 0}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {t('common.pay')}
            </button>
          </div>
        </div>

        {showPayment && (
          <PaymentModal
            total={getOrderTotal(currentOrder)}
            onComplete={handleCompleteOrder}
            onClose={() => setShowPayment(false)}
          />
        )}
      </div>
    </div>
  );
};