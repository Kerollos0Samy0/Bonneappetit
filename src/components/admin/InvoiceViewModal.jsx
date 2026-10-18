import React from 'react';
import { X, Printer, Share2, CheckCircle2, MessageCircle, Phone, Calendar, User, CreditCard } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/products';
import { UI_TRANSLATIONS } from '../../data/translations';

export default function InvoiceViewModal({ invoice, isOpen, onClose, lang = 'ar', t }) {
  if (!isOpen || !invoice) return null;
  const activeT = t || UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!invoice.customerPhone) {
      alert(lang === 'en' ? 'No phone number registered for this customer.' : 'لا يوجد رقم هاتف مسجل لهذا العميل لإرسال الفاتورة عبر واتساب.');
      return;
    }

    let phone = invoice.customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('01')) {
      phone = '2' + phone;
    }

    let msg = `*🧾 ${lang === 'en' ? 'Sales Invoice from Bonne Appetit' : 'فاتورة مبيعات من بونابيتي (Bonne Appetit)'}*\n`;
    msg += `------------------------------------\n`;
    msg += `📄 *${lang === 'en' ? 'Invoice #:' : 'رقم الفاتورة:'}* ${invoice.invoiceNumber}\n`;
    msg += `📅 *${lang === 'en' ? 'Date:' : 'التاريخ:'}* ${invoice.date}\n`;
    msg += `👤 *${lang === 'en' ? 'Customer:' : 'العميل:'}* ${invoice.customerName}\n`;
    msg += `💳 *${lang === 'en' ? 'Payment Method:' : 'طريقة الدفع:'}* ${invoice.paymentMethod || (lang === 'en' ? 'Cash' : 'نقدي')}\n`;
    msg += `------------------------------------\n`;
    msg += `*${lang === 'en' ? 'Items:' : 'الأصناف:'}*\n`;

    invoice.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} (${item.quantity} ${item.unit || (lang === 'en' ? 'tray' : 'طبق')}) × ${item.price} ${activeT.currency} = ${item.total} ${activeT.currency}\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💰 *${lang === 'en' ? 'Subtotal:' : 'الإجمالي الفرعي:'}* ${invoice.subtotal} ${activeT.currency}\n`;
    if (invoice.discount > 0) {
      msg += `🎁 *${lang === 'en' ? 'Discount' : 'الخصم'} (${invoice.discountPct || 0}%):* -${invoice.discount} ${activeT.currency}\n`;
    }
    if (invoice.shippingFee > 0) {
      msg += `🛵 *${lang === 'en' ? 'Shipping:' : 'الشحن:'}* +${invoice.shippingFee} ${activeT.currency}\n`;
    }
    msg += `💵 *${lang === 'en' ? 'Net Total Due:' : 'الصافي النهائي المطلوب:'}* *${invoice.total} ${activeT.currency}*\n`;
    msg += `------------------------------------\n`;
    msg += `❄️ *${lang === 'en' ? 'Storage Instructions: Keep frozen at -18°C.' : 'تعليمات الحفظ: تحفظ في الفريزر بدرجة حرارة -18°C.'}*\n`;
    msg += `📞 *${lang === 'en' ? 'Customer Service:' : 'لخدمة العملاء:'}* ${BUSINESS_INFO.phoneDisplay}\n`;
    msg += `${lang === 'en' ? 'Thank you for choosing Bonne Appetit! 🧡' : 'شكراً لتعاملكم مع بونابيتي! 🧡'}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative my-6 print:m-0 print:p-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions Bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
              {lang === 'en' ? 'Invoice Preview' : 'معاينة الفاتورة'}
            </span>
            <span className="text-xs font-mono font-bold text-stone-500">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Print Invoice' : 'طباعة الفاتورة'}</span>
            </button>

            {invoice.customerPhone && (
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Send WhatsApp' : 'إرسال واتساب'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="mt-4 p-4 sm:p-6 bg-white border border-stone-200 rounded-2xl print:border-none print:p-0">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👩‍🍳</span>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                  بونابيتي <span className="text-brand-600 font-serif text-xl">Bonne Appetit</span>
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {lang === 'en' ? 'Premium Homemade Ready-to-Cook Gourmet Meals' : BUSINESS_INFO.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-2 font-mono">
                <span>{lang === 'en' ? 'Phone:' : 'هاتف:'} {BUSINESS_INFO.phoneDisplay}</span>
                <span>•</span>
                <span>{lang === 'en' ? 'Storage:' : 'الحفظ:'} {BUSINESS_INFO.storageTemp}</span>
              </div>
            </div>

            <div className={`${lang === 'en' ? 'text-right sm:text-right' : 'text-left sm:text-left'} bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto`}>
              <span className="text-xs font-black text-brand-600 uppercase tracking-widest block">
                {lang === 'en' ? 'Official Tax / Sales Invoice' : 'فاتورة ضريبية / مبيعات'}
              </span>
              <span className="text-xl font-mono font-black text-stone-900 block mt-0.5">{invoice.invoiceNumber}</span>
              <span className="text-xs text-stone-500 block mt-1">{invoice.date}</span>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-stone-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 block uppercase">{lang === 'en' ? 'Customer Details:' : 'بيانات العميل:'}</span>
              <p className="font-extrabold text-stone-900 text-sm">{invoice.customerName}</p>
              {invoice.customerPhone && (
                <p className="text-stone-600 font-mono">📱 {invoice.customerPhone}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-stone-600">📍 {invoice.customerAddress}</p>
              )}
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                {invoice.customerType === 'wholesale' ? (lang === 'en' ? 'Approved Wholesale Merchant' : 'تاجر جملة معتمد') : (lang === 'en' ? 'Retail Client' : 'عميل قطاعي / كاش')}
              </span>
            </div>

            <div className={`space-y-1 ${lang === 'en' ? 'sm:text-right' : 'sm:text-left'}`}>
              <span className="text-[11px] font-bold text-stone-400 block uppercase">{lang === 'en' ? 'Payment Status:' : 'تفاصيل الدفع والحالة:'}</span>
              <p className="font-bold text-stone-800">
                {lang === 'en' ? 'Payment Method:' : 'طريقة الدفع:'} <span className="text-brand-600">{invoice.paymentMethod || (lang === 'en' ? 'Cash' : 'نقدي (كاش)')}</span>
              </p>
              <p className="font-bold text-stone-800">
                {lang === 'en' ? 'Payment Status:' : 'حالة السداد:'} <span className="text-emerald-600">{lang === 'en' ? 'Paid in Full ✅' : 'تم السداد بالكامل ✅'}</span>
              </p>
              {invoice.notes && (
                <p className="text-stone-500 text-[11px] mt-1 bg-amber-50/80 p-1.5 rounded border border-amber-200">
                  {lang === 'en' ? 'Notes:' : 'ملاحظات:'} {invoice.notes}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4 overflow-x-auto">
            <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-xs`}>
              <thead>
                <tr className="border-b border-stone-300 text-stone-600 font-black">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">{lang === 'en' ? 'Dish' : 'الصنف'}</th>
                  <th className="py-2.5 px-2 text-center">{lang === 'en' ? 'Qty' : 'الكمية'}</th>
                  <th className={`py-2.5 px-2 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{lang === 'en' ? 'Unit Price' : 'سعر الوحدة'}</th>
                  <th className={`py-2.5 px-2 ${lang === 'en' ? 'text-right' : 'text-left'}`}>{lang === 'en' ? 'Total' : 'الإجمالي'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-2 text-stone-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-stone-900">
                      {item.name}
                      <span className="text-[10px] text-stone-500 font-normal block">
                        {item.unit || (lang === 'en' ? 'Ready to cook tray' : 'طبق جاهز للتسوية')}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-stone-800">
                      {item.quantity}
                    </td>
                    <td className={`py-2.5 px-2 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono text-stone-700`}>
                      {item.price} {activeT.currency}
                    </td>
                    <td className={`py-2.5 px-2 ${lang === 'en' ? 'text-right' : 'text-left'} font-mono font-black text-stone-900`}>
                      {item.total} {activeT.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 pt-4 border-t-2 border-stone-800 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{lang === 'en' ? 'Subtotal:' : 'المجموع الفرعي:'}</span>
                <span className="font-mono font-bold">{invoice.subtotal} {activeT.currency}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>{lang === 'en' ? 'Discount' : 'الخصم'} ({invoice.discountPct || 0}%):</span>
                  <span className="font-mono">-{invoice.discount} {activeT.currency}</span>
                </div>
              )}

              {invoice.shippingFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>{lang === 'en' ? 'Shipping & Delivery:' : 'مصاريف الشحن والتوصيل:'}</span>
                  <span className="font-mono font-bold">+{invoice.shippingFee} {activeT.currency}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>{lang === 'en' ? 'Net Due Total:' : 'الصافي المطلوب:'}</span>
                <span className="font-mono text-base text-brand-600">{invoice.total} {activeT.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-4 border-t border-dashed border-stone-200 text-center text-[11px] text-stone-500 space-y-1">
            <p className="font-bold text-stone-700">
              {lang === 'en' ? 'Thank you for choosing Bonne Appetit Premium Homemade Meals' : 'نشكركم لاختياركم منتجات بونابيتي البيتي الفاخرة'}
            </p>
            <p>
              {lang === 'en' ? 'All our products are freshly crafted by hand to the highest cleanliness & quality standards, ready to cook.' : 'جميع منتجاتنا مصنعة يدوياً بأعلى معايير النظافة والجودة ومجهزة للتسوية الفورية.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
