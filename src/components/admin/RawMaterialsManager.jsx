import React, { useState } from 'react';
import { 
  Boxes, Plus, Search, Edit2, Trash2, AlertTriangle, 
  Check, Save, Sparkles, Scale, DollarSign, ArrowDownRight, 
  ArrowUpRight, RefreshCw, X, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { getLocalizedProduct } from '../../data/translations';

export default function RawMaterialsManager({
  rawMaterials = [],
  onUpdateRawMaterial,
  onAddRawMaterial,
  onDeleteRawMaterial,
  recipes = {},
  onUpdateRecipe,
  products = [],
  lang = 'ar'
}) {
  const [activeSubTab, setActiveSubTab] = useState('stock'); // 'stock' | 'recipes' | 'restock'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New Raw Material Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('كجم');
  const [newStock, setNewStock] = useState('10');
  const [newUnitCost, setNewUnitCost] = useState('50');
  const [newMinAlert, setNewMinAlert] = useState('10');
  const [newCategory, setNewCategory] = useState('خضروات');

  // Restock Form State
  const [selectedRmForRestock, setSelectedRmForRestock] = useState('');
  const [restockQty, setRestockQty] = useState('20');
  const [restockCost, setRestockCost] = useState('');
  const [restockSuccess, setRestockSuccess] = useState('');

  // Selected Dish for Recipe Editing
  const [selectedDishForRecipe, setSelectedDishForRecipe] = useState(products[0]?.id || 'p1');
  const [recipeIngredientRm, setRecipeIngredientRm] = useState('');
  const [recipeIngredientAmount, setRecipeIngredientAmount] = useState('0.2');

  // Calculations
  const totalStockValue = rawMaterials.reduce((acc, rm) => acc + (rm.stock * rm.unitCost), 0);
  const lowStockCount = rawMaterials.filter((rm) => rm.stock <= rm.minAlert).length;
  const totalRecipesCount = Object.keys(recipes).length;

  // Filtered Raw Materials
  const filteredMaterials = rawMaterials.filter((rm) => {
    const matchSearch = rm.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || rm.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Handle Add New Raw Material
  const handleAddNewMaterial = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem = {
      id: 'rm_' + Date.now(),
      name: newName.trim(),
      unit: newUnit,
      stock: parseFloat(newStock) || 0,
      unitCost: parseFloat(newUnitCost) || 0,
      minAlert: parseFloat(newMinAlert) || 10,
      category: newCategory
    };

    onAddRawMaterial(newItem);
    setIsAddModalOpen(false);
    setNewName('');
    setNewStock('10');
    setNewUnitCost('50');
  };

  // Handle Restock
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedRmForRestock) return;

    const targetRm = rawMaterials.find((rm) => rm.id === selectedRmForRestock);
    if (!targetRm) return;

    const addedQty = parseFloat(restockQty) || 0;
    const newUnitCost = restockCost ? parseFloat(restockCost) : targetRm.unitCost;

    const updated = {
      ...targetRm,
      stock: Number((targetRm.stock + addedQty).toFixed(2)),
      unitCost: newUnitCost
    };

    onUpdateRawMaterial(updated);
    setRestockSuccess(`تم توريد ${addedQty} ${targetRm.unit} بنجاح إلى مخزن "${targetRm.name}".`);
    setRestockQty('20');
    setRestockCost('');
    setTimeout(() => setRestockSuccess(''), 3500);
  };

  // Current Recipe under inspection
  const currentDishRecipe = recipes[selectedDishForRecipe] || [];
  const currentProduct = products.find((p) => p.id === selectedDishForRecipe);

  // Calculate Cost of the dish based on recipe ingredients
  const currentDishCost = currentDishRecipe.reduce((acc, ing) => {
    const rm = rawMaterials.find((r) => r.id === ing.rawMaterialId);
    const cost = rm ? rm.unitCost : 0;
    return acc + (ing.amountPerUnit * cost);
  }, 0);

  // Add Ingredient to Recipe
  const handleAddIngredientToRecipe = (e) => {
    e.preventDefault();
    if (!recipeIngredientRm) return;

    const rm = rawMaterials.find((r) => r.id === recipeIngredientRm);
    if (!rm) return;

    const amount = parseFloat(recipeIngredientAmount);
    if (isNaN(amount) || amount <= 0) return;

    const existingIndex = currentDishRecipe.findIndex((i) => i.rawMaterialId === rm.id);
    let updatedRecipe;
    if (existingIndex > -1) {
      updatedRecipe = [...currentDishRecipe];
      updatedRecipe[existingIndex].amountPerUnit = amount;
    } else {
      updatedRecipe = [
        ...currentDishRecipe,
        {
          rawMaterialId: rm.id,
          rawMaterialName: rm.name,
          amountPerUnit: amount,
          unit: rm.unit
        }
      ];
    }

    onUpdateRecipe(selectedDishForRecipe, updatedRecipe);
    setRecipeIngredientRm('');
    setRecipeIngredientAmount('0.2');
  };

  // Remove Ingredient from Recipe
  const handleRemoveIngredientFromRecipe = (rawMaterialId) => {
    const updated = currentDishRecipe.filter((i) => i.rawMaterialId !== rawMaterialId);
    onUpdateRecipe(selectedDishForRecipe, updated);
  };

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Top Banner & KPIs */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                مخزن المواد الخام والخلطات (BOM)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                إدارة خامات ومكونات كل وجبة • خصم آلي عند تسجيل إنتاج العمال • مراقبة تكلفة الطبق
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة خام جديدة</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">أصناف الخامات بالمخزن</span>
            <span className="text-xl font-black text-amber-400 font-mono">{rawMaterials.length}</span>
            <span className="text-[10px] text-stone-500 mr-1">صنف خام</span>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">إجمالي قيمة مخزون الخامات</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{Math.round(totalStockValue).toLocaleString()}</span>
            <span className="text-[10px] text-stone-500 mr-1">ج.م</span>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">خامات أوشكت على النفاد</span>
            <span className={`text-xl font-black font-mono ${lowStockCount > 0 ? 'text-red-400' : 'text-stone-200'}`}>
              {lowStockCount}
            </span>
            <span className="text-[10px] text-stone-500 mr-1">تحتاج توريد</span>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
            <span className="text-stone-400 block mb-1">خلطات الأصناف المحددة</span>
            <span className="text-xl font-black text-sky-400 font-mono">{totalRecipesCount}</span>
            <span className="text-[10px] text-stone-500 mr-1">خلطة جاهزة</span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex border-b border-stone-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveSubTab('stock')}
          className={`py-3 px-5 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'stock'
              ? 'border-amber-500 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4 text-amber-600" />
          <span>أرصدة مخزن المواد الخام ({rawMaterials.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recipes')}
          className={`py-3 px-5 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'recipes'
              ? 'border-amber-500 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-600" />
          <span>خلطات ومكونات كل صنف (الربط التلقائي للإنتاج)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('restock')}
          className={`py-3 px-5 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'restock'
              ? 'border-amber-500 text-amber-900 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          <span>توريد وشراء خامات جديدة</span>
        </button>
      </div>

      {/* SUBTAB 1: Raw Materials Stock Table */}
      {activeSubTab === 'stock' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الخامات والمكونات..."
                className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-stone-500 font-bold whitespace-nowrap">التصنيف:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 text-xs border border-stone-200 rounded-xl bg-white font-medium focus:outline-hidden"
              >
                <option value="all">كافة التصنيفات</option>
                <option value="لحوم">لحوم ومصنعات</option>
                <option value="دواجن">دواجن</option>
                <option value="حبوب وبقوليات">حبوب وأرز وبقوليات</option>
                <option value="خضروات">خضروات وبصل</option>
                <option value="معجنات">معجنات وعجائن</option>
                <option value="زيوت ودهون">زيوت وسمن</option>
                <option value="توابل ومطيبات">توابل وبهارات</option>
                <option value="تعبئة وتغليف">تعبئة وتغليف</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-black text-stone-700">
                <tr>
                  <th className="p-3.5">اسم المادة الخام</th>
                  <th className="p-3.5">التصنيف</th>
                  <th className="p-3.5 text-center">الرصيد المتاح</th>
                  <th className="p-3.5 text-center">الوحدة</th>
                  <th className="p-3.5 text-center">سعر التكلفة (ج.م)</th>
                  <th className="p-3.5 text-center">إجمالي القيمة</th>
                  <th className="p-3.5 text-center">حد التنبيه</th>
                  <th className="p-3.5 text-center">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMaterials.map((rm) => {
                  const isLow = rm.stock <= rm.minAlert;
                  const itemTotalCost = rm.stock * rm.unitCost;

                  return (
                    <tr key={rm.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">
                        {rm.name}
                      </td>
                      <td className="p-3.5 text-stone-500">
                        <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {rm.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-sm">
                        <span className={isLow ? 'text-red-600' : 'text-stone-900'}>
                          {rm.stock}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-stone-500">
                        {rm.unit}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-stone-700">
                        {rm.unitCost} ج.م
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-emerald-700">
                        {Math.round(itemTotalCost).toLocaleString()} ج.م
                      </td>
                      <td className="p-3.5 text-center font-mono text-stone-400">
                        {rm.minAlert} {rm.unit}
                      </td>
                      <td className="p-3.5 text-center">
                        {isLow ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300 animate-pulse">
                            ⚠️ رصيد حرج
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            متوفر ✓
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedRmForRestock(rm.id);
                            setActiveSubTab('restock');
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          + توريد
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Recipes & Formulations (خلطات كل صنف) */}
      {activeSubTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Select Dish from Menu */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
            <h3 className="font-black text-stone-900 text-xs flex items-center justify-between">
              <span>اختر الصنف لتحديد خلطته:</span>
              <span className="text-[11px] text-stone-400 font-normal">({products.length} صنف بالمنيو)</span>
            </h3>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {products.map((prod) => {
                const isSelected = prod.id === selectedDishForRecipe;
                const recipeExists = !!recipes[prod.id] && recipes[prod.id].length > 0;
                const localized = getLocalizedProduct(prod, lang);

                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedDishForRecipe(prod.id)}
                    className={`w-full text-right p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 font-bold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <span className="block font-black text-stone-900">{localized.name}</span>
                      <span className="text-[10px] text-stone-400">{prod.price} ج.م • {prod.weightKg} كجم</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {recipeExists ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          الخلطة محددة ✓
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                          لم تحدد
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recipe Ingredients & Cost Analysis */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Dish Header & Profit Analysis Card */}
            {currentProduct && (
              <div className="bg-stone-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    الخلطة المعتمدة للصنف (BOM)
                  </span>
                  <h3 className="text-base font-black mt-0.5">
                    {currentProduct.name} ({currentProduct.unit})
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    سيتم خصم هذه المكونات تلقائياً من مخزن المواد الخام بمجرد تسجيل العامل إنتاج هذا الصنف.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-stone-800 p-3 rounded-xl border border-stone-700 shrink-0 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block">سعر البيع:</span>
                    <strong className="text-sm font-black text-white font-mono">{currentProduct.price} ج.م</strong>
                  </div>
                  <div className="border-r border-stone-700 pr-3">
                    <span className="text-stone-400 text-[10px] block">تكلفة خلطة الخامات:</span>
                    <strong className="text-sm font-black text-amber-400 font-mono">{Math.round(currentDishCost)} ج.م</strong>
                  </div>
                  <div className="border-r border-stone-700 pr-3">
                    <span className="text-stone-400 text-[10px] block">الربح التقديري:</span>
                    <strong className="text-sm font-black text-emerald-400 font-mono">
                      {Math.max(0, currentProduct.price - Math.round(currentDishCost))} ج.م
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients Table */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden p-4 space-y-3">
              <h4 className="text-xs font-black text-stone-800 flex items-center justify-between">
                <span>مكونات الخلطة للطبق الواحد ({currentDishRecipe.length} مكون):</span>
                <span className="text-[11px] text-stone-400 font-normal">
                  إجمالي تكلفة المكونات: <strong className="text-amber-700 font-bold">{Math.round(currentDishCost)} ج.م</strong>
                </span>
              </h4>

              {currentDishRecipe.length > 0 ? (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 font-bold text-stone-700">
                      <tr>
                        <th className="p-2.5">المادة الخام</th>
                        <th className="p-2.5 text-center">الكمية لكل طبق</th>
                        <th className="p-2.5 text-center">سعر الكيلو/الوحدة</th>
                        <th className="p-2.5 text-center">تكلفة الحصة</th>
                        <th className="p-2.5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {currentDishRecipe.map((ing) => {
                        const rm = rawMaterials.find((r) => r.id === ing.rawMaterialId);
                        const cost = rm ? rm.unitCost : 0;
                        const lineCost = Number((ing.amountPerUnit * cost).toFixed(1));

                        return (
                          <tr key={ing.rawMaterialId} className="hover:bg-stone-50">
                            <td className="p-2.5 font-bold text-stone-900">
                              {ing.rawMaterialName}
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold">
                              {ing.amountPerUnit} {ing.unit}
                            </td>
                            <td className="p-2.5 text-center font-mono text-stone-500">
                              {cost} ج.م
                            </td>
                            <td className="p-2.5 text-center font-mono font-black text-amber-700">
                              {lineCost} ج.م
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleRemoveIngredientFromRecipe(ing.rawMaterialId)}
                                className="p-1 text-stone-400 hover:text-red-600 rounded"
                                title="إزالة من الخلطة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                  لم يتم تحديد مكونات خلطة هذا الصنف بعد. أضف الخامات والمقادير من النموذج بالأسفل.
                </div>
              )}

              {/* Add Ingredient to Recipe Form */}
              <form onSubmit={handleAddIngredientToRecipe} className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-6">
                  <label className="font-bold text-stone-700 block mb-1">إضافة خامة للخلطة:</label>
                  <select
                    value={recipeIngredientRm}
                    onChange={(e) => setRecipeIngredientRm(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden"
                  >
                    <option value="">-- اختر مادة خام من المخزن --</option>
                    {rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.stock} {rm.unit} متوفر - {rm.unitCost} ج.م/{rm.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="font-bold text-stone-700 block mb-1">الكمية للطبق الواحد:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={recipeIngredientAmount}
                    onChange={(e) => setRecipeIngredientAmount(e.target.value)}
                    placeholder="0.25"
                    className="w-full p-2 border border-stone-300 rounded-xl bg-white font-mono text-center font-bold focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة للخلطة</span>
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 3: Restock Form (توريد خامات) */}
      {activeSubTab === 'restock' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-base font-black text-stone-900">توريد وشراء خامات جديدة للمخزن</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              تسجيل كميات الخامات المشتراة وتحديث أسعار التكلفة وأرصدة المخزن تلقائياً.
            </p>
          </div>

          {restockSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{restockSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">اختر المادة الخام الموردة *:</label>
              <select
                value={selectedRmForRestock}
                onChange={(e) => {
                  setSelectedRmForRestock(e.target.value);
                  const rm = rawMaterials.find((r) => r.id === e.target.value);
                  if (rm) setRestockCost(String(rm.unitCost));
                }}
                required
                className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-medium focus:outline-hidden"
              >
                <option value="">-- اختر مادة خام --</option>
                {rawMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} (رصيد حالي: {rm.stock} {rm.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">الكمية المضافة *:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="25"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">سعر الشراء للوحدة (ج.م):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={restockCost}
                  onChange={(e) => setRestockCost(e.target.value)}
                  placeholder="سعر الكيلو"
                  className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-mono font-bold focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>تأكيد توريد الكمية وإضافتها للمخزن</span>
            </button>
          </form>
        </div>
      )}

      {/* Add New Raw Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-black text-stone-900">إضافة مادة خام جديدة</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">اسم المادة الخام *:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: لحم ضاني مفروم بلدي"
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="لحوم">لحوم</option>
                    <option value="دواجن">دواجن</option>
                    <option value="حبوب وبقوليات">حبوب وبقوليات</option>
                    <option value="خضروات">خضروات</option>
                    <option value="معجنات">معجنات</option>
                    <option value="زيوت ودهون">زيوت ودهون</option>
                    <option value="توابل ومطيبات">توابل ومطيبات</option>
                    <option value="تعبئة وتغليف">تعبئة وتغليف</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">وحدة القياس:</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="كجم">كجم</option>
                    <option value="لتر">لتر</option>
                    <option value="طبق">طبق</option>
                    <option value="قطعة">قطعة</option>
                    <option value="عبوة">عبوة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">الرصيد الأولي:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">سعر التكلفة:</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newUnitCost}
                    onChange={(e) => setNewUnitCost(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono text-center focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">حد التنبيه:</label>
                  <input
                    type="number"
                    min="1"
                    value={newMinAlert}
                    onChange={(e) => setNewMinAlert(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl font-mono text-center focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-colors shadow-sm"
                >
                  حفظ وإضافة للمخزن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
