import React, { useState } from 'react';
import { X, Lock, User, Phone, ShieldCheck } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  wholesaleUsers
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('wholesale_login'); // 'wholesale_login' | 'admin'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // Wholesale Login
  const handleWholesaleLogin = (e) => {
    e.preventDefault();
    setError('');

    const cleanInput = phone.trim().toLowerCase();
    const cleanPhone = phone.replace(/\s+/g, '');

    const user = wholesaleUsers.find(
      (u) =>
        (u.phone === cleanInput ||
          u.phone === cleanPhone ||
          (u.username && u.username.toLowerCase() === cleanInput)) &&
        u.password === password
    );

    if (!user) {
      setError('رقم الموبايل / اسم الحساب أو كلمة المرور غير صحيحة');
      return;
    }

    if (!user.approved) {
      setError('حسابك قيد المراجعة أو معطل من قبل إدارة بونابيتي');
      return;
    }

    onLoginSuccess({
      role: 'wholesale',
      id: user.id,
      name: user.name,
      area: user.area,
      phone: user.phone,
      discountPct: user.discountPct || BUSINESS_INFO.defaultWholesaleDiscount
    });
    onClose();
  };

  // Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    const savedAdmin = (() => {
      try {
        const s = localStorage.getItem('bonne_appetit_admin_creds');
        return s ? JSON.parse(s) : BUSINESS_INFO.adminCredentials;
      } catch (err) {
        return BUSINESS_INFO.adminCredentials;
      }
    })();

    if (phone.trim() === savedAdmin.username && password === savedAdmin.password) {
      onLoginSuccess({
        role: 'admin',
        name: 'إدارة بونابيتي',
        phone: BUSINESS_INFO.phone
      });
      onClose();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة. برجاء التأكد والمحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors active:scale-95"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Tabs */}
        <div className="flex border-b border-stone-200 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('wholesale_login')}
            className={`flex-1 pb-3 text-center transition-colors border-b-2 touch-manipulation ${
              activeTab === 'wholesale_login'
                ? 'border-brand-500 text-brand-600 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            دخول تجار الجملة
          </button>
          
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 pb-3 text-center transition-colors border-b-2 touch-manipulation ${
              activeTab === 'admin'
                ? 'border-brand-500 text-brand-600 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            دخول الإدارة
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Wholesale Login */}
        {activeTab === 'wholesale_login' && (
          <form onSubmit={handleWholesaleLogin} className="space-y-4 text-xs">
            <div className="text-right">
              <h3 className="font-black text-stone-900 text-base">تسجيل دخول تجار الجملة</h3>
              <p className="text-stone-500 text-[11px] mt-0.5">
                سجل الدخول بحسابك المسجل لدى إدارة بونابيتي لتطبيق نسبة خصم الجملة فوراً.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">رقم الموبايل أو اسم الحساب المسجل</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="رقم الموبايل أو اسم الحساب"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-base sm:text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-base sm:text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
              💡 <strong>تجار الجملة المعتمدين:</strong> يمكنكم تسجيل الدخول برقم الموبايل أو اسم الحساب وكلمة المرور المسلمة لكم من إدارة بونابيتي لتطبيق الخصم فوراً.
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 active:bg-brand-600 text-white font-bold py-3 sm:py-2.5 px-4 rounded-xl transition-all text-xs active:scale-98 touch-manipulation shadow-md"
            >
              دخول واستعراض أسعار الجملة
            </button>
          </form>
        )}

        {/* Tab 2: Admin Login */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="text-right">
              <h3 className="font-black text-stone-900 text-base">تسجيل دخول إدارة بونابيتي</h3>
              <p className="text-stone-500 text-[11px] mt-0.5">
                متابعة سجل الأوردرات، إضافة وتسجيل تجار الجملة، وتحديد نسب الخصم.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">اسم المستخدم</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-base sm:text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-brand-500 font-mono text-left transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 pl-3.5 py-2.5 text-base sm:text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-brand-500 font-mono text-left transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 active:bg-brand-600 text-white font-bold py-3 sm:py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 active:scale-98 touch-manipulation shadow-md"
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>تسجيل الدخول</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
