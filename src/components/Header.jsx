import React from 'react';
import { Phone, MessageCircle, ShoppingBag, Search, User, ShieldCheck, LogOut } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

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
  wholesaleDiscountPct
}) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top Simple Bar: Contact, Free Shipping, & User Account */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3">
            <span>🛵 شحن مجاني للطلبات من 20 كجم | خصم 50% من 10 كجم</span>
            
            {/* Wholesale Merchant Active Banner */}
            {currentUser?.role === 'wholesale' && (
              <span className="bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[11px] animate-pulse">
                🏷️ خصم تاجر الجملة مفعّل ({wholesaleDiscountPct}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Phone direct call */}
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              <span>هاتف الطلبات: <strong className="font-mono text-white text-sm">{BUSINESS_INFO.phoneDisplay}</strong></span>
            </a>

            {/* Auth / Account Link */}
            {currentUser?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdmin}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>لوحة الإدارة</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-white transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : currentUser?.role === 'wholesale' ? (
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">
                  مرحباً، {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className="text-stone-400 hover:text-white text-[11px] underline"
                >
                  (خروج)
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors font-semibold"
              >
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>دخول تجار الجملة / الإدارة</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Name with Official Profile Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.png"
              alt="بونابيتي"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-stone-200 shadow-sm flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-black text-stone-900">
                  {BUSINESS_INFO.nameAr}
                </span>
                <span className="text-xs sm:text-sm font-bold text-stone-400 font-sans tracking-wide">
                  {BUSINESS_INFO.name}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-stone-500 font-medium mt-2 leading-relaxed tracking-wide">
                أكلات بيتي جاهزة للتسوية الفورية
              </p>
            </div>
          </div>

          {/* Clean Search Input */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث في قائمة الطعام..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-stone-100 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-lg focus:outline-none transition-colors"
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
              <span>السلة</span>
              {cartCount > 0 && (
                <span className="bg-brand-500 text-white px-1.5 py-0.2 rounded text-[11px]">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="mr-1 text-stone-300 font-mono">({cartTotal} ج.م)</span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Search */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث في قائمة الطعام..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
