import { PRODUCTS } from './products';

// Default Workers list for Bonne Appetit
export const DEFAULT_WORKERS = [
  { id: 'w_1', name: 'أم عطية', role: 'تجهيز وإنتاج أكلات بيتي', phone: '', active: true },
  { id: 'w_2', name: 'أم محمد', role: 'تجهيز وإنتاج أكلات بيتي', phone: '', active: true },
  { id: 'w_3', name: 'علا', role: 'تجهيز وإنتاج أكلات بيتي', phone: '', active: true },
  { id: 'w_4', name: 'فاطمة', role: 'تجهيز وإنتاج أكلات بيتي', phone: '', active: true },
  { id: 'w_5', name: 'أم محمود', role: 'تجهيز وإنتاج أكلات بيتي', phone: '', active: true }
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
