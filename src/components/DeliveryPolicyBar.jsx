import React from 'react';
import { Truck, Percent, Gift, Info } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function DeliveryPolicyBar() {
  return (
    <section className="bg-amber-50/60 border-y border-amber-200/80 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                سياسة الشحن الذكية عبر أوبر (وفر مع زيادة وزن الطلب)
              </h2>
              <p className="text-xs text-stone-600">
                كلما زاد وزن أوردرك، شاركتك بونابيتي في تكلفة الرحلة حتى الشحن المجاني التام!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-100/80 px-3 py-1 rounded-full border border-brand-200">
            تطبق على رحلات أوبر الفعالة
          </span>
        </div>

        {/* 3 Tiers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tier 1 */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center font-black text-sm">
              1
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-500">أقل من 10 كجم</span>
              </div>
              <p className="text-sm font-extrabold text-stone-800">
                100% مساهمة العميل
              </p>
              <p className="text-[11px] text-stone-500">سعر رحلة أوبر العادية</p>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-br">
              خصم 50%
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-800">10 إلى 19.9 كجم</span>
              </div>
              <p className="text-sm font-extrabold text-amber-900">
                مناصفة 50% / 50%
              </p>
              <p className="text-[11px] text-stone-500">بونابيتي تتحمل نصف المشوار</p>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-emerald-50 p-3.5 rounded-xl border-2 border-emerald-500 shadow-md flex items-center gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-br">
              العرض الأقوى
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-800">20 كجم فأكثر</span>
              </div>
              <p className="text-sm font-extrabold text-emerald-700">
                شحن مجاني 100%!
              </p>
              <p className="text-[11px] text-emerald-700/80">بونابيتي تتحمل تكلفة التوصيل كاملة</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
