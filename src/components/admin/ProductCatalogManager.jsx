import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, 
  Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Sparkles, 
  DollarSign, Utensils, X, Save, Check, SlidersHorizontal, ArrowUpDown,
  Download, FileSpreadsheet
} from 'lucide-react';
import { CATEGORIES } from '../../data/products';
import { UI_TRANSLATIONS, getLocalizedProduct } from '../../data/translations';
import ProductEditModal from './ProductEditModal';
import ExcelImportModal from './ExcelImportModal';
import { exportInventoryToExcel } from '../../utils/excelInventoryHandler';

export default function ProductCatalogManager({
  products = [],
  onUpdateProduct,
  onToggleProductVisibility,
  onAddProduct,
  onDeleteProduct,
  onMoveProduct,
  onResetProducts,
  inventory = {},
  onUpdateStock,
  wholesaleDiscountPct = 15,
  lang = 'ar',
  t
}) {
  const activeT = t || UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all' | 'visible' | 'hidden'

  // Modal State for Edit / Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new

  // Inline Price Editing State
  const [inlinePriceId, setInlinePriceId] = useState(null);
  const [inlinePriceVal, setInlinePriceVal] = useState('');

  // Batch Price Adjust Modal State
  const [isBatchPriceOpen, setIsBatchPriceOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState('all');
  const [batchActionType, setBatchActionType] = useState('percent'); // 'percent' | 'fixed'
  const [batchAmount, setBatchAmount] = useState('10'); // +10% or +10 EGP
  const [batchDirection, setBatchDirection] = useState('increase'); // 'increase' | 'decrease'

  const [successToast, setSuccessToast] = useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Handle Export Excel
  const handleExportExcel = () => {
    const fileName = exportInventoryToExcel(products, inventory, wholesaleDiscountPct);
    setSuccessToast(`✓ تم تنزيل شيت الإكسيل بنجاح (${fileName}) 📥`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Handle Apply Excel Updates
  const handleApplyExcelUpdates = (updates) => {
    let priceChanges = 0;
    let wholesaleChanges = 0;
    let newItems = 0;

    updates.forEach((u) => {
      if (u.isNew && onAddProduct) {
        onAddProduct(u.product);
        newItems++;
      } else if (onUpdateProduct) {
        onUpdateProduct(u.product);
      }

      if (u.priceChanged) priceChanges++;
      if (u.wholesalePriceChanged) wholesaleChanges++;

      if (u.stockChanged && onUpdateStock) {
        onUpdateStock(u.targetId, u.newStock);
      }
    });

    setSuccessToast(`✓ تم تطبيق شيت الإكسيل بنجاح (${priceChanges} تعديل قطاعي، ${wholesaleChanges} تعديل تجار${newItems > 0 ? `، ${newItems} أصناف جديدة` : ''})!`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Open modal for editing
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Open modal for adding new
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Save product from modal
  const handleSaveModal = (productData, stockQty) => {
    if (editingProduct) {
      onUpdateProduct(productData);
      if (onUpdateStock && productData.id) {
        onUpdateStock(productData.id, stockQty);
      }
      setSuccessToast(lang === 'en' ? `Updated "${productData.name}" successfully!` : `تم حفظ وتحديث بيانات الصنف "${productData.name}" بنجاح!`);
    } else {
      onAddProduct(productData);
      if (onUpdateStock && productData.id) {
        onUpdateStock(productData.id, stockQty);
      }
      setSuccessToast(lang === 'en' ? `Added "${productData.name}" to menu successfully!` : `تمت إضافة الصنف الجديد "${productData.name}" للمنيو بنجاح!`);
    }
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Quick inline price saving
  const handleStartInlinePrice = (product) => {
    setInlinePriceId(product.id);
    setInlinePriceVal(String(product.price));
  };

  const handleSaveInlinePrice = (product) => {
    const newPrice = parseFloat(inlinePriceVal);
    if (!isNaN(newPrice) && newPrice > 0) {
      onUpdateProduct({ ...product, price: newPrice });
      setSuccessToast(lang === 'en' ? `Price updated to ${newPrice} EGP` : `تم تحديث سعر "${product.name}" إلى ${newPrice} ج.م`);
      setTimeout(() => setSuccessToast(''), 3000);
    }
    setInlinePriceId(null);
  };

  // Batch Price Update handler
  const handleApplyBatchPrices = (e) => {
    e.preventDefault();
    const val = parseFloat(batchAmount);
    if (isNaN(val) || val <= 0) {
      alert('برجاء كتابة قيمة صحيحة أكبر من الصفر');
      return;
    }

    let affectedCount = 0;
    products.forEach((p) => {
      if (batchCategory === 'all' || p.category === batchCategory) {
        let newPrice = p.price;
        if (batchActionType === 'percent') {
          const factor = batchDirection === 'increase' ? (1 + val / 100) : (1 - val / 100);
          newPrice = Math.max(5, Math.round(p.price * factor));
        } else {
          const diff = batchDirection === 'increase' ? val : -val;
          newPrice = Math.max(5, Math.round(p.price + diff));
        }

        if (newPrice !== p.price) {
          onUpdateProduct({ ...p, price: newPrice });
          affectedCount++;
        }
      }
    });

    setIsBatchPriceOpen(false);
    setSuccessToast(lang === 'en' ? `Updated prices of ${affectedCount} dishes successfully!` : `تم تحديث أسعار ${affectedCount} صنف في المنيو بنجاح!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      let matchVisibility = true;
      if (visibilityFilter === 'visible') matchVisibility = !p.hidden;
      if (visibilityFilter === 'hidden') matchVisibility = !!p.hidden;

      return matchSearch && matchCategory && matchVisibility;
    });
  }, [products, searchTerm, categoryFilter, visibilityFilter]);

  // Stats
  const totalCount = products.length;
  const visibleCount = products.filter((p) => !p.hidden).length;
  const hiddenCount = products.filter((p) => p.hidden).length;

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-400 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
              {lang === 'en' ? 'Product Catalog & Pricing' : 'المنيو والأسعار والصور'}
            </span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
              {lang === 'en' ? 'Full Control Live' : 'تحكم شامل فوري ✓'}
            </span>
          </div>
          <h2 className="text-xl font-black mt-1">
            {activeT.catalog_title}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {lang === 'en' 
              ? 'Complete control over dish names, selling prices, food photos, descriptions, categories, and inventory.' 
              : 'تحكم كامل وشامل في أسماء الأصناف، أسعار البيع، رفع وتغيير الصور، الأوزان، الوصف وإخفاء أو إظهار المنتجات.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Add Dish Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{activeT.catalog_addDish} ➕</span>
          </button>

          {/* Batch Price Update Button */}
          <button
            onClick={() => setIsBatchPriceOpen(true)}
            title="تعديل أسعار جماعي لجميع الأصناف أو قسم معين بنسبة مئوية أو مبلغ ثابت"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-colors border border-amber-500/40"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'Batch Prices' : 'تعديل أسعار جماعي ⚡'}</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            title="تصدير جميع الأصناف والأسعار والمخزون في شيت إكسيل"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700/40 hover:bg-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold transition-colors border border-emerald-500/40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>تصدير إكسيل 📥</span>
          </button>

          {/* Excel Import */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            title="رفع شيت إكسيل بعد تعديل الأسعار أو الرصيد وتطبيقه فوراً"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>استيراد وتحديث إكسيل 📤</span>
          </button>

          {/* Reset Menu */}
          <button
            onClick={() => {
              if (window.confirm(lang === 'en' ? 'Are you sure you want to restore the default Bonne Appetit menu?' : 'هل أنت متأكد من استعادة منيو بونابيتي الافتراضي الأصلي بالكامل؟')) {
                onResetProducts();
                setSuccessToast(lang === 'en' ? 'Default Bonne Appetit menu restored successfully.' : 'تمت استعادة منيو بونابيتي الافتراضي بنجاح.');
                setTimeout(() => setSuccessToast(''), 4000);
              }
            }}
            title={activeT.catalog_resetBtn}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors border border-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{activeT.catalog_resetBtn}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-medium block mb-1">{lang === 'en' ? 'Total Menu Dishes' : 'إجمالي أصناف المنيو'}</span>
          <span className="text-2xl font-black text-stone-900 font-mono">{totalCount}</span>
          <span className="text-[11px] text-stone-400 block mt-0.5">{lang === 'en' ? 'registered items' : 'صنف مسجل'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-emerald-700 font-medium block mb-1">{lang === 'en' ? 'Visible in Store' : 'أصناف معروضة بالمتجر'}</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">{visibleCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">{lang === 'en' ? 'Live for customers ✅' : 'تظهر للزبائن الآن ✅'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-amber-800 font-medium block mb-1">{lang === 'en' ? 'Hidden Dishes' : 'أصناف مخفية مؤقتاً'}</span>
          <span className="text-2xl font-black text-amber-800 font-mono">{hiddenCount}</span>
          <span className="text-[11px] text-amber-700 block mt-0.5">{lang === 'en' ? 'Suspended from storefront 👁️‍🗨️' : 'موقوفة عن العرض 👁️‍🗨️'}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-medium block mb-1">{lang === 'en' ? 'Fast Price Edit' : 'تعديل السعر السريع'}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-stone-800 font-bold text-xs">{lang === 'en' ? 'Click on price to edit' : 'اضغط على السعر في الجدول'}</span>
          </div>
          <span className="text-[11px] text-stone-400 block mt-0.5">{lang === 'en' ? 'Instant inline update' : 'تعديل وحفظ فوري بدون نوافذ'}</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search dish name or description...' : 'ابحث باسم الصنف أو تفاصيله...'}
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500 bg-white"
            />
            <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-2.5`} />
          </div>

          {/* Visibility Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-stone-500 font-bold ml-1">{lang === 'en' ? 'Visibility:' : 'حالة العرض:'}</span>
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {lang === 'en' ? 'All' : 'الكل'} ({products.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('visible')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'visible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {activeT.catalog_visible} ({visibleCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'hidden'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {activeT.catalog_hidden} ({hiddenCount})
            </button>
          </div>

        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-stone-200">
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
      </div>

      {/* Products Table */}
      <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-xs`}>
            <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
              <tr>
                <th className="p-3 text-center">{activeT.catalog_thOrder || (lang === 'en' ? 'Order' : 'الترتيب')}</th>
                <th className="p-3">{lang === 'en' ? 'Photo' : 'الصورة'}</th>
                <th className="p-3">{activeT.catalog_thDish || (lang === 'en' ? 'Dish Name' : 'اسم الصنف')}</th>
                <th className="p-3">{activeT.catalog_thCategory || (lang === 'en' ? 'Category' : 'القسم')}</th>
                <th className="p-3">{activeT.catalog_thUnit || (lang === 'en' ? 'Unit & Weight' : 'الوحدة والوزن')}</th>
                <th className={`p-3 ${lang === 'en' ? 'text-right' : 'text-left'}`}>
                  <div className="flex flex-col">
                    <span className="font-black">{lang === 'en' ? 'Prices (Retail / Wholesale)' : 'الأسعار (قطاعي / تجار)'}</span>
                    <span className="text-[10px] text-stone-400 font-normal">سعر الزبون • سعر التاجر</span>
                  </div>
                </th>
                <th className="p-3 text-center">{lang === 'en' ? 'Stock' : 'الرصيد'}</th>
                <th className="p-3 text-center">{activeT.catalog_thVisibility || (lang === 'en' ? 'Visibility' : 'حالة الظهور')}</th>
                <th className="p-3 text-center">{lang === 'en' ? 'Full Edit' : 'تحكم شامل'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product, index) => {
                const isFirst = index === 0;
                const isLast = index === products.length - 1;
                const localizedP = getLocalizedProduct(product, lang);
                const currentStock = inventory[product.id] ?? 0;

                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-stone-50/80 transition-colors ${
                      product.hidden ? 'bg-amber-50/30 text-stone-400' : ''
                    }`}
                  >
                    
                    {/* Reordering Buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onMoveProduct(product.id, 'up')}
                          disabled={isFirst}
                          title={lang === 'en' ? 'Move Up' : 'نقل للأعلى'}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-20 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveProduct(product.id, 'down')}
                          disabled={isLast}
                          title={lang === 'en' ? 'Move Down' : 'نقل للأسفل'}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-20 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Image Thumbnail with Click-to-edit */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-brand-400 transition-all relative group"
                        title={lang === 'en' ? 'Click to change photo' : 'اضغط لتغيير أو رفع صورة للصنف'}
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={localizedP.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-stone-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Edit3 className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    </td>

                    {/* Product Name & Badges */}
                    <td className="p-3 max-w-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className={`text-start font-black text-sm block hover:text-brand-600 transition-colors ${
                          product.hidden ? 'text-stone-500 line-through' : 'text-stone-900'
                        }`}
                      >
                        {localizedP.name}
                      </button>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {localizedP.description || (lang === 'en' ? 'Ready to cook immediately' : 'جاهز للتسوية الفورية')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {product.isFasting && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded">
                            {lang === 'en' ? 'Fasting 🌱' : 'صيامي 🌱'}
                          </span>
                        )}
                        {product.isSpecial && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-1.5 py-0.2 rounded">
                            {lang === 'en' ? 'Special 🔥' : 'سبشيال 🔥'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                      </span>
                    </td>

                    {/* Unit & Weight */}
                    <td className="p-3 text-stone-600">
                      <span>{localizedP.unit}</span>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        ({product.weightKg} {activeT.kg})
                      </span>
                    </td>

                    {/* Dual Prices: Retail & Wholesale */}
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
                            className="w-20 p-1 text-xs font-mono font-bold border border-brand-500 rounded-lg bg-white shadow-inner focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlinePrice(product)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            title="حفظ السعر"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlinePriceId(null)}
                            className="p-1 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                            title="إلغاء"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Retail Price */}
                          <div
                            onClick={() => handleStartInlinePrice(product)}
                            className="flex items-center gap-1.5 font-mono font-black text-xs sm:text-sm text-stone-900 hover:text-brand-600 cursor-pointer p-0.5 rounded transition-all group"
                            title={lang === 'en' ? 'Click to quick edit price' : 'اضغط لتعديل السعر العادي مباشرة'}
                          >
                            <span className="text-[10px] text-stone-500 font-sans font-bold">قطاعي:</span>
                            <span>{product.price} {activeT.currency}</span>
                            <Edit3 className="w-2.5 h-2.5 text-stone-400 group-hover:text-brand-600 opacity-40 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Wholesale Price */}
                          <div
                            onClick={() => handleOpenEdit(product)}
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
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${
                        currentStock === 0 ? 'bg-red-100 text-red-700' :
                        currentStock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {currentStock}
                      </span>
                    </td>

                    {/* Visibility Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleProductVisibility(product.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          product.hidden
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        }`}
                        title={product.hidden ? (lang === 'en' ? 'Click to show in store' : 'اضغط لإظهاره في المتجر') : (lang === 'en' ? 'Click to hide from store' : 'اضغط لإخفائه عن الزبائن')}
                      >
                        {product.hidden ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>{activeT.catalog_hidden}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>{activeT.catalog_visible}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Comprehensive Edit & Delete */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          title={lang === 'en' ? 'Edit all dish details' : 'تعديل شامل (الاسم، السعر، الصورة، الوصف)'}
                          className="px-2.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-bold flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                          <span>{lang === 'en' ? 'Edit' : 'تعديل'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(lang === 'en' ? `Are you sure you want to delete "${product.name}" from menu?` : `هل أنت متأكد من حذف الصنف "${product.name}" نهائياً من المنيو؟`)) {
                              onDeleteProduct(product.id);
                              setSuccessToast(lang === 'en' ? `Deleted "${product.name}" from menu.` : `تم حذف "${product.name}" من المنيو.`);
                              setTimeout(() => setSuccessToast(''), 4000);
                            }
                          }}
                          title={lang === 'en' ? 'Delete Dish' : 'حذف الصنف نهائياً'}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PRODUCT EDIT / CREATE MODAL */}
      <ProductEditModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        currentStock={editingProduct ? (inventory[editingProduct.id] ?? 20) : 20}
        wholesaleDiscountPct={wholesaleDiscountPct}
        lang={lang}
      />

      {/* BATCH PRICE ADJUSTMENT MODAL */}
      {isBatchPriceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-sm text-stone-900">
                  {lang === 'en' ? 'Batch Price Adjustment' : 'تعديل أسعار جماعي للمنيو ⚡'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchPriceOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBatchPrices} className="space-y-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'en' ? 'Target Section / Category' : 'الأصناف المستهدفة'}:
                </label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                >
                  <option value="all">جميع أصناف المنيو بلا استثناء ({products.length} صنف)</option>
                  <option value="special">قسم السبشيال (SPECIAL) فقط</option>
                  <option value="fish">قسم الأسماك والبحريات (FISH) فقط</option>
                  <option value="poultry">قسم الفراخ والدواجن (CHICKEN) فقط</option>
                  <option value="beef">قسم اللحوم البلدي (BEEF) فقط</option>
                  <option value="vegetables">قسم الخضار والمحاشي (VEGAN) فقط</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {lang === 'en' ? 'Adjustment Direction' : 'نوع التعديل'}:
                  </label>
                  <select
                    value={batchDirection}
                    onChange={(e) => setBatchDirection(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                  >
                    <option value="increase">زيادة في الأسعار 📈</option>
                    <option value="decrease">تخفيض في الأسعار 📉</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {lang === 'en' ? 'Calculation Method' : 'طريقة الحساب'}:
                  </label>
                  <select
                    value={batchActionType}
                    onChange={(e) => setBatchActionType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-bold bg-white"
                  >
                    <option value="percent">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت بالجنيه (ج.م)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {lang === 'en' ? 'Value' : 'القيمة'} ({batchActionType === 'percent' ? '%' : 'جنيه'}):
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={batchAmount}
                  onChange={(e) => setBatchAmount(e.target.value)}
                  placeholder="10"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsBatchPriceOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-bold"
                >
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl shadow-md transition-all"
                >
                  {lang === 'en' ? 'Apply to All' : 'تطبيق التعديل على الأسعار ⚡'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
