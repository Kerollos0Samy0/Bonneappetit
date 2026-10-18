import React from 'react';
import { Phone, ShoppingBag, Search, User, ShieldCheck, LogOut, Globe } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function Header({
  cartCount,
  cartTotal,
  onOpenCart,
  searchTerm,
  onSearchChange,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
  wholesaleDiscountPct,
  businessInfo = BUSINESS_INFO,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar,
  onToggleLang
}) {
  const info = businessInfo || BUSINESS_INFO;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Simple Bar: Contact, Free Shipping, & Language Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <span>🛵 {lang === 'en' ? t.shippingPolicy : (info.shippingPolicy || t.shippingPolicy)}</span>
            
            {/* Wholesale Merchant Active Banner */}
            {currentUser?.role === 'wholesale' && (
              <span className="bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[11px] animate-pulse">
                🏷️ {t.wholesaleDiscountActive} ({wholesaleDiscountPct}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Phone direct call */}
            <a
              href={`tel:${info.phone}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              <span>{t.orderPhone} <strong className="font-mono text-white text-sm" dir="ltr">{info.phoneDisplay || info.phone}</strong></span>
            </a>

            {/* Language Switcher Button */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors shadow-xs"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{t.langToggleLabel}</span>
            </button>

            {/* Auth / Account Link */}
            {currentUser?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdmin}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.adminDashboard}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-white transition-colors"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : currentUser?.role === 'wholesale' ? (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">
                  {t.welcomeUser} {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-white text-[11px] underline"
                >
                  ({t.logout})
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors font-semibold"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>{t.wholesaleLogin}</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Name with Official Profile Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/images/logo.png"
              alt="Bonne Appetit"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-stone-200 shadow-sm shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-black text-stone-900">
                  {lang === 'en' ? (BUSINESS_INFO.name) : (info.nameAr || BUSINESS_INFO.nameAr)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-stone-400 font-sans tracking-wide">
                  {lang === 'en' ? (BUSINESS_INFO.nameAr) : (info.name || BUSINESS_INFO.name)}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-stone-500 font-medium mt-1 leading-relaxed tracking-wide">
                {lang === 'en' ? t.slogan : (info.slogan || t.slogan)}
              </p>
            </div>
          </div>

          {/* Clean Search Input */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 text-xs bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-lg focus:outline-hidden transition-colors`}
              />
            </div>
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-lg font-bold text-xs transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.cart}</span>
              {cartCount > 0 && (
                <span className="bg-brand-500 text-white px-1.5 py-0.2 rounded text-[11px] font-bold">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="text-stone-300 font-mono">({cartTotal} {t.currency})</span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-hidden`}
            />
          </div>
        </div>

      </div>
    </header>
  );
}
