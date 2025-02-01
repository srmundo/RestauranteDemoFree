export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  type: 'dineIn' | 'takeaway';
  status: 'pending' | 'completed';
  total: number;
  paymentMethod?: PaymentMethodType;
  createdAt: Date;
  tableNumber?: number;
  customerName?: string;
  orderCode?: string;
}

export interface CashFlow {
  id: string;
  date: Date;
  initialAmount: number;
  finalAmount: number;
  sales: Order[];
  expenses: Expense[];
  closedAt?: Date;
  cashierName?: string;
  finalAmounts?: Record<string, number>;
  totalSales?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
}

export interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
  password: string;
}

export interface SystemSettings {
  defaultLanguage: Language;
  currency: Currency;
  enabledPaymentMethods: PaymentMethod[];
  categories: string[];
  restaurantInfo: RestaurantInfo;
}

export type Language = 'en' | 'es' | 'pt' | 'ru' | 'zh';

export type Currency = 'USD' | 'EUR' | 'BRL' | 'RUB' | 'CNY';

export type PaymentMethodType = 'cash' | 'credit' | 'debit' | 'vr' | 'pix';

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  enabled: boolean;
}