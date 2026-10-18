import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function ProductCard({
  product,
  onAddToCart,
  currentUser,
  wholesaleDiscountPct
}) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const categoryInfo = CATEGORIES.find((c) => c.id === product.category) || {};

  // Calculate Wholesale Price if user is a logged-in wholesale merchant
  const isWholesale = currentUser?.role === 'wholesale';
  const effectivePrice = isWholesale
    ? Math.round(product.price * (1 - (wholesaleDiscountPct || 15) / 100))
    : product.price;

  const handleAdd = () => {
    onAddToCart({ ...product, price: effectivePrice, originalPrice: product.price }, qty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-400 hover:shadow-sm transition-all flex flex-col justify-between relative overflow-hidden">
      
      {/* Product Image if available */}
      {product.image && (
        <div className="w-full h-36 rounded-lg overflow-hidden mb-3 bg-stone-100 border border-stone-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Category Color Accent Dot & Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Category Tag */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryInfo.badgeStyle || 'bg-stone-100 text-stone-700'}`}>
            {categoryInfo.name || 'عام'}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Wholesale badge */}
            {isWholesale && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-black px-1.5 py-0.5 rounded">
                جملة -{wholesaleDiscountPct}%
              </span>
            )}

            {/* Fasting Badge */}
            {product.isFasting && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded flex-shrink-0">
                صيامي 🌱
              </span>
            )}

            {/* Limited Time Special Badge */}
            {product.isSpecial && (
              <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-300 font-black px-2 py-0.5 rounded flex-shrink-0">
                لفترة محدودة 🔥
              </span>
            )}
          </div>
        </div>

        <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
          {product.name}
        </h3>

        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mt-1">
          {product.description}
        </p>

        <div className="mt-2 text-[11px] text-stone-400 font-medium">
          {product.unit} • {product.weightKg} كجم
        </div>
      </div>

      {/* Price & Quantity & Add Button */}
      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div>
          {isWholesale ? (
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-400 line-through">
                {product.price} ج.م
              </span>
              <div>
                <span className="text-base sm:text-lg font-black text-amber-700">
                  {effectivePrice}
                </span>
                <span className="text-xs text-stone-500 mr-1">جنيه</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-base sm:text-lg font-black text-stone-900">
                {product.price}
              </span>
              <span className="text-xs text-stone-500 mr-1">جنيه</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Qty controls */}
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors"
              title="تقليل الكمية"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 text-xs font-bold text-stone-800 min-w-[16px] text-center">
              {qty}
            </span>
            <button
              onClick={() => setQty((prev) => prev + 1)}
              className="px-2 py-1 hover:bg-stone-200 text-stone-600 transition-colors"
              title="زيادة الكمية"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>أضف</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
