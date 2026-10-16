import React, { useState } from 'react';
import { X, ShoppingBag, Users, Percent, DollarSign, CheckCircle2, Clock, Truck, MessageCircle, Trash2, Save, UserPlus } from 'lucide-react';
import { BUSINESS_INFO } from '../data/products';

export default function AdminDashboard({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  wholesaleDiscountPct,
  onUpdateWholesaleDiscount,
  wholesaleUsers,
  onToggleUserApproval,
  onAddWholesaleMerchant,
  onDeleteWholesaleMerchant,
  onClearOrders
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'discount' | 'merchants'
  const [newDiscount, setNewDiscount] = useState(wholesaleDiscountPct);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Wholesale Merchant Form State
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantPhone, setNewMerchantPhone] = useState('');
  const [newMerchantPassword, setNewMerchantPassword] = useState('');
  const [newMerchantDiscount, setNewMerchantDiscount] = useState(wholesaleDiscountPct);
  const [merchantSuccessMsg, setMerchantSuccessMsg] = useState('');
  const [merchantErrorMsg, setMerchantErrorMsg] = useState('');

  // Statistics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalWholesaleMerchants = wholesaleUsers.filter((u) => u.approved).length;

  const handleSaveDiscount = (e) => {
    e.preventDefault();
    const val = Number(newDiscount);
    if (val >= 0 && val <= 80) {
      onUpdateWholesaleDiscount(val);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleCreateMerchant = (e) => {
    e.preventDefault();
    setMerchantErrorMsg('');
    setMerchantSuccessMsg('');

    const cleanPhone = newMerchantPhone.trim();
    if (!cleanPhone || !newMerchantName.trim() || !newMerchantPassword) {
      setMerchantErrorMsg('برجاء إدخال كافة بيانات التاجر المطلوبة');
      return;
    }

    if (wholesaleUsers.some((u) => u.phone === cleanPhone)) {
      setMerchantErrorMsg('رقم الموبايل مسجل بالفعل لحساب تاجر جملة آخر');
      return;
    }

    const discount = Number(newMerchantDiscount) || wholesaleDiscountPct;

    const newMerchant = {
      id: 'ws_' + Date.now(),
      name: newMerchantName.trim(),
      phone: cleanPhone,
      password: newMerchantPassword,
      discountPct: discount,
      approved: true
    };

    if (onAddWholesaleMerchant) {
      onAddWholesaleMerchant(newMerchant);
    }

    setMerchantSuccessMsg(`تمت إضافة التاجر "${newMerchant.name}" بنجاح واعتماد خصم ${discount}% له.`);
    setNewMerchantName('');
    setNewMerchantPhone('');
    setNewMerchantPassword('');
    setNewMerchantDiscount(wholesaleDiscountPct);

    setTimeout(() => setMerchantSuccessMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative my-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white rounded-t-3xl">
          <div>
            <span className="text-xs font-bold text-brand-400 bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700">
              لوحة الإدارة
            </span>
            <h2 className="text-xl font-black mt-1">
              إدارة متجر بونابيتي (Bonne Appetit)
            </h2>
            <p className="text-xs text-stone-400">
              متابعة الأوردرات وتحديد خصومات تجار الجملة واعتماد الكانتينات
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-stone-50 border-b border-stone-200 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">إجمالي الأوردرات</span>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span className="text-xl font-black text-stone-900">{totalOrdersCount}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">إجمالي المبيعات</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xl font-black text-emerald-700">{totalRevenue} ج.م</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">تجار الجملة المعتمدين</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xl font-black text-stone-900">{totalWholesaleMerchants}</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">نسبة خصم الجملة الحالية</span>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-600" />
              <span className="text-xl font-black text-amber-700">{wholesaleDiscountPct}%</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-5 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سجل الأوردرات ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('discount')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'discount'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>إعدادات نسبة خصم الجملة</span>
          </button>

          <button
            onClick={() => setActiveTab('merchants')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'merchants'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة حسابات تجار الجملة ({wholesaleUsers.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* TAB 1: Orders Log */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm">
                  الأوردرات الواردة من الموقع والواتساب
                </h3>
                {orders.length > 0 && (
                  <button
                    onClick={onClearOrders}
                    className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح سجل الطلبات</span>
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <p className="font-bold text-stone-700 text-sm">لا توجد أوردرات مسجلة حتى الآن</p>
                  <p className="text-xs text-stone-500">أي طلب يتم إرساله من الموقع أو عبر واتساب سيظهر هنا تلقائياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">رقم الطلب</th>
                        <th className="p-3">العميل</th>
                        <th className="p-3">الصفة</th>
                        <th className="p-3">الموبايل</th>
                        <th className="p-3">الأصناف والوزن</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-brand-600">
                            {order.id}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-stone-900 block">{order.clientName}</span>
                            <span className="text-[11px] text-stone-500">{order.address}</span>
                          </td>
                          <td className="p-3">
                            {order.isWholesale ? (
                              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">
                                جملة (خصم {order.discountPct || wholesaleDiscountPct}%)
                              </span>
                            ) : (
                              <span className="bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded text-[10px]">
                                عميل قطاعي
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono" dir="ltr">
                            {order.phone}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-stone-800 block">
                              {order.itemsCount} صنف ({order.totalWeight} كجم)
                            </span>
                            <span className="text-[11px] text-stone-500 line-clamp-1" title={order.itemsSummary}>
                              {order.itemsSummary}
                            </span>
                          </td>
                          <td className="p-3 font-black text-stone-900">
                            {order.totalAmount} ج.م
                          </td>
                          <td className="p-3">
                            <select
                              value={order.status || 'جديد'}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                              className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none ${
                                order.status === 'تم التسليم'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.status === 'قيد التجهيز'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="جديد">جديد 🟡</option>
                              <option value="قيد التجهيز">قيد التجهيز 🔵</option>
                              <option value="تم التسليم">تم التسليم 🟢</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <a
                              href={`https://wa.me/${order.phone.replace(/^0/, '20')}?text=${encodeURIComponent(`مرحباً أستاذ ${order.clientName}، بخصوص أوردر بونابيتي رقم ${order.id}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                              title="مراسلة العميل واتساب"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>مراسلة</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Wholesale Discount Settings */}
          {activeTab === 'discount' && (
            <div className="max-w-md mx-auto py-6 space-y-5 text-xs">
              <div className="text-right">
                <h3 className="font-bold text-stone-900 text-base">تعديل نسبة خصم تجار الجملة</h3>
                <p className="text-stone-500 text-xs mt-1">
                  هذه النسبة ستُطبق تلقائياً على حسابات جميع تجار الجملة والكانتينات المسجلين عند تسجيل دخولهم.
                </p>
              </div>

              <form onSubmit={handleSaveDiscount} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-2">
                    نسبة الخصم المئوية (%):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                      className="w-24 px-3 py-2 border border-stone-300 rounded-lg text-base font-black text-center font-mono focus:border-brand-500 focus:outline-none"
                    />
                    <span className="text-sm font-bold text-stone-700">% خصم على أسعار المنتجات</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 leading-relaxed text-[11px]">
                  💡 <strong>مثال على الخصم ({newDiscount}%):</strong>
                  <br />
                  طبق محشي ورق عنب (السعر الأصلي: 180 ج.م) ⬅️ يصبح لتاجر الجملة:{' '}
                  <strong>{(180 * (1 - newDiscount / 100)).toFixed(0)} جنيه مصري</strong>!
                </div>

                {saveSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
                    ✓ تم حفظ وتحديث نسبة الخصم بنجاح!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ نسبة الخصم وتطبيقها فوراً</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Wholesale Merchants List & Registration */}
          {activeTab === 'merchants' && (
            <div className="space-y-6">
              
              {/* Form to Add New Wholesale Merchant */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      تسجيل تاجر جملة أو كانتين جديد
                    </h3>
                    <p className="text-stone-500 text-[11px]">
                      التسجيل حصري للإدارة فقط؛ يتم تفعيل حساب التاجر فوراً ليتمكن من الدخول واستعراض أسعار الجملة.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateMerchant} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">اسم التاجر / الكانتين *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: كانتين مدرسة الرواد"
                        value={newMerchantName}
                        onChange={(e) => setNewMerchantName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">رقم الموبايل (لتسجيل الدخول) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 01012345678"
                        value={newMerchantPhone}
                        onChange={(e) => setNewMerchantPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">كلمة المرور *</label>
                      <input
                        type="text"
                        required
                        placeholder="كلمة مرور الدخول"
                        value={newMerchantPassword}
                        onChange={(e) => setNewMerchantPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">نسبة الخصم الخاصة به (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        placeholder={`${wholesaleDiscountPct}%`}
                        value={newMerchantDiscount}
                        onChange={(e) => setNewMerchantDiscount(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  {merchantErrorMsg && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                      {merchantErrorMsg}
                    </div>
                  )}

                  {merchantSuccessMsg && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                      ✓ {merchantSuccessMsg}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>إضافة وتفعيل حساب التاجر فوراً</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered Merchants Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-stone-900 text-xs">
                    قائمة تجار الجملة المسجلين ({wholesaleUsers.length})
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    يمكنك إيقاف أو تفعيل أو حذف أي تاجر في أي وقت
                  </span>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">اسم التاجر / الكانتين</th>
                        <th className="p-3">رقم الموبايل</th>
                        <th className="p-3">كلمة المرور</th>
                        <th className="p-3">نسبة الخصم</th>
                        <th className="p-3">حالة الحساب</th>
                        <th className="p-3 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {wholesaleUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-stone-50">
                          <td className="p-3">
                            <span className="font-bold text-stone-900 block">{user.name}</span>
                            {user.area && (
                              <span className="text-[11px] text-stone-500 font-medium block">📍 {user.area}</span>
                            )}
                          </td>
                          <td className="p-3 font-mono" dir="ltr">
                            <span className="font-bold text-stone-800 block">{user.phone}</span>
                            {user.username && (
                              <span className="text-[10px] text-stone-400 font-sans block">اسم الدخول: {user.username}</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-800 bg-emerald-50/50 rounded" dir="ltr">
                            {user.password || '••••••'}
                          </td>
                          <td className="p-3 font-bold text-emerald-700">
                            {user.discountPct || wholesaleDiscountPct}%
                          </td>
                          <td className="p-3">
                            {user.approved ? (
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                معتمد ومفعّل ✓
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                موقوف ⏸️
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center space-x-1 space-x-reverse">
                            <button
                              onClick={() => onToggleUserApproval(user.id)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                                user.approved
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {user.approved ? 'إيقاف الخصم' : 'تفعيل'}
                            </button>
                            {onDeleteWholesaleMerchant && (
                              <button
                                onClick={() => onDeleteWholesaleMerchant(user.id)}
                                className="px-2 py-1 rounded text-[10px] text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors mr-1"
                                title="حذف حساب التاجر"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 text-stone-500 text-xs flex justify-between items-center rounded-b-3xl">
          <span>هاتف إدارة بونابيتي المعتمد: {BUSINESS_INFO.phoneDisplay}</span>
          <button
            onClick={onClose}
            className="bg-stone-900 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-stone-800"
          >
            إغلاق لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}
