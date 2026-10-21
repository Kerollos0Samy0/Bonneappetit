import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, Edit3 } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function ProductCard({
  product,
  onAddToCart,
  currentUser,
  wholesaleDiscountPct,
  onEditProduct,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar
}) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const categoryInfo = CATEGORIES.find((c) => c.id === product.category) || {};
  const categoryDisplayName = lang === 'en' ? (categoryInfo.label || categoryInfo.name) : (categoryInfo.name || 'عام');

  // Calculate Wholesale Price if user is a logged-in wholesale merchant
  const isWholesale = currentUser?.role === 'wholesale';
  const effectivePrice = isWholesale
    ? (product.wholesalePrice !== undefined && product.wholesalePrice !== null && Number(product.wholesalePrice) > 0
        ? Number(product.wholesalePrice)
        : Math.round(product.price * (1 - (wholesaleDiscountPct || 15) / 100)))
    : product.price;

  const discountPercent = isWholesale && product.price > effectivePrice
    ? Math.round(((product.price - effectivePrice) / product.price) * 100)
    : (wholesaleDiscountPct || 15);

  const handleAdd = () => {
    onAddToCart({ ...product, price: effectivePrice, originalPrice: product.price }, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-4 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
      
      {/* Product Image if available */}
      {product.image && (
        <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-3 bg-stone-100 border border-stone-200 relative">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Category Color Accent Dot & Tag */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2">
          {/* Category Tag */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${categoryInfo.badgeStyle || 'bg-stone-100 text-stone-700'}`}>
            {categoryDisplayName}
          </span>

          <div className="flex items-center gap-1">
            {/* Wholesale badge */}
            {isWholesale && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-black px-1.5 py-0.5 rounded-md">
                {t.wholesaleBadge} -{discountPercent}%
              </span>
            )}

            {/* Fasting Badge */}
            {product.isFasting && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md shrink-0">
                {t.fastingBadge}
              </span>
            )}

            {/* Limited Time Special Badge */}
            {product.isSpecial && (
              <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 font-black px-2 py-0.5 rounded-md shrink-0">
                {t.specialBadge}
              </span>
            )}

            {/* Admin Direct Edit Button */}
            {currentUser?.role === 'admin' && onEditProduct && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                className="text-[10px] bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-stone-700 flex items-center gap-1 shadow-xs transition-colors shrink-0"
                title={lang === 'en' ? 'Edit Dish as Admin' : 'تعديل السعر والصورة والبيانات كمسؤول'}
              >
                <Edit3 className="w-2.5 h-2.5 text-amber-400" />
                <span>{lang === 'en' ? 'Edit' : 'تعديل'}</span>
              </button>
            )}
          </div>
        </div>

        <h3 className="font-black text-stone-900 text-sm sm:text-base leading-snug">
          {product.name}
        </h3>

        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mt-1">
          {product.description}
        </p>

        <div className="mt-2 text-[11px] text-stone-400 font-medium">
          {product.unit} • {product.weightKg} {t.kg}
        </div>
      </div>

      {/* Price & Quantity & Add Button */}
      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div>
          {isWholesale ? (
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-400 line-through">
                {product.price} {t.currency}
              </span>
              <div>
                <span className="text-base sm:text-lg font-black text-amber-700">
                  {effectivePrice}
                </span>
                <span className="text-xs text-stone-500 mx-1">{t.currency}</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-base sm:text-lg font-black text-stone-900">
                {product.price}
              </span>
              <span className="text-xs text-stone-500 mx-1">{t.currency}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Qty controls with comfortable mobile touch targets */}
          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-700 transition-colors touch-manipulation"
              title={lang === 'ar' ? 'تقليل الكمية' : 'Decrease Quantity'}
              aria-label="تقليل"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs sm:text-sm font-bold text-stone-900 min-w-[20px] text-center font-mono">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((prev) => prev + 1)}
              className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-stone-200 active:bg-stone-300 text-stone-700 transition-colors touch-manipulation"
              title={lang === 'ar' ? 'زيادة الكمية' : 'Increase Quantity'}
              aria-label="زيادة"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add button with tactile mobile touch response */}
          <button
            type="button"
            onClick={handleAdd}
            className={`h-9 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 touch-manipulation shadow-xs ${
              justAdded
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-stone-900 hover:bg-stone-800 active:bg-brand-600 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-brand-400" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
