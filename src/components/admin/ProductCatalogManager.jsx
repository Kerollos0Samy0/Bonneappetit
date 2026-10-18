import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, 
  Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Sparkles, 
  DollarSign, Utensils, X, Save, ExternalLink
} from 'lucide-react';
import { CATEGORIES } from '../../data/products';

export default function ProductCatalogManager({
  products,
  onUpdateProduct,
  onToggleProductVisibility,
  onAddProduct,
  onDeleteProduct,
  onMoveProduct,
  onResetProducts
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all' | 'visible' | 'hidden'

  // Modal State for Edit / Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding new

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('special');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('طبق نصف كيلو');
  const [formWeightKg, setFormWeightKg] = useState('0.5');
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFasting, setFormIsFasting] = useState(false);
  const [formIsSpecial, setFormIsSpecial] = useState(false);
  const [formHidden, setFormHidden] = useState(false);

  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Open modal for editing
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormName(product.name || '');
    setFormCategory(product.category || 'special');
    setFormPrice(String(product.price || ''));
    setFormUnit(product.unit || 'طبق نصف كيلو');
    setFormWeightKg(String(product.weightKg || '0.5'));
    setFormImage(product.image || '');
    setFormDescription(product.description || '');
    setFormIsFasting(!!product.isFasting);
    setFormIsSpecial(!!product.isSpecial);
    setFormHidden(!!product.hidden);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for adding new
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('special');
    setFormPrice('');
    setFormUnit('طبق نصف كيلو');
    setFormWeightKg('0.5');
    setFormImage('');
    setFormDescription('');
    setFormIsFasting(false);
    setFormIsSpecial(false);
    setFormHidden(false);
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Edit or Create
  const handleSaveProduct = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('برجاء كتابة اسم الصنف');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('برجاء كتابة سعر صحيح أكبر من الصفر');
      return;
    }

    const weightNum = parseFloat(formWeightKg) || 0.5;

    if (editingProduct) {
      // Update existing
      const updated = {
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        unit: formUnit.trim(),
        weightKg: weightNum,
        image: formImage.trim(),
        description: formDescription.trim(),
        isFasting: formIsFasting,
        isSpecial: formIsSpecial,
        hidden: formHidden
      };

      onUpdateProduct(updated);
      setSuccessToast(`تم تحديث الصنف "${updated.name}" بنجاح!`);
    } else {
      // Add new
      const newProd = {
        id: 'prod_' + Date.now(),
        name: formName.trim(),
        category: formCategory,
        price: priceNum,
        unit: formUnit.trim() || 'طبق جاهز للتسوية',
        weightKg: weightNum,
        image: formImage.trim(),
        description: formDescription.trim(),
        isFasting: formIsFasting,
        isSpecial: formIsSpecial,
        hidden: formHidden
      };

      onAddProduct(newProd);
      setSuccessToast(`تمت إضافة الصنف الجديد "${newProd.name}" للمنيو بنجاح!`);
    }

    setIsModalOpen(false);
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
              كتالوج المنتجات والمنيو
            </span>
            <span className="text-xs text-stone-400">تحكم كامل شامل</span>
          </div>
          <h2 className="text-xl font-black mt-1">
            إدارة أصناف المنيو • تعديل الأسعار، الصور، الترتيب والإظهار
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            يمكنك إخفاء أي منتج مؤقتاً بنقرة واحدة، إعادة ترتيب ظهور المنتجات في الصفحة الرئيسية، أو تعديل السعر والصورة والاسم.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد للمنيو ➕</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من استعادة منيو بونابيتي الافتراضي الأصلي بالكامل؟')) {
                onResetProducts();
                setSuccessToast('تمت استعادة منيو بونابيتي الافتراضي بنجاح.');
                setTimeout(() => setSuccessToast(''), 4000);
              }
            }}
            title="استعادة المنيو الافتراضي"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-colors border border-stone-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
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
          <span className="text-stone-500 font-medium block mb-1">إجمالي أصناف المنيو</span>
          <span className="text-2xl font-black text-stone-900 font-mono">{totalCount}</span>
          <span className="text-[11px] text-stone-400 block mt-0.5">صنف مسجل</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-emerald-700 font-medium block mb-1">أصناف معروضة بالمتجر</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">{visibleCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">تظهر للزبائن الآن ✅</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-amber-800 font-medium block mb-1">أصناف مخفية مؤقتاً</span>
          <span className="text-2xl font-black text-amber-800 font-mono">{hiddenCount}</span>
          <span className="text-[11px] text-amber-700 block mt-0.5">موقوفة عن العرض 👁️‍🗨️</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-500 font-medium block mb-1">الأقسام النشطة</span>
          <span className="text-2xl font-black text-brand-600 font-mono">5</span>
          <span className="text-[11px] text-stone-400 block mt-0.5">سبشيال، سمك، دواجن، لحوم، نباتي</span>
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
              placeholder="ابحث باسم الصنف أو تفاصيله..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500 bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>

          {/* Visibility Filter Buttons */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <span className="text-stone-500 font-bold ml-1">حالة العرض:</span>
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              الكل ({products.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('visible')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'visible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              ظاهر بالمتجر ({visibleCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                visibilityFilter === 'hidden'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              مخفي ({hiddenCount})
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
            جميع الأقسام
          </button>
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
              <tr>
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3">الصورة</th>
                <th className="p-3">اسم الصنف</th>
                <th className="p-3">القسم</th>
                <th className="p-3">الوحدة والوزن</th>
                <th className="p-3 text-left">السعر</th>
                <th className="p-3 text-center">حالة الظهور</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product, index) => {
                const isFirst = index === 0;
                const isLast = index === products.length - 1;

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
                          title="نقل للأعلى (تقديم في الصفحة الرئيسية)"
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-20 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveProduct(product.id, 'down')}
                          disabled={isLast}
                          title="نقل للأسفل (تأخير في الصفحة الرئيسية)"
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-20 text-stone-700 flex items-center justify-center font-bold"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="p-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
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
                          <ImageIcon className="w-5 h-5 text-stone-300" />
                        )}
                      </div>
                    </td>

                    {/* Product Name & Badges */}
                    <td className="p-3 max-w-xs">
                      <span className={`font-black text-sm block ${product.hidden ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                        {product.name}
                      </span>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {product.description || 'جاهز للتسوية الفورية'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {product.isFasting && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.2 rounded">
                            صيامي 🌱
                          </span>
                        )}
                        {product.isSpecial && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-1.5 py-0.2 rounded">
                            سبشيال 🔥
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full">
                        {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                      </span>
                    </td>

                    {/* Unit & Weight */}
                    <td className="p-3 text-stone-600">
                      <span>{product.unit}</span>
                      <span className="text-[10px] text-stone-400 block font-mono">
                        ({product.weightKg} كجم)
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-3 text-left font-mono font-black text-sm text-stone-900">
                      {product.price} ج.م
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
                        title={product.hidden ? 'اضغط لإظهاره في المتجر' : 'اضغط لإخفائه عن الزبائن'}
                      >
                        {product.hidden ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>مخفي</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>معروض</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          title="تعديل بيانات الصنف والصورة والسعر"
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف الصنف "${product.name}" نهائياً من المنيو؟`)) {
                              onDeleteProduct(product.id);
                              setSuccessToast(`تم حذف "${product.name}" من المنيو.`);
                              setTimeout(() => setSuccessToast(''), 4000);
                            }
                          }}
                          title="حذف الصنف نهائياً"
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
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

      {/* EDIT / CREATE PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative my-6 text-xs max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-widest block">
                  {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
                </span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  {editingProduct ? editingProduct.name : 'إضافة وجبة / أكلة جديدة للمنيو'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  اسم الصنف الكامل <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: كفتة سمك فيليه أو محشي ورق عنب..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">القسم / التصنيف:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:outline-hidden focus:border-brand-500"
                  >
                    <option value="special">سبشيال (SPECIAL) 🌟</option>
                    <option value="fish">سمك وبحريات (FISH) 🐟</option>
                    <option value="poultry">فراخ ودواجن (CHICKEN) 🍗</option>
                    <option value="beef">لحمة متبلة (BEEF) 🥩</option>
                    <option value="vegetables">خضار ونباتي (VEGAN) 🌱</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    السعر الرسمي بالجنيه <span className="text-red-500">*</span>:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="مثال: 150"
                      className="w-full p-2.5 pr-8 rounded-xl border border-stone-300 font-mono font-bold focus:outline-hidden focus:border-brand-500"
                    />
                    <span className="absolute right-2.5 top-2.5 font-bold text-stone-400">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Unit & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">الوحدة والبيان:</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="مثال: طبق نصف كيلو مصبع، كيلو جاهز..."
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">الوزن التقديري (كجم):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={formWeightKg}
                    onChange={(e) => setFormWeightKg(e.target.value)}
                    placeholder="0.5"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  رابط صورة المنتج (Image URL):
                </label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg أو مسار الصورة"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-[11px] focus:outline-hidden focus:border-brand-500"
                  dir="ltr"
                />

                {/* Live Image Preview */}
                {formImage && (
                  <div className="mt-2 p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                      <img
                        src={formImage}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-stone-500">
                      <span className="font-bold text-stone-800 block">معاينة الصورة المباشرة</span>
                      <span>تأكد من ظهور الصورة بشكل صحيح في المربع.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">الوصف والمكونات:</label>
                <textarea
                  rows="3"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب وصفاً جذاباً للوجبة يوضح المكونات وطريقة التسوية والتتبيل..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Badges / Options */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-700 block mb-1">خيارات إضافية للمنتج:</span>
                
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formIsFasting}
                      onChange={(e) => setFormIsFasting(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>أكل صيامي / نباتي 100% 🌱</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                    <input
                      type="checkbox"
                      checked={formIsSpecial}
                      onChange={(e) => setFormIsSpecial(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>سبشيال لفترة محدودة 🔥</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800">
                    <input
                      type="checkbox"
                      checked={formHidden}
                      onChange={(e) => setFormHidden(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>إخفاء المنتج حالياً من المتجر 👁️‍🗨️</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'حفظ تعديلات الصنف' : 'إضافة الصنف للمنيو'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
