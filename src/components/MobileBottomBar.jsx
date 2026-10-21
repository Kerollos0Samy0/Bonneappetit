import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Leaf, 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  Phone, 
  X, 
  Globe, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function MobileBottomBar({
  cartCount,
  cartTotal,
  onOpenCart,
  onlyFasting,
  onToggleFasting,
  onSelectMenu,
  onFocusSearch,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onLogout,
  businessInfo = BUSINESS_INFO,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar,
  onToggleLang,
  activeCategory = 'all'
}) {
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const info = businessInfo || BUSINESS_INFO;
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* Contact & Quick Services Bottom Sheet */}
      {isContactSheetOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center md:hidden"
          onClick={() => setIsContactSheetOpen(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-5 shadow-2xl border-t border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-black text-stone-900">{t.contactSheetTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{info.slogan || t.slogan}</p>
              </div>
              <button
                onClick={() => setIsContactSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2.5">
              {/* WhatsApp Direct */}
              <a
                href={`https://wa.me/${info.whatsapp || BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(lang === 'en' ? 'Hello Bonne Appetit' : 'مرحباً بونابيتي، أريد الاستفسار عن قائمة الأصناف')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors active:scale-98"
                onClick={() => setIsContactSheetOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-900 block">{t.contactSheetWhatsApp}</span>
                    <span className="text-[11px] text-emerald-700 font-mono" dir="ltr">{info.phoneDisplay || info.phone}</span>
                  </div>
                </div>
                <ArrowIcon className="w-4 h-4 text-emerald-600" />
              </a>

              {/* Direct Phone Call */}
              <a
                href={`tel:${info.phone || BUSINESS_INFO.phone}`}
                className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-colors active:scale-98"
                onClick={() => setIsContactSheetOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                    <Phone className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-stone-900 block">{t.contactSheetCall}</span>
                    <span className="text-[11px] text-stone-500 font-mono" dir="ltr">{info.phoneDisplay || info.phone}</span>
                  </div>
                </div>
                <ArrowIcon className="w-4 h-4 text-stone-500" />
              </a>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => {
                  onToggleLang();
                  setIsContactSheetOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-colors active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-stone-900 block">
                      {lang === 'ar' ? 'English (تغيير للإنجليزية)' : 'العربية (Switch to Arabic)'}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {lang === 'ar' ? 'Change app language to English' : 'تغيير لغة التطبيق إلى العربية'}
                    </span>
                  </div>
                </div>
                <ArrowIcon className="w-4 h-4 text-stone-500" />
              </button>

              {/* Wholesale / Admin Access */}
              {currentUser?.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsContactSheetOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-2xl transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-brand-900 block">{t.adminDashboard}</span>
                      <span className="text-[11px] text-brand-700">{t.adminSubtitle}</span>
                    </div>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-brand-600" />
                </button>
              ) : currentUser?.role === 'wholesale' ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                      🏷️
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-950 block">{currentUser.name}</span>
                      <span className="text-[11px] text-amber-700">{t.wholesaleDiscountActive} ({currentUser.discountPct}%)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsContactSheetOpen(false);
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-bold underline px-2 py-1"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsContactSheetOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-colors active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center shadow-xs">
                      <User className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-stone-900 block">{t.contactSheetWholesale}</span>
                      <span className="text-[11px] text-stone-500">دخول أسعار الجملة، الكانتين، وإدارة المتجر</span>
                    </div>
                  </div>
                  <ArrowIcon className="w-4 h-4 text-stone-500" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsContactSheetOpen(false)}
              className="w-full py-3 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-200 transition-colors"
            >
              {t.contactSheetClose}
            </button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Container for Mobile (md:hidden) */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden pointer-events-none">
        
        {/* Floating Quick Checkout Strip (Only when cart has items) */}
        {cartCount > 0 && (
          <div className="px-3 pb-2 pointer-events-auto">
            <button
              onClick={onOpenCart}
              className="w-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 hover:from-brand-700 hover:to-amber-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between active:scale-98 transition-all animate-in slide-in-from-bottom-2 duration-200 border border-white/20"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block leading-tight">
                    {cartCount} {t.mobileItemsCount} • {cartTotal} {t.currency}
                  </span>
                  <span className="text-[10px] text-white/90">
                    اضغط لإتمام الطلب الآن
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white text-stone-900 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs">
                <span>{t.mobileQuickCheckout}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}

        {/* 5-Tab Ergonomic Bottom Navigation Bar */}
        <nav 
          className="bg-white/95 backdrop-blur-lg border-t border-stone-200 shadow-2xl px-2 pt-1.5 pb-safe pointer-events-auto flex items-center justify-around"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* TAB 1: Menu (All dishes) */}
          <button
            onClick={onSelectMenu}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeCategory === 'all' && !onlyFasting
                ? 'text-brand-600 font-black'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${activeCategory === 'all' && !onlyFasting ? 'bg-brand-50' : ''}`}>
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 leading-tight">{t.mobileNavMenu}</span>
          </button>

          {/* TAB 2: Fasting Toggle 🌱 */}
          <button
            onClick={onToggleFasting}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
              onlyFasting
                ? 'text-emerald-700 font-black'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${onlyFasting ? 'bg-emerald-100 ring-2 ring-emerald-400' : ''}`}>
              <Leaf className={`w-5 h-5 ${onlyFasting ? 'text-emerald-700' : ''}`} />
            </div>
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="text-[11px] leading-tight">{t.mobileNavFasting}</span>
              {onlyFasting && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
            </div>
          </button>

          {/* TAB 3: Cart with Badge 🛒 */}
          <button
            onClick={onOpenCart}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-700 hover:text-stone-900 transition-all relative"
          >
            <div className="relative p-1">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-scale-up">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold mt-0.5 leading-tight">
              {cartTotal > 0 ? `${cartTotal} ${t.currency}` : t.mobileNavCart}
            </span>
          </button>

          {/* TAB 4: Search 🔍 */}
          <button
            onClick={onFocusSearch}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-500 hover:text-stone-900 transition-all"
          >
            <div className="p-1">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 leading-tight">{t.mobileNavSearch}</span>
          </button>

          {/* TAB 5: Contact & More 💬 */}
          <button
            onClick={() => setIsContactSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-500 hover:text-stone-900 transition-all"
          >
            <div className="p-1">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[11px] mt-0.5 leading-tight">{t.mobileNavContact}</span>
          </button>
        </nav>

      </div>
    </>
  );
}
