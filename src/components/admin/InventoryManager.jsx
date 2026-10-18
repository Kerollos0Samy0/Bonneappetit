import React, { useState, useMemo } from 'react';
import { Package, Search, Plus, Minus, AlertTriangle, CheckCircle2, SlidersHorizontal, RefreshCw, DollarSign, Boxes, ArrowUpRight, ArrowDownRight, History, Edit3 } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/products';

export default function InventoryManager({
  inventory,
  onUpdateStock,
  stockMovements,
  onAddStockMovement
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'low' | 'out' | 'available'
  const [showMovementsLog, setShowMovementsLog] = useState(false);

  // Manual Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('جرد دوري للمخزن');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter;

      const currentQty = inventory[product.id] || 0;
      let matchesStatus = true;
      if (stockStatusFilter === 'out') {
        matchesStatus = currentQty === 0;
      } else if (stockStatusFilter === 'low') {
        matchesStatus = currentQty > 0 && currentQty <= 5;
      } else if (stockStatusFilter === 'available') {
        matchesStatus = currentQty > 5;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, stockStatusFilter, inventory]);

  // Overall Warehouse Stats
  const totalItemsCount = PRODUCTS.length;
  const totalUnitsInStock = Object.values(inventory).reduce((acc, q) => acc + (q || 0), 0);
  
  const totalValuation = useMemo(() => {
    return PRODUCTS.reduce((acc, product) => {
      const qty = inventory[product.id] || 0;
      return acc + qty * product.price;
    }, 0);
  }, [inventory]);

  const lowStockCount = PRODUCTS.filter((p) => {
    const q = inventory[p.id] || 0;
    return q > 0 && q <= 5;
  }).length;

  const outOfStockCount = PRODUCTS.filter((p) => {
    const q = inventory[p.id] || 0;
    return q === 0;
  }).length;

  // Handle Quick Change
  const handleQuickAdjust = (productId, delta) => {
    const current = inventory[productId] || 0;
    const next = Math.max(0, current + delta);
    const product = PRODUCTS.find((p) => p.id === productId);

    onUpdateStock(productId, next);

    if (onAddStockMovement) {
      onAddStockMovement({
        id: 'mov_' + Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        type: delta > 0 ? 'in_quick' : 'out_quick',
        productId,
        productName: product?.name || productId,
        quantityChange: delta,
        previousStock: current,
        newStock: next,
        reference: delta > 0 ? 'إضافة سريعة (+)' : 'صرف سريع (-)',
        notes: 'تعديل سريع من جدول المخزن'
      });
    }
  };

  // Handle Detailed Adjustment Submit
  const handleSaveDetailedAdjustment = (e) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    const newQuantity = parseInt(adjustQty, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert('برجاء إدخال كمية صحيحة أكبر من أو تساوي الصفر');
      return;
    }

    const current = inventory[adjustingProduct.id] || 0;
    const diff = newQuantity - current;

    onUpdateStock(adjustingProduct.id, newQuantity);

    if (onAddStockMovement) {
      onAddStockMovement({
        id: 'mov_' + Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        type: 'manual_adjustment',
        productId: adjustingProduct.id,
        productName: adjustingProduct.name,
        quantityChange: diff,
        previousStock: current,
        newStock: newQuantity,
        reference: 'تسوية جرد يدوي',
        notes: adjustReason || 'جرد مخزن'
      });
    }

    setAdjustingProduct(null);
    setAdjustQty('');
    setAdjustReason('جرد دوري للمخزن');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">إجمالي رصيد المخزن</span>
            <Boxes className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {totalUnitsInStock}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">طبق / وحدة جاهزة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">القيمة المالية للمخزون</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {totalValuation.toLocaleString()} ج.م
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">سعر بيع الأصناف الحالية</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-bold">رصيد حرج (أقل من 5)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-700 font-mono">
            {lowStockCount}
          </span>
          <span className="text-[11px] text-amber-600 block mt-0.5">صنف يحتاج تصنيع</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs font-bold">أصناف نفدت تماماً</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-black text-red-700 font-mono">
            {outOfStockCount}
          </span>
          <span className="text-[11px] text-red-600 block mt-0.5">صنف رصيده صفر</span>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, Stock Status */}
      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن صنف في المخزن..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500 bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>

          {/* Toggle Movements Log Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowMovementsLog(!showMovementsLog)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                showMovementsLog
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{showMovementsLog ? 'إخفاء سجل الحركات' : 'سجل حركات المخزن'}</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 text-xs">
          
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              جميع الأقسام ({PRODUCTS.length})
            </button>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-stone-500 font-bold ml-1">حالة الرصيد:</span>
            <button
              onClick={() => setStockStatusFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'all' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStockStatusFilter('available')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'available' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              متوفر
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'low' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              رصيد حرج
            </button>
            <button
              onClick={() => setStockStatusFilter('out')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                stockStatusFilter === 'out' ? 'bg-red-600 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              نفد
            </button>
          </div>

        </div>
      </div>

      {/* Stock Movements Log (if toggled) */}
      {showMovementsLog && (
        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl shadow-md border border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-400" />
              <h4 className="font-bold text-xs text-white">سجل حركات الوارد والمنصرف والتسويات</h4>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              {stockMovements.length} حركة مسجلة
            </span>
          </div>

          {stockMovements.length === 0 ? (
            <p className="text-center py-6 text-stone-400 text-xs">
              لا توجد حركات مسجلة بعد. أي إنتاج عمال أو فاتورة مبيعات ستسجل هنا أوتوماتيكياً.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto border border-stone-800 rounded-xl">
              <table className="w-full text-right text-[11px]">
                <thead className="bg-stone-800 text-stone-300 font-bold sticky top-0">
                  <tr>
                    <th className="p-2">التاريخ</th>
                    <th className="p-2">نوع الحركة</th>
                    <th className="p-2">الصنف</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-center">الرصيد بعد الحركة</th>
                    <th className="p-2">البيان / الملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {stockMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-stone-800/50">
                      <td className="p-2 text-stone-400 font-mono">{mov.date}</td>
                      <td className="p-2">
                        {mov.type.startsWith('in') ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> وارد (+)
                          </span>
                        ) : mov.type.startsWith('out') ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> منصرف (-)
                          </span>
                        ) : (
                          <span className="text-sky-400 font-bold">تسوية جرد ⚖️</span>
                        )}
                      </td>
                      <td className="p-2 font-bold text-white">{mov.productName}</td>
                      <td className="p-2 text-center font-mono font-bold">
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                      </td>
                      <td className="p-2 text-center font-mono text-brand-300">
                        {mov.newStock}
                      </td>
                      <td className="p-2 text-stone-400">
                        <span className="text-stone-300 font-medium">{mov.reference}</span>
                        {mov.notes && <span className="block text-[10px] text-stone-500">{mov.notes}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Products Table */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم الصنف</th>
                <th className="p-3">القسم</th>
                <th className="p-3">الوحدة والوزن</th>
                <th className="p-3 text-left">سعر البيع</th>
                <th className="p-3 text-center">الرصيد المتاح</th>
                <th className="p-3 text-left">قيمة المخزون</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">تعديل سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((product, idx) => {
                const qty = inventory[product.id] || 0;
                const value = qty * product.price;

                return (
                  <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3 text-stone-400 font-mono">{idx + 1}</td>
                    
                    <td className="p-3">
                      <span className="font-extrabold text-stone-900 block text-sm">
                        {product.name}
                      </span>
                      {product.isFasting && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 rounded">
                          🌱 نباتي / صيامي
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </td>

                    <td className="p-3 text-stone-600">
                      <span>{product.unit}</span>
                      <span className="text-[10px] text-stone-400 block font-mono">({product.weightKg} كجم)</span>
                    </td>

                    <td className="p-3 text-left font-mono font-bold text-stone-800">
                      {product.price} ج.م
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`inline-block font-mono font-black text-sm px-2.5 py-1 rounded-xl ${
                          qty === 0
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : qty <= 5
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {qty} {qty > 10 ? 'طبق' : 'أطباق'}
                      </span>
                    </td>

                    <td className="p-3 text-left font-mono font-bold text-stone-900">
                      {value.toLocaleString()} ج.م
                    </td>

                    <td className="p-3 text-center">
                      {qty === 0 ? (
                        <span className="text-red-600 font-black text-[11px] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          🔴 نفد من المخزن
                        </span>
                      ) : qty <= 5 ? (
                        <span className="text-amber-700 font-black text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ⚠️ رصيد حرج
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✅ متوفر
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleQuickAdjust(product.id, -1)}
                          title="خصم 1"
                          disabled={qty === 0}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-stone-700 font-bold flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(product.id, 1)}
                          title="إضافة 1"
                          className="w-6 h-6 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => handleQuickAdjust(product.id, 5)}
                          title="إضافة 5"
                          className="px-1.5 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[10px]"
                        >
                          +5
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingProduct(product);
                            setAdjustQty(String(qty));
                          }}
                          title="جرد دقيق وتعديل"
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs ml-1"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Detailed Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-1">
              تعديل جرد المخزن: {adjustingProduct.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              الرصيد الحالي بالمخزن: <strong className="font-mono text-stone-800">{inventory[adjustingProduct.id] || 0}</strong> {adjustingProduct.unit}
            </p>

            <form onSubmit={handleSaveDetailedAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">الرصيد الفعلي الجديد بعد الجرد:</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-sm font-bold focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">سبب التعديل / ملاحظات:</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="مثال: جرد فعلي في الفريزر، تالف، زيادة إنتاج..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-xs"
                >
                  حفظ وتحديث الرصيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
