import { Currency } from '../types';

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'BRL':
      return 'R$';
    case 'RUB':
      return '₽';
    case 'CNY':
      return '¥';
    default:
      return '$';
  }
};