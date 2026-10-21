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

// Generate next quotation number
export const generateQuotationNumber = (existingQuotations = []) => {
  const year = new Date().getFullYear();
  const nextNum = (existingQuotations.length || 0) + 1;
  return `QOT-${year}-${String(nextNum).padStart(4, '0')}`;
};

// Generate unique ID
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

// Default Raw Materials Inventory (مخزن المواد الخام)
export const DEFAULT_RAW_MATERIALS = [
  { id: 'rm_1', name: 'لحم بلدي مفروم ممتاز', unit: 'كجم', stock: 85, unitCost: 340, minAlert: 20, category: 'لحوم' },
  { id: 'rm_2', name: 'صدور وفيليه دجاج طازج', unit: 'كجم', stock: 95, unitCost: 170, minAlert: 25, category: 'دواجن' },
  { id: 'rm_3', name: 'أرز مصري رفيع فاخر', unit: 'كجم', stock: 220, unitCost: 33, minAlert: 40, category: 'حبوب وبقوليات' },
  { id: 'rm_4', name: 'ورق عنب بناتي ناعم طازج', unit: 'كجم', stock: 65, unitCost: 90, minAlert: 15, category: 'خضروات' },
  { id: 'rm_5', name: 'ممبار بلدي طازج منظف', unit: 'كجم', stock: 50, unitCost: 140, minAlert: 15, category: 'لحوم' },
  { id: 'rm_6', name: 'عجينة سمبوسك مقرمشة', unit: 'كجم', stock: 60, unitCost: 65, minAlert: 15, category: 'معجنات' },
  { id: 'rm_7', name: 'برغل أبيض ناعم للكبيبة', unit: 'كجم', stock: 55, unitCost: 48, minAlert: 15, category: 'حبوب وبقوليات' },
  { id: 'rm_8', name: 'خضروات مشكلة وبصل وثوم مفروم', unit: 'كجم', stock: 130, unitCost: 25, minAlert: 30, category: 'خضروات' },
  { id: 'rm_9', name: 'زيت زيتون بكر وسمن بلدي', unit: 'لتر', stock: 45, unitCost: 190, minAlert: 10, category: 'زيوت ودهون' },
  { id: 'rm_10', name: 'بهارات بونابيتي السرية ودبس رمان', unit: 'كجم', stock: 35, unitCost: 150, minAlert: 10, category: 'توابل ومطيبات' },
  { id: 'rm_11', name: 'أطباق فويل حرارية وشنط تغليف', unit: 'طبق', stock: 750, unitCost: 4, minAlert: 100, category: 'تعبئة وتغليف' }
];

// Default Recipes / Formulas per product (خلطات كل صنف)
// Each recipe specifies the raw materials consumed to produce 1 unit (1 tray / kg)
export const DEFAULT_RECIPES = {
  // ورق عنب بالأرز
  p1: [
    { rawMaterialId: 'rm_4', rawMaterialName: 'ورق عنب بناتي ناعم طازج', amountPerUnit: 0.35, unit: 'كجم' },
    { rawMaterialId: 'rm_3', rawMaterialName: 'أرز مصري رفيع فاخر', amountPerUnit: 0.45, unit: 'كجم' },
    { rawMaterialId: 'rm_8', rawMaterialName: 'خضروات مشكلة وبصل وثوم مفروم', amountPerUnit: 0.15, unit: 'كجم' },
    { rawMaterialId: 'rm_9', rawMaterialName: 'زيت زيتون بكر وسمن بلدي', amountPerUnit: 0.05, unit: 'لتر' },
    { rawMaterialId: 'rm_10', rawMaterialName: 'بهارات بونابيتي السرية ودبس رمان', amountPerUnit: 0.03, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ],
  // كفتة بلدي للشوي
  p2: [
    { rawMaterialId: 'rm_1', rawMaterialName: 'لحم بلدي مفروم ممتاز', amountPerUnit: 0.85, unit: 'كجم' },
    { rawMaterialId: 'rm_8', rawMaterialName: 'خضروات مشكلة وبصل وثوم مفروم', amountPerUnit: 0.15, unit: 'كجم' },
    { rawMaterialId: 'rm_10', rawMaterialName: 'بهارات بونابيتي السرية ودبس رمان', amountPerUnit: 0.03, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ],
  // ممبار بلدي بيتي
  p3: [
    { rawMaterialId: 'rm_5', rawMaterialName: 'ممبار بلدي طازج منظف', amountPerUnit: 0.45, unit: 'كجم' },
    { rawMaterialId: 'rm_3', rawMaterialName: 'أرز مصري رفيع فاخر', amountPerUnit: 0.50, unit: 'كجم' },
    { rawMaterialId: 'rm_8', rawMaterialName: 'خضروات مشكلة وبصل وثوم مفروم', amountPerUnit: 0.10, unit: 'كجم' },
    { rawMaterialId: 'rm_10', rawMaterialName: 'بهارات بونابيتي السرية ودبس رمان', amountPerUnit: 0.02, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ],
  // سمبوسك لحمة بلدي
  p4: [
    { rawMaterialId: 'rm_6', rawMaterialName: 'عجينة سمبوسك مقرمشة', amountPerUnit: 0.45, unit: 'كجم' },
    { rawMaterialId: 'rm_1', rawMaterialName: 'لحم بلدي مفروم ممتاز', amountPerUnit: 0.45, unit: 'كجم' },
    { rawMaterialId: 'rm_8', rawMaterialName: 'خضروات مشكلة وبصل وثوم مفروم', amountPerUnit: 0.10, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ],
  // بانيه دجاج متبل
  p5: [
    { rawMaterialId: 'rm_2', rawMaterialName: 'صدور وفيليه دجاج طازج', amountPerUnit: 0.90, unit: 'كجم' },
    { rawMaterialId: 'rm_10', rawMaterialName: 'بهارات بونابيتي السرية ودبس رمان', amountPerUnit: 0.08, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ],
  // كبيبة شامي بلدي
  p6: [
    { rawMaterialId: 'rm_1', rawMaterialName: 'لحم بلدي مفروم ممتاز', amountPerUnit: 0.55, unit: 'كجم' },
    { rawMaterialId: 'rm_7', rawMaterialName: 'برغل أبيض ناعم للكبيبة', amountPerUnit: 0.40, unit: 'كجم' },
    { rawMaterialId: 'rm_10', rawMaterialName: 'بهارات بونابيتي السرية ودبس رمان', amountPerUnit: 0.05, unit: 'كجم' },
    { rawMaterialId: 'rm_11', rawMaterialName: 'أطباق فويل حرارية وشنط تغليف', amountPerUnit: 1, unit: 'طبق' }
  ]
};

// Default Administrative Expenses (المصاريف الإدارية والتشغيلية)
export const DEFAULT_EXPENSES = [
  {
    id: 'exp_1',
    date: '2026-10-15',
    category: 'إيجار المطبخ والمخزن',
    description: 'إيجار مقر المطبخ والمخزن المركزي لشهر أكتوبر',
    amount: 12000,
    paidBy: 'كاش',
    recordedBy: 'إدارة بونابيتي'
  },
  {
    id: 'exp_2',
    date: '2026-10-16',
    category: 'كهرباء وغاز ومياه',
    description: 'فاتورة استهلاك الغاز الطبيعي والكهرباء لغرف التبريد',
    amount: 3450,
    paidBy: 'فودافون كاش',
    recordedBy: 'إدارة بونابيتي'
  },
  {
    id: 'exp_3',
    date: '2026-10-17',
    category: 'تغليف وتعبئة',
    description: 'شراء كراتين حفظ حرارية وأكياس تفريز أوردرات',
    amount: 2800,
    paidBy: 'إنستاباي',
    recordedBy: 'إدارة بونابيتي'
  },
  {
    id: 'exp_4',
    date: '2026-10-18',
    category: 'صيانة ومعدات',
    description: 'صيانة دورية وشحن فريون لديب فريزر التخزين',
    amount: 950,
    paidBy: 'كاش',
    recordedBy: 'إدارة بونابيتي'
  }
];

// Default Waste Logs (سجل الهالك والتالف)
export const DEFAULT_WASTE_LOGS = [
  {
    id: 'wst_1',
    date: '2026-10-17 14:30',
    type: 'raw',
    itemId: 'rm_8',
    itemName: 'خضروات مشكلة وبصل وثوم مفروم',
    quantity: 3.5,
    unit: 'كجم',
    costLoss: 87.5,
    reason: 'هالك فرز وتنظيف وتقشير طبيعي',
    reportedBy: 'أم عطية',
    notes: 'تم استبعاد أوراق ذابلة'
  },
  {
    id: 'wst_2',
    date: '2026-10-18 16:15',
    type: 'product',
    itemId: 'p1',
    itemName: 'ورق عنب بالأرز',
    quantity: 1,
    unit: 'طبق',
    costLoss: 140,
    reason: 'كسر في الطبق أثناء النقل للفريزر',
    reportedBy: 'علا',
    notes: 'تم إتلاف الطبق لضمان معايير الجودة'
  }
];

// Helper: Convert numbers to Arabic words for official A4 invoices & quotations (التفقيط العربي)
export const numberToWordsArabic = (num) => {
  if (isNaN(num) || num === null || num === undefined) return '';
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'صفر جنيه مصري لا غير';

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const teens = ['أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  const convertGroup = (val) => {
    let result = '';
    const h = Math.floor(val / 100);
    const rem = val % 100;
    const t = Math.floor(rem / 10);
    const o = rem % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (rem > 0) {
      if (result) result += ' و';
      if (rem <= 10) {
        result += ones[rem];
      } else if (rem < 20) {
        result += teens[rem - 11];
      } else {
        if (o > 0) {
          result += ones[o] + ' و';
        }
        result += tens[t];
      }
    }
    return result;
  };

  let words = '';
  const thousands = Math.floor((n % 1000000) / 1000);
  const remaining = n % 1000;

  if (thousands > 0) {
    if (thousands === 1) {
      words += 'ألف';
    } else if (thousands === 2) {
      words += 'ألفان';
    } else if (thousands >= 3 && thousands <= 10) {
      words += convertGroup(thousands) + ' آلاف';
    } else {
      words += convertGroup(thousands) + ' ألفاً';
    }
  }

  if (remaining > 0) {
    if (words) words += ' و';
    words += convertGroup(remaining);
  }

  return `فقط ${words} جنيهاً مصرياً لا غير`;
};
