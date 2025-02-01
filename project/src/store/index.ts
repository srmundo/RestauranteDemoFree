import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Order, OrderItem, CashFlow, SystemSettings, PaymentMethod, Currency, Language, PaymentMethodType } from '../types';

interface StoreState {
  products: Product[];
  orders: Order[];
  cashFlows: CashFlow[];
  settings: SystemSettings;
  
  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  
  // Category actions
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  
  // Order actions
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  getOrderTotal: (items: OrderItem[]) => number;
  getDailySales: (date: Date) => Order[];
  getActiveOrders: () => Order[];
  
  // CashFlow actions
  addCashFlow: (cashFlow: CashFlow) => void;
  closeCashFlow: (id: string, closeData: {
    closedAt: Date;
    cashierName: string;
    finalAmounts: Record<string, number>;
    totalSales: number;
  }) => void;
  getWeeklyCashFlows: () => CashFlow[];
  
  // Settings actions
  updateSettings: (settings: Partial<SystemSettings>) => void;
  togglePaymentMethod: (methodId: PaymentMethodType) => void;
  updateCurrency: (currency: Currency) => void;
  updateDefaultLanguage: (language: Language) => void;
  updateRestaurantInfo: (info: Partial<SystemSettings['restaurantInfo']>) => void;
  
  // Auth actions
  logout: () => void;
}

const defaultSettings: SystemSettings = {
  defaultLanguage: 'en',
  currency: 'USD',
  enabledPaymentMethods: [
    { id: 'cash', name: 'Cash', enabled: true },
    { id: 'credit', name: 'Credit Card', enabled: true },
    { id: 'debit', name: 'Debit Card', enabled: true },
    { id: 'vr', name: 'VR', enabled: true },
    { id: 'pix', name: 'PIX', enabled: true },
  ],
  categories: ['food', 'drink'],
  restaurantInfo: {
    name: '',
    address: '',
    phone: '',
    password: ''
  }
};

const initialState = {
  products: [],
  orders: [],
  cashFlows: [],
  settings: defaultSettings,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addProduct: (product) => 
        set((state) => ({ products: [...state.products, product] })),
        
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map(p => p.id === product.id ? product : p)
        })),
        
      removeProduct: (id) =>
        set((state) => ({ products: state.products.filter(p => p.id !== id) })),
        
      addCategory: (category) =>
        set((state) => ({
          settings: {
            ...state.settings,
            categories: Array.isArray(state.settings.categories) 
              ? [...state.settings.categories, category]
              : [category]
          }
        })),
        
      removeCategory: (category) =>
        set((state) => ({
          settings: {
            ...state.settings,
            categories: Array.isArray(state.settings.categories)
              ? state.settings.categories.filter(c => c !== category)
              : []
          }
        })),
        
      addOrder: (order) =>
        set((state) => ({ orders: [...state.orders, order] })),
        
      updateOrder: (order) =>
        set((state) => ({
          orders: state.orders.map(o => o.id === order.id ? order : o)
        })),
        
      getOrderTotal: (items) =>
        items.reduce((total, item) => total + (item.price * item.quantity), 0),
        
      getDailySales: (date) => {
        const orders = get().orders;
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });
      },

      getActiveOrders: () => {
        const orders = get().orders;
        return orders.filter(order => order.status === 'pending');
      },
      
      addCashFlow: (cashFlow) =>
        set((state) => ({ cashFlows: [...state.cashFlows, cashFlow] })),
        
      closeCashFlow: (id, closeData) =>
        set((state) => ({
          cashFlows: state.cashFlows.map(cf => 
            cf.id === id
              ? {
                  ...cf,
                  closedAt: closeData.closedAt,
                  cashierName: closeData.cashierName,
                  finalAmounts: closeData.finalAmounts,
                  totalSales: closeData.totalSales
                }
              : cf
          )
        })),
        
      getWeeklyCashFlows: () => {
        const cashFlows = get().cashFlows;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return cashFlows.filter(cf => new Date(cf.date) >= weekAgo);
      },
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { 
            ...state.settings, 
            ...newSettings,
            restaurantInfo: {
              ...state.settings.restaurantInfo,
              ...(newSettings.restaurantInfo || {})
            }
          }
        })),
        
      togglePaymentMethod: (methodId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            enabledPaymentMethods: state.settings.enabledPaymentMethods.map(
              method => method.id === methodId
                ? { ...method, enabled: !method.enabled }
                : method
            )
          }
        })),
        
      updateCurrency: (currency) =>
        set((state) => ({
          settings: { ...state.settings, currency }
        })),
        
      updateDefaultLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, defaultLanguage: language }
        })),

      updateRestaurantInfo: (info) =>
        set((state) => ({
          settings: {
            ...state.settings,
            restaurantInfo: {
              ...state.settings.restaurantInfo,
              ...info
            }
          }
        })),

      logout: () => {
        set(initialState);
      },
    }),
    {
      name: (storage) => {
        const restaurantName = storage?.getItem('restaurant-store')
          ? JSON.parse(storage.getItem('restaurant-store')!).state.settings.restaurantInfo.name
          : 'default';
        return `restaurant-store-${restaurantName}`;
      },
      version: 1,
    }
  )
);