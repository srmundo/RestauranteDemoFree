import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, Wallet, QrCode } from 'lucide-react';
import { PaymentMethodType } from '../types';
import { useStore } from '../store';
import { getCurrencySymbol } from '../utils/currency';

interface PaymentModalProps {
  total: number;
  onComplete: (method: PaymentMethodType) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  onComplete,
  onClose,
}) => {
  const { t } = useTranslation();
  const { settings } = useStore();
  const [method, setMethod] = useState<PaymentMethodType>('cash');
  const [cashReceived, setCashReceived] = useState(total);

  const currencySymbol = getCurrencySymbol(settings.currency);
  const enabledMethods = settings.enabledPaymentMethods.filter(m => m.enabled);

  const getMethodIcon = (methodId: PaymentMethodType) => {
    switch (methodId) {
      case 'credit':
      case 'debit':
      case 'vr':
        return <CreditCard className="w-6 h-6" />;
      case 'pix':
        return <QrCode className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('payment.title')}</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">{t('payment.method')}</label>
            <div className="grid grid-cols-2 gap-2">
              {enabledMethods.map((paymentMethod) => (
                <button
                  key={paymentMethod.id}
                  onClick={() => setMethod(paymentMethod.id)}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
                    method === paymentMethod.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  {getMethodIcon(paymentMethod.id)}
                  <span>{t(`payment.methods.${paymentMethod.id}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {method === 'cash' && (
            <div>
              <label className="block mb-2">{t('common.amountReceived')}</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value))}
                className="w-full border rounded p-2"
              />
              <p className="mt-2">
                {t('common.change')}: {currencySymbol}{(cashReceived - total).toFixed(2)}
              </p>
            </div>
          )}

          <button
            onClick={() => onComplete(method)}
            disabled={method === 'cash' && cashReceived < total}
            className="w-full bg-green-500 text-white py-2 rounded disabled:opacity-50"
          >
            {t('payment.complete')}
          </button>
        </div>
      </div>
    </div>
  );
};