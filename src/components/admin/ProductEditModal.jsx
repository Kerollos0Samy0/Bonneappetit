import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Upload, Camera, Image as ImageIcon, Link as LinkIcon, 
  Trash2, AlertCircle, CheckCircle2, Sparkles, DollarSign, 
  Boxes, Scale, Tag, Info, Eye, EyeOff, Check
} from 'lucide-react';
import { CATEGORIES } from '../../data/products';
import { compressImageFile, PRESET_FOOD_IMAGES } from '../../utils/imageCompressor';

export default function ProductEditModal({
  product = null, // null means adding a new product
  isOpen,
  onClose,
  onSave, // (productData, stockQty) => void
  currentStock = 20,
  wholesaleDiscountPct = 15,
  lang = 'ar'
}) {
  if (!isOpen) return null;

  const isEditing = !!product;

  // Form State
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'special');
  const [price, setPrice] = useState(product?.price !== undefined ? String(product.price) : '');
  const [wholesalePrice, setWholesalePrice] = useState(
    product?.wholesalePrice !== undefined && product?.wholesalePrice !== null
      ? String(product.wholesalePrice)
      : (product?.price ? String(Math.round(product.price * (1 - (wholesaleDiscountPct || 15) / 100))) : '')
  );
  const [unit, setUnit] = useState(product?.unit || 'طبق نصف كيلو مصبع');
  const [weightKg, setWeightKg] = useState(product?.weightKg !== undefined ? String(product.weightKg) : '0.5');
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(product?.image || '');
  const [isFasting, setIsFasting] = useState(!!product?.isFasting);
  const [isSpecial, setIsSpecial] = useState(!!product?.isSpecial);
  const [hidden, setHidden] = useState(!!product?.hidden);
  
  // Stock adjustment in modal
  const [stock, setStock] = useState(String(currentStock ?? 20));

  // Image tab: 'upload' | 'camera' | 'presets' | 'url'
  const [imageTab, setImageTab] = useState('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || 'special');
      setPrice(product.price !== undefined ? String(product.price) : '');
      setWholesalePrice(
        product.wholesalePrice !== undefined && product.wholesalePrice !== null
          ? String(product.wholesalePrice)
          : (product.price ? String(Math.round(product.price * (1 - (wholesaleDiscountPct || 15) / 100))) : '')
      );
      setUnit(product.unit || 'طبق نصف كيلو مصبع');
      setWeightKg(product.weightKg !== undefined ? String(product.weightKg) : '0.5');
      setDescription(product.description || '');
      setImage(product.image || '');
      setIsFasting(!!product.isFasting);
      setIsSpecial(!!product.isSpecial);
      setHidden(!!product.hidden);
    } else {
      setName('');
      setCategory('special');
      setPrice('');
      setWholesalePrice('');
      setUnit('طبق نصف كيلو مصبع');
      setWeightKg('0.5');
      setDescription('');
      setImage('');
      setIsFasting(false);
      setIsSpecial(false);
      setHidden(false);
    }
    setStock(String(currentStock ?? 20));
    setFormError('');
  }, [product, currentStock, isOpen]);

  // Handle Local Image File (from device gallery / file picker)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setFormError('');
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.82);
      setImage(compressedDataUrl);
    } catch (err) {
      setFormError(err.message || 'حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Calculate Pricing in Realtime
  const parsedPrice = parseFloat(price) || 0;
  const parsedWholesalePrice = parseFloat(wholesalePrice) || 0;
  const autoCalculatedWholesale = Math.round(parsedPrice * (1 - (wholesaleDiscountPct || 15) / 100));

  // Quick preset chips for unit
  const UNIT_PRESETS = [
    'طبق نصف كيلو مصبع',
    'طبق نصف كيلو',
    'طبق 1 كيلو جاهز',
    'طبق 750 جرام',
    'كيس 20 قطعة',
    'علبة 12 قرص جامبو',
    'كيس 1 كيلو متبل'
  ];

  // Quick preset chips for weight
  const WEIGHT_PRESETS = ['0.25', '0.5', '0.75', '1.0', '1.5', '2.0'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError(lang === 'en' ? 'Please enter dish name' : 'برجاء كتابة اسم الصنف');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError(lang === 'en' ? 'Please enter a valid retail price greater than 0' : 'برجاء إدخال سعر بيع عادي صحيح أكبر من الصفر');
      return;
    }

    const wholesaleNum = parseFloat(wholesalePrice);
    const validWholesale = (!isNaN(wholesaleNum) && wholesaleNum > 0)
      ? wholesaleNum
      : Math.round(priceNum * (1 - (wholesaleDiscountPct || 15) / 100));

    const weightNum = parseFloat(weightKg) || 0.5;
    const stockNum = parseInt(stock, 10);
    const validStock = isNaN(stockNum) ? 0 : Math.max(0, stockNum);

    const productPayload = {
      ...(product || {}),
      id: product?.id || 'prod_' + Date.now(),
      name: cleanName,
      category,
      price: priceNum,
      wholesalePrice: validWholesale,
      unit: unit.trim() || 'طبق جاهز للتسوية',
      weightKg: weightNum,
      image: image.trim(),
      description: description.trim(),
      isFasting,
      isSpecial,
      hidden
    };

    onSave(productPayload, validStock);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 relative my-4 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-brand-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                  {isEditing ? (lang === 'en' ? 'Full Dish Control' : 'تحكم كامل شامل') : (lang === 'en' ? 'New Menu Dish' : 'إضافة صنف جديد')}
                </span>
                {product?.id && (
                  <span className="text-[11px] font-mono text-stone-400">
                    #{product.id}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isEditing ? `تعديل صنف: ${product.name}` : (lang === 'en' ? 'Add New Product to Bonne Appetit' : 'إضافة أكلة / منتج جديد لمنيو بونابيتي')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors border border-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Error Message */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Image Control */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span className="font-extrabold text-stone-800 text-xs">
                  {lang === 'en' ? 'Dish Photo (Change or Upload)' : 'صورة الصنف (تغيير، رفع أو اختيار صورة)'}
                </span>
              </div>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-stone-400 hover:text-red-500 font-bold flex items-center gap-1 text-[11px] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Remove Photo' : 'إزالة الصورة'}</span>
                </button>
              )}
            </div>

            {/* Live Image Preview & Selector Container */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Thumbnail */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 overflow-hidden flex items-center justify-center shrink-0 relative shadow-inner group">
                {image ? (
                  <img
                    src={image}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-2 text-stone-400 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-stone-300" />
                    <span className="text-[10px] block font-bold">{lang === 'en' ? 'No photo set' : 'بدون صورة'}</span>
                  </div>
                )}

                {isCompressing && (
                  <div className="absolute inset-0 bg-stone-900/75 flex flex-col items-center justify-center text-white text-[10px] font-bold p-2 text-center">
                    <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mb-1"></div>
                    <span>جاري ضغط ومعالجة الصورة...</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Image */}
              <div className="flex-1 w-full space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Upload from Gallery / Files */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold border border-stone-300 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-600" />
                    <span>{lang === 'en' ? 'Choose from Device' : 'رفع من الموبايل / الكمبيوتر'}</span>
                  </button>

                  {/* Camera Snap */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold border border-stone-300 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{lang === 'en' ? 'Take Photo' : 'التقاط بالكاميرا 📸'}</span>
                  </button>
                </div>

                {/* Subtabs for image presets or URL */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setImageTab('presets')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      imageTab === 'presets' ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    🍲 {lang === 'en' ? 'Preset Food Gallery' : 'معرض أكلات جاهزة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      imageTab === 'url' ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    🔗 {lang === 'en' ? 'Image URL' : 'رابط مباشر (URL)'}
                  </button>
                </div>

                {/* Presets Grid */}
                {imageTab === 'presets' && (
                  <div className="pt-2">
                    <span className="text-[10px] text-stone-500 block mb-1.5">
                      {lang === 'en' ? 'Click any ready photo to select it instantly:' : 'اضغط على أي صورة لتطبيقها على الصنف فوراً:'}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-xl border border-stone-200">
                      {PRESET_FOOD_IMAGES.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          title={preset.title}
                          className={`relative h-14 rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                            image === preset.url ? 'border-brand-500 ring-2 ring-brand-300' : 'border-stone-200'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover"
                          />
                          {image === preset.url && (
                            <div className="absolute inset-0 bg-brand-600/40 flex items-center justify-center text-white">
                              <Check className="w-4 h-4 font-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL Input */}
                {imageTab === 'url' && (
                  <div className="pt-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px] bg-white"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Basic Info (Name & Category) */}
          <div className="space-y-3">
            <div>
              <label className="font-extrabold text-stone-800 block mb-1">
                {lang === 'en' ? 'Dish Full Name' : 'اسم الصنف الكامل'} <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: كفتة سمك فيليه، شيش طاووق فراخ، محشي ورق عنب..."
                className="w-full p-3 rounded-xl border border-stone-300 font-black text-sm bg-stone-50 focus:bg-white focus:outline-hidden focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-extrabold text-stone-800 block mb-1">
                  {lang === 'en' ? 'Category / Section' : 'القسم / التصنيف الرئيسي'} <span className="text-red-500">*</span>:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold focus:outline-hidden focus:border-brand-500"
                >
                  <option value="special">🌟 سبشيال (SPECIAL) - مميز لفترة محدودة</option>
                  <option value="fish">🐟 سمك وبحريات (FISH) - فيليه وجمبري</option>
                  <option value="poultry">🍗 فراخ ودواجن (CHICKEN) - بانيه واستربس وكفتة</option>
                  <option value="beef">🥩 لحمة بلدي متبلة (BEEF) - كفتة وبرجر وحواوشي</option>
                  <option value="vegetables">🌱 خضار ومحاشي (VEGAN) - ورق عنب وممبار ونباتي</option>
                </select>
              </div>

              {/* Stock Quantity in Warehouse */}
              <div>
                <label className="font-extrabold text-stone-800 block mb-1">
                  {lang === 'en' ? 'Current Inventory Stock (Trays)' : 'رصيد المخزن المتاح حالياً (طبق)'}:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 pr-10 rounded-xl border border-stone-300 font-mono font-bold bg-white focus:outline-hidden focus:border-brand-500"
                  />
                  <Boxes className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3`} />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dual Pricing (Retail & Merchant Wholesale) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>{lang === 'en' ? 'Pricing (Retail & Merchant Wholesale)' : 'التسعير (سعر البيع العادي وسعر التجار)'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const p = parseFloat(price) || 0;
                  const autoW = Math.round(p * (1 - (wholesaleDiscountPct || 15) / 100));
                  setWholesalePrice(String(autoW));
                }}
                className="text-[11px] font-bold text-amber-800 bg-amber-200/90 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                title={`تطبيق نسبة الخصم المعتمدة (${wholesaleDiscountPct}%) تلقائياً`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'en' ? `Auto-calc (${wholesaleDiscountPct}% off)` : `حساب سعر التجار تلقائياً (خصم ${wholesaleDiscountPct}%)`}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Regular Price */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-stone-800 text-xs">
                    {lang === 'en' ? 'Regular Retail Price' : 'سعر البيع العادي (قطاعي)'} <span className="text-red-500">*</span>:
                  </label>
                  <span className="text-[10px] text-stone-500 font-bold">زبائن المتجر</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => {
                      const newPrice = e.target.value;
                      setPrice(newPrice);
                      if (!wholesalePrice || wholesalePrice === '0') {
                        const p = parseFloat(newPrice) || 0;
                        setWholesalePrice(String(Math.round(p * (1 - (wholesaleDiscountPct || 15) / 100))));
                      }
                    }}
                    placeholder="150"
                    className="w-full p-2.5 pr-8 rounded-xl border border-stone-300 font-mono font-black text-base text-stone-900 bg-white focus:outline-hidden focus:border-brand-500"
                  />
                  <span className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3 font-bold text-stone-400 text-xs`}>
                    ج.م
                  </span>
                </div>
              </div>

              {/* Merchant Wholesale Price */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-extrabold text-amber-950 text-xs">
                    {lang === 'en' ? 'Merchant / Wholesale Price' : 'سعر بيع التجار (جملة)'} <span className="text-red-500">*</span>:
                  </label>
                  <span className="text-[10px] text-amber-800 font-bold">للتجار والكانتين</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    placeholder="128"
                    className="w-full p-2.5 pr-8 rounded-xl border border-amber-300 font-mono font-black text-base text-amber-900 bg-white focus:outline-hidden focus:border-amber-500 shadow-xs"
                  />
                  <span className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3 font-bold text-amber-600 text-xs`}>
                    ج.م
                  </span>
                </div>
                {parsedPrice > 0 && parsedWholesalePrice > 0 && (
                  <div className="mt-1 text-[11px] text-amber-800 font-bold flex items-center justify-between">
                    <span>خصم التاجر: {Math.max(0, parsedPrice - parsedWholesalePrice)} ج.م</span>
                    <span className="font-mono">
                      (نسبة: {Math.round(((parsedPrice - parsedWholesalePrice) / parsedPrice) * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Unit Packaging & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-stone-800 block mb-1">
                {lang === 'en' ? 'Portion & Unit' : 'بيان الوحدة والتعبئة'}:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="مثال: طبق نصف كيلو مصبع"
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-brand-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {UNIT_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setUnit(preset)}
                    className="text-[10px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-0.5 rounded-md"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-extrabold text-stone-800 block mb-1">
                {lang === 'en' ? 'Estimated Weight (Kg)' : 'الوزن التقديري للشحن (كجم)'}:
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="0.5"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono bg-white focus:outline-hidden focus:border-brand-500"
                />
                <Scale className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-3`} />
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                {WEIGHT_PRESETS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightKg(w)}
                    className="text-[10px] font-mono bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-0.5 rounded-md"
                  >
                    {w} كجم
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Description & Preparation Tips */}
          <div>
            <label className="font-extrabold text-stone-800 block mb-1">
              {lang === 'en' ? 'Description & Cooking Tips' : 'الوصف وطريقة التسوية والحفظ'}:
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب وصفاً شهياً ومكونات التتبيلة، وطريقة التسوية (مثلاً: توضع في الفرن 20 دقيقة على درجة حرارة 180°C أو في الإيرفراير...)"
              className="w-full p-3 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-brand-500 leading-relaxed"
            />
          </div>

          {/* Section 6: Options & Badges */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
            <span className="font-extrabold text-stone-800 block mb-2">
              {lang === 'en' ? 'Dish Badges & Visibility' : 'خيارات الظهور والوسوم'}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer font-bold text-stone-700 hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isFasting}
                  onChange={(e) => setIsFasting(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px]">أكل صيامي / نباتي 🌱</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer font-bold text-stone-700 hover:border-purple-300 transition-colors">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-[11px]">سبشيال لفترة محدودة 🔥</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer font-bold text-amber-800 hover:border-amber-300 transition-colors">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-[11px]">إخفاء من المتجر مؤقتاً 👁️‍🗨️</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold transition-colors"
            >
              {lang === 'en' ? 'Cancel' : 'إلغاء'}
            </button>

            <button
              type="submit"
              disabled={isCompressing}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>
                {isEditing 
                  ? (lang === 'en' ? 'Save All Dish Changes' : 'حفظ تعديلات الصنف بالكامل ✓') 
                  : (lang === 'en' ? 'Add Dish to Store' : 'إضافة الصنف للمتجر والمنيو ➕')}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
