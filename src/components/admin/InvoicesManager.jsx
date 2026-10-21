import React, { useState, useMemo } from 'react';
import { Receipt, Plus, Search, Trash2, Printer, Eye, MessageCircle, AlertTriangle, CheckCircle2, User, DollarSign, CreditCard, ShoppingBag, ArrowDownRight, Phone, FileText } from 'lucide-react';
import { PRODUCTS, BUSINESS_INFO } from '../../data/products';
import { generateInvoiceNumber } from '../../data/adminDefaults';
import { UI_TRANSLATIONS, getLocalizedProduct } from '../../data/translations';
import ProductCombobox from './ProductCombobox';

export default function InvoicesManager({
  products = PRODUCTS,
  invoices = [],
  onCreateInvoice,
  onCancelInvoice,
  inventory = {},
  wholesaleUsers = [],
  wholesaleDiscountPct = 15,
  onOpenInvoiceView,
  onOpenA4Quotation,
  lang = 'ar',
  t
}) {
  const activeT = t || UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
  // View Toggle: 'list' or 'create'
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'create'

  // Search and Filters for Invoices List
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // --- New Invoice Form State ---
  const [customerType, setCustomerType] = useState('retail'); // 'retail' | 'wholesale'
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Invoice Items
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQty, setCurrentQty] = useState('1');
  const [customPrice, setCustomPrice] = useState('');

  // Discount & Fees
  const [discountPct, setDiscountPct] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('كاش (نقدي)');
  const [invoiceNotes, setInvoiceNotes] = useState('');

  const [formError, setFormError] = useState('');

  // Handle Customer / Merchant selection from dropdown
  const handleSelectMerchant = (merchantId) => {
    setSelectedMerchantId(merchantId);
    if (!merchantId || merchantId === 'new_retail') {
      setCustomerType('retail');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDiscountPct(0);
      return;
    }

    const merchant = wholesaleUsers.find((u) => u.id === merchantId);
    if (merchant) {
      setCustomerType('wholesale');
      setCustomerName(merchant.name);
      setCustomerPhone(merchant.phone);
      setCustomerAddress(merchant.area || '');
      setDiscountPct(merchant.discountPct || wholesaleDiscountPct || 15);
    }
  };

  // When product dropdown changes in item row
  const handleProductSelect = (prodId) => {
    setCurrentProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const isMerchant = customerType === 'wholesale' || (selectedMerchantId && selectedMerchantId !== 'custom');
      if (isMerchant) {
        const wholesalePriceVal = (prod.wholesalePrice !== undefined && prod.wholesalePrice !== null && Number(prod.wholesalePrice) > 0)
          ? Number(prod.wholesalePrice)
          : Math.round(prod.price * (1 - (discountPct || wholesaleDiscountPct || 15) / 100));
        setCustomPrice(String(wholesalePriceVal));
      } else {
        setCustomPrice(String(prod.price));
      }
    } else {
      setCustomPrice('');
    }
  };

  // Add Item to Invoice
  const handleAddItemToInvoice = (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentProductId) {
      setFormError('برجاء اختيار الصنف المراد إضافته');
      return;
    }

    const qty = parseInt(currentQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError('برجاء إدخال كمية صحيحة (1 أو أكثر)');
      return;
    }

    const product = products.find((p) => p.id === currentProductId);
    if (!product) return;

    const availableStock = inventory[product.id] || 0;
    if (qty > availableStock) {
      if (!window.confirm(`⚠️ تنبيه: الكمية المطلوبة (${qty}) تتجاوز رصيد المخزن الحالي (${availableStock} طبق). هل تريد المتابعة مع تسجيل الرصيد بالسالب؟`)) {
        return;
      }
    }

    const price = parseFloat(customPrice) || product.price;

    // Check if already in invoice
    const existingIndex = invoiceItems.findIndex((i) => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...invoiceItems];
      const newTotalQty = updated[existingIndex].quantity + qty;
      updated[existingIndex].quantity = newTotalQty;
      updated[existingIndex].price = price;
      updated[existingIndex].total = newTotalQty * price;
      setInvoiceItems(updated);
    } else {
      setInvoiceItems([
        ...invoiceItems,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          weightKg: product.weightKg,
          price: price,
          quantity: qty,
          total: qty * price
        }
      ]);
    }

    // Reset Item Row
    setCurrentProductId('');
    setCurrentQty('1');
    setCustomPrice('');
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setInvoiceItems(invoiceItems.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = Math.round((subtotal * (Number(discountPct) || 0)) / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + (Number(shippingFee) || 0));

  // Submit and Create Invoice
  const handleSaveInvoice = (e) => {
    e.preventDefault();
    setFormError('');

    if (invoiceItems.length === 0) {
      setFormError('لا يمكن إصدار فاتورة فارغة! أضف صنفاً واحداً على الأقل.');
      return;
    }

    if (!customerName.trim()) {
      setFormError('برجاء إدخال اسم العميل');
      return;
    }

    const newInvoiceNumber = generateInvoiceNumber(invoices);
    const now = new Date();

    const newInvoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: newInvoiceNumber,
      date: now.toLocaleDateString('ar-EG') + ' ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      customerType,
      merchantId: selectedMerchantId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: invoiceItems,
      itemsCount: invoiceItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      discountPct: Number(discountPct) || 0,
      discount: discountAmount,
      shippingFee: Number(shippingFee) || 0,
      total: totalAmount,
      paymentMethod,
      notes: invoiceNotes.trim(),
      status: 'مدفوع'
    };

    // Trigger parent callback (deducts stock and adds to stock movements!)
    onCreateInvoice(newInvoice);

    // Open view/print modal immediately
    onOpenInvoiceView(newInvoice);

    // Reset Form and return to list
    setInvoiceItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountPct(0);
    setShippingFee(0);
    setInvoiceNotes('');
    setCurrentView('list');
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customerPhone && inv.customerPhone.includes(searchTerm));
      
      const matchPayment = paymentFilter === 'all' || inv.paymentMethod === paymentFilter;

      return matchSearch && matchPayment;
    });
  }, [invoices, searchTerm, paymentFilter]);

  // Overall Invoice Stats
  const totalSalesRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalInvoicesCount = invoices.length;

  return (
    <div className="space-y-6">

      {/* Top Header & Switch Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900 text-white p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black">
              {activeT.invoices_title}
            </h3>
            <p className="text-xs text-stone-400">
              {activeT.invoices_desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentView === 'list' ? (
            <button
              onClick={() => setCurrentView('create')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl shadow-md transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{activeT.invoices_newInvoice} 🧾</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('list')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition-colors"
            >
              <span>{lang === 'en' ? 'Back to Invoices Archive' : 'العودة لأرشيف الفواتير'}</span>
            </button>
          )}
        </div>
      </div>

      {/* CREATE NEW INVOICE VIEW */}
      {currentView === 'create' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          
          <div className="border-b border-stone-200 pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block">
                {lang === 'en' ? 'New Sales Invoice' : 'فاتورة مبيعات جديدة'}
              </span>
              <h2 className="text-lg font-black text-stone-900 mt-0.5">
                {lang === 'en' ? 'Expected Invoice #:' : 'رقم الفاتورة المتوقع:'} <span className="font-mono text-brand-600">{generateInvoiceNumber(invoices)}</span>
              </h2>
            </div>
            <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full font-mono">
              📅 {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG')}
            </span>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1">
              <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand-600" />
                <span>{lang === 'en' ? '1. Customer / Merchant Details:' : '1. بيانات العميل / التاجر:'}</span>
              </h4>
              <span className="text-[11px] text-stone-500">
                {lang === 'en' ? 'Select an approved merchant to auto-fill details and discount, or pick retail.' : 'اختر من قائمة التجار المعتمدين ليتم ملء بياناته ونسبة خصمه فوراً، أو اختر "عميل جديد" بدون خصم.'}
              </span>
            </div>

            {/* Customer Dropdown (Always prominent!) */}
            <div>
              <label className="font-bold text-stone-800 block mb-1 text-xs">
                {activeT.invoices_customerSelect || (lang === 'en' ? 'Select Customer / Merchant (Dropdown)' : 'اختيار العميل / التاجر (Drop Down)')} <span className="text-red-500">*</span>:
              </label>
              <select
                value={selectedMerchantId || 'new_retail'}
                onChange={(e) => handleSelectMerchant(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-xs focus:outline-hidden focus:border-brand-500 shadow-2xs"
              >
                <option value="new_retail">
                  ➕ {lang === 'en' ? 'New Retail Customer (No Discount — 0%)' : 'عميل جديد / قطاعي (بدون خصم — 0%)'}
                </option>
                <optgroup label={lang === 'en' ? '🏪 Approved Wholesale Merchants' : '🏪 قائمة تجار الجملة المعتمدين'}>
                  {wholesaleUsers.filter((u) => u.approved !== false).map((m) => (
                    <option key={m.id} value={m.id}>
                      🏪 {m.name} ({m.area || m.phone}) — {lang === 'en' ? 'Discount' : 'خصم'} {m.discountPct || wholesaleDiscountPct}%
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Customer Details Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Customer / Facility Name' : 'اسم العميل / التاجر'} <span className="text-red-500">*</span>:</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Karma Supermarket' : 'مثال: سوبر ماركت كارما أو مدام مريم...'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Phone Number:' : 'رقم الموبايل:'}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono focus:outline-hidden focus:border-brand-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Address / Area:' : 'العنوان / المنطقة:'}</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Maadi, Cairo...' : 'مثال: المعادي - مصر القديمة...'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>

            {/* Active customer status pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              {selectedMerchantId && selectedMerchantId !== 'new_retail' ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span>🏪 {lang === 'en' ? `Approved Merchant: ${discountPct}% wholesale discount applied automatically` : `تاجر جملة معتمد: تم تطبيق خصم ${discountPct}% تلقائياً على الفاتورة`}</span>
                </span>
              ) : (
                <span className="bg-stone-200 text-stone-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span>👤 {lang === 'en' ? 'Retail Client: Standard retail prices (0% discount)' : 'عميل جديد / قطاعي: بدون خصم (0%) بسعر المنيو الأصلي'}</span>
                </span>
              )}

              <span className="text-stone-500">
                {lang === 'en' ? '(You can customize the discount percentage below anytime)' : '(يمكنك تعديل نسبة الخصم يدوياً من أسفل الفاتورة في أي وقت)'}
              </span>
            </div>
          </div>

          {/* Add Items to Invoice Form */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-black text-stone-800">{lang === 'en' ? '2. Add Items to Invoice:' : '2. إضافة أصناف للفاتورة:'}</h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
              
              {/* Product Select with Combobox (Type & Dropdown) */}
              <div className="sm:col-span-6">
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'en' ? 'Select Dish from Stock:' : 'اختر الصنف من المخزن:'}
                </label>
                <ProductCombobox
                  products={products}
                  inventory={inventory}
                  selectedProductId={currentProductId}
                  onSelectProduct={(prodId) => handleProductSelect(prodId)}
                  lang={lang}
                  currency={activeT.currency}
                  placeholder={lang === 'en' ? '-- Type to search or pick from list --' : '-- اكتب للبحث أو اختر من القائمة --'}
                />
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Quantity:' : 'الكمية:'}</label>
                <input
                  type="number"
                  min="1"
                  value={currentQty}
                  onChange={(e) => setCurrentQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-center focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Unit Price */}
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Price' : 'سعر الوحدة'} ({activeT.currency}):</label>
                <input
                  type="number"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-center focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Add Button */}
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleAddItemToInvoice}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add' : 'إضافة'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Current Invoice Items Table */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden">
            <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-xs`}>
              <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{activeT.inv_thDish || (lang === 'en' ? 'Dish' : 'الصنف')}</th>
                  <th className="p-3 text-center">{lang === 'en' ? 'Qty' : 'الكمية'}</th>
                  <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{lang === 'en' ? 'Unit Price' : 'سعر القطعة'}</th>
                  <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{lang === 'en' ? 'Total' : 'الإجمالي'}</th>
                  <th className="p-3 text-center">{lang === 'en' ? 'Delete' : 'حذف'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoiceItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-stone-400 font-bold">
                      {lang === 'en' ? 'No items added yet. Choose dishes from the selector above.' : 'لم يتم إضافة أي أصناف بعد. اختر الأصناف من النموذج أعلاه.'}
                    </td>
                  </tr>
                ) : (
                  invoiceItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60">
                      <td className="p-3 font-mono text-stone-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-stone-900">
                        {item.name}
                        <span className="text-[10px] text-stone-400 block font-normal">{item.unit}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-black text-stone-800">
                        {item.quantity}
                      </td>
                      <td className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono text-stone-700`}>
                        {item.price} {activeT.currency}
                      </td>
                      <td className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono font-black text-stone-900`}>
                        {item.total} {activeT.currency}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-stone-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Financial Totals & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200">
            
            {/* Left: Payment Method & Notes */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{activeT.invoices_thPayment || (lang === 'en' ? 'Payment Method:' : 'طريقة السداد / الدفع:')}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="كاش (نقدي)">{lang === 'en' ? 'Cash 💵' : 'كاش (نقدي) 💵'}</option>
                  <option value="إنستاباي (InstaPay)">{lang === 'en' ? 'InstaPay 📱' : 'إنستاباي (InstaPay) 📱'}</option>
                  <option value="محفظة فودافون كاش">{lang === 'en' ? 'Vodafone Cash 💳' : 'محفظة فودافون كاش 💳'}</option>
                  <option value="تحويل بنكي">{lang === 'en' ? 'Bank Transfer 🏦' : 'تحويل بنكي 🏦'}</option>
                  <option value="آجل (على الحساب)">{lang === 'en' ? 'Credit / On Account 📝' : 'آجل (على الحساب) 📝'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{lang === 'en' ? 'Invoice Notes:' : 'ملاحظات الفاتورة:'}</label>
                <input
                  type="text"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder={lang === 'en' ? 'Delivery instructions, time...' : 'ملاحظات تسليم، وقت الشحن...'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>

            {/* Right: Calculations Box */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-stone-600">
                <span>{lang === 'en' ? 'Items Subtotal:' : 'إجمالي الأصناف:'}</span>
                <span className="font-mono font-bold text-sm">{subtotal} {activeT.currency}</span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center text-stone-700">
                <span className="flex items-center gap-1 font-bold">
                  {lang === 'en' ? 'Discount (%):' : 'نسبة الخصم (%):'}
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    className="w-16 p-1 text-center border border-stone-300 rounded font-mono font-bold"
                  />
                  <span className="font-mono text-amber-700 font-bold">(-{discountAmount} {activeT.currency})</span>
                </div>
              </div>

              {/* Shipping Fee */}
              <div className="flex justify-between items-center text-stone-700">
                <span>{lang === 'en' ? 'Shipping & Delivery' : 'مصاريف الشحن والتوصيل'} ({activeT.currency}):</span>
                <input
                  type="number"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-20 p-1 text-center border border-stone-300 rounded font-mono font-bold"
                />
              </div>

              {/* Net Total */}
              <div className="pt-2 border-t-2 border-stone-800 flex justify-between items-center">
                <span className="text-sm font-black text-stone-900">{lang === 'en' ? 'Net Due Total:' : 'الصافي المطلوب سداده:'}</span>
                <span className="text-xl font-black font-mono text-brand-600">
                  {totalAmount} {activeT.currency}
                </span>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('list')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100"
            >
              {lang === 'en' ? 'Cancel' : 'إلغاء'}
            </button>

            <button
              type="button"
              onClick={handleSaveInvoice}
              className="w-full sm:w-auto px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>{lang === 'en' ? 'Issue Invoice & Auto-Deduct Stock ➖' : 'إصدار الفاتورة وخصم الكميات من المخزن أوتوماتيكياً ➖'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ARCHIVE / INVOICES LIST VIEW */}
      {currentView === 'list' && (
        <div className="space-y-4">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-stone-500 font-medium block mb-1">{lang === 'en' ? 'Total Invoice Sales' : 'إجمالي مبيعات الفواتير'}</span>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {totalSalesRevenue.toLocaleString()} {activeT.currency}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="text-stone-500 font-medium block mb-1">{lang === 'en' ? 'Total Invoices Issued' : 'عدد الفواتير الصادرة'}</span>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-600" />
                <span className="text-xl font-black text-stone-900 font-mono">
                  {totalInvoicesCount}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-stone-500 font-medium block mb-1">{lang === 'en' ? 'Average Invoice Value' : 'متوسط قيمة الفاتورة'}</span>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span className="text-xl font-black text-stone-900 font-mono">
                  {totalInvoicesCount > 0 ? Math.round(totalSalesRevenue / totalInvoicesCount) : 0} {activeT.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'en' ? 'Search by invoice # or customer...' : 'بحث برقم الفاتورة أو اسم العميل...'}
                className="w-full pl-3 pr-9 py-2 rounded-xl border border-stone-300 bg-white"
              />
              <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5`} />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-stone-500 font-bold">{activeT.invoices_thPayment || (lang === 'en' ? 'Payment Method:' : 'طريقة الدفع:')}</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
              >
                <option value="all">{lang === 'en' ? 'All' : 'الكل'}</option>
                <option value="كاش (نقدي)">{lang === 'en' ? 'Cash' : 'كاش'}</option>
                <option value="إنستاباي (InstaPay)">{lang === 'en' ? 'InstaPay' : 'إنستاباي'}</option>
                <option value="محفظة فودافون كاش">{lang === 'en' ? 'Vodafone Cash' : 'فودافون كاش'}</option>
                <option value="آجل (على الحساب)">{lang === 'en' ? 'Credit' : 'آجل'}</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
              <Receipt className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700 text-sm">{lang === 'en' ? 'No invoices recorded yet' : 'لا توجد فواتير مسجلة حتى الآن'}</p>
              <p className="text-xs text-stone-500">
                {lang === 'en' ? 'Click "Issue New Invoice" to create an invoice and deduct inventory.' : 'اضغط على زر "إنشاء فاتورة جديدة" لإصدار أول فاتورة وخصمها من المخزن.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
              <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-xs`}>
                <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
                  <tr>
                    <th className="p-3">{activeT.invoices_thInvoiceNo || (lang === 'en' ? 'Invoice #' : 'رقم الفاتورة')}</th>
                    <th className="p-3">{activeT.invoices_thDate || (lang === 'en' ? 'Date & Time' : 'التاريخ والوقت')}</th>
                    <th className="p-3">{activeT.invoices_thCustomer || (lang === 'en' ? 'Customer' : 'العميل')}</th>
                    <th className="p-3">{lang === 'en' ? 'Type' : 'نوع العميل'}</th>
                    <th className="p-3 text-center">{lang === 'en' ? 'Items' : 'عدد الأصناف'}</th>
                    <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{activeT.invoices_thTotal || (lang === 'en' ? 'Total' : 'المبلغ الإجمالي')}</th>
                    <th className="p-3">{activeT.invoices_thPayment || (lang === 'en' ? 'Payment' : 'طريقة الدفع')}</th>
                    <th className="p-3 text-center">{lang === 'en' ? 'Actions' : 'إجراءات'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3 font-mono font-black text-brand-600">
                        {inv.invoiceNumber}
                      </td>

                      <td className="p-3 text-stone-500 font-mono text-[11px]">
                        {inv.date}
                      </td>

                      <td className="p-3">
                        <span className="font-extrabold text-stone-900 block">{inv.customerName}</span>
                        {inv.customerPhone && (
                          <span className="text-[10px] text-stone-500 font-mono">{inv.customerPhone}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.customerType === 'wholesale'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {inv.customerType === 'wholesale' ? (lang === 'en' ? 'Wholesale' : 'تاجر جملة') : (lang === 'en' ? 'Retail' : 'قطاعي / عادي')}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-stone-800">
                        {inv.itemsCount || inv.items?.length || 0}
                      </td>

                      <td className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono font-black text-sm text-stone-900`}>
                        {inv.total} {activeT.currency}
                      </td>

                      <td className="p-3">
                        <span className="text-stone-700 font-medium text-[11px]">
                          {inv.paymentMethod}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenInvoiceView(inv)}
                            title={activeT.invoices_viewInvoice || (lang === 'en' ? 'View & Print' : 'معاينة وطباعة الفاتورة')}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => (onOpenA4Quotation ? onOpenA4Quotation(inv) : onOpenInvoiceView(inv))}
                            title={lang === 'en' ? 'Official A4 Quotation / Confirmation' : 'عرض سعر رسمي A4 ومشاركته واتساب'}
                            className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-300 flex items-center gap-1 font-bold text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>A4</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(lang === 'en' ? `Are you sure you want to cancel invoice ${inv.invoiceNumber}? Stock will be returned.` : `هل أنت متأكد من إلغاء الفاتورة ${inv.invoiceNumber}؟`)) {
                                onCancelInvoice(inv.id);
                              }
                            }}
                            title={activeT.invoices_cancelInvoice || (lang === 'en' ? 'Cancel & Return Stock' : 'إلغاء الفاتورة واسترجاع المخزون')}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
