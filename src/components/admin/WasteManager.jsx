import React, { useState } from 'react';
import { 
  Trash2, Plus, Search, AlertOctagon, Filter, 
  Calendar, Check, X, ShieldAlert, ArrowDownCircle
} from 'lucide-react';
import { getLocalizedProduct } from '../../data/translations';

export default function WasteManager({
  wasteLogs = [],
  onLogWaste,
  onDeleteWasteLog,
  rawMaterials = [],
  products = [],
  lang = 'ar'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'raw' | 'product'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [wasteDate, setWasteDate] = useState(() => {
    const now = new Date();
    return `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [wasteType, setWasteType] = useState('raw'); // 'raw' | 'product'
  const [selectedItemId, setSelectedItemId] = useState('');
  const [wasteQty, setWasteQty] = useState('1');
  const [wasteReason, setWasteReason] = useState('هالك تشغيل وفرز طبيعي');
  const [reportedBy, setReportedBy] = useState('أم عطية');
  const [wasteNotes, setWasteNotes] = useState('');

  // Reasons list
  const REASONS = [
    'هالك تشغيل وفرز طبيعي',
    'تلف في التخزين أو الفريزر',
    'كسر أو تمزق في أطباق التعبئة',
    'خطأ في التسوية أو الإعداد',
    'انتهاء فترة الصلاحية أو عيب مورد'
  ];

  // Calculations
  const totalCostLoss = wasteLogs.reduce((acc, w) => acc + (w.costLoss || 0), 0);
  const rawLoss = wasteLogs.filter((w) => w.type === 'raw').reduce((acc, w) => acc + (w.costLoss || 0), 0);
  const productLoss = wasteLogs.filter((w) => w.type === 'product').reduce((acc, w) => acc + (w.costLoss || 0), 0);

  // Filtered list
  const filteredLogs = wasteLogs.filter((log) => {
    const matchSearch = log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = typeFilter === 'all' || log.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedItemId) return;

    let itemName = '';
    let unit = 'كجم';
    let costPerUnit = 0;

    if (wasteType === 'raw') {
      const rm = rawMaterials.find((r) => r.id === selectedItemId);
      if (rm) {
        itemName = rm.name;
        unit = rm.unit;
        costPerUnit = rm.unitCost;
      }
    } else {
      const prod = products.find((p) => p.id === selectedItemId);
      if (prod) {
        itemName = prod.name;
        unit = prod.unit || 'طبق';
        costPerUnit = prod.price;
      }
    }

    const qty = parseFloat(wasteQty) || 1;
    const costLoss = Number((qty * costPerUnit).toFixed(1));

    const newLog = {
      id: 'wst_' + Date.now(),
      date: wasteDate,
      type: wasteType,
      itemId: selectedItemId,
      itemName: itemName,
      quantity: qty,
      unit: unit,
      costLoss: costLoss,
      reason: wasteReason,
      reportedBy: reportedBy.trim(),
      notes: wasteNotes.trim()
    };

    onLogWaste(newLog);
    setIsAddModalOpen(false);
    setSelectedItemId('');
    setWasteQty('1');
    setWasteNotes('');
  };

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Banner & Loss KPIs */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                سجل الهالك والتالف وضبط الجودة
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                تسجيل هالك الخامات والوجبات • خصم تلقائي من المخزن • حساب الخسائر المالية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل هالك أو تالف</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">إجمالي الخسارة المالية للهالك</span>
            <span className="text-2xl font-black text-red-400 font-mono">
              {Math.round(totalCostLoss).toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">هالك المواد الخام</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {Math.round(rawLoss).toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">هالك المنتجات التامة (أطباق)</span>
            <span className="text-xl font-black text-purple-400 font-mono">
              {Math.round(productLoss).toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="space-y-3">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 text-xs">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في الصنف التالف أو السبب..."
              className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-stone-500 font-bold whitespace-nowrap">النوع:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border border-stone-200 rounded-xl bg-white font-medium focus:outline-hidden"
            >
              <option value="all">كافة أنواع الهالك</option>
              <option value="raw">هالك مواد خام فقط</option>
              <option value="product">هالك منتجات تامة فقط</option>
            </select>
          </div>
        </div>

        {/* Waste Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 font-black text-stone-700">
              <tr>
                <th className="p-3">التاريخ والوقت</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الصنف التالف</th>
                <th className="p-3 text-center">الكمية التالفة</th>
                <th className="p-3 text-center">الخسارة المقدرة</th>
                <th className="p-3">سبب الهالك</th>
                <th className="p-3">المسؤول / الشيف</th>
                <th className="p-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3 font-mono text-stone-500 text-[11px]">
                      {log.date}
                    </td>
                    <td className="p-3">
                      {log.type === 'raw' ? (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[10px] border border-amber-200">
                          مادة خام
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold text-[10px] border border-purple-200">
                          وجبة تامة
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-stone-900">
                      {log.itemName}
                      {log.notes && (
                        <span className="block text-[10px] text-stone-400 font-normal">
                          {log.notes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-stone-900 text-sm">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="p-3 text-center font-mono font-black text-red-600">
                      {log.costLoss} ج.م
                    </td>
                    <td className="p-3 text-stone-600 font-medium">
                      {log.reason}
                    </td>
                    <td className="p-3 text-stone-700 font-bold">
                      {log.reportedBy}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                            onDeleteWasteLog(log.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                        title="حذف السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-stone-400">
                    لم يتم تسجيل أي هالك حتى الآن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add New Waste Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-base font-black text-stone-900">تسجيل هالك أو تالف</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              
              {/* Type Switcher */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">نوع الهالك *:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setWasteType('raw'); setSelectedItemId(''); }}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      wasteType === 'raw'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    مادة خام (خضار، لحوم، أرز...)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWasteType('product'); setSelectedItemId(''); }}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      wasteType === 'product'
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-stone-200 bg-white text-stone-600'
                    }`}
                  >
                    منتج تام (طبق كفتة، ورق عنب...)
                  </button>
                </div>
              </div>

              {/* Item Select */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  اختر الصنف التالف *:
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden"
                >
                  <option value="">-- اختر الصنف --</option>
                  {wasteType === 'raw'
                    ? rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name} (متوفر: {rm.stock} {rm.unit} - تكلفة: {rm.unitCost} ج.م)
                        </option>
                      ))
                    : products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name} ({prod.price} ج.م)
                        </option>
                      ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">الكمية التالفة *:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={wasteQty}
                    onChange={(e) => setWasteQty(e.target.value)}
                    placeholder="1"
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-mono font-bold text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">المسؤول / الشيف:</label>
                  <input
                    type="text"
                    required
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl font-medium focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">سبب الهالك أو التلف *:</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-hidden"
                >
                  {REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">ملاحظات إضافية:</label>
                <input
                  type="text"
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  placeholder="أي تفاصيل خاصة بسبب التلف..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs transition-colors shadow-md active:scale-98"
                >
                  تسجيل الهالك وخصم الكمية من المخزن
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
