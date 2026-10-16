import React from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  currentUser,
  wholesaleDiscountPct
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

  let shippingText = 'شحن عادي (100% عميل)';
  if (totalWeight >= 20) {
    shippingText = 'شحن مجاني 100% على بونابيتي 🎁';
  } else if (totalWeight >= 10) {
    const remaining = (20 - totalWeight).toFixed(1);
    shippingText = `خصم 50% على الشحن (أضف ${remaining} كجم للشحن المجاني)`;
  } else {
    const remaining = (10 - totalWeight).toFixed(1);
    shippingText = `أضف ${remaining} كجم لخصم 50% على الشحن`;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="font-black text-stone-900 text-base">سلة الطلبات</h2>
              <span className="text-xs text-stone-500">
                {cartItems.length} صنف مختار • {totalWeight} كجم
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Shipping Indicator */}
          <div className="p-3 bg-stone-100 border-b border-stone-200 text-xs flex items-center justify-between">
            <span className="text-stone-600 font-medium">حالة الشحن:</span>
            <span className="font-bold text-stone-900">{shippingText}</span>
          </div>

          {/* Items List (No images) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 text-stone-400 space-y-2">
                <p className="text-sm font-bold text-stone-600">السلة فارغة</p>
                <p className="text-xs">اختر أصنافك من القائمة لإضافتها هنا</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.name}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {item.price} ج.م × {item.quantity} = {item.price * item.quantity} ج.م
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center border border-stone-200 rounded bg-white">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-stone-100 text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-stone-100 text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1">
                {isWholesale && savings > 0 && (
                  <>
                    <div className="flex justify-between items-baseline text-xs text-stone-500">
                      <span>إجمالي الأسعار العادية:</span>
                      <span className="line-through">{originalTotal} ج.م</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs font-bold text-amber-700">
                      <span>خصم تاجر الجملة ({wholesaleDiscountPct}%):</span>
                      <span>-{savings} ج.م</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-stone-700 font-bold">المطلوب سداده:</span>
                  <span className="text-lg font-black text-stone-900">
                    {totalAmount} جنيه مصري
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onProceedToCheckout}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 text-white py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>متابعة تأكيد الطلب</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onClearCart}
                  className="px-3 py-2.5 text-stone-500 hover:text-red-600 border border-stone-300 rounded-lg text-xs"
                  title="تفريغ السلة"
                >
                  مسح
                </button>
              </div>

              <div className="text-center text-[11px] text-stone-500 pt-1">
                للتواصل الهاتفي: <strong className="font-mono text-stone-800">{BUSINESS_INFO.phoneDisplay}</strong>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
