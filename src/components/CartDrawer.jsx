import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/translations';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  currentUser,
  wholesaleDiscountPct,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar
}) {
  if (!isOpen) return null;

  const isWholesale = currentUser?.role === 'wholesale';
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalWeight = Number(
    cartItems.reduce((acc, item) => acc + (item.weightKg || 1) * item.quantity, 0).toFixed(1)
  );

  // If wholesale, calculate original total
  const originalTotal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const savings = Math.max(0, originalTotal - totalAmount);

  // Shipping tier message
  let shippingText = '';
  if (totalWeight >= 20) {
    shippingText = lang === 'en' 
      ? '🎉 100% Free Shipping on Bonne Appetit!'
      : 'شحن مجاني 100% على بونابيتي 🎁';
  } else if (totalWeight >= 10) {
    const remaining = (20 - totalWeight).toFixed(1);
    shippingText = lang === 'en'
      ? `🛵 50% Off Shipping (Add ${remaining} kg for Free Shipping)`
      : `خصم 50% على الشحن (أضف ${remaining} كجم للشحن المجاني)`;
  } else {
    const remaining = (10 - totalWeight).toFixed(1);
    shippingText = lang === 'en'
      ? `Add ${remaining} kg for 50% discount on shipping`
      : `أضف ${remaining} كجم لخصم 50% على الشحن`;
  }

  const BackIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0 pl-10' : 'right-0 pr-10'} max-w-full flex`}>
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-stone-900">{t.cartTitle}</h2>
              <span className="text-xs font-bold bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-mono">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl font-bold">
                  🛒
                </div>
                <h3 className="font-bold text-stone-700 text-sm">{t.emptyCartTitle}</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  {t.emptyCartDesc}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-bold text-brand-600 underline"
                >
                  {t.viewAllDishes}
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span>{item.price} {t.currency}</span>
                      <span>•</span>
                      <span>{((item.weightKg || 0.5) * item.quantity).toFixed(1)} {t.kg}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Qty controls */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden text-xs">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-stone-100 text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold font-mono">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-stone-100 text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                      title={lang === 'ar' ? 'حذف الصنف' : 'Remove item'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              
              {/* Shipping Tier Alert */}
              <div className="bg-stone-100 border border-stone-200 p-2.5 rounded-xl text-xs text-stone-700 flex items-center justify-between">
                <span>{shippingText}</span>
                <span className="font-bold font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                  {totalWeight} {t.kg}
                </span>
              </div>

              {/* Wholesale Savings if active */}
              {isWholesale && savings > 0 && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs flex justify-between font-bold">
                  <span>{lang === 'en' ? 'Wholesale Savings:' : 'وفرت كتاجر جملة:'}</span>
                  <span className="font-mono">-{savings} {t.currency}</span>
                </div>
              )}

              {/* Total Row */}
              <div className="flex items-center justify-between text-stone-900">
                <span className="text-sm font-bold">{t.total}</span>
                <span className="text-xl font-black font-mono text-stone-900">
                  {totalAmount} {t.currency}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={onProceedToCheckout}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>{t.proceedToCheckout}</span>
                  <BackIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={onClearCart}
                  className="w-full text-center text-xs text-stone-500 hover:text-red-600 py-1 font-medium transition-colors"
                >
                  {t.clearCart}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
