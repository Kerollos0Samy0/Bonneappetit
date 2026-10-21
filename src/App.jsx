import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import MobileBottomBar from './components/MobileBottomBar';
import { PRODUCTS, BUSINESS_INFO } from './data/products';
import { 
  DEFAULT_WORKERS, 
  getInitialInventory, 
  DEFAULT_RAW_MATERIALS, 
  DEFAULT_RECIPES, 
  DEFAULT_EXPENSES, 
  DEFAULT_WASTE_LOGS 
} from './data/adminDefaults';
import { UI_TRANSLATIONS, getLocalizedProduct } from './data/translations';
import { MessageCircle, Phone, Filter, Bell, Volume2, X } from 'lucide-react';
import { playLoudOrderAlert, sendDesktopNotification, requestDesktopNotificationPermission } from './utils/orderNotifier';

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
      const saved = localStorage.getItem('bonne_appetit_inventory_v3');
      return saved ? JSON.parse(saved) : getInitialInventory();
    } catch (e) {
      return getInitialInventory();
    }
  });

  // Workers list
  const [workers, setWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_workers_v2');
      if (saved) return JSON.parse(saved);

      const old = localStorage.getItem('bonne_appetit_workers');
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed.some((w) => w.name && (w.name.includes('أحمد صابر') || w.name.includes('مينا عادل') || w.name.includes('سناء يوسف')))) {
          return DEFAULT_WORKERS;
        }
        return parsed;
      }
      return DEFAULT_WORKERS;
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

  // Raw materials inventory (مخزن المواد الخام)
  const [rawMaterials, setRawMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_raw_materials_v1');
      return saved ? JSON.parse(saved) : DEFAULT_RAW_MATERIALS;
    } catch (e) {
      return DEFAULT_RAW_MATERIALS;
    }
  });

  // Dish Recipes / Formulas (كتابة خلطات كل صنف)
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_recipes_v1');
      return saved ? JSON.parse(saved) : DEFAULT_RECIPES;
    } catch (e) {
      return DEFAULT_RECIPES;
    }
  });

  // Operating Expenses (المصاريف الإدارية والتشغيلية)
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_expenses_v1');
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch (e) {
      return DEFAULT_EXPENSES;
    }
  });

  // Waste and Spoilage Logs (سجل الهالك والتوالف)
  const [wasteLogs, setWasteLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_waste_logs_v1');
      return saved ? JSON.parse(saved) : DEFAULT_WASTE_LOGS;
    } catch (e) {
      return DEFAULT_WASTE_LOGS;
    }
  });

  // Dynamic Products Catalog state (full admin control: add, edit, reorder, hide)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('bonne_appetit_products_v3');
      if (saved) {
        return JSON.parse(saved);
      }
      return PRODUCTS;
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

  // Modals & Navigation
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyFasting, setOnlyFasting] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState('inventory');
  const [incomingOrderAlert, setIncomingOrderAlert] = useState(null);

  // Auto-dismiss incoming order banner after 35 seconds
  useEffect(() => {
    if (incomingOrderAlert) {
      const timer = setTimeout(() => {
        setIncomingOrderAlert(null);
      }, 35000);
      return () => clearTimeout(timer);
    }
  }, [incomingOrderAlert]);

  // Cross-tab sync: trigger loud alert and notification when an order is placed from another tab or window
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bonne_appetit_new_order_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload && payload.order) {
            playLoudOrderAlert();
            sendDesktopNotification(payload.order);
            setIncomingOrderAlert(payload.order);

            // Sync orders from storage
            try {
              const saved = localStorage.getItem('bonne_appetit_orders');
              if (saved) setOrders(JSON.parse(saved));
            } catch (err) {}
          }
        } catch (err) {
          console.error("Storage event error:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Language State: 'ar' | 'en'
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('bonne_appetit_lang') || 'ar';
    } catch (e) {
      return 'ar';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('bonne_appetit_lang', lang);
    } catch (e) {}
  }, [lang]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;

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

  // Helper to sync local change to cloud
  // Save effects: persist locally to browser storage
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
      localStorage.setItem('bonne_appetit_inventory_v3', JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_workers_v2', JSON.stringify(workers));
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
      localStorage.setItem('bonne_appetit_raw_materials_v1', JSON.stringify(rawMaterials));
    } catch (e) {}
  }, [rawMaterials]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_recipes_v1', JSON.stringify(recipes));
    } catch (e) {}
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_expenses_v1', JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_waste_logs_v1', JSON.stringify(wasteLogs));
    } catch (e) {}
  }, [wasteLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('bonne_appetit_products_v3', JSON.stringify(products));
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

    // 1. Play loud POS restaurant chime
    playLoudOrderAlert();

    // 2. Dispatch native desktop notification
    sendDesktopNotification(newOrder);

    // 3. Set visual toast/banner alert
    setIncomingOrderAlert(newOrder);

    // 4. Notify all other open browser tabs/windows (e.g. admin tab open in background)
    try {
      localStorage.setItem(
        'bonne_appetit_new_order_event',
        JSON.stringify({ order: newOrder, timestamp: Date.now() })
      );
    } catch (e) {}
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

  // Production Handlers - AUTOMATICALLY ADDS TO INVENTORY & DEDUCTS RAW MATERIALS RECIPE
  const handleLogProduction = (newLog) => {
    // 1. Add to production logs
    setProductionLogs((prev) => [newLog, ...prev]);

    // 2. Automatically ADD to finished goods inventory
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

    // 4. Automatically DEDUCT raw materials according to recipe / formula
    const dishRecipe = recipes[newLog.productId] || [];
    if (dishRecipe.length > 0) {
      setRawMaterials((prevRms) => {
        return prevRms.map((rm) => {
          const ingredient = dishRecipe.find((ing) => ing.rawMaterialId === rm.id);
          if (ingredient) {
            const needed = (ingredient.amountPerUnit || 0) * newLog.quantity;
            const newStock = Math.max(0, Number((rm.stock - needed).toFixed(3)));
            return { ...rm, stock: newStock };
          }
          return rm;
        });
      });
    }
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
    setInventory(getInitialInventory());
    localStorage.removeItem('bonne_appetit_products_v3');
    localStorage.removeItem('bonne_appetit_products_v2');
    localStorage.removeItem('bonne_appetit_inventory_v3');
    localStorage.removeItem('bonne_appetit_inventory_v1');
  };

  const handleUpdateBusinessInfo = (newInfo) => {
    setBusinessInfo(newInfo);
  };

  // Raw Materials Inventory Handlers
  const handleUpdateRawMaterial = (updated) => {
    setRawMaterials((prev) => prev.map((rm) => (rm.id === updated.id ? updated : rm)));
  };

  const handleAddRawMaterial = (newRm) => {
    setRawMaterials((prev) => [newRm, ...prev]);
  };

  const handleDeleteRawMaterial = (rmId) => {
    setRawMaterials((prev) => prev.filter((rm) => rm.id !== rmId));
  };

  // Dish Recipes / Formulas Handlers
  const handleUpdateRecipe = (productId, newIngredients) => {
    setRecipes((prev) => ({
      ...prev,
      [productId]: newIngredients
    }));
  };

  // Administrative Expenses Handlers
  const handleAddExpense = (newExp) => {
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (expId) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== expId));
  };

  // Spoilage & Waste Handlers - Automatically Deducts from inventory
  const handleLogWaste = (wasteEntry) => {
    setWasteLogs((prev) => [wasteEntry, ...prev]);

    if (wasteEntry.type === 'raw') {
      // Deduct from rawMaterials stock
      setRawMaterials((prev) =>
        prev.map((rm) => {
          if (rm.id === wasteEntry.itemId) {
            return {
              ...rm,
              stock: Math.max(0, Number((rm.stock - wasteEntry.quantity).toFixed(3)))
            };
          }
          return rm;
        })
      );
    } else if (wasteEntry.type === 'product') {
      // Deduct from finished product inventory
      const cur = inventory[wasteEntry.itemId] || 0;
      setInventory((prev) => ({
        ...prev,
        [wasteEntry.itemId]: Math.max(0, cur - wasteEntry.quantity)
      }));

      // Audit movement
      handleAddStockMovement({
        id: 'mov_waste_' + Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        type: 'out_waste',
        productId: wasteEntry.itemId,
        productName: wasteEntry.itemName,
        quantityChange: -wasteEntry.quantity,
        previousStock: cur,
        newStock: Math.max(0, cur - wasteEntry.quantity),
        reference: `تسجيل هالك وتوالف: ${wasteEntry.reason}`,
        notes: `المسؤول: ${wasteEntry.reportedBy || 'المطبخ'}`
      });
    }
  };

  const handleDeleteWasteLog = (wasteId) => {
    setWasteLogs((prev) => prev.filter((w) => w.id !== wasteId));
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
      
      {/* Sticky Header & Category Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white">
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
          lang={lang}
          t={t}
          onToggleLang={handleToggleLang}
        />

        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={(catId) => {
            setActiveCategory(catId);
          }}
          lang={lang}
          t={t}
        />
      </div>

      {/* Main Dishes Catalog */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 md:pb-8">
        
        {/* Filter bar info & Wholesale Alert */}
        <div className="space-y-2 mb-4">
          {currentUser?.role === 'wholesale' && (
            <div className="bg-amber-100/80 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl text-xs flex items-center justify-between">
              <div>
                <strong>{t.wholesaleMerchantBadge} ({currentUser.name})</strong>: {t.wholesaleDiscountApplied}{' '}
                <strong>{wholesaleDiscountPct}%</strong> {t.automaticallyOnAll}
              </div>
              <button
                onClick={handleLogout}
                className="text-stone-600 hover:text-stone-900 underline font-bold"
              >
                {t.switchAccount}
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-stone-900">
                {t.menuTitle} ({filteredProducts.length} {t.itemCount})
              </h2>
              {onlyFasting && (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {t.fastingActiveBadge}
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
                <span>{onlyFasting ? t.cancelFastingFilter : t.showFastingFilter}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid with Wholesale Price support */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((rawProduct) => {
              const product = getLocalizedProduct(rawProduct, lang);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  currentUser={currentUser}
                  wholesaleDiscountPct={wholesaleDiscountPct}
                  onEditProduct={(p) => {
                    setAdminInitialTab('catalog');
                    setIsAdminDashboardOpen(true);
                  }}
                  lang={lang}
                  t={t}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-6 space-y-2">
            <p className="text-sm font-bold text-stone-700">{t.noProductsFound}</p>
            <p className="text-xs text-stone-500">
              {onlyFasting ? t.cancelFastingFilter : t.tryOtherSearch}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setOnlyFasting(false);
              }}
              className="text-xs font-bold text-brand-600 underline"
            >
              {t.viewAllDishes}
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer onSelectCategory={setActiveCategory} lang={lang} t={t} />

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
        lang={lang}
        t={t}
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
        lang={lang}
        t={t}
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
          // Raw Materials & Recipes
          rawMaterials={rawMaterials}
          onUpdateRawMaterial={handleUpdateRawMaterial}
          onAddRawMaterial={handleAddRawMaterial}
          onDeleteRawMaterial={handleDeleteRawMaterial}
          recipes={recipes}
          onUpdateRecipe={handleUpdateRecipe}
          // Expenses & Net Profit
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          // Spoilage & Waste
          wasteLogs={wasteLogs}
          onLogWaste={handleLogWaste}
          onDeleteWasteLog={handleDeleteWasteLog}
          initialTab={adminInitialTab}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      </ErrorBoundary>

      {/* Realtime Loud Order Alert Toast Banner */}
      {incomingOrderAlert && (
        <div className={`fixed top-4 ${lang === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-60 max-w-sm sm:max-w-md w-full shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4`}>
          <div className="bg-stone-900 text-white rounded-2xl border-2 border-amber-400 p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Ambient amber glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/25 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold shadow-md shrink-0 animate-bounce">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      {lang === 'en' ? 'Incoming New Order!' : 'أوردر جديد وارد الآن!'}
                    </span>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {lang === 'en' ? 'Loud Alert' : 'صوت تنبيه عالي 🔊'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-100 mt-0.5">
                    {incomingOrderAlert.clientName || (lang === 'en' ? 'New Customer' : 'عميل جديد')}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setIncomingOrderAlert(null)}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title={lang === 'en' ? 'Dismiss' : 'إغلاق'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Brief Info */}
            <div className="mt-3 bg-stone-800/90 rounded-xl p-3 text-xs space-y-1.5 border border-stone-700/60 relative z-10">
              <div className="flex justify-between items-center text-stone-300">
                <span>{lang === 'en' ? 'Order Number:' : 'رقم الطلب:'}</span>
                <span className="font-mono font-bold text-amber-400">{incomingOrderAlert.id}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>{lang === 'en' ? 'Total Amount:' : 'إجمالي الحساب:'}</span>
                <span className="font-mono font-black text-emerald-400 text-sm">{incomingOrderAlert.totalAmount} ج.م</span>
              </div>
              {incomingOrderAlert.itemsSummary && (
                <div className="text-stone-400 text-[11px] line-clamp-2 pt-1 border-t border-stone-700/50">
                  {incomingOrderAlert.itemsSummary}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 flex items-center gap-2 relative z-10">
              <button
                onClick={() => {
                  setAdminInitialTab('orders');
                  setIsAdminDashboardOpen(true);
                  setIncomingOrderAlert(null);
                }}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>{lang === 'en' ? 'Open in Admin Dashboard' : 'عرض الطلب في لوحة التحكم'}</span>
              </button>

              <button
                onClick={() => playLoudOrderAlert()}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl transition-all border border-stone-700"
                title={lang === 'en' ? 'Replay Loud Chime' : 'إعادة تشغيل صوت التنبيه العالي'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop-only Floating Call & WhatsApp Pill Button */}
      <div className={`hidden md:flex fixed bottom-5 ${lang === 'ar' ? 'left-5' : 'right-5'} z-40 items-center gap-2`}>
        <a
          href={`tel:${businessInfo.phone || BUSINESS_INFO.phone}`}
          className="bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-colors"
          title={`${t.callDirect} ${businessInfo.phoneDisplay || businessInfo.phone || BUSINESS_INFO.phoneDisplay}`}
        >
          <Phone className="w-5 h-5 text-brand-400" />
        </a>

        <a
          href={`https://wa.me/${businessInfo.whatsapp || BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(lang === 'en' ? 'Hello Bonne Appetit' : 'مرحباً بونابيتي')}`}
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold transition-colors"
          title={t.whatsappOrder}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{t.whatsappOrder} ({businessInfo.phoneDisplay || businessInfo.phone || BUSINESS_INFO.phoneDisplay})</span>
        </a>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Bar with Quick Order Strip */}
      <MobileBottomBar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onlyFasting={onlyFasting}
        onToggleFasting={() => setOnlyFasting((prev) => !prev)}
        onSelectMenu={() => {
          setActiveCategory('all');
          setOnlyFasting(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onFocusSearch={() => {
          const el = document.getElementById('mobile-search-input');
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onLogout={handleLogout}
        businessInfo={businessInfo}
        lang={lang}
        t={t}
        onToggleLang={handleToggleLang}
        activeCategory={activeCategory}
      />

    </div>
  );
}
