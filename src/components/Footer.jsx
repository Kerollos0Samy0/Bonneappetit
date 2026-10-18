import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function Footer({ onSelectCategory, lang = 'ar', t = UI_TRANSLATIONS.ar }) {
  return (
    <footer className="bg-stone-900 text-stone-300 text-xs py-8 px-4 border-t border-stone-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Slogan */}
        <div className={`text-center ${lang === 'ar' ? 'md:text-right' : 'md:text-left'} space-y-1`}>
          <div className={`flex items-center justify-center ${lang === 'ar' ? 'md:justify-start' : 'md:justify-start'} gap-2`}>
            <span className="text-base font-black text-white">
              {lang === 'en' ? BUSINESS_INFO.name : BUSINESS_INFO.nameAr}
            </span>
            <span className="text-xs text-stone-400 font-sans">
              {lang === 'en' ? BUSINESS_INFO.nameAr : BUSINESS_INFO.name}
            </span>
          </div>
          <p className="text-stone-400 text-xs max-w-md">
            {t.footerAboutDesc}
          </p>
        </div>

        {/* Prominent Contact */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg transition-colors border border-stone-700"
          >
            <Phone className="w-4 h-4 text-brand-400" />
            <span>{t.orderPhone} <strong className="font-mono text-sm" dir="ltr">{BUSINESS_INFO.phoneDisplay}</strong></span>
          </a>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(lang === 'en' ? 'Hello Bonne Appetit' : 'مرحباً بونابيتي')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{lang === 'en' ? 'Sales WhatsApp' : 'واتساب المبيعات'}</span>
          </a>
        </div>

      </div>

      <div className="max-w-6xl mx-auto mt-6 pt-4 border-t border-stone-800/80 text-center text-stone-500 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>{t.allRightsReserved} {new Date().getFullYear()}</span>
        <span>{lang === 'en' ? `Frozen Storage at ${BUSINESS_INFO.storageTemp}` : `حفظ وتخزين مجمد بدرجة ${BUSINESS_INFO.storageTemp}`}</span>
      </div>
    </footer>
  );
}
