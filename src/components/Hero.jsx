import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function Hero({ onExploreMenu }) {
  return (
    <section className="bg-white border-b border-stone-200 py-8 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        {/* Bonneappetite-Cover2 Image placed at the top */}
        <div className="flex justify-center pb-1">
          <img
            src="/images/cover2.png"
            alt="Bonne Appetit - Special, Fish, Chicken, Beef, Vegan"
            className="h-14 sm:h-20 md:h-24 w-auto object-contain max-w-full"
          />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
          أكلات بيتي وتجهيزات فاخرة جاهزة للتسوية
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          سبشيال بونابيتي، لحوم ودواجن متبلة، أسماك طازجة، وقسم خضار ونباتي متكامل. جاهز للتسوية الفورية لتوفير وقتك ومجهودك.
        </p>

        {/* Minimal Info Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-700">
          <span className="bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
            🛵 شحن مجاني عند 20 كجم
          </span>
          <span className="bg-stone-100 px-3 py-1 rounded-md border border-stone-200">
            ❄️ حفظ مجمد -18°C
          </span>
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-1.5 bg-stone-900 text-white px-3 py-1 rounded-md hover:bg-stone-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-brand-400" />
            <span>للطلب المباشر: <strong className="font-mono text-sm">{BUSINESS_INFO.phoneDisplay}</strong></span>
          </a>
          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent('مرحباً بونابيتي، أريد الاستفسار وطلب أوردر')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-emerald-700 text-white px-3 py-1 rounded-md hover:bg-emerald-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>طلب واتساب</span>
          </a>
        </div>
      </div>
    </section>
  );
}
