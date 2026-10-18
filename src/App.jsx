import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import { PRODUCTS, BUSINESS_INFO } from './data/products';
import { DEFAULT_WORKERS, getInitialInventory } from './data/adminDefaults';
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
      const saved = localStorage.getItem('bonne_appetit_wholesale_users_v3');
      if (saved) return JSON.parse(saved);
      return BUSINESS_INFO.defaultWholesaleUsers;
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

  // Central Warehouse / Inventory state
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_inventory_v1');
      return saved ? JSON.parse(saved) : getInitialInventory();
    } catch (e) {
      return getInitialInventory();
    }
  });

  // Workers list
  const [workers, setWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_workers');
      return saved ? JSON.parse(saved) : DEFAULT_WORKERS;
    } catch (e) {
      return DEFAULT_WORKERS;
    }
  });

  // Worker daily production logs
  const [productionLogs, setProductionLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_production_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sales Invoices
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Stock movements audit log
  const [stockMovements, setStockMovements] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_stock_movements');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Dynamic Products Catalog state (full admin control: add, edit, reorder, hide)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_products_v2');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch (e) {
      return PRODUCTS;
    }
  });

  // Dynamic Business Info state (phone, whatsapp, banner text, slogan)
  const [businessInfo, setBusinessInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_business_info');
      return saved ? JSON.parse(saved) : BUSINESS_INFO;
    } catch (e) {
      return BUSINESS_INFO;
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
      localStorage.setItem('bonne_appetit_wholesale_users_v3', JSON.stringify(wholesaleUsers));
      localStorage.setItem('bonne_appetit_wholesale_users', JSON.stringify(wholesaleUsers));
    } catch (e) {}
  }, [wholesaleUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_inventory_v1', JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_workers', JSON.stringify(workers));
    } catch (e) {}
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_production_logs', JSON.stringify(productionLogs));
    } catch (e) {}
  }, [productionLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_invoices', JSON.stringify(invoices));
    } catch (e) {}
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_stock_movements', JSON.stringify(stockMovements));
    } catch (e) {}
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_products_v2', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_business_info', JSON.stringify(businessInfo));
    } catch (e) {}
  }, [businessInfo]);

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

  // Inventory & Stock Movements Handlers
  const handleUpdateStock = (productId, newQuantity) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: Math.max(0, newQuantity)
    }));
  };

  const handleAddStockMovement = (movement) => {
    setStockMovements((prev) => [movement, ...prev]);
  };

  // Workers Handlers
  const handleAddWorker = (newWorker) => {
    setWorkers((prev) => [...prev, newWorker]);
  };

  const handleDeleteWorker = (workerId) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  };

  // Production Handlers - AUTOMATICALLY ADDS TO INVENTORY
  const handleLogProduction = (newLog) => {
    // 1. Add to production logs
    setProductionLogs((prev) => [newLog, ...prev]);

    // 2. Automatically ADD to inventory
    const prevQty = inventory[newLog.productId] || 0;
    const newQty = prevQty + newLog.quantity;
    setInventory((prev) => ({
      ...prev,
      [newLog.productId]: newQty
    }));

    // 3. Automatically record in stock movements
    handleAddStockMovement({
      id: 'mov_' + Date.now(),
      date: new Date().toLocaleString('ar-EG'),
      type: 'in_production',
      productId: newLog.productId,
      productName: newLog.productName,
      quantityChange: newLog.quantity,
      previousStock: prevQty,
      newStock: newQty,
      reference: `وارد إنتاج عمال: ${newLog.workerName} (${newLog.shift})`,
      notes: newLog.notes || 'تمت الإضافة للمخزن أوتوماتيكياً'
    });
  };

  const handleDeleteProductionLog = (logId) => {
    setProductionLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // Invoices Handlers - AUTOMATICALLY DEDUCTS FROM INVENTORY
  const handleCreateInvoice = (newInvoice) => {
    // 1. Add to invoices
    setInvoices((prev) => [newInvoice, ...prev]);

    // 2. Automatically DEDUCT from inventory
    setInventory((prev) => {
      const updated = { ...prev };
      newInvoice.items.forEach((item) => {
        const cur = updated[item.productId] || 0;
        updated[item.productId] = Math.max(0, cur - item.quantity);
      });
      return updated;
    });

    // 3. Automatically record in stock movements for each item
    newInvoice.items.forEach((item, index) => {
      const cur = inventory[item.productId] || 0;
      handleAddStockMovement({
        id: `mov_${Date.now()}_${index}`,
        date: new Date().toLocaleString('ar-EG'),
        type: 'out_invoice',
        productId: item.productId,
        productName: item.name,
        quantityChange: -item.quantity,
        previousStock: cur,
        newStock: Math.max(0, cur - item.quantity),
        reference: `منصرف فاتورة مبيعات رقم ${newInvoice.invoiceNumber}`,
        notes: `العميل: ${newInvoice.customerName} (${newInvoice.paymentMethod})`
      });
    });
  };

  const handleCancelInvoice = (invoiceId) => {
    const invoice = invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    // Return items to inventory
    setInventory((prev) => {
      const updated = { ...prev };
      invoice.items.forEach((item) => {
        updated[item.productId] = (updated[item.productId] || 0) + item.quantity;
      });
      return updated;
    });

    // Record return movement
    invoice.items.forEach((item, index) => {
      const cur = inventory[item.productId] || 0;
      handleAddStockMovement({
        id: `mov_cancel_${Date.now()}_${index}`,
        date: new Date().toLocaleString('ar-EG'),
        type: 'in_return',
        productId: item.productId,
        productName: item.name,
        quantityChange: item.quantity,
        previousStock: cur,
        newStock: cur + item.quantity,
        reference: `مرتجع إلغاء فاتورة ${invoice.invoiceNumber}`,
        notes: `تم إلغاء الفاتورة واسترجاع البضاعة للمخزن`
      });
    });

    // Remove invoice
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  };

  // Product Catalog Handlers (Full admin control: add, edit, reorder, visibility toggle)
  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleToggleProductVisibility = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, hidden: !p.hidden } : p))
    );
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setInventory((prev) => ({
      ...prev,
      [newProduct.id]: prev[newProduct.id] || 20
    }));
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleMoveProduct = (productId, direction) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === productId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const handleResetProducts = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem('bonne_appetit_products_v2');
  };

  const handleUpdateBusinessInfo = (newInfo) => {
    setBusinessInfo(newInfo);
  };

  // Filtered products for public storefront
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Hide product from public store if hidden by admin
      if (product.hidden && currentUser?.role !== 'admin') return false;

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
  }, [products, currentUser, onlyFasting, activeCategory, searchTerm]);

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
        businessInfo={businessInfo}
      />

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
      <ErrorBoundary>
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
          // New Props
          inventory={inventory}
          onUpdateStock={handleUpdateStock}
          stockMovements={stockMovements}
          onAddStockMovement={handleAddStockMovement}
          workers={workers}
          onAddWorker={handleAddWorker}
          onDeleteWorker={handleDeleteWorker}
          productionLogs={productionLogs}
          onLogProduction={handleLogProduction}
          onDeleteProductionLog={handleDeleteProductionLog}
          invoices={invoices}
          onCreateInvoice={handleCreateInvoice}
          onCancelInvoice={handleCancelInvoice}
          // Catalog & Store Control
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onToggleProductVisibility={handleToggleProductVisibility}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onMoveProduct={handleMoveProduct}
          onResetProducts={handleResetProducts}
          businessInfo={businessInfo}
          onUpdateBusinessInfo={handleUpdateBusinessInfo}
        />
      </ErrorBoundary>

      {/* Floating Call & WhatsApp Pill Button */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <a
          href={`tel:${businessInfo.phone || BUSINESS_INFO.phone}`}
          className="bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title={`اتصل برقم بونابيتي: ${businessInfo.phoneDisplay || businessInfo.phone || BUSINESS_INFO.phoneDisplay}`}
        >
          <Phone className="w-5 h-5 text-brand-400" />
        </a>

        <a
          href={`https://wa.me/${businessInfo.whatsapp || BUSINESS_INFO.whatsapp}?text=${encodeURIComponent('مرحباً بونابيتي')}`}
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-colors"
          title="تواصل معنا عبر واتساب"
        >
          <MessageCircle className="w-4 h-4" />
          <span>واتساب بونابيتي ({businessInfo.phoneDisplay || businessInfo.phone || BUSINESS_INFO.phoneDisplay})</span>
        </a>
      </div>

    </div>
  );
}
