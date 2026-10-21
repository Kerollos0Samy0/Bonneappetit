import React from 'react';
import { Phone, ShoppingBag, Search, User, ShieldCheck, LogOut, Globe, X } from 'lucide-react';
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
    <header className="bg-white border-b border-stone-200 shadow-xs">
      {/* Top Simple Bar: Contact, Free Shipping, & Language Switcher */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 sm:py-2 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="sm:hidden font-medium text-[11px] truncate">
              🛵 {lang === 'en' ? t.mobileFreeShippingShort : (info.shippingPolicy || t.shippingPolicy)}
            </span>
            <span className="hidden sm:inline font-medium">
              🛵 {lang === 'en' ? t.shippingPolicy : (info.shippingPolicy || t.shippingPolicy)}
            </span>
            
            {/* Wholesale Merchant Active Banner */}
            {currentUser?.role === 'wholesale' && (
              <span className="bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] sm:text-[11px] animate-pulse shrink-0">
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
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Name with Official Profile Logo */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <img
              src="/images/logo.png"
              alt="Bonne Appetit"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-cover border border-stone-200 shadow-xs shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 truncate">
                  {lang === 'en' ? (BUSINESS_INFO.name) : (info.nameAr || BUSINESS_INFO.nameAr)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-stone-400 font-sans tracking-wide shrink-0">
                  {lang === 'en' ? (BUSINESS_INFO.nameAr) : (info.name || BUSINESS_INFO.name)}
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-stone-500 font-medium mt-0.5 leading-snug truncate sm:whitespace-normal">
                {lang === 'en' ? t.slogan : (info.slogan || t.slogan)}
              </p>
            </div>
          </div>

          {/* Desktop Search Input */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
              <input
                type="search"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full ${lang === 'ar' ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-1.5 text-xs bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-hidden transition-colors`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className={`absolute ${lang === 'ar' ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5`}
                  title="مسح"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Header Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 sm:gap-2 bg-stone-900 hover:bg-stone-800 active:bg-brand-600 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 touch-manipulation"
              aria-label={t.cart}
            >
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="bg-brand-500 text-white px-1.5 py-0.2 rounded-full text-[11px] font-bold min-w-[18px] text-center">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="text-stone-300 font-mono text-[11px] sm:text-xs">({cartTotal} {t.currency})</span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
            <input
              id="mobile-search-input"
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full ${lang === 'ar' ? 'pr-9 pl-8' : 'pl-9 pr-8'} py-2 text-sm bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl focus:outline-hidden transition-colors`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={`absolute ${lang === 'ar' ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1`}
                aria-label="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
