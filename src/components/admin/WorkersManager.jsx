import React, { useState, useMemo } from 'react';
import { UserCheck, Plus, Search, Calendar, Clock, CheckCircle2, AlertCircle, Trash2, UserPlus, Filter, Award, Boxes, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../../data/products';

export default function WorkersManager({
  products = PRODUCTS,
  workers,
  onAddWorker,
  onDeleteWorker,
  productionLogs,
  onLogProduction,
  onDeleteProductionLog,
  inventory
}) {
  // New Production Entry State
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [shift, setShift] = useState('وردية صباحية');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add Worker Modal State
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');

  // Filters for History
  const [filterWorker, setFilterWorker] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  // Handle Log Production
  const handleSubmitProduction = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedWorkerId) {
      setErrorMsg('برجاء اختيار العامل أولاً');
      return;
    }

    if (!selectedProductId) {
      setErrorMsg('برجاء اختيار الصنف / المنتج المصنّع');
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('برجاء إدخال كمية منتجة صحيحة (أكبر من صفر)');
      return;
    }

    const worker = workers.find((w) => w.id === selectedWorkerId);
    const product = products.find((p) => p.id === selectedProductId);

    if (!worker || !product) {
      setErrorMsg('بيانات العامل أو الصنف غير صالحة');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG');
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: 'prod_' + Date.now(),
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      productId: product.id,
      productName: product.name,
      productUnit: product.unit,
      productCategory: product.category,
      quantity: qtyNum,
      date: dateStr,
      time: timeStr,
      shift: shift,
      notes: notes.trim()
    };

    // Trigger parent callback (which also adds to inventory + stock movements automatically!)
    onLogProduction(newLog);

    setSuccessMsg(`✅ تم تسجيل إنتاج "${worker.name}" بنجاح: (+${qtyNum} ${product.unit} من ${product.name}) وتمت إضافتها فوراً إلى رصيد المخزن!`);
    
    // Reset Form
    setQuantity('');
    setNotes('');

    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Handle Add New Worker
  const handleCreateWorker = (e) => {
    e.preventDefault();
    if (!newWorkerName.trim()) return;

    const newWorker = {
      id: 'w_' + Date.now(),
      name: newWorkerName.trim(),
      role: newWorkerRole.trim() || 'عامل تجهيز وإنتاج',
      phone: newWorkerPhone.trim() || '',
      active: true
    };

    onAddWorker(newWorker);
    setIsAddWorkerOpen(false);
    setNewWorkerName('');
    setNewWorkerRole('');
    setNewWorkerPhone('');
    setSelectedWorkerId(newWorker.id);
  };

  // Filtered Production Logs
  const filteredLogs = useMemo(() => {
    return productionLogs.filter((log) => {
      const matchWorker = filterWorker === 'all' || log.workerId === filterWorker;
      const matchDate = !filterDate || log.date.includes(filterDate);
      const matchProduct = !searchProduct || log.productName.toLowerCase().includes(searchProduct.toLowerCase());
      return matchWorker && matchDate && matchProduct;
    });
  }, [productionLogs, filterWorker, filterDate, searchProduct]);

  // Daily & Worker Statistics
  const todayStr = new Date().toLocaleDateString('ar-EG');
  const todayTotalProduced = productionLogs
    .filter((log) => log.date === todayStr)
    .reduce((acc, log) => acc + log.quantity, 0);

  const totalAllTimeProduced = productionLogs.reduce((acc, log) => acc + log.quantity, 0);

  // Top Producing Worker
  const workerStats = useMemo(() => {
    const counts = {};
    productionLogs.forEach((log) => {
      counts[log.workerName] = (counts[log.workerName] || 0) + log.quantity;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [productionLogs]);

  const topWorker = workerStats.length > 0 ? workerStats[0] : null;

  return (
    <div className="space-y-6">
      
      {/* Top Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-brand-50 to-amber-50 p-4 rounded-2xl border border-brand-200">
          <div className="flex items-center justify-between text-brand-800 mb-1">
            <span className="text-xs font-bold">إنتاج اليوم الفعلي</span>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <span className="text-2xl font-black text-brand-950 font-mono">
            +{todayTotalProduced}
          </span>
          <span className="text-[11px] text-brand-700 block mt-0.5">طبق/وحدة تم تصنيعها اليوم</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">إجمالي الإنتاج التراكمي</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-stone-900 font-mono">
            {totalAllTimeProduced}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">إجمالي ما ضخه العمال بالمخزن</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold">الأعلى إنتاجية</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-sm font-black text-stone-900 block truncate">
            {topWorker ? topWorker[0] : 'لا توجد بيانات'}
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5 font-mono">
            {topWorker ? `${topWorker[1]} طبق مسجل` : 'ابدأ بتسجيل أول وردية'}
          </span>
        </div>
      </div>

      {/* Main Production Entry Form */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                تسجيل إنتاج جديد للعمال (إضافة فورية للمخزن)
              </h3>
              <p className="text-[11px] text-stone-500">
                اختر العامل والصنف والكمية؛ وسيتم تحديث رصيد المخزن أوتوماتيكياً في نفس اللحظة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-600" />
            <span>إضافة عامل جديد</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitProduction} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          
          {/* Worker Dropdown */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              اسم العامل / الشيف <span className="text-red-500">*</span>:
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:outline-hidden focus:border-brand-500"
            >
              <option value="">-- اختر العامل --</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.role})
                </option>
              ))}
            </select>
          </div>

          {/* Product Dropdown */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              الصنف / المنتج المُصنع <span className="text-red-500">*</span>:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:outline-hidden focus:border-brand-500"
            >
              <option value="">-- اختر الصنف من المنيو --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} (المخزون الحالي: {inventory[prod.id] || 0} {prod.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              الكمية المنتجة (بالطبق/الوحدة) <span className="text-red-500">*</span>:
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="مثال: 25"
              className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-sm font-bold focus:outline-hidden focus:border-brand-500"
            />
          </div>

          {/* Shift */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              الوردية / التوقيت:
            </label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium focus:outline-hidden focus:border-brand-500"
            >
              <option value="وردية صباحية">وردية صباحية ☀️</option>
              <option value="وردية مسائية">وردية مسائية 🌙</option>
              <option value="ساعات إضافية (أوفر تايم)">ساعات إضافية (أوفر تايم) ⚡</option>
              <option value="تجهيز عطلة / موسم">تجهيز عطلة / موسم 📦</option>
            </select>
          </div>

          {/* Notes (Full width on small, span 3 on medium) */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="font-bold text-stone-700 block mb-1">
              ملاحظات إضافية (جودة التغليف، تواريخ انتهاء، رقم الباتش...):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات اختيارية عن التشغيلة..."
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>تسجيل وإضافة للمخزن</span>
              <span className="font-mono text-base">+</span>
            </button>
          </div>

        </form>
      </div>

      {/* Production History & Filter */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-stone-900">
              سجل إنتاج العمال اليومي ({filteredLogs.length})
            </h3>
            <p className="text-[11px] text-stone-500">
              متابعة كل ما ينتجه العمال والتأكد من انضباط المخزن وتوزيع العمل.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            {/* Filter by Worker */}
            <select
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
              className="p-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
            >
              <option value="all">جميع العمال ({workers.length})</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Search by Product */}
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="بحث بالصنف..."
              className="p-2 rounded-xl border border-stone-300 bg-white text-xs w-36"
            />
          </div>
        </div>

        {/* Table of Production Logs */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <p className="text-xs text-stone-500 font-bold">
              لا توجد عمليات إنتاج مسجلة حتى الآن وفقاً لمعايير البحث.
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              استخدم النموذج أعلاه لتسجيل أول وردية عمل لعامل.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">العامل / الشيف</th>
                  <th className="p-3">الوردية</th>
                  <th className="p-3">الصنف المُصنّع</th>
                  <th className="p-3 text-center">الكمية المُنتجة</th>
                  <th className="p-3 text-center">حالة المخزن</th>
                  <th className="p-3">ملاحظات</th>
                  <th className="p-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3">
                      <span className="font-mono text-stone-800 font-bold block">{log.date}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{log.time}</span>
                    </td>

                    <td className="p-3">
                      <span className="font-extrabold text-stone-900 block">{log.workerName}</span>
                      <span className="text-[10px] text-stone-500">{log.workerRole}</span>
                    </td>

                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                        {log.shift}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-stone-900">
                      {log.productName}
                      <span className="text-[10px] text-stone-400 block font-normal">{log.productUnit}</span>
                    </td>

                    <td className="p-3 text-center">
                      <span className="font-mono font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        +{log.quantity}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        أُضيفت للمخزن
                      </span>
                    </td>

                    <td className="p-3 text-stone-500 text-[11px]">
                      {log.notes || '-'}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف هذا السجل الخاص بـ ${log.workerName}؟`)) {
                            onDeleteProductionLog(log.id);
                          }
                        }}
                        title="حذف هذا السجل"
                        className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workers Management Modal */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-black text-stone-900 mb-1">
              إضافة عامل / شيف جديد لفريق بونابيتي
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              أدخل بيانات العامل لتتمكن من إسناد عمليات الإنتاج إليه.
            </p>

            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">اسم العامل الكامل *:</label>
                <input
                  type="text"
                  required
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="مثال: شيف مصطفى محمود"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-bold focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">التخصص / القسم المسؤول عنه:</label>
                <input
                  type="text"
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  placeholder="مثال: تجهيز محاشي وممبار / شيف شواية وكفتة..."
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">رقم الهاتف (اختياري):</label>
                <input
                  type="tel"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-xs"
                >
                  إضافة العامل الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
