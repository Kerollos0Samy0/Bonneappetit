import React, { useRef, useState } from 'react';
import { 
  X, Printer, MessageCircle, Copy, Check, FileText, 
  Phone, MapPin, Calendar, User, ShieldCheck, Download, Award
} from 'lucide-react';
import { BUSINESS_INFO } from '../../data/products';
import { numberToWordsArabic } from '../../data/adminDefaults';

export default function A4QuotationModal({ 
  documentData, 
  isOpen, 
  onClose, 
  lang = 'ar' 
}) {
  if (!isOpen || !documentData) return null;

  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  // Normalize data whether it's an Invoice or a Store Order
  const isInvoice = !!documentData.invoiceNumber;
  const docNumber = documentData.invoiceNumber || documentData.id || 'QOT-' + Date.now();
  const docDate = documentData.date || new Date().toLocaleDateString('ar-EG');
  const customerName = documentData.customerName || documentData.clientName || 'عميل كرام';
  const customerPhone = documentData.customerPhone || documentData.phone || '';
  const customerAddress = documentData.customerAddress || documentData.address || '';
  const deliveryDate = documentData.deliveryDate || documentData.requestedTime || '';
  const isWholesale = documentData.customerType === 'wholesale' || documentData.isWholesale || false;
  const discountPct = documentData.discountPct || 0;
  
  // Normalize items array
  const items = (documentData.items && Array.isArray(documentData.items)) 
    ? documentData.items 
    : (documentData.cartItems || []);

  const subtotal = documentData.subtotal !== undefined 
    ? documentData.subtotal 
    : (documentData.totalAmount || 0);

  const discount = documentData.discount !== undefined 
    ? documentData.discount 
    : (isWholesale && discountPct > 0 ? Math.round((subtotal * discountPct) / (100 - discountPct)) : 0);

  const shippingFee = documentData.shippingFee || 0;
  const totalAmount = documentData.total !== undefined ? documentData.total : (documentData.totalAmount || subtotal);
  const notes = documentData.notes || '';

  const tafqeetText = numberToWordsArabic(totalAmount);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone;
    }

    let msg = `*🧾 عرض سعر رسمي وتأكيد طلب — بونابيتي (Bonne Appetit)*\n`;
    msg += `------------------------------------\n`;
    msg += `📄 *رقم المستند:* ${docNumber}\n`;
    msg += `📅 *التاريخ:* ${docDate}\n`;
    msg += `👤 *العميل:* ${customerName}\n`;
    if (customerPhone) msg += `📞 *الموبايل:* ${customerPhone}\n`;
    if (customerAddress) msg += `📍 *عنوان التسليم:* ${customerAddress}\n`;
    if (deliveryDate) msg += `⏰ *موعد التسليم:* ${deliveryDate}\n`;
    msg += `------------------------------------\n`;
    msg += `*الأصناف المطلوبة:*\n`;

    if (items.length > 0) {
      items.forEach((item, idx) => {
        const itemTotal = item.total || (item.price * item.quantity);
        msg += `${idx + 1}) ${item.name} (${item.quantity} ${item.unit || 'طبق'}) × ${item.price} ج.م = ${itemTotal} ج.م\n`;
      });
    } else if (documentData.itemsSummary) {
      msg += `• ${documentData.itemsSummary}\n`;
    }

    msg += `------------------------------------\n`;
    if (discount > 0) {
      msg += `• *الخصم (${discountPct}%):* -${discount} ج.م\n`;
    }
    if (shippingFee > 0) {
      msg += `• *الشحن والتوصيل:* +${shippingFee} ج.م\n`;
    }
    msg += `💰 *الإجمالي المستحق:* *${totalAmount} ج.م*\n`;
    msg += `(${tafqeetText})\n`;
    msg += `------------------------------------\n`;
    msg += `❄️ *تعليمات الحفظ:* تحفظ في الفريزر مجمدة بدرجة -18°C جاهزة للتسوية الفورية.\n`;
    msg += `📞 *خدمة العملاء:* ${BUSINESS_INFO.phoneDisplay}\n`;
    msg += `*مطبخ وتجهيزات بونابيتي يتمنى لكم وجبة شهية!* 🧡`;

    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  // Copy text summary
  const handleCopyText = () => {
    let text = `عرض سعر رسمي وتأكيد طلب — بونابيتي (Bonne Appetit)\n`;
    text += `رقم: ${docNumber} | تاريخ: ${docDate}\n`;
    text += `العميل: ${customerName} | هاتف: ${customerPhone}\n`;
    text += `العنوان: ${customerAddress}\n\n`;
    text += `الأصناف:\n`;
    if (items.length > 0) {
      items.forEach((item, idx) => {
        const itemTotal = item.total || (item.price * item.quantity);
        text += `${idx + 1}. ${item.name} x ${item.quantity} = ${itemTotal} ج.م\n`;
      });
    } else if (documentData.itemsSummary) {
      text += documentData.itemsSummary + '\n';
    }
    text += `\nالإجمالي النهائي: ${totalAmount} ج.م\n`;
    text += `(${tafqeetText})\n`;
    text += `هاتف الطلبات: ${BUSINESS_INFO.phoneDisplay}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      
      {/* Modal Container */}
      <div 
        dir="rtl"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 relative my-4 flex flex-col max-h-[96vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:my-0 print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
              A4
            </span>
            <div>
              <h3 className="text-sm font-black">
                {isInvoice ? 'عرض سعر / فاتورة معتمدة A4' : 'عرض سعر وتأكيد طلب عميل A4'}
              </h3>
              <p className="text-[11px] text-stone-400 font-mono">
                {docNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
              title="طباعة على ورق A4 أو الحفظ كـ PDF"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة A4 / PDF</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
              title="مشاركة تفاصيل العرض مع العميل على واتساب"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال واتساب</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all border border-stone-700"
              title="نسخ نص العرض"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area on Screen / Full Printable Page */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/70 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Authenticated A4 Paper Sheet */}
          <div 
            ref={printRef}
            className="a4-document-sheet bg-white max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-10 shadow-lg border border-stone-200 rounded-2xl print:border-none print:shadow-none print:p-0 print:max-w-none print:rounded-none flex flex-col justify-between"
          >
            
            {/* Top Official Header with Logo & Brand Data */}
            <div>
              <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-4">
                  <img
                    src="/images/logo.png"
                    alt="Bonne Appetit"
                    className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 p-0.5 shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                      {BUSINESS_INFO.nameAr}
                    </h1>
                    <span className="text-xs font-bold font-sans text-brand-600 tracking-wider uppercase block">
                      {BUSINESS_INFO.name} — HOMEMADE GOURMET
                    </span>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {BUSINESS_INFO.slogan}
                    </p>
                  </div>
                </div>

                {/* Document Type Badge & Identification */}
                <div className="text-left">
                  <div className="inline-block bg-stone-900 text-white px-4 py-1 rounded-xl text-xs font-black shadow-xs mb-2">
                    {isInvoice ? 'فاتورة مبيعات معتمدة' : 'عرض سعر وتأكيد طلب'}
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div className="text-stone-700 font-bold">
                      رقم: <strong className="text-brand-600 font-black">{docNumber}</strong>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      التاريخ: <strong>{docDate}</strong>
                    </div>
                    <div className="text-[10px] text-stone-400">
                      القاهرة والجيزة - شحن سريع
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Order Metadata Box */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-stone-500">العميل / المنشأة:</span>
                    <strong className="text-stone-900 font-bold">{customerName}</strong>
                  </div>
                  {customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="text-stone-500">رقم الهاتف:</span>
                      <strong className="text-stone-900 font-mono" dir="ltr">{customerPhone}</strong>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">نوع الحساب:</span>
                    {isWholesale ? (
                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300">
                        تاجر جملة معتمد (خصم {discountPct}%)
                      </span>
                    ) : (
                      <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        عميل قطاعي
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 sm:border-r sm:border-stone-200 sm:pr-4">
                  {customerAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 block">عنوان التوصيل:</span>
                        <strong className="text-stone-900 leading-relaxed font-bold">{customerAddress}</strong>
                      </div>
                    </div>
                  )}
                  {deliveryDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="text-stone-500">الموعد المطلوب:</span>
                      <strong className="text-stone-900 font-bold">{deliveryDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mt-5 border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-900 text-white font-black">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">بيان الصنف والوجبة البيتي</th>
                      <th className="p-3 w-20 text-center">الكمية</th>
                      <th className="p-3 w-20 text-center">الوحدة</th>
                      <th className="p-3 w-28 text-center">سعر الوحدة</th>
                      <th className="p-3 w-28 text-left pl-4">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {items.length > 0 ? (
                      items.map((item, index) => {
                        const itemPrice = item.price || 0;
                        const itemQty = item.quantity || 1;
                        const itemTotal = item.total || (itemPrice * itemQty);
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}>
                            <td className="p-3 text-center font-mono text-stone-400 font-bold">{index + 1}</td>
                            <td className="p-3 font-bold text-stone-900">
                              {item.name}
                              {item.weightKg && (
                                <span className="text-[10px] text-stone-400 font-normal mr-2">
                                  ({(item.weightKg * itemQty).toFixed(1)} كجم)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center font-mono font-black text-stone-900 text-sm">
                              {itemQty}
                            </td>
                            <td className="p-3 text-center text-stone-500">
                              {item.unit || 'طبق'}
                            </td>
                            <td className="p-3 text-center font-mono">
                              {itemPrice} ج.م
                            </td>
                            <td className="p-3 text-left pl-4 font-mono font-black text-stone-900">
                              {itemTotal} ج.م
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-stone-500">
                          {documentData.itemsSummary || 'تفاصيل الأصناف مسجلة بالطلب'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tafqeet Summary */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Notes & Tafqeet */}
                <div className="sm:col-span-7 space-y-2">
                  <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs">
                    <span className="text-stone-500 block font-bold mb-1">المبلغ الإجمالي بالحروف (تفقيط رسمي):</span>
                    <strong className="text-amber-950 font-black text-sm block">
                      {tafqeetText}
                    </strong>
                  </div>

                  {notes && (
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
                      <span className="text-stone-500 block font-bold mb-0.5">ملاحظات خاصة بالتسليم:</span>
                      <p className="text-stone-700 leading-relaxed font-medium">{notes}</p>
                    </div>
                  )}

                  {/* Storage Notice */}
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 text-[11px] text-blue-900 font-medium">
                    <span>❄️</span>
                    <span>تحفظ جميع المنتجات مجمدة بالفريزر بدرجة حرارة <strong>(-18°C)</strong> صالحة للتسوية الفورية.</span>
                  </div>
                </div>

                {/* Financial Totals */}
                <div className="sm:col-span-5 bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>المجموع الفرعي:</span>
                    <span className="font-mono font-bold text-stone-900">{subtotal} ج.م</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 font-bold">
                      <span>خصم الجملة ({discountPct}%):</span>
                      <span className="font-mono">-{discount} ج.م</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-stone-600">
                    <span>رسوم الشحن والتوصيل:</span>
                    <span className="font-mono font-bold">
                      {shippingFee > 0 ? `${shippingFee} ج.م` : 'شحن مجاني 🎁'}
                    </span>
                  </div>

                  <div className="border-t-2 border-stone-300 pt-2 flex justify-between items-center">
                    <span className="text-sm font-black text-stone-900">المطلوب سداده:</span>
                    <span className="text-lg font-black font-mono text-brand-600">
                      {totalAmount} ج.م
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Footer with Seal Stamp & Contact */}
            <div className="mt-8 pt-4 border-t-2 border-stone-200 flex items-end justify-between text-xs text-stone-600">
              <div className="space-y-1">
                <p className="font-bold text-stone-900">
                  مطبخ وتجهيزات بونابيتي (Bonne Appetit)
                </p>
                <p className="text-[11px] text-stone-500">
                  📞 هاتف الطلبات والمبيعات: <strong className="font-mono text-stone-800" dir="ltr">{BUSINESS_INFO.phoneDisplay}</strong>
                </p>
                <p className="text-[11px] text-stone-500">
                  💬 واتساب الاستفسارات: <strong className="font-mono text-stone-800" dir="ltr">{BUSINESS_INFO.phoneDisplay}</strong>
                </p>
                <p className="text-[10px] text-stone-400">
                  هذا المستند صادر إلكترونياً ومعتمد رسمياً من إدارة بونابيتي.
                </p>
              </div>

              {/* Official Stamp Simulation */}
              <div className="border-2 border-brand-600/60 rounded-full w-24 h-24 p-1.5 flex flex-col items-center justify-center text-center text-brand-700 font-black rotate-[-6deg] select-none shadow-xs shrink-0 bg-brand-50/40">
                <Award className="w-5 h-5 text-brand-600 mb-0.5" />
                <span className="text-[9px] uppercase tracking-wider font-mono">Bonne Appetit</span>
                <span className="text-[10px] leading-tight font-black">معتمد رسمي</span>
                <span className="text-[8px] font-mono text-stone-500">APPROVED</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
