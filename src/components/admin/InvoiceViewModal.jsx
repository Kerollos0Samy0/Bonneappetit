import React from 'react';
import { X, Printer, Share2, CheckCircle2, MessageCircle, Phone, Calendar, User, CreditCard } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/products';

export default function InvoiceViewModal({ invoice, isOpen, onClose }) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    if (!invoice.customerPhone) {
      alert('لا يوجد رقم هاتف مسجل لهذا العميل لإرسال الفاتورة عبر واتساب.');
      return;
    }

    let phone = invoice.customerPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('01')) {
      phone = '2' + phone;
    }

    let msg = `*🧾 فاتورة مبيعات من بونابيتي (Bonne Appetit)*\n`;
    msg += `------------------------------------\n`;
    msg += `📄 *رقم الفاتورة:* ${invoice.invoiceNumber}\n`;
    msg += `📅 *التاريخ:* ${invoice.date}\n`;
    msg += `👤 *العميل:* ${invoice.customerName}\n`;
    msg += `💳 *طريقة الدفع:* ${invoice.paymentMethod || 'نقدي'}\n`;
    msg += `------------------------------------\n`;
    msg += `*الأصناف:*\n`;

    invoice.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} (${item.quantity} ${item.unit || 'طبق'}) × ${item.price} ج.م = ${item.total} ج.م\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💰 *الإجمالي الفرعي:* ${invoice.subtotal} ج.م\n`;
    if (invoice.discount > 0) {
      msg += `🎁 *الخصم (${invoice.discountPct || 0}%):* -${invoice.discount} ج.م\n`;
    }
    if (invoice.shippingFee > 0) {
      msg += `🛵 *الشحن:* +${invoice.shippingFee} ج.م\n`;
    }
    msg += `💵 *الصافي النهائي المطلوب:* *${invoice.total} جنيه مصري*\n`;
    msg += `------------------------------------\n`;
    msg += `❄️ *تعليمات الحفظ:* تحفظ في الفريزر بدرجة حرارة -18°C.\n`;
    msg += `📞 *لخدمة العملاء:* ${BUSINESS_INFO.phoneDisplay}\n`;
    msg += `شكراً لتعاملكم مع بونابيتي! 🧡`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative my-6 print:m-0 print:p-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions Bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
              معاينة الفاتورة
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
              <span>طباعة الفاتورة</span>
            </button>

            {invoice.customerPhone && (
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>إرسال واتساب</span>
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
                {BUSINESS_INFO.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-2 font-mono">
                <span>هاتف: {BUSINESS_INFO.phoneDisplay}</span>
                <span>•</span>
                <span>الحفظ: {BUSINESS_INFO.storageTemp}</span>
              </div>
            </div>

            <div className="text-left bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto">
              <span className="text-xs font-black text-brand-600 uppercase tracking-widest block">فاتورة ضريبية / مبيعات</span>
              <span className="text-xl font-mono font-black text-stone-900 block mt-0.5">{invoice.invoiceNumber}</span>
              <span className="text-xs text-stone-500 block mt-1">{invoice.date}</span>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-stone-200 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-stone-400 block uppercase">بيانات العميل:</span>
              <p className="font-extrabold text-stone-900 text-sm">{invoice.customerName}</p>
              {invoice.customerPhone && (
                <p className="text-stone-600 font-mono">📱 {invoice.customerPhone}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-stone-600">📍 {invoice.customerAddress}</p>
              )}
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                {invoice.customerType === 'wholesale' ? 'تاجر جملة معتمد' : 'عميل قطاعي / كاش'}
              </span>
            </div>

            <div className="space-y-1 sm:text-left">
              <span className="text-[11px] font-bold text-stone-400 block uppercase">تفاصيل الدفع والحالة:</span>
              <p className="font-bold text-stone-800">
                طريقة الدفع: <span className="text-brand-600">{invoice.paymentMethod || 'نقدي (كاش)'}</span>
              </p>
              <p className="font-bold text-stone-800">
                حالة السداد: <span className="text-emerald-600">تم السداد بالكامل ✅</span>
              </p>
              {invoice.notes && (
                <p className="text-stone-500 text-[11px] mt-1 bg-amber-50/80 p-1.5 rounded border border-amber-200">
                  ملاحظات: {invoice.notes}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-300 text-stone-600 font-black">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">الصنف</th>
                  <th className="py-2.5 px-2 text-center">الكمية</th>
                  <th className="py-2.5 px-2 text-left">سعر الوحدة</th>
                  <th className="py-2.5 px-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-2 text-stone-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-stone-900">
                      {item.name}
                      <span className="text-[10px] text-stone-500 font-normal block">
                        {item.unit || 'طبق جاهز للتسوية'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-stone-800">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-2 text-left font-mono text-stone-700">
                      {item.price} ج.م
                    </td>
                    <td className="py-2.5 px-2 text-left font-mono font-black text-stone-900">
                      {item.total} ج.م
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
                <span>المجموع الفرعي:</span>
                <span className="font-mono font-bold">{invoice.subtotal} ج.م</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>الخصم ({invoice.discountPct || 0}%):</span>
                  <span className="font-mono">-{invoice.discount} ج.م</span>
                </div>
              )}

              {invoice.shippingFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>مصاريف الشحن والتوصيل:</span>
                  <span className="font-mono font-bold">+{invoice.shippingFee} ج.م</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>الصافي المطلوب:</span>
                <span className="font-mono text-base text-brand-600">{invoice.total} ج.م</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 pt-4 border-t border-dashed border-stone-200 text-center text-[11px] text-stone-500 space-y-1">
            <p className="font-bold text-stone-700">نشكركم لاختياركم منتجات بونابيتي البيتي الفاخرة</p>
            <p>جميع منتجاتنا مصنعة يدوياً بأعلى معايير النظافة والجودة ومجهزة للتسوية الفورية.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
