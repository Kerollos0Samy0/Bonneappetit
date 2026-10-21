import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Users, Percent, DollarSign, CheckCircle2, Clock, 
  Truck, MessageCircle, Trash2, Save, UserPlus, Boxes, UserCheck, 
  Receipt, ArrowDownRight, Package, ArrowUpRight, Lock, ShieldCheck, Key, Eye, EyeOff,
  Utensils, Globe, Phone, Volume2, Bell, Layers, Wallet, AlertOctagon, FileText,
  Cloud, CloudOff
} from 'lucide-react';
import { playLoudOrderAlert, requestDesktopNotificationPermission, getNotificationPermissionStatus } from '../utils/orderNotifier';
import { UI_TRANSLATIONS } from '../data/translations';
import { PRODUCTS, BUSINESS_INFO } from '../data/products';
import InventoryManager from './admin/InventoryManager';
import WorkersManager from './admin/WorkersManager';
import InvoicesManager from './admin/InvoicesManager';
import ProductCatalogManager from './admin/ProductCatalogManager';
import InvoiceViewModal from './admin/InvoiceViewModal';
import RawMaterialsManager from './admin/RawMaterialsManager';
import ExpensesManager from './admin/ExpensesManager';
import WasteManager from './admin/WasteManager';
import A4QuotationModal from './admin/A4QuotationModal';

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
  onCancelInvoice,
  // Raw Materials & Recipes
  rawMaterials = [],
  onUpdateRawMaterial,
  onAddRawMaterial,
  onDeleteRawMaterial,
  recipes = {},
  onUpdateRecipe,
  // Expenses & Net Profit
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  // Spoilage & Waste
  wasteLogs = [],
  onLogWaste,
  onDeleteWasteLog,
  // Catalog & Store Control
  products = PRODUCTS,
  onUpdateProduct,
  onToggleProductVisibility,
  onAddProduct,
  onDeleteProduct,
  onMoveProduct,
  onResetProducts,
  businessInfo,
  onUpdateBusinessInfo,
  initialTab = 'inventory',
  lang = 'ar',
  onToggleLang,
  onOpenFirebaseModal,
  isCloudConnected = false
}) {
  if (!isOpen) return null;

  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;

  // Tabs: 'inventory' | 'catalog' | 'workers' | 'invoices' | 'orders' | 'merchants' | 'discount'
  const [activeTab, setActiveTab] = useState(initialTab || 'inventory');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Audio & Notification Testing State
  const [notificationPermission, setNotificationPermission] = useState(() => getNotificationPermissionStatus());
  const [isTestingSound, setIsTestingSound] = useState(false);

  const handleTestChime = () => {
    setIsTestingSound(true);
    playLoudOrderAlert();
    setTimeout(() => setIsTestingSound(false), 2200);
  };

  const handleRequestNotification = async () => {
    const res = await requestDesktopNotificationPermission();
    setNotificationPermission(res);
  };
  
  // Invoice View Modal state
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);

  // A4 Quotation Modal state (Works for both invoices & store orders)
  const [selectedDocForA4Quotation, setSelectedDocForA4Quotation] = useState(null);

  // Wholesale Discount State
  const [newDiscount, setNewDiscount] = useState(wholesaleDiscountPct);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Wholesale Merchant Form State
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantPhone, setNewMerchantPhone] = useState('');
  const [newMerchantPassword, setNewMerchantPassword] = useState('');
  const [newMerchantDiscount, setNewMerchantDiscount] = useState(wholesaleDiscountPct);
  const [merchantSuccessMsg, setMerchantSuccessMsg] = useState('');
  const [merchantErrorMsg, setMerchantErrorMsg] = useState('');

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

  // Safe Props & Overall Quick Stats
  const safeOrders = orders || [];
  const safeInvoices = invoices || [];
  const safeInventory = inventory || {};
  const safeWholesaleUsers = wholesaleUsers || [];
  const safeProducts = products || PRODUCTS;

  const totalOrdersCount = safeOrders.length;
  const totalInvoicesCount = safeInvoices.length;
  const totalRevenue = safeInvoices.reduce((acc, i) => acc + (i.total || 0), 0) + safeOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalUnitsInStock = Object.values(safeInventory).reduce((acc, q) => acc + (q || 0), 0);
  const totalWholesaleMerchants = safeWholesaleUsers.length;

  // Store Settings State (Banner text, Phone, WhatsApp, Slogan)
  const [storePhone, setStorePhone] = useState(() => businessInfo?.phone || BUSINESS_INFO.phone);
  const [storeWhatsapp, setStoreWhatsapp] = useState(() => businessInfo?.whatsapp || BUSINESS_INFO.whatsapp);
  const [storeBannerText, setStoreBannerText] = useState(() => businessInfo?.shippingPolicy || BUSINESS_INFO.shippingPolicy);
  const [storeSlogan, setStoreSlogan] = useState(() => businessInfo?.slogan || BUSINESS_INFO.slogan);
  const [storeSettingsSuccess, setStoreSettingsSuccess] = useState(false);

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    if (onUpdateBusinessInfo) {
      onUpdateBusinessInfo({
        ...businessInfo,
        phone: storePhone.trim(),
        phoneDisplay: storePhone.trim(),
        whatsapp: storeWhatsapp.trim(),
        shippingPolicy: storeBannerText.trim(),
        slogan: storeSlogan.trim()
      });
      setStoreSettingsSuccess(true);
      setTimeout(() => setStoreSettingsSuccess(false), 3000);
    }
  };

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
    <div 
      className="fixed inset-0 z-50 bg-stone-100 flex flex-col w-screen h-screen overflow-hidden"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      
      {/* Top Navbar Header */}
      {/* Top Navbar Header */}
      <header className="bg-stone-900 text-white px-4 sm:px-6 py-2.5 border-b border-stone-800 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
            BA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight">
                {t.adminTitle} <span className="text-brand-400 font-serif">Bonne Appetit</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold text-brand-300 bg-stone-800 px-2 py-0.5 rounded border border-stone-700 font-mono">
                {t.adminBadge}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 hidden md:block">
              {t.adminSubtitle}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Firebase Cloud Sync Button */}
          {onOpenFirebaseModal && (
            <button
              type="button"
              onClick={onOpenFirebaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border ${
                isCloudConnected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-700 animate-pulse'
              }`}
              title={lang === 'en' ? 'Firebase Realtime Cloud Sync Settings' : 'إعدادات المزامنة السحابية اللحظية (Firebase) لمزامنة البيانات بين الأجهزة'}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isCloudConnected ? '🟢 السحابة متصلة' : '☁️ ربط السحابة'}
              </span>
              <span className="sm:hidden">{isCloudConnected ? '🟢' : '☁️'}</span>
            </button>
          )}

          {/* Test Chime Button */}
          <button
            type="button"
            onClick={handleTestChime}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-xs"
            title={lang === 'en' ? 'Test loud restaurant order chime' : 'تجربة صوت تنبيه الأوردرات الجديد (رنة المطاعم العالية)'}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isTestingSound ? 'animate-bounce text-amber-200' : ''}`} />
            <span className="hidden sm:inline">{isTestingSound ? t.adminSoundPlaying : t.adminTestSound}</span>
            <span className="sm:hidden">{t.adminSoundMobile}</span>
          </button>

          {/* Language Switcher */}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'ar' ? 'English 🇬🇧' : 'العربية 🇪🇬'}</span>
            </button>
          )}

          {/* Return to Store */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-bold transition-all border border-stone-700 shadow-xs"
            title={t.adminBackToStore}
          >
            <span className="hidden sm:inline">{t.adminBackToStore}</span>
            <span className="text-xs">🏪</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700"
            title={t.adminCloseTooltip}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Summary Stats Row - Sleek & Compact */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-2 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-stone-500 font-bold text-[11px] block">{t.adminStockBalance}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-stone-900 font-mono">{totalUnitsInStock}</span>
                <span className="text-[10px] text-stone-400">{t.adminDishUnit}</span>
              </div>
            </div>
            <Boxes className="w-5 h-5 text-brand-600 opacity-70" />
          </div>

          <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-stone-500 font-bold text-[11px] block">{t.adminTotalSales}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-emerald-700 font-mono">{totalRevenue.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-bold">{t.currency}</span>
              </div>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-600 opacity-70" />
          </div>

          <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-stone-500 font-bold text-[11px] block">{t.adminInvoicesAndOrders}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-stone-900 font-mono">{totalInvoicesCount + totalOrdersCount}</span>
                <span className="text-[10px] text-stone-400">{t.adminOperations}</span>
              </div>
            </div>
            <Receipt className="w-5 h-5 text-indigo-600 opacity-70" />
          </div>

          <div className="bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-stone-500 font-bold text-[11px] block">{t.adminApprovedWholesale}</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-stone-900 font-mono">{totalWholesaleMerchants}</span>
                <span className="text-[10px] text-stone-400">{t.adminCanteensStores}</span>
              </div>
            </div>
            <Users className="w-5 h-5 text-amber-600 opacity-70" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex overflow-x-auto text-xs font-bold scrollbar-none">
          
          {/* TAB: Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{t.adminTabInventory}</span>
          </button>

          {/* TAB: Catalog & Menu */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>{lang === 'en' ? 'Menu & Price Control' : 'المنيو والأسعار والصور 🏷️'} ({products.length})</span>
          </button>

          {/* TAB: Workers Production */}
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'workers'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.adminTabWorkers}</span>
          </button>

          {/* TAB: Invoices & POS */}
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'invoices'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.adminTabInvoices}</span>
          </button>

          {/* TAB: Online Orders */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.adminTabOrders} ({safeOrders.length})</span>
          </button>

          {/* TAB: Raw Materials & Recipes */}
          <button
            onClick={() => setActiveTab('raw_materials')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'raw_materials'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{lang === 'en' ? 'Raw Materials & Recipes' : 'مخزن الخامات والخلطات'}</span>
          </button>

          {/* TAB: Expenses & Net Profit */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'expenses'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{lang === 'en' ? 'Expenses & Net Profit' : 'المصاريف الإدارية'}</span>
          </button>

          {/* TAB: Spoilage & Waste */}
          <button
            onClick={() => setActiveTab('waste')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'waste'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{lang === 'en' ? 'Waste & Spoilage' : 'سجل الهالك'}</span>
          </button>

          {/* TAB: Merchants */}
          <button
            onClick={() => setActiveTab('merchants')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'merchants'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.adminTabMerchants} ({safeWholesaleUsers.length})</span>
          </button>

          {/* TAB: Settings & Security */}
          <button
            onClick={() => setActiveTab('discount')}
            className={`py-2.5 px-3.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'discount'
                ? 'border-brand-500 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.adminTabSettings}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TAB 1: Inventory & Stock */}
          {activeTab === 'inventory' && (
            <InventoryManager
              products={products}
              inventory={inventory}
              onUpdateStock={onUpdateStock}
              stockMovements={stockMovements}
              onAddStockMovement={onAddStockMovement}
              onUpdateProduct={onUpdateProduct}
              onAddProduct={onAddProduct}
              wholesaleDiscountPct={wholesaleDiscountPct}
              lang={lang}
              t={t}
            />
          )}

          {/* TAB 2: Catalog & Products Management */}
          {activeTab === 'catalog' && (
            <ProductCatalogManager
              products={products}
              onUpdateProduct={onUpdateProduct}
              onToggleProductVisibility={onToggleProductVisibility}
              onAddProduct={onAddProduct}
              onDeleteProduct={onDeleteProduct}
              onMoveProduct={onMoveProduct}
              onResetProducts={onResetProducts}
              inventory={inventory}
              onUpdateStock={onUpdateStock}
              wholesaleDiscountPct={wholesaleDiscountPct}
              lang={lang}
              t={t}
            />
          )}

          {/* TAB 3: Workers Production */}
          {activeTab === 'workers' && (
            <WorkersManager
              products={products}
              workers={workers}
              onAddWorker={onAddWorker}
              onDeleteWorker={onDeleteWorker}
              productionLogs={productionLogs}
              onLogProduction={onLogProduction}
              onDeleteProductionLog={onDeleteProductionLog}
              inventory={inventory}
              lang={lang}
              t={t}
            />
          )}

          {/* TAB 4: Invoices & POS */}
          {activeTab === 'invoices' && (
            <InvoicesManager
              products={products}
              invoices={invoices}
              onCreateInvoice={onCreateInvoice}
              onCancelInvoice={onCancelInvoice}
              inventory={inventory}
              wholesaleUsers={wholesaleUsers}
              wholesaleDiscountPct={wholesaleDiscountPct}
              onOpenInvoiceView={(inv) => setSelectedInvoiceForView(inv)}
              onOpenA4Quotation={(inv) => setSelectedDocForA4Quotation(inv)}
              lang={lang}
              t={t}
            />
          )}

          {/* TAB 4: Website Orders Log */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Loud Sound & Notification Banner Box */}
              <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center shrink-0 shadow-xs">
                      <Bell className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-stone-900 text-sm">
                          {t.adminAlertSystemTitle}
                        </h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          {t.adminAlertSystemActive}
                        </span>
                      </div>
                      <p className="text-stone-600 text-xs mt-0.5">
                        {t.adminAlertSystemDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleTestChime}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-all shadow-xs"
                    >
                      <Volume2 className={`w-4 h-4 ${isTestingSound ? 'animate-bounce' : ''}`} />
                      <span>{isTestingSound ? (lang === 'en' ? '🔊 Chime Playing...' : '🔊 الصوت يعمل الآن...') : t.adminTestLoudSound}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestNotification}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        notificationPermission === 'granted'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-stone-900 text-white hover:bg-stone-800 border-stone-800'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>
                        {notificationPermission === 'granted'
                          ? t.adminDesktopNotifActive
                          : t.adminEnableDesktopNotif}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {t.adminIncomingOrdersTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.adminIncomingOrdersDesc}
                  </p>
                </div>

                {orders.length > 0 && (
                  <button
                    onClick={onClearOrders}
                    className="text-stone-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.adminClearOrders}</span>
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <p className="font-bold text-stone-700 text-sm">{t.adminNoOrders}</p>
                  <p className="text-xs text-stone-500">{t.adminNoOrdersDesc}</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">{t.thOrderId}</th>
                        <th className="p-3">{t.thCustomer}</th>
                        <th className="p-3">{t.thAccountType}</th>
                        <th className="p-3">{t.thPhone}</th>
                        <th className="p-3">{t.thItemsWeight}</th>
                        <th className="p-3">{t.thAmount}</th>
                        <th className="p-3">{t.thStatus}</th>
                        <th className="p-3 text-center">{t.thActions}</th>
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
                                {lang === 'en' ? `Wholesale (${order.discountPct || wholesaleDiscountPct}% off)` : `جملة (خصم ${order.discountPct || wholesaleDiscountPct}%)`}
                              </span>
                            ) : (
                              <span className="bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded text-[10px]">
                                {t.orderRetailLabel}
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
                              {t.orderTotalWeightLabel} {order.totalWeight} {t.kg}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-stone-900 text-sm">
                            {order.totalAmount} {t.currency}
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
                              {order.status === 'جديد' ? t.statusNew :
                               order.status === 'قيد التجهيز' ? t.statusPreparing :
                               order.status === 'تم الشحن' ? t.statusShipped :
                               order.status === 'مكتمل ومستلم' ? t.statusDelivered :
                               order.status === 'ملغي' ? t.statusCancelled : order.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                className="p-1 border border-stone-300 rounded text-xs bg-white focus:outline-none"
                              >
                                <option value="جديد">{t.statusNew}</option>
                                <option value="قيد التجهيز">{t.statusPreparing}</option>
                                <option value="تم الشحن">{t.statusShipped}</option>
                                <option value="مكتمل ومستلم">{t.statusDelivered}</option>
                                <option value="ملغي">{t.statusCancelled}</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setSelectedDocForA4Quotation(order)}
                                title={lang === 'en' ? 'Official A4 Quotation / Print' : 'إنشاء وطباعة عرض سعر رسمي A4 ومشاركته واتساب'}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors border border-amber-300 flex items-center gap-1 font-bold text-[11px]"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-600" />
                                <span>A4</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: Raw Materials & Recipes */}
          {activeTab === 'raw_materials' && (
            <RawMaterialsManager
              rawMaterials={rawMaterials}
              onUpdateRawMaterial={onUpdateRawMaterial}
              onAddRawMaterial={onAddRawMaterial}
              onDeleteRawMaterial={onDeleteRawMaterial}
              recipes={recipes}
              onUpdateRecipe={onUpdateRecipe}
              products={products}
              lang={lang}
            />
          )}

          {/* TAB: Expenses & Net Profit */}
          {activeTab === 'expenses' && (
            <ExpensesManager
              expenses={expenses}
              onAddExpense={onAddExpense}
              onDeleteExpense={onDeleteExpense}
              invoices={invoices}
              orders={orders}
              lang={lang}
            />
          )}

          {/* TAB: Spoilage & Waste */}
          {activeTab === 'waste' && (
            <WasteManager
              wasteLogs={wasteLogs}
              onLogWaste={onLogWaste}
              onDeleteWasteLog={onDeleteWasteLog}
              rawMaterials={rawMaterials}
              products={products}
              lang={lang}
            />
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
                      {t.merchantsTitle}
                    </h3>
                    <p className="text-stone-500 text-[11px]">
                      {t.merchantsSubtitle}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateMerchant} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t.merchantsNameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={t.merchantsNamePlaceholder}
                        value={newMerchantName}
                        onChange={(e) => setNewMerchantName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t.merchantsPhoneLabel}</label>
                      <input
                        type="tel"
                        required
                        placeholder={t.merchantsPhonePlaceholder}
                        value={newMerchantPhone}
                        onChange={(e) => setNewMerchantPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t.merchantsPasswordLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={t.merchantsPasswordPlaceholder}
                        value={newMerchantPassword}
                        onChange={(e) => setNewMerchantPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-brand-500 bg-white font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t.merchantsDiscountLabel}</label>
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
                      <span>{t.merchantsAddBtn}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered Merchants Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-stone-900 text-xs">
                    {t.merchantsListTitle} ({wholesaleUsers.length})
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    {t.merchantsListDesc}
                  </span>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">{t.merchantsThName}</th>
                        <th className="p-3">{t.merchantsThPhone}</th>
                        <th className="p-3">{t.merchantsThPassword}</th>
                        <th className="p-3">{t.merchantsThDiscount}</th>
                        <th className="p-3">{t.merchantsThStatus}</th>
                        <th className="p-3 text-center">{t.thActions}</th>
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
                              <span className="text-[10px] text-stone-400 font-sans block">{lang === 'en' ? 'Username: ' : 'اسم الدخول: '}{user.username}</span>
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
                                {t.merchantsActive}
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                {t.merchantsSuspended}
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
                              {user.approved ? t.merchantsSuspendBtn : t.merchantsActivateBtn}
                            </button>
                            {onDeleteWholesaleMerchant && (
                              <button
                                onClick={() => onDeleteWholesaleMerchant(user.id)}
                                className="px-2 py-1 rounded text-[10px] text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors mr-1"
                                title={t.merchantsDeleteTooltip}
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
                        {t.settingsSecurityTitle}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {t.settingsSecurityDesc}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-stone-100 text-stone-800 px-3 py-1 rounded-full border border-stone-200">
                    {t.settingsHighSecurity}
                  </span>
                </div>

                {/* Current Active Credentials Display */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    {t.settingsActiveCreds}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-stone-200">
                      <span className="text-stone-400 text-[11px] block">{t.settingsUsername}</span>
                      <strong className="font-mono text-sm text-stone-900">{adminUsername}</strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-stone-400 text-[11px] block">{t.settingsCurrentPassword}</span>
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
                  <h4 className="font-bold text-stone-800 text-xs">{t.settingsNewPasswordLabel}</h4>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full">
                      <Key className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder={t.settingsNewPasswordPlaceholder}
                        className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:outline-hidden focus:border-brand-500 bg-white"
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.settingsUpdatePasswordBtn}</span>
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
                    {t.settingsDiscountTitle}
                  </h3>
                </div>

                <p className="text-stone-600 text-xs leading-relaxed">
                  {t.settingsDiscountDesc}
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
                    {t.settingsDiscountSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.settingsSaveDiscountBtn}</span>
                </button>
              </form>

              {/* Loud Sound & Notification Settings Card */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-base">
                        {t.settingsSoundCardTitle}
                      </h3>
                      <p className="text-stone-500 text-[11px]">
                        {t.settingsSoundCardDesc}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                    {t.settingsSoundCardActive}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <strong className="text-stone-900 block text-xs">{t.settingsTestSoundTitle}</strong>
                    <p className="text-stone-500 text-[11px]">
                      {t.settingsTestSoundDesc}
                    </p>
                    <button
                      type="button"
                      onClick={handleTestChime}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Volume2 className={`w-4 h-4 ${isTestingSound ? 'animate-bounce' : ''}`} />
                      <span>{isTestingSound ? (lang === 'en' ? '🔊 Chime Playing...' : '🔊 الصوت يعمل الآن...') : t.settingsTestSoundBtn}</span>
                    </button>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <strong className="text-stone-900 block text-xs">{t.settingsDesktopNotifTitle}</strong>
                    <p className="text-stone-500 text-[11px]">
                      {t.settingsDesktopNotifDesc}
                    </p>
                    <button
                      type="button"
                      onClick={handleRequestNotification}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                        notificationPermission === 'granted'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-stone-900 text-white hover:bg-stone-800 border-stone-800'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span>
                        {notificationPermission === 'granted'
                          ? t.settingsDesktopNotifGranted
                          : t.settingsDesktopNotifRequest}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* General Store Settings Form (Banner, Phone, WhatsApp) */}
              <form onSubmit={handleSaveStoreSettings} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                  <Globe className="w-5 h-5 text-brand-600" />
                  <div>
                    <h3 className="font-black text-stone-900 text-base">
                      {t.settingsStoreSettingsTitle}
                    </h3>
                    <p className="text-stone-500 text-[11px]">
                      {t.settingsStoreSettingsDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">{t.settingsPhoneLabel}</label>
                    <input
                      type="text"
                      required
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">{t.settingsWhatsappLabel}</label>
                    <input
                      type="text"
                      required
                      value={storeWhatsapp}
                      onChange={(e) => setStoreWhatsapp(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    {t.settingsBannerLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeBannerText}
                    onChange={(e) => setStoreBannerText(e.target.value)}
                    placeholder="مثال: الشحن: خصم 50% (من 10 كجم) | مجاني (من 20 كجم فأكثر)"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">{t.settingsSloganLabel}</label>
                  <input
                    type="text"
                    value={storeSlogan}
                    onChange={(e) => setStoreSlogan(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                {storeSettingsSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.settingsStoreSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.settingsSaveStoreBtn}</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </main>

      {/* Invoice View Modal */}
      {selectedInvoiceForView && (
        <InvoiceViewModal
          invoice={selectedInvoiceForView}
          isOpen={!!selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
          lang={lang}
          t={t}
        />
      )}

      {/* Official A4 Quotation & Order Confirmation Modal */}
      {selectedDocForA4Quotation && (
        <A4QuotationModal
          documentData={selectedDocForA4Quotation}
          isOpen={!!selectedDocForA4Quotation}
          onClose={() => setSelectedDocForA4Quotation(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
