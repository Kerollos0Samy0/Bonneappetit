import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { PRODUCTS, BUSINESS_INFO } from './data/products';
import { MessageCircle, Phone, Filter } from 'lucide-react';

export default function App() {
  // Cart state
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Current User (guest | wholesale | admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_user');
      return saved ? JSON.parse(saved) : { role: 'guest' };
    } catch (e) {
      return { role: 'guest' };
    }
  });

  // Wholesale Discount Percentage (managed by Admin)
  const [wholesaleDiscountPct, setWholesaleDiscountPct] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_wholesale_discount');
      return saved ? Number(saved) : BUSINESS_INFO.defaultWholesaleDiscount;
    } catch (e) {
      return BUSINESS_INFO.defaultWholesaleDiscount;
    }
  });

  // Wholesale Merchants List
  const [wholesaleUsers, setWholesaleUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_wholesale_users');
      return saved ? JSON.parse(saved) : BUSINESS_INFO.defaultWholesaleUsers;
    } catch (e) {
      return BUSINESS_INFO.defaultWholesaleUsers;
    }
  });

  // Orders Log (managed by Admin)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modals
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyFasting, setOnlyFasting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_wholesale_discount', String(wholesaleDiscountPct));
    } catch (e) {}
  }, [wholesaleDiscountPct]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_wholesale_users', JSON.stringify(wholesaleUsers));
    } catch (e) {}
  }, [wholesaleUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdminDashboardOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser({ role: 'guest' });
  };

  const handleRegisterWholesale = (newMerchant) => {
    setWholesaleUsers((prev) => [newMerchant, ...prev]);
  };

  const handleDeleteWholesaleMerchant = (merchantId) => {
    if (window.confirm('هل أنت متأكد من حذف حساب هذا التاجر؟')) {
      setWholesaleUsers((prev) => prev.filter((u) => u.id !== merchantId));
    }
  };

  const handleToggleUserApproval = (userId) => {
    setWholesaleUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, approved: !u.approved } : u))
    );
  };

  const handleUpdateWholesaleDiscount = (newPct) => {
    setWholesaleDiscountPct(newPct);
  };

  // Orders Handlers
  const handleSaveOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleClearOrders = () => {
    if (window.confirm('هل تريد مسح سجل الأوردرات بالكامل؟')) {
      setOrders([]);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (onlyFasting && !product.isFasting) return false;

      if (activeCategory !== 'all') {
        const matchesCategory = product.category === activeCategory;
        if (!matchesCategory) return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [activeCategory, searchTerm, onlyFasting]);

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      
      {/* Header with Auth & Cart */}
      <Header
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onLogout={handleLogout}
        wholesaleDiscountPct={wholesaleDiscountPct}
      />

      {/* Hero Banner with Cover2 image */}
      <Hero onExploreMenu={() => {}} />

      {/* Category Tabs */}
      <CategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
        }}
      />

      {/* Main Dishes Catalog */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        
        {/* Filter bar info & Wholesale Alert */}
        <div className="space-y-2 mb-4">
          {currentUser?.role === 'wholesale' && (
            <div className="bg-amber-100/80 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
              <div>
                <strong>حساب تاجر جملة معتمد ({currentUser.name})</strong>: يتم احتساب نسبة خصم{' '}
                <strong>{wholesaleDiscountPct}%</strong> تلقائياً على كافة الأسعار!
              </div>
              <button
                onClick={handleLogout}
                className="text-stone-600 hover:text-stone-900 underline font-bold"
              >
                تبديل الحساب
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                قائمة الطعام ({filteredProducts.length} صنف)
              </h2>
              {onlyFasting && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  مفعّل: الأصناف الصيامية فقط 🌱
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Inline Fasting Filter Toggle */}
              <button
                onClick={() => setOnlyFasting((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  onlyFasting
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{onlyFasting ? 'إلغاء فلتر الصيامي' : 'فلتر: إظهار الصيامي فقط 🌱'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid with Wholesale Price support */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                currentUser={currentUser}
                wholesaleDiscountPct={wholesaleDiscountPct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-6 space-y-2">
            <p className="text-sm font-bold text-stone-700">لا توجد أصناف مطابقة لهذا التصنيف</p>
            <p className="text-xs text-stone-500">
              {onlyFasting ? 'جرّب إلغاء فلتر الصيامي لاختيار قسم آخر.' : 'جرب البحث بكلمات أخرى.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setOnlyFasting(false);
              }}
              className="text-xs font-bold text-brand-600 underline"
            >
              عرض جميع الأصناف
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer onSelectCategory={setActiveCategory} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currentUser={currentUser}
        wholesaleDiscountPct={wholesaleDiscountPct}
      />

      {/* Checkout Modal with direct WhatsApp ordering to 01055083061 */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
        wholesaleDiscountPct={wholesaleDiscountPct}
        onSaveOrderToAdmin={handleSaveOrder}
      />

      {/* Auth Modal (Wholesale Login, Register, Admin) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        wholesaleUsers={wholesaleUsers}
        onRegisterWholesale={handleRegisterWholesale}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        wholesaleDiscountPct={wholesaleDiscountPct}
        onUpdateWholesaleDiscount={handleUpdateWholesaleDiscount}
        wholesaleUsers={wholesaleUsers}
        onToggleUserApproval={handleToggleUserApproval}
        onAddWholesaleMerchant={handleRegisterWholesale}
        onDeleteWholesaleMerchant={handleDeleteWholesaleMerchant}
        onClearOrders={handleClearOrders}
      />

      {/* Floating Call & WhatsApp Pill Button */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <a
          href={`tel:${BUSINESS_INFO.phone}`}
          className="bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title={`اتصل برقم بونابيتي: ${BUSINESS_INFO.phoneDisplay}`}
        >
          <Phone className="w-5 h-5 text-brand-400" />
        </a>

        <a
          href={`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent('مرحباً بونابيتي')}`}
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-colors"
          title="تواصل معنا عبر واتساب"
        >
          <MessageCircle className="w-4 h-4" />
          <span>واتساب بونابيتي ({BUSINESS_INFO.phoneDisplay})</span>
        </a>
      </div>

    </div>
  );
}
