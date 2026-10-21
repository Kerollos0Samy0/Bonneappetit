import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Minus, AlertTriangle, CheckCircle2, 
  SlidersHorizontal, RefreshCw, DollarSign, Boxes, ArrowUpRight, 
  ArrowDownRight, History, Edit3, Check, X, Image as ImageIcon, Sparkles,
  Download, FileSpreadsheet
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/products';
import { UI_TRANSLATIONS, getLocalizedProduct } from '../../data/translations';
import ProductEditModal from './ProductEditModal';
import ExcelImportModal from './ExcelImportModal';
import { exportInventoryToExcel } from '../../utils/excelInventoryHandler';

export default function InventoryManager({
  products = PRODUCTS,
  inventory = {},
  onUpdateStock,
  stockMovements = [],
  onAddStockMovement,
  onUpdateProduct,
  onAddProduct,
  wholesaleDiscountPct = 15,
  lang = 'ar',
  t
}) {
  const activeT = t || UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'low' | 'out' | 'available'
  const [showMovementsLog, setShowMovementsLog] = useState(false);

  // Manual Stock Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState(lang === 'en' ? 'Routine inventory audit' : 'جرد دوري للمخزن');

  // Full Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Inline Price Editing State
  const [inlinePriceId, setInlinePriceId] = useState(null);
  const [inlinePriceVal, setInlinePriceVal] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Filtered Products with Localization
  const filteredProducts = useMemo(() => {
    return products.map((raw) => getLocalizedProduct(raw, lang)).filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      const currentQty = inventory[product.id] || 0;
      let matchesStatus = true;
      if (stockStatusFilter === 'out') {
        matchesStatus = currentQty === 0;
      } else if (stockStatusFilter === 'low') {
        matchesStatus = currentQty > 0 && currentQty <= 5;
      } else if (stockStatusFilter === 'available') {
        matchesStatus = currentQty > 5;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, stockStatusFilter, inventory, products, lang]);

  // Overall Warehouse Stats
  const totalItemsCount = products.length;
  const totalUnitsInStock = Object.values(inventory).reduce((acc, q) => acc + (q || 0), 0);
  
  const totalValuation = useMemo(() => {
    return products.reduce((acc, product) => {
      const qty = inventory[product.id] || 0;
      return acc + qty * product.price;
    }, 0);
  }, [inventory, products]);

  const lowStockCount = products.filter((p) => {
    const q = inventory[p.id] || 0;
    return q > 0 && q <= 5;
  }).length;

  const outOfStockCount = products.filter((p) => {
    const q = inventory[p.id] || 0;
    return q === 0;
  }).length;

  // Handle Quick Stock Change (+1, -1, +5)
  const handleQuickAdjust = (productId, delta) => {
    const current = inventory[productId] || 0;
    const next = Math.max(0, current + delta);
    const product = products.find((p) => p.id === productId);

    onUpdateStock(productId, next);

    if (onAddStockMovement) {
      onAddStockMovement({
        id: 'mov_' + Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        type: delta > 0 ? 'in_quick' : 'out_quick',
        productId,
        productName: product?.name || productId,
        quantityChange: delta,
        previousStock: current,
        newStock: next,
        reference: delta > 0 ? 'إضافة سريعة (+)' : 'صرف سريع (-)',
        notes: 'تعديل سريع من جدول المخزن'
      });
    }
  };

  // Handle Detailed Adjustment Submit
  const handleSaveDetailedAdjustment = (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const newQuantity = parseInt(adjustQty, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert('برجاء إدخال كمية صحيحة أكبر من أو تساوي الصفر');
      return;
    }

    const current = inventory[adjustingProduct.id] || 0;
    const diff = newQuantity - current;

    onUpdateStock(adjustingProduct.id, newQuantity);

    if (onAddStockMovement) {
      onAddStockMovement({
        id: 'mov_' + Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        type: 'manual_adjustment',
        productId: adjustingProduct.id,
        productName: adjustingProduct.name,
        quantityChange: diff,
        previousStock: current,
        newStock: newQuantity,
        reference: 'تسوية جرد يدوي',
        notes: adjustReason || 'جرد مخزن'
      });
    }

    setAdjustingProduct(null);
    setAdjustQty('');
    setAdjustReason('جرد دوري للمخزن');
    setToastMsg(lang === 'en' ? 'Stock count updated successfully.' : 'تم تحديث رصيد المخزن بنجاح.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Handle Inline Price Edit
  const handleStartInlinePrice = (product) => {
    setInlinePriceId(product.id);
    setInlinePriceVal(String(product.price));
  };

  const handleSaveInlinePrice = (product) => {
    const newPrice = parseFloat(inlinePriceVal);
    if (!isNaN(newPrice) && newPrice > 0) {
      if (onUpdateProduct) {
        onUpdateProduct({ ...product, price: newPrice });
      }
      setToastMsg(`تم تحديث سعر "${product.name}" إلى ${newPrice} ج.م`);
      setTimeout(() => setToastMsg(''), 3000);
    }
    setInlinePriceId(null);
  };

  // Handle Full Edit Save
  const handleSaveProductModal = (productData, stockQty) => {
    if (onUpdateProduct) {
      onUpdateProduct(productData);
    }
    if (onUpdateStock && productData.id) {
      onUpdateStock(productData.id, stockQty);
    }
    setToastMsg(`تم حفظ وتحديث كافة بيانات الصنف "${productData.name}" بنجاح!`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    const fileName = exportInventoryToExcel(products, inventory, wholesaleDiscountPct);
    setToastMsg(`✓ تم تنزيل شيت الإكسيل بنجاح (${fileName}) 📥`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Handle Apply Excel Updates
  const handleApplyExcelUpdates = (updates) => {
    let stockChanges = 0;
    let priceChanges = 0;
    let wholesaleChanges = 0;
    let newItems = 0;

    updates.forEach((u) => {
      // 1. Add New or Update Product Details
      if (u.isNew && onAddProduct) {
        onAddProduct(u.product);
        newItems++;
      } else if (onUpdateProduct) {
        onUpdateProduct(u.product);
      }

      if (u.priceChanged) priceChanges++;
      if (u.wholesalePriceChanged) wholesaleChanges++;

      // 2. Update Inventory Stock & Audit Movements
      if (u.stockChanged) {
        stockChanges++;
        const diff = u.newStock - u.oldStock;
        if (onUpdateStock) {
          onUpdateStock(u.targetId, u.newStock);
        }
        if (onAddStockMovement) {
          onAddStockMovement({
            id: 'mov_xl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            date: new Date().toLocaleString('ar-EG'),
            type: diff > 0 ? 'in_quick' : 'out_quick',
            productId: u.targetId,
            productName: u.product.name,
            quantityChange: diff,
            previousStock: u.oldStock,
            newStock: u.newStock,
            reference: 'تحديث جرد جماعي من شيت إكسيل',
            notes: `تم التعديل من ملف الإكسيل (من ${u.oldStock} إلى ${u.newStock} طبق)`
          });
        }
      }
    });

    setToastMsg(`✓ تم تحديث وتطبيق شيت الإكسيل بنجاح: (${stockChanges} تعديل مخزون، ${priceChanges} تعديل قطاعي، ${wholesaleChanges} تعديل تجار${newItems > 0 ? `، ${newItems} أصناف جديدة` : ''})!`);
    setTimeout(() => setToastMsg(''), 5000);
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner: Informing user about full control & Excel buttons */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-stone-100">
                {lang === 'en' ? 'Central Inventory & Full Product Control' : 'المخزن المركزي والتحكم الشامل في الأصناف'}
              </h4>
              <span className="text-[10px] bg-brand-500/30 text-brand-300 border border-brand-500/50 px-2 py-0.5 rounded-full font-bold">
                {lang === 'en' ? 'Full Control' : 'تعديل كامل متاح'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === 'en'
                ? 'Export current inventory to Excel, edit prices or stock quantities on your computer, and upload back.'
                : 'يمكنك تصدير المخزن والأسعار في شيت إكسيل، والتعديل بحرية، ثم إعادة رفع الشيت ليتم تحديث كل شيء تلقائياً.'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Export Excel, Import Excel, Add Dish */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="تنزيل شيت إكسيل كامل للمخزن والأسعار (Export)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير إكسيل 📥</span>
          </button>

          {/* Upload / Import from Excel */}
          <button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="رفع شيت إكسيل معدل لتحديث المخزن (Upload)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>استيراد وتحديث إكسيل 📤</span>
          </button>

          {/* Add New Dish */}
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsEditModalOpen(true);
            }}
            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة صنف ➕</span>
          </button>
        </div>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">{activeT.inv_totalStock}</span>
            <Boxes className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {totalUnitsInStock}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">{activeT.adminDishUnit}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">{activeT.inv_valuation}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {totalValuation.toLocaleString()}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">{activeT.currency}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">{activeT.inv_lowStock}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 font-mono">
            {lowStockCount}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">{lang === 'en' ? 'critical balance' : 'صنف رصيده حرج'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">{lang === 'en' ? 'Out of Stock' : 'نفد تماماً'}</span>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
          </div>
          <span className="text-2xl font-black text-red-600 font-mono">
            {outOfStockCount}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">{lang === 'en' ? 'needs cooking' : 'بحاجة للإنتاج'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeT.inv_searchPlaceholder}
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500 bg-white"
            />
            <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5`} />
          </div>

          {/* Toggle Movements Log Button */}
          <button
            onClick={() => setShowMovementsLog((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
              showMovementsLog
                ? 'bg-stone-900 text-white'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <History className="w-3.5 h-3.5 text-brand-500" />
            <span>{activeT.inv_movementsBtn} ({stockMovements.length})</span>
          </button>
        </div>

        {/* Categories & Stock Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 text-xs">
          {/* Categories Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {activeT.cat_all}
            </button>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catName = cat.id === 'special' ? activeT.cat_special :
                              cat.id === 'fish' ? activeT.cat_fish :
                              cat.id === 'poultry' ? activeT.cat_poultry :
                              cat.id === 'beef' ? activeT.cat_beef :
                              cat.id === 'vegetables' ? activeT.cat_vegetables : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-stone-500 font-bold ml-1">{lang === 'en' ? 'Stock Status:' : 'حالة الرصيد:'}</span>
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'all' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lang === 'en' ? 'All' : 'الكل'}
            </button>
            <button
              onClick={() => setStockStatusFilter('available')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'available' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lang === 'en' ? 'Available (>5)' : 'متوفر'}
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'low' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lang === 'en' ? 'Low Stock (<=5)' : 'رصيد حرج'}
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'out' ? 'bg-red-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              {lang === 'en' ? 'Out of Stock' : 'نفد'}
            </button>
          </div>

        </div>
      </div>

      {/* Stock Movements Log (if toggled) */}
      {showMovementsLog && (
        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-md border border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <h4 className="font-bold text-xs text-white">
                {lang === 'en' ? 'Stock Movements, Inbound, Outbound & Audits Log' : 'سجل حركات الوارد والمنصرف والتسويات'}
              </h4>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              {stockMovements.length} {lang === 'en' ? 'records' : 'حركة مسجلة'}
            </span>
          </div>

          {stockMovements.length === 0 ? (
            <p className="text-center py-6 text-stone-400 text-xs">
              {lang === 'en'
                ? 'No stock movements recorded yet. Production entries or sales invoices will automatically appear here.'
                : 'لا توجد حركات مسجلة بعد. أي إنتاج عمال أو فاتورة مبيعات ستسجل هنا أوتوماتيكياً.'}
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-stone-800 rounded-xl">
              <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-[11px]`}>
                <thead className="bg-stone-800 text-stone-300 font-bold sticky top-0">
                  <tr>
                    <th className="p-2">{lang === 'en' ? 'Date' : 'التاريخ'}</th>
                    <th className="p-2">{lang === 'en' ? 'Type' : 'نوع الحركة'}</th>
                    <th className="p-2">{lang === 'en' ? 'Dish' : 'الصنف'}</th>
                    <th className="p-2 text-center">{lang === 'en' ? 'Qty' : 'الكمية'}</th>
                    <th className="p-2 text-center">{lang === 'en' ? 'Balance After' : 'الرصيد بعد الحركة'}</th>
                    <th className="p-2">{lang === 'en' ? 'Notes / Reference' : 'البيان / الملاحظات'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {stockMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-stone-800/50">
                      <td className="p-2 text-stone-400 font-mono">{mov.date}</td>
                      <td className="p-2">
                        {mov.type.startsWith('in') ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> {lang === 'en' ? 'Inbound (+)' : 'وارد (+)'}
                          </span>
                        ) : mov.type.startsWith('out') ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> {lang === 'en' ? 'Outbound (-)' : 'منصرف (-)'}
                          </span>
                        ) : (
                          <span className="text-sky-400 font-bold">{lang === 'en' ? 'Audit Adj ⚖️' : 'تسوية جرد ⚖️'}</span>
                        )}
                      </td>
                      <td className="p-2 font-bold text-white">{mov.productName}</td>
                      <td className="p-2 text-center font-mono font-bold">
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                      </td>
                      <td className="p-2 text-center font-mono text-brand-300">
                        {mov.newStock}
                      </td>
                      <td className="p-2 text-stone-400">
                        <span className="text-stone-300 font-medium">{mov.reference}</span>
                        {mov.notes && <span className="block text-[10px] text-stone-500">{mov.notes}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Products Table */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-xs`}>
            <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">{lang === 'en' ? 'Photo' : 'الصورة'}</th>
                <th className="p-3">{activeT.inv_thDish || (lang === 'en' ? 'Dish Name' : 'اسم الصنف')}</th>
                <th className="p-3">{activeT.inv_thCategory || (lang === 'en' ? 'Category' : 'القسم')}</th>
                <th className="p-3">{lang === 'en' ? 'Unit & Weight' : 'الوحدة والوزن'}</th>
                <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col">
                    <span className="font-black">{lang === 'en' ? 'Prices (Retail / Wholesale)' : 'الأسعار (قطاعي / تجار)'}</span>
                    <span className="text-[10px] text-stone-400 font-normal">سعر الزبون • سعر التاجر</span>
                  </div>
                </th>
                <th className="p-3 text-center">{activeT.inv_thStock || (lang === 'en' ? 'In Stock' : 'الرصيد المتاح')}</th>
                <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{activeT.inv_thTotalVal || (lang === 'en' ? 'Stock Value' : 'قيمة المخزون')}</th>
                <th className="p-3 text-center">{activeT.inv_thStatus || (lang === 'en' ? 'Status' : 'الحالة')}</th>
                <th className="p-3 text-center">{lang === 'en' ? 'Quantity Adjust' : 'تعديل الكمية'}</th>
                <th className="p-3 text-center">{lang === 'en' ? 'Full Edit' : 'تحكم شامل'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product, idx) => {
                const qty = inventory[product.id] || 0;
                const value = qty * product.price;

                return (
                  <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3 text-stone-400 font-mono">{idx + 1}</td>
                    
                    {/* Photo Thumbnail with click to open full editor */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-brand-400 transition-all relative group"
                        title={lang === 'en' ? 'Click to change photo and details' : 'اضغط لتغيير الصورة وبيانات الصنف'}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-stone-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Edit3 className="w-3 h-3" />
                        </div>
                      </button>
                    </td>

                    {/* Dish Name */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        className="text-start font-extrabold text-stone-900 block text-sm hover:text-brand-600 transition-colors"
                        title="اضغط لتعديل الاسم والسعر والصورة"
                      >
                        {product.name}
                      </button>
                      {product.isFasting && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                          {lang === 'en' ? '🌱 Vegan / Fasting' : '🌱 نباتي / صيامي'}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {product.category}
                      </span>
                    </td>

                    {/* Unit & Weight */}
                    <td className="p-3 text-stone-600">
                      <span>{product.unit}</span>
                      <span className="text-[10px] text-stone-400 block font-mono">({product.weightKg} {activeT.kg})</span>
                    </td>

                    {/* Dual Prices (Retail & Wholesale) */}
                    <td className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>
                      {inlinePriceId === product.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={inlinePriceVal}
                            onChange={(e) => setInlinePriceVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlinePrice(product);
                              if (e.key === 'Escape') setInlinePriceId(null);
                            }}
                            className="w-16 p-1 text-xs font-mono font-bold border border-brand-500 rounded bg-white shadow-inner focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlinePrice(product)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="حفظ"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlinePriceId(null)}
                            className="p-1 rounded bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                            title="إلغاء"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Retail Price */}
                          <div
                            onClick={() => handleStartInlinePrice(product)}
                            className="flex items-center gap-1 font-mono font-black text-xs text-stone-900 hover:text-brand-600 cursor-pointer p-0.5 rounded transition-all group"
                            title="اضغط لتعديل السعر العادي مباشرة"
                          >
                            <span className="text-[10px] text-stone-500 font-sans font-bold">قطاعي:</span>
                            <span>{product.price} {activeT.currency}</span>
                            <Edit3 className="w-2.5 h-2.5 text-stone-400 group-hover:text-brand-600 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Merchant Wholesale Price */}
                          <div
                            onClick={() => {
                              setEditingProduct(product);
                              setIsEditModalOpen(true);
                            }}
                            className="flex items-center gap-1 font-mono font-black text-[11px] text-amber-800 hover:text-amber-950 cursor-pointer p-0.5 rounded transition-all"
                            title="اضغط لتعديل سعر التجار في شاشة التحكم"
                          >
                            <span className="text-[10px] text-amber-700 font-sans font-bold">تجار:</span>
                            <span className="bg-amber-100 text-amber-900 px-1 rounded border border-amber-200">
                              {product.wholesalePrice !== undefined && product.wholesalePrice !== null && Number(product.wholesalePrice) > 0
                                ? Number(product.wholesalePrice)
                                : Math.round(product.price * (1 - (wholesaleDiscountPct || 15) / 100))} {activeT.currency}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Current Stock */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block font-mono font-black text-sm px-2.5 py-1 rounded-xl ${
                          qty === 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : qty <= 5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {qty} {lang === 'en' ? 'units' : (qty > 10 ? 'طبق' : 'أطباق')}
                      </span>
                    </td>

                    {/* Stock Valuation */}
                    <td className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono font-bold text-stone-900`}>
                      {value.toLocaleString()} {activeT.currency}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      {qty === 0 ? (
                        <span className="text-red-600 font-black text-[11px] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          {lang === 'en' ? '🔴 Out of Stock' : '🔴 نفد من المخزن'}
                        </span>
                      ) : qty <= 5 ? (
                        <span className="text-amber-700 font-black text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {lang === 'en' ? '⚠️ Low Stock' : '⚠️ رصيد حرج'}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {lang === 'en' ? '✅ Available' : '✅ متوفر'}
                        </span>
                      )}
                    </td>

                    {/* Quick Quantity Adjust Buttons (+1, -1, +5, جرد) */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleQuickAdjust(product.id, -1)}
                          title={lang === 'en' ? 'Deduct 1' : 'خصم 1'}
                          disabled={qty === 0}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 font-bold flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(product.id, 1)}
                          title={lang === 'en' ? 'Add 1' : 'إضافة 1'}
                          className="w-6 h-6 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(product.id, 5)}
                          title={lang === 'en' ? 'Add 5' : 'إضافة 5'}
                          className="px-1.5 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]"
                        >
                          +5
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingProduct(product);
                            setAdjustQty(String(qty));
                          }}
                          title={lang === 'en' ? 'Detailed Stock Audit' : 'جرد دقيق وتعديل'}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Comprehensive Product Edit Button (Name, Price, Image, Description) */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditModalOpen(true);
                        }}
                        title={lang === 'en' ? 'Edit name, price, photo, description' : 'تحكم كامل: تعديل الاسم والسعر والصورة والوصف'}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-center gap-1 text-[11px] transition-all shadow-2xs"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>{lang === 'en' ? 'Edit Dish' : 'تعديل شامل'}</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED STOCK ADJUSTMENT MODAL */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block">
                {activeT.inv_adjustModalTitle}
              </span>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="font-bold text-sm text-stone-900 mb-1">
              {lang === 'en' ? 'Adjust Inventory:' : 'تعديل جرد المخزن:'} {adjustingProduct.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {lang === 'en' ? 'Current stock count:' : 'الرصيد الحالي بالمخزن:'} <strong className="font-mono text-stone-800">{inventory[adjustingProduct.id] || 0}</strong> {adjustingProduct.unit}
            </p>

            <form onSubmit={handleSaveDetailedAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'en' ? 'New Actual Count After Physical Audit:' : 'الرصيد الفعلي الجديد بعد الجرد:'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-sm font-bold focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'en' ? 'Reason for Adjustment / Notes:' : 'سبب التعديل / ملاحظات:'}
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g., Physical count in freezer, damaged goods, excess production...' : 'مثال: جرد فعلي في الفريزر، تالف، زيادة إنتاج...'}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-xs"
                >
                  {lang === 'en' ? 'Save & Update Stock' : 'حفظ وتحديث الرصيد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE PRODUCT EDIT MODAL (Name, Price, Image, Details) */}
      <ProductEditModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProductModal}
        currentStock={editingProduct ? (inventory[editingProduct.id] ?? 20) : 20}
        wholesaleDiscountPct={wholesaleDiscountPct}
        lang={lang}
      />

      {/* EXCEL IMPORT / UPLOAD MODAL */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        products={products}
        inventory={inventory}
        onApplyExcelUpdates={handleApplyExcelUpdates}
        wholesaleDiscountPct={wholesaleDiscountPct}
        lang={lang}
      />

    </div>
  );
}
