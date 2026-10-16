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

    const user = wholesaleUsers.find(
      (u) => (u.phone === phone.trim() || u.phone === phone.replace(/\s+/g, '')) && u.password === password
    );

    if (!user) {
      setError('رقم الموبايل أو كلمة المرور غير صحيحة');
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
      phone: user.phone,
      discountPct: user.discountPct || BUSINESS_INFO.defaultWholesaleDiscount
    });
    onClose();
  };

  // Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');

    const { username, password: adminPass } = BUSINESS_INFO.adminCredentials;
    if (phone.trim() === username && password === adminPass) {
      onLoginSuccess({
        role: 'admin',
        name: 'إدارة بونابيتي',
        phone: BUSINESS_INFO.phone
      });
      onClose();
    } else {
      setError('بيانات دخول الإدارة غير صحيحة (اسم المستخدم: admin / كلمة المرور: 123)');
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
              <label className="block font-bold text-stone-700 mb-1">رقم الموبايل المسجل</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="مثال: 01234567890"
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

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
              💡 حساب تجريبي معتمد: موبايل: <strong className="font-mono">01234567890</strong> | كلمة المرور: <strong className="font-mono">123</strong>
              <br />
              <span className="text-stone-500 text-[10px]">
                * إذا كنت تاجر جملة أو كانتين جديد، يرجى التواصل مع إدارة بونابيتي لإنشاء حسابك وتحديد نسبة خصمك.
              </span>
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

            <div className="p-2.5 bg-stone-100 rounded-lg border border-stone-200 text-[11px] text-stone-700">
              🔑 بيانات دخول الإدارة: اسم المستخدم: <strong className="font-mono">admin</strong> | كلمة المرور: <strong className="font-mono">123</strong>
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
