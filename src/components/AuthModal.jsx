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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Tabs (Only 2 Tabs: Wholesale Login & Admin Login) */}
        <div className="flex border-b border-stone-200 mb-6 text-xs font-bold">
          <button
            onClick={() => handleTabChange('wholesale_login')}
            className={`flex-1 pb-3 text-center transition-colors border-b-2 ${
              activeTab === 'wholesale_login'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            دخول تجار الجملة
          </button>
          
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 pb-3 text-center transition-colors border-b-2 ${
              activeTab === 'admin'
                ? 'border-brand-500 text-brand-600'
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
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="رقم الموبايل أو اسم الحساب (مثل karma أو mina)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="p-2.5 bg-stone-100 rounded-lg border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
              💡 <strong>تجار الجملة المعتمدين:</strong> يمكنكم تسجيل الدخول برقم الموبايل أو اسم الحساب وكلمة المرور المسلمة لكم من إدارة بونابيتي لتطبيق الخصم فوراً.
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-xs"
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
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>منطقة دخول مخصصة لإدارة بونابيتي فقط.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>دخول لوحة تحكم الإدارة</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
