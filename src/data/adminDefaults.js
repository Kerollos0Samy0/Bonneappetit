import { PRODUCTS } from './products';

// Default Workers list for Bonne Appetit
export const DEFAULT_WORKERS = [
  { id: 'w_1', name: 'شيف أحمد صابر', role: 'تجهيز وتتبيل اللحوم والدواجن', phone: '01011112233', active: true },
  { id: 'w_2', name: 'أم مريم', role: 'لف وتجهيز المحاشي والممبار', phone: '01022223344', active: true },
  { id: 'w_3', name: 'شيف مينا عادل', role: 'تشكيل الكفتة والسمبوسك والكبيبة', phone: '01033334455', active: true },
  { id: 'w_4', name: 'شيف إبراهيم كمال', role: 'تجهيز الأسماك والبحريات', phone: '01044445566', active: true },
  { id: 'w_5', name: 'سناء يوسف', role: 'قسم الخضار والتجهيز النباتي والصيامي', phone: '01055556677', active: true }
];

// Generate initial inventory with realistic stock numbers
export const getInitialInventory = () => {
  const stock = {};
  PRODUCTS.forEach((product) => {
    // Give each product a starter quantity between 15 and 35 units
    stock[product.id] = 25;
  });
  return stock;
};

// Generate next invoice number
export const generateInvoiceNumber = (existingInvoices = []) => {
  const year = new Date().getFullYear();
  const nextNum = existingInvoices.length + 1;
  return `INV-${year}-${String(nextNum).padStart(4, '0')}`;
};

// Generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};
