import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useStore } from '../store';
import { CashFlow, PaymentMethodType } from '../types';
import { Plus, DollarSign, TrendingUp, TrendingDown, Printer, X, Clock } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

interface PaymentTotals {
  [key: string]: {
    count: number;
    total: number;
  };
}

interface ClosingAmounts {
  [key: string]: number;
}

export const CashFlowPage: React.FC = () => {
  const { t } = useTranslation();
  const { getWeeklyCashFlows, addCashFlow, closeCashFlow, orders, settings } = useStore();
  const [showNewCashFlow, setShowNewCashFlow] = useState(false);
  const [showClosingDialog, setShowClosingDialog] = useState(false);
  const [initialAmount, setInitialAmount] = useState('');
  const [closingAmounts, setClosingAmounts] = useState<ClosingAmounts>({});
  const [cashierName, setCashierName] = useState('');
  const currencySymbol = getCurrencySymbol(settings.currency);
  
  const weeklyCashFlows = getWeeklyCashFlows();
  const activeCashFlow = weeklyCashFlows.find(cf => !cf.closedAt);
  const closedCashFlows = weeklyCashFlows.filter(cf => cf.closedAt).sort((a, b) => 
    new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime()
  );
  
  const calculatePaymentTotals = (cashFlow?: CashFlow): PaymentTotals => {
    if (!cashFlow) return {};
    
    const startDate = new Date(cashFlow.date);
    const endDate = cashFlow.closedAt ? new Date(cashFlow.closedAt) : new Date();
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
      })
      .reduce((acc: PaymentTotals, order) => {
        const method = order.paymentMethod || 'other';
        if (!acc[method]) {
          acc[method] = { count: 0, total: 0 };
        }
        acc[method].count++;
        acc[method].total += order.total;
        return acc;
      }, {});
  };

  const paymentTotals = calculatePaymentTotals(activeCashFlow);
  const totalSales = Object.values(paymentTotals).reduce((sum, { total }) => sum + total, 0);

  const getDifference = (method: string) => {
    const reported = closingAmounts[method] || 0;
    const actual = paymentTotals[method]?.total || 0;
    return reported - actual;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return 'text-green-600';
    return diff > 0 ? 'text-orange-500' : 'text-red-500';
  };

  const handleCreateCashFlow = (e: React.FormEvent) => {
    e.preventDefault();
    const newCashFlow: CashFlow = {
      id: crypto.randomUUID(),
      date: new Date(),
      initialAmount: parseFloat(initialAmount),
      finalAmount: parseFloat(initialAmount),
      sales: [],
      expenses: [],
    };
    addCashFlow(newCashFlow);
    setShowNewCashFlow(false);
    setInitialAmount('');
  };

  const printClosingReceipt = () => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('cashFlow.closingReceipt')}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin: 20px 0; }
            .totals { margin: 20px 0; border-top: 1px solid #000; padding-top: 10px; }
            .signature { margin-top: 40px; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 5px; text-align: left; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${settings.restaurantInfo.name}</h2>
            <p>${settings.restaurantInfo.address || ''}</p>
            <p>${settings.restaurantInfo.phone || ''}</p>
          </div>

          <div class="details">
            <p>${t('cashFlow.date')}: ${format(new Date(), 'dd/MM/yyyy')}</p>
            <p>${t('cashFlow.closingTime')}: ${format(new Date(), 'HH:mm')}</p>
            <p>${t('cashFlow.cashier')}: ${cashierName}</p>
          </div>

          <h3>${t('cashFlow.salesSummary')}</h3>
          <table>
            <thead>
              <tr>
                <th>${t('payment.method')}</th>
                <th>${t('cashFlow.transactions')}</th>
                <th>${t('common.total')}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(paymentTotals).map(([method, data]) => `
                <tr>
                  <td>${t(`payment.methods.${method}`)}</td>
                  <td>${data.count}</td>
                  <td>${currencySymbol}${data.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>${t('cashFlow.totalSales')}: ${currencySymbol}${totalSales.toFixed(2)}</strong></p>
            ${Object.entries(closingAmounts).map(([method, amount]) => `
              <p>${t(`payment.methods.${method}`)}: ${currencySymbol}${amount.toFixed(2)}</p>
            `).join('')}
          </div>

          <div class="signature">
            <p>_______________________</p>
            <p>${cashierName}</p>
            <p>${t('cashFlow.cashierSignature')}</p>
          </div>

          <button onclick="window.print(); window.close();" class="no-print">
            ${t('receipt.print')}
          </button>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;

    win.document.write(receiptContent);
    win.document.close();
  };

  const handleCloseCashFlow = () => {
    if (!activeCashFlow) return;
    
    const finalAmounts = Object.entries(closingAmounts).reduce((acc, [method, amount]) => ({
      ...acc,
      [method]: amount
    }), {});

    closeCashFlow(activeCashFlow.id, {
      closedAt: new Date(),
      cashierName,
      finalAmounts,
      totalSales
    });
    
    printClosingReceipt();
    setShowClosingDialog(false);
    setClosingAmounts({});
    setCashierName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('cashFlow.title')}
        </h1>
        {!activeCashFlow ? (
          <button
            onClick={() => setShowNewCashFlow(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('cashFlow.new')}
          </button>
        ) : (
          <button
            onClick={() => setShowClosingDialog(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            {t('cashFlow.close')}
          </button>
        )}
      </div>

      {activeCashFlow && (
        <div style={{maxHeight: '500px', overflowY: 'auto'}} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                {t('cashFlow.sales')}
              </h4>
              <p className="text-2xl font-bold text-green-700">
                {currencySymbol}{totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold flex items-center gap-2 text-blue-700">
                <DollarSign className="w-5 h-5" />
                {t('cashFlow.initialAmount')}
              </h4>
              <p className="text-2xl font-bold text-blue-700">
                {currencySymbol}{activeCashFlow.initialAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">{t('cashFlow.paymentMethods')}</h3>
            <div className="grid gap-4">
              {Object.entries(paymentTotals).map(([method, data]) => (
                <div key={method} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t(`payment.methods.${method}`)}</span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{data.count} {t('cashFlow.transactions')}</p>
                    <p className="font-semibold">{currencySymbol}{data.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {closedCashFlows.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">
            {t('cashFlow.closedCashFlows')}
          </h2>
          <div className="divide-y">
            {closedCashFlows.map(cashFlow => {
              const cashFlowTotals = calculatePaymentTotals(cashFlow);
              const total = Object.values(cashFlowTotals).reduce((sum, { total }) => sum + total, 0);
              
              return (
                <div key={cashFlow.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">
                        {format(new Date(cashFlow.date), 'MMMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(cashFlow.date), 'HH:mm')} - {format(new Date(cashFlow.closedAt!), 'HH:mm')}
                      </p>
                      {cashFlow.cashierName && (
                        <p className="text-sm text-gray-500 mt-1">
                          {t('cashFlow.cashier')}: {cashFlow.cashierName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{currencySymbol}{total.toFixed(2)}</p>
                      <button
                        onClick={() => {
                          // Re-print the closing receipt
                          const win = window.open('', '_blank', 'width=400,height=600');
                          if (!win) return;
                          // ... Similar receipt content but with cashFlow data
                        }}
                        className="text-blue-500 text-sm flex items-center gap-1 hover:text-blue-600"
                      >
                        <Printer className="w-4 h-4" />
                        {t('receipt.print')}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.entries(cashFlowTotals).map(([method, data]) => (
                      <div key={method} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">{t(`payment.methods.${method}`)}</p>
                        <p className="font-medium">{currencySymbol}{data.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showNewCashFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCashFlow} className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">{t('cashFlow.new')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('cashFlow.initialAmount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowNewCashFlow(false)}
                  className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  {t('common.create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showClosingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('cashFlow.closing')}</h2>
              <button onClick={() => setShowClosingDialog(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                <p><strong>{t('cashFlow.openingTime')}:</strong> {format(new Date(activeCashFlow?.date || new Date()), 'dd/MM/yyyy HH:mm')}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('cashFlow.cashierName')}
                  </label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={(e) => setCashierName(e.target.value)}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {settings.enabledPaymentMethods
                  .filter(method => method.enabled)
                  .map(method => (
                    <div key={method.id} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">
                        {t(`payment.methods.${method.id}`)}
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          step="0.01"
                          value={closingAmounts[method.id] || ''}
                          onChange={(e) => setClosingAmounts({
                            ...closingAmounts,
                            [method.id]: parseFloat(e.target.value) || 0
                          })}
                          className="flex-1 border rounded-lg px-3 py-2"
                        />
                        <div className="w-32 text-right">
                          <p className="text-sm text-gray-500">{t('cashFlow.actual')}</p>
                          <p className="font-semibold">{currencySymbol}{(paymentTotals[method.id]?.total || 0).toFixed(2)}</p>
                        </div>
                        <div className="w-32 text-right">
                          <p className="text-sm text-gray-500">{t('cashFlow.difference')}</p>
                          <p className={`font-semibold ${getDifferenceColor(getDifference(method.id))}`}>
                            {currencySymbol}{getDifference(method.id).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4 sticky bottom-0 bg-white pt-4 border-t">
              <button
                onClick={() => setShowClosingDialog(false)}
                className="flex-1 bg-gray-100 py-2 rounded-lg hover:bg-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCloseCashFlow}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                {t('cashFlow.closeAndPrint')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};