import React, { useState, useEffect } from 'react';
import { X, MessageCircle, CheckCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  currentUser,
  wholesaleDiscountPct,
  onSaveOrderToAdmin,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar
}) {
  if (!isOpen) return null;

  const isWholesale = currentUser?.role === 'wholesale';

  const [formData, setFormData] = useState({
    clientName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: '',
    deliveryDate: '',
    notes: ''
  });

  useEffect(() => {
    if (currentUser?.name) {
      setFormData((prev) => ({
        ...prev,
        clientName: prev.clientName || currentUser.name,
        phone: prev.phone || currentUser.phone
      }));
    }
  }, [currentUser]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const originalTotal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const savings = Math.max(0, originalTotal - totalAmount);

  const totalWeight = Number(
    cartItems.reduce((acc, item) => acc + (item.weightKg || 1) * item.quantity, 0).toFixed(1)
  );

  let shippingTier = lang === 'en' ? 'Standard Shipping (Calculated by address)' : 'شحن عادي (حسب العنوان)';
  if (totalWeight >= 20) {
    shippingTier = lang === 'en' ? 'Free Shipping 100% (Bonne Appetit Offer)' : 'شحن مجاني 100% (عرض بونابيتي)';
  } else if (totalWeight >= 10) {
    shippingTier = lang === 'en' ? '50% Off Shipping (Bonne Appetit Offer)' : 'خصم 50% على الشحن (عرض بونابيتي)';
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone || !formData.address) {
      alert(lang === 'en' ? 'Please enter name, phone, and delivery address to proceed' : 'يرجى كتابة الاسم ورقم الموبايل والعنوان للمتابعة');
      return;
    }

    const orderId = 'BN-' + Math.floor(100000 + Math.random() * 900000);

    // Format the official WhatsApp Message sent directly to Bonne Appetit
    const isEn = lang === 'en';
    let msg = isEn 
      ? `*New Order Request — Bonne Appetit*\n`
      : `*طلب أوردر جديد — بونابيتي (Bonne Appetit)*\n`;
    msg += `------------------------------------\n`;
    msg += `• *${isEn ? 'Order #' : 'رقم الطلب'}:* ${orderId}\n`;
    msg += `• *${isEn ? 'Customer' : 'العميل'}:* ${formData.clientName}\n`;
    msg += `• *${isEn ? 'Phone' : 'الموبايل'}:* ${formData.phone}\n`;
    if (isWholesale) {
      msg += `• *${isEn ? 'Account' : 'نوع الحساب'}:* ${isEn ? `Wholesale Merchant (${wholesaleDiscountPct}% Discount)` : `تاجر جملة معتمد (خصم ${wholesaleDiscountPct}%)`}\n`;
    } else {
      msg += `• *${isEn ? 'Account' : 'نوع الحساب'}:* ${isEn ? 'Retail Client' : 'عميل قطاعي'}\n`;
    }
    msg += `• *${isEn ? 'Delivery Address' : 'عنوان التسليم'}:* ${formData.address}\n`;
    if (formData.deliveryDate) {
      msg += `• *${isEn ? 'Requested Time' : 'الموعد المطلوب'}:* ${formData.deliveryDate}\n`;
    }

    msg += `\n*${isEn ? 'Ordered Dishes' : 'الأصناف المطلوبة'}:*\n`;
    cartItems.forEach((item, index) => {
      const itemWeight = (item.weightKg * item.quantity).toFixed(1);
      const unitLabel = item.unit || (isEn ? 'tray' : 'طبق');
      msg += `${index + 1}) ${item.name} × ${item.quantity} ${unitLabel} — ${item.price * item.quantity} ${isEn ? 'EGP' : 'ج.م'} [${itemWeight} ${isEn ? 'kg' : 'كجم'}]\n`;
    });

    msg += `------------------------------------\n`;
    msg += `• *${isEn ? 'Total Weight' : 'إجمالي وزن الشحنة'}:* ${totalWeight} ${isEn ? 'kg' : 'كجم'}\n`;
    msg += `• *${isEn ? 'Shipping' : 'الشحن'}:* ${shippingTier}\n`;

    if (isWholesale && savings > 0) {
      msg += `• *${isEn ? 'Original Subtotal' : 'السعر قبل الخصم'}:* ${originalTotal} ${isEn ? 'EGP' : 'ج.م'}\n`;
      msg += `• *${isEn ? 'Wholesale Discount' : 'خصم الجملة'} (${wholesaleDiscountPct}%):* -${savings} ${isEn ? 'EGP' : 'ج.م'}\n`;
      msg += `• *${isEn ? 'Total Due' : 'المطلوب سداده بعد الخصم'}:* ${totalAmount} ${isEn ? 'EGP' : 'جنيه مصري'}\n`;
    } else {
      msg += `• *${isEn ? 'Total Due' : 'إجمالي الفاتورة المطلوبة'}:* ${totalAmount} ${isEn ? 'EGP' : 'جنيه مصري'}\n`;
    }

    if (formData.notes && formData.notes.trim()) {
      msg += `• *${isEn ? 'Notes' : 'ملاحظات'}:* ${formData.notes.trim()}\n`;
    }

    msg += `------------------------------------\n`;
    msg += isEn
      ? `*Please confirm order receipt and coordinate delivery schedule.*`
      : `*برجاء تأكيد استلام الأوردر وتحديد موعد خروج المندوب والتسليم.*`;

    // Construct direct WhatsApp link to Bonne Appetit official phone
    const url = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    // Save order into Admin records
    if (onSaveOrderToAdmin) {
      onSaveOrderToAdmin({
        id: orderId,
        date: new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US'),
        clientName: formData.clientName,
        phone: formData.phone,
        address: formData.address,
        isWholesale: isWholesale,
        discountPct: isWholesale ? wholesaleDiscountPct : 0,
        itemsCount: cartItems.length,
        itemsSummary: cartItems.map((i) => `${i.name} (x${i.quantity})`).join(', '),
        totalWeight: totalWeight,
        totalAmount: totalAmount,
        status: 'جديد'
      });
    }

    setIsSubmitted(true);
    onOrderSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative my-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-600`}
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-stone-900">
              {lang === 'en' ? 'Order Sent to WhatsApp!' : 'تم إرسال الأوردر لواتساب بونابيتي!'}
            </h3>
            <p className="text-xs text-stone-600">
              {lang === 'en' ? 'Your order details were sent directly to WhatsApp:' : 'تم إرسال تفاصيل طلبك مباشرة على واتساب رقم:'}
              <br />
              <strong className="font-mono text-stone-900 text-sm mt-1 inline-block" dir="ltr">
                {BUSINESS_INFO.phoneDisplay}
              </strong>
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-stone-900 text-white text-xs font-bold px-6 py-2 rounded-lg"
            >
              {lang === 'en' ? 'Return to Store' : 'العودة للمتجر'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-stone-900">{t.checkoutTitle}</h2>
                {isWholesale && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                    {t.wholesaleBadge} (-{wholesaleDiscountPct}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {t.total} <strong>{totalAmount} {t.currency}</strong> ({totalWeight} {t.kg})
                {isWholesale && savings > 0 && (
                  <span className="text-emerald-700 font-bold mx-2">
                    ({lang === 'en' ? `Saved ${savings} ${t.currency}` : `وفرت ${savings} ج.م خصم جملة`})
                  </span>
                )}
              </p>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  name="clientName"
                  required
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.phonePlaceholder}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t.addressPlaceholder}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Preferred Delivery Time (Optional)' : 'موعد التسليم المناسب (اختياري)'}
                </label>
                <input
                  type="text"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  placeholder={lang === 'en' ? 'e.g. Tomorrow at 2:00 PM' : 'مثال: غداً الساعة 2 ظهراً'}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {t.notes}
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.sendOrderWhatsApp} ({BUSINESS_INFO.phoneDisplay})</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-stone-500 pt-1">
                {t.orderSentNotice}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
