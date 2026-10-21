import React, { useState, useMemo } from 'react';
import { 
  DollarSign, Plus, Search, Trash2, Calendar, 
  CreditCard, PieChart, TrendingUp, TrendingDown, 
  Receipt, Filter, X, Check, ArrowDownRight, Wallet
} from 'lucide-react';

export default function ExpensesManager({
  expenses = [],
  onAddExpense,
  onDeleteExpense,
  invoices = [],
  orders = [],
  lang = 'ar'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense Form State
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expenseCategory, setExpenseCategory] = useState('إيجار المطبخ والمخزن');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('كاش');

  // Categories List
  const CATEGORIES = [
    'إيجار المطبخ والمخزن',
    'كهرباء وغاز ومياه',
    'أجور ويوميات العمال',
    'تغليف وتعبئة',
    'شحن ونقل وبنزين',
    'صيانة ومعدات',
    'تسويق وإعلانات',
    'بوفيه ونثريات ومشتريات'
  ];

  // Financial Calculations
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  
  // Total Revenue from Invoices & Completed Orders
  const invoicesRevenue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const ordersRevenue = orders
    .filter((o) => o.status !== 'ملغي')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalRevenue = invoicesRevenue + ordersRevenue;

  // Net Profit
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenses.forEach((exp) => {
      map[exp.category] = (map[exp.category] || 0) + exp.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Filtered Expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!expenseDesc.trim() || !expenseAmount) return;

    const newExp = {
      id: 'exp_' + Date.now(),
      date: expenseDate,
      category: expenseCategory,
      description: expenseDesc.trim(),
      amount: parseFloat(expenseAmount) || 0,
      paidBy: expensePaidBy,
      recordedBy: 'إدارة بونابيتي'
    };

    onAddExpense(newExp);
    setIsAddModalOpen(false);
    setExpenseDesc('');
    setExpenseAmount('');
  };

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Banner & KPI Financial Health Overview */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-md">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                المصاريف الإدارية والتشغيلية وحساب الأرباح
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                متابعة كافة بنود الصرف • تحليل الإيرادات والمصروفات • حساب صافي أرباح البراند
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span>إجمالي الإيرادات (المبيعات)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span>إجمالي المصاريف الإدارية</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-xl font-black text-red-400 font-mono">
              {totalExpenses.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span>صافي الأرباح الصافية</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <span className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {netProfit.toLocaleString()}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60">
            <div className="flex items-center justify-between text-stone-400 mb-1">
              <span>هامش صافي الربح</span>
              <PieChart className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xl font-black text-sky-400 font-mono">
              {profitMargin}%
            </span>
            <span className="text-[10px] text-stone-500 mr-1">من المبيعات</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Breakdown + Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Category Breakdown Sidebar */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
          <h3 className="font-black text-stone-900 text-xs flex items-center justify-between border-b border-stone-100 pb-2">
            <span>توزيع المصاريف حسب البند:</span>
            <span className="text-stone-400 text-[11px] font-normal">({totalExpenses.toLocaleString()} ج.م)</span>
          </h3>

          <div className="space-y-2.5">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map(([cat, amount]) => {
                const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-stone-800">{cat}</span>
                      <span className="font-mono text-stone-600">{amount.toLocaleString()} ج.م ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stone-400 text-center py-6">لم يتم تسجيل أي مصاريف حتى الآن.</p>
            )}
          </div>
        </div>

        {/* Expenses List & Filtering */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في بيان المصروف..."
                className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-stone-500 font-bold whitespace-nowrap">البند:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 border border-stone-200 rounded-xl bg-white font-medium focus:outline-hidden"
              >
                <option value="all">كافة البنود</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-black text-stone-700">
                <tr>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">البند</th>
                  <th className="p-3">بيان وتفاصيل المصروف</th>
                  <th className="p-3 text-center">طريقة الدفع</th>
                  <th className="p-3 text-center">المبلغ (ج.م)</th>
                  <th className="p-3 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3 font-mono text-stone-500">
                        {exp.date}
                      </td>
                      <td className="p-3">
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-stone-900">
                        {exp.description}
                      </td>
                      <td className="p-3 text-center text-stone-600">
                        {exp.paidBy}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-red-600 text-sm">
                        {exp.amount.toLocaleString()} ج.م
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-stone-400">
                      لا توجد مصاريف مسجلة مطابقة للبحث.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Add New Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">تسجيل مصروف إداري جديد</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">التاريخ *:</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">طريقة الدفع:</label>
                  <select
                    value={expensePaidBy}
                    onChange={(e) => setExpensePaidBy(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="كاش">كاش (نقدية)</option>
                    <option value="فودافون كاش">فودافون كاش</option>
                    <option value="إنستاباي">إنستاباي (InstaPay)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">بند المصروف *:</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-hidden font-bold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">بيان وتفاصيل المصروف *:</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="مثال: فاتورة استهلاك الغاز للمطبخ أو شراء كراتين"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">المبلغ المصروف (ج.م) *:</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="1500"
                  className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-base font-black text-red-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors shadow-md active:scale-98"
                >
                  تسجيل المصروف واحتسابه بالأرباح
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
