import React, { useState } from 'react';
import { X, Clock, ShieldCheck, Flame, ShoppingBag, Plus, Minus, Check, Leaf } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart
}) {
  if (!product) return null;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-full flex items-center justify-center shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image Side */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-stone-100 min-h-[260px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/WhatsApp Image 2024-08-29 at 10.28.47 AM.jpeg';
              }}
            />
            {product.isFasting && (
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                <span>أكل صيامي 100%</span>
              </span>
            )}
            <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              الوزن التقديري: {product.weightKg} كجم
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-bold text-brand-600 mb-1">
                {product.unit}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                {product.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-600">{product.price}</span>
                <span className="text-sm font-bold text-stone-500">جنيه مصري</span>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Ingredients */}
              {product.ingredients && (
                <div className="mt-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <h4 className="text-xs font-bold text-stone-800 mb-1">المكونات والنظافة:</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* Cooking Guide */}
              {product.cookingTips && (
                <div className="mt-3 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                    <Flame className="w-4 h-4 text-brand-500" />
                    <span>طريقة التسوية السريعة:</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {product.cookingTips}
                  </p>
                </div>
              )}

              {/* Storage Note */}
              <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>شروط الحفظ: يحفظ مجمداً بدرجة {BUSINESS_INFO.storageTemp}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="p-2 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-stone-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((prev) => prev + 1)}
                    className="p-2 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-500 hover:bg-brand-600 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة للسلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>إضافة {qty * product.price} ج.م للسلة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
