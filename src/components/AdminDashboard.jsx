import React, { useState } from 'react';
import { 
  X, ShoppingBag, Users, Percent, DollarSign, CheckCircle2, Clock, 
  Truck, MessageCircle, Trash2, Save, UserPlus, Boxes, UserCheck, 
  Receipt, ArrowDownRight, Package, ArrowUpRight, Lock, ShieldCheck, Key, Eye, EyeOff
} from 'lucide-react';
import { BUSINESS_INFO, PRODUCTS } from '../data/products';
import InventoryManager from './admin/InventoryManager';
import WorkersManager from './admin/WorkersManager';
import InvoicesManager from './admin/InvoicesManager';
import InvoiceViewModal from './admin/InvoiceViewModal';

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
  onClearOrders,
  // New Admin Capabilities
  inventory,
  onUpdateStock,
  stockMovements,
  onAddStockMovement,
  workers,
  onAddWorker,
  onDeleteWorker,
  productionLogs,
  onLogProduction,
  onDeleteProductionLog,
  invoices,
  onCreateInvoice,
  onCancelInvoice
}) {
  if (!isOpen) return null;

  // Tabs: 'inventory' | 'workers' | 'invoices' | 'orders' | 'merchants' | 'discount'
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Invoice View Modal state
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);

  // Wholesale Discount State
  const [newDiscount, setNewDiscount] = useState(wholesaleDiscountPct);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Wholesale Merchant Form State
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantPhone, setNewMerchantPhone] = useState('');
  const [newMerchantPassword, setNewMerchantPassword] = useState('');
  const [newMerchantDiscount, setNewMerchantDiscount] = useState(wholesaleDiscountPct);
  const [merchantSuccessMsg, setMerchantSuccessMsg] = useState('');
  // Admin Password Management State
  const [adminUsername, setAdminUsername] = useState(() => {
    try {
      const s = localStorage.getItem('bonne_appetit_admin_creds');
      return s ? JSON.parse(s).username : BUSINESS_INFO.adminCredentials.username;
    } catch (e) {
      return BUSINESS_INFO.adminCredentials.username;
    }
  });

  const [currentAdminPassword, setCurrentAdminPassword] = useState(() => {
    try {
      const s = localStorage.getItem('bonne_appetit_admin_creds');
      return s ? JSON.parse(s).password : BUSINESS_INFO.adminCredentials.password;
    } catch (e) {
      return BUSINESS_INFO.adminCredentials.password;
    }
  });

  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdateAdminPassword = (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newAdminPassword.length < 8) {
      setPasswordErrorMsg('كلمة المرور يجب أن تتكون من 8 أحرف ورموز على الأقل لضمان الأمان');
      return;
    }

    const updatedCreds = {
      username: adminUsername,
      password: newAdminPassword
    };

    try {
      localStorage.setItem('bonne_appetit_admin_creds', JSON.stringify(updatedCreds));
      setCurrentAdminPassword(newAdminPassword);
      setNewAdminPassword('');
      setPasswordSuccessMsg('✓ تم تحديث كلمة مرور الإدارة بنجاح وحفظها بأمان!');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    } catch (err) {
      setPasswordErrorMsg('حدث خطأ أثناء حفظ كلمة المرور');
    }
  };

  // Overall Quick Stats
  const totalOrdersCount = orders.length;
  const totalInvoicesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, i) => acc + (i.total || 0), 0) + orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalUnitsInStock = Object.values(inventory || {}).reduce((acc, q) => acc + (q || 0), 0);
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
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col w-screen h-screen overflow-hidden">
      
      {/* Top Navbar Header */}
      <header className="bg-stone-900 text-white px-4 sm:px-8 py-3.5 border-b border-stone-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
            BA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight">
                لوحة تحكم إدارة بونابيتي <span className="text-brand-400 font-serif">Bonne Appetit</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-bold text-brand-300 bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700 font-mono">
                ERP & POS المركزي
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              المخزن المركزي • تسجيل إنتاج العمال • إصدار الفواتير • الطلبات وحسابات الجملة
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all border border-stone-700 shadow-xs"
          >
            <span>الرجوع للمتجر</span>
            <span className="text-sm">🏪</span>
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700"
            title="إغلاق لوحة التحكم والرجوع للمتجر"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Global Summary Stats Row */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">رصيد المخزن الحالي</span>
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-brand-600" />
              <span className="text-xl font-black text-stone-900 font-mono">{totalUnitsInStock}</span>
              <span className="text-[11px] text-stone-400">طبق / وحدة</span>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">إجمالي المبيعات</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xl font-black text-emerald-700 font-mono">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">الفواتير والأوردرات</span>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span className="text-xl font-black text-stone-900 font-mono">{totalInvoicesCount + totalOrdersCount}</span>
              <span className="text-[11px] text-stone-400">عملية</span>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-stone-500 font-medium block mb-1">تجار الجملة المعتمدين</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-xl font-black text-stone-900 font-mono">{totalWholesaleMerchants}</span>
              <span className="text-[11px] text-stone-400">كانتين / محل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 shrink-0">
        <div className="max-w-7xl mx-auto flex overflow-x-auto text-xs font-bold scrollbar-none">
          
          {/* TAB: Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>المخزن والجرد</span>
          </button>

          {/* TAB: Workers Production */}
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'workers'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>إنتاج العمال (+ المخزن)</span>
          </button>

          {/* TAB: Invoices & POS */}
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>قسم الفواتير (- المخزن)</span>
          </button>

          {/* TAB: Online Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>طلبات الموقع ({orders.length})</span>
          </button>

          {/* TAB: Merchants */}
          <button
            onClick={() => setActiveTab('merchants')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'merchants'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>تجار الجملة ({wholesaleUsers.length})</span>
          </button>

          {/* TAB: Settings & Security */}
          <button
            onClick={() => setActiveTab('discount')}
            className={`py-3.5 px-4 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'discount'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الإعدادات والأمان</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TAB 1: Inventory & Stock */}
          {activeTab === 'inventory' && (
            <InventoryManager
              inventory={inventory}
              onUpdateStock={onUpdateStock}
              stockMovements={stockMovements}
              onAddStockMovement={onAddStockMovement}
            />
          )}

          {/* TAB 2: Workers Production */}
          {activeTab === 'workers' && (
            <WorkersManager
              workers={workers}
              onAddWorker={onAddWorker}
              onDeleteWorker={onDeleteWorker}
              productionLogs={productionLogs}
              onLogProduction={onLogProduction}
              onDeleteProductionLog={onDeleteProductionLog}
              inventory={inventory}
            />
          )}

          {/* TAB 3: Invoices & POS */}
          {activeTab === 'invoices' && (
            <InvoicesManager
              invoices={invoices}
              onCreateInvoice={onCreateInvoice}
              onCancelInvoice={onCancelInvoice}
              inventory={inventory}
              wholesaleUsers={wholesaleUsers}
              wholesaleDiscountPct={wholesaleDiscountPct}
              onOpenInvoiceView={(inv) => setSelectedInvoiceForView(inv)}
            />
          )}

          {/* TAB 4: Website Orders Log */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    الأوردرات الواردة من المتجر الإلكتروني وواتساب
                  </h3>
                  <p className="text-xs text-stone-500">
                    الطلبات المباشرة التي يقوم العملاء بإرسالها من سلة الموقع.
                  </p>
                </div>

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
                            <a
                              href={`tel:${order.phone}`}
                              className="text-stone-700 hover:text-brand-600 font-bold"
                            >
                              {order.phone}
                            </a>
                          </td>
                          <td className="p-3 max-w-xs">
                            <p className="line-clamp-2 text-stone-700">{order.itemsSummary}</p>
                            <span className="text-[11px] font-bold text-brand-600 mt-0.5 inline-block">
                              الوزن الإجمالي: {order.totalWeight} كجم
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-stone-900 text-sm">
                            {order.totalAmount} ج.م
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold inline-block ${
                                order.status === 'جديد'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'قيد التجهيز'
                                  ? 'bg-amber-100 text-amber-800'
                                  : order.status === 'تم الشحن'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                              className="p-1 border border-stone-300 rounded text-xs bg-white focus:outline-none"
                            >
                              <option value="جديد">جديد</option>
                              <option value="قيد التجهيز">قيد التجهيز</option>
                              <option value="تم الشحن">تم الشحن</option>
                              <option value="مكتمل ومستلم">مكتمل ومستلم</option>
                              <option value="ملغي">ملغي</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Wholesale Merchants */}
          {activeTab === 'merchants' && (
            <div className="space-y-6">
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

          {/* TAB 6: Settings & Security */}
          {activeTab === 'discount' && (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              
              {/* Security & Admin Password Card */}
              <div className="bg-white border-2 border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 text-brand-400 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-base">
                        أمان لوحة التحكم (بيانات دخول الإدارة)
                      </h3>
                      <p className="text-xs text-stone-500">
                        حماية لوحة التحكم بكلمة مرور معقدة وتغييرها في أي وقت.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-stone-100 text-stone-800 px-3 py-1 rounded-full border border-stone-200">
                    أمان عالي 🔒
                  </span>
                </div>

                {/* Current Active Credentials Display */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    بيانات الاعتماد النشطة حالياً:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-400 text-[11px] block">اسم المستخدم:</span>
                      <strong className="font-mono text-sm text-stone-900">{adminUsername}</strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-stone-400 text-[11px] block">كلمة المرور الحالية:</span>
                        <strong className="font-mono text-sm text-brand-600" dir="ltr">
                          {showPassword ? currentAdminPassword : '••••••••••••••••'}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                        title={showPassword ? 'إخفاء' : 'إظهار'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleUpdateAdminPassword} className="space-y-3 pt-2 text-xs">
                  <h4 className="font-bold text-stone-800 text-xs">تعيين كلمة مرور جديدة:</h4>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full">
                      <Key className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة المعقدة..."
                        className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:outline-hidden focus:border-brand-500 bg-white"
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>تحديث كلمة المرور</span>
                    </button>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
                      {passwordErrorMsg}
                    </div>
                  )}
                </form>
              </div>

              {/* Wholesale Discount Form */}
              <form onSubmit={handleSaveDiscount} className="bg-stone-50 border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-brand-600" />
                  <h3 className="font-bold text-stone-900 text-base">
                    تعديل نسبة خصم الجملة الافتراضية
                  </h3>
                </div>

                <p className="text-stone-600 text-xs leading-relaxed">
                  هذه النسبة تُطبق تلقائياً على حسابات تجار الجملة الجدد عند تسجيلهم، وتظهر لهم الأسعار مخفضة فور تسجيل الدخول.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-28 text-center text-lg font-mono font-bold p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-lg font-black text-stone-700">%</span>
                </div>

                {saveSuccess && (
                  <div className="text-emerald-700 text-xs font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    ✓ تم حفظ نسبة الخصم بنجاح وتحديث المتجر بالكامل!
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ نسبة الخصم</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-3 bg-stone-900 border-t border-stone-800 text-stone-400 text-xs flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-stone-300 font-medium">نظام إدارة بونابيتي نشط</span>
          <span className="hidden sm:inline text-stone-500">• هاتف الإدارة: {BUSINESS_INFO.phoneDisplay}</span>
        </div>
        <button
          onClick={onClose}
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-1.5 rounded-xl font-bold text-xs transition-colors border border-stone-700 shadow-xs"
        >
          الخروج والرجوع للمتجر 🏪
        </button>
      </footer>

      {/* Invoice View Modal */}
      {selectedInvoiceForView && (
        <InvoiceViewModal
          invoice={selectedInvoiceForView}
          isOpen={!!selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
        />
      )}
    </div>
  );
}
