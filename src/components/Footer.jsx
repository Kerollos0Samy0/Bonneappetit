import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="bg-stone-900 text-stone-300 text-xs py-8 px-4 border-t border-stone-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Slogan */}
        <div className="text-center md:text-right space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-base font-black text-white">{BUSINESS_INFO.nameAr}</span>
            <span className="text-xs text-stone-400 font-sans">{BUSINESS_INFO.name}</span>
          </div>
          <p className="text-stone-400 text-xs">
            {BUSINESS_INFO.slogan}
          </p>
        </div>

        {/* Prominent Contact */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg transition-colors border border-stone-700"
          >
            <Phone className="w-4 h-4 text-brand-400" />
            <span>هاتف بونابيتي: <strong className="font-mono text-sm">{BUSINESS_INFO.phoneDisplay}</strong></span>
          </a>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent('مرحباً بونابيتي')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب المبيعات</span>
          </a>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-stone-800/80 text-center text-stone-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© {new Date().getFullYear()} بونابيتي (Bonne Appetit). جميع الحقوق محفوظة.</span>
        <span>حفظ وتخزين مجمد بدرجة {BUSINESS_INFO.storageTemp}</span>
      </div>
    </footer>
  );
}
