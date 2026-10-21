import React, { useState, useRef } from 'react';
import { 
  X, Upload, Download, FileSpreadsheet, CheckCircle2, 
  AlertTriangle, AlertCircle, RefreshCw, ArrowRight, ArrowLeft, 
  Check, FileText, Sparkles, DollarSign, Boxes, Plus
} from 'lucide-react';
import { parseInventoryExcelFile, exportInventoryToExcel } from '../../utils/excelInventoryHandler';

export default function ExcelImportModal({
  isOpen,
  onClose,
  products = [],
  inventory = {},
  onApplyExcelUpdates, // (updatesList) => void
  wholesaleDiscountPct = 15,
  lang = 'ar'
}) {
  if (!isOpen) return null;

  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [parseError, setParseError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Export Template / Current Inventory
  const handleExportNow = () => {
    exportInventoryToExcel(products, inventory, wholesaleDiscountPct);
  };

  // Handle Selected File
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError('');
    setParseResult(null);
    setIsParsing(true);

    try {
      const result = await parseInventoryExcelFile(selectedFile, products, inventory);
      setParseResult(result);
    } catch (err) {
      setParseError(err.message || 'فشل في قراءة ومعالجة ملف الإكسيل');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Confirm and Apply
  const handleConfirmApply = () => {
    if (!parseResult || !parseResult.updates) return;
    onApplyExcelUpdates(parseResult.updates);
    onClose();
  };

  // Summary Metrics
  const changedUpdates = parseResult?.updates?.filter((u) => u.hasAnyChange) || [];
  const stockChangesCount = parseResult?.updates?.filter((u) => u.stockChanged).length || 0;
  const priceChangesCount = parseResult?.updates?.filter((u) => u.priceChanged).length || 0;
  const wholesaleChangesCount = parseResult?.updates?.filter((u) => u.wholesalePriceChanged).length || 0;
  const newItemsCount = parseResult?.updates?.filter((u) => u.isNew).length || 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
        }}
        className="hidden"
      />

      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 relative my-4 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                  Microsoft Excel (XLSX / CSV)
                </span>
                <span className="text-[11px] font-bold text-stone-400">
                  تصدير • تعديل • استيراد
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'en' ? 'Excel Inventory Export & Import' : 'تحديث المخزن والأسعار بشيت إكسيل'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors border border-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Quick 3-Step Guide Banner */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
            <span className="font-extrabold text-stone-800 block mb-2 text-xs">
              {lang === 'en' ? 'Simple 3-Step Workflow:' : 'طريقة العمل في 3 خطوات بسيطة:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono text-[10px]">1</span>
                  <span>تصدير الشيت (Export)</span>
                </div>
                <p className="text-stone-500 leading-relaxed">
                  حمل شيت إكسيل محدث بأصناف وأسعار ورصيد المخزن الحالي.
                </p>
                <button
                  type="button"
                  onClick={handleExportNow}
                  className="mt-1 w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span>تنزيل الشيت الآن 📥</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-mono text-[10px]">2</span>
                  <span>التعديل في إكسيل (Edit)</span>
                </div>
                <p className="text-stone-500 leading-relaxed">
                  افتح الملف في برنامج Excel، وعدّل خانة (الرصيد) أو (سعر البيع) أو (الاسم) ثم احفظ الملف.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-mono text-[10px]">3</span>
                  <span>رفع وتطبيق الشيت (Upload)</span>
                </div>
                <p className="text-stone-500 leading-relaxed">
                  اسحب الملف المعدل هنا، وعاين كل التغييرات واعتمدها بنقرة واحدة.
                </p>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragOver 
                ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]' 
                : file 
                ? 'border-emerald-400 bg-emerald-50/30' 
                : 'border-stone-300 hover:border-emerald-500 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center mx-auto mb-3 text-emerald-600">
              {isParsing ? (
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              ) : file ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              ) : (
                <Upload className="w-7 h-7 text-stone-500" />
              )}
            </div>

            {isParsing ? (
              <div className="space-y-1">
                <h4 className="font-black text-stone-900 text-sm">جاري قراءة ومعالجة ملف الإكسيل...</h4>
                <p className="text-stone-500 text-[11px]">يتم فحص مطابقة الأصناف واكتشاف الفروقات في الرصيد والأسعار.</p>
              </div>
            ) : file ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  تم اختيار الملف بنجاح
                </span>
                <h4 className="font-mono font-black text-stone-900 text-sm mt-1">{file.name}</h4>
                <p className="text-stone-500 text-[11px]">
                  الحجم: {(file.size / 1024).toFixed(1)} ك.ب • اضغط لاختيار ملف آخر إن أردت
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="font-black text-stone-800 text-sm">
                  {lang === 'en' ? 'Click or Drag & Drop Excel Sheet Here' : 'اضغط لاختيار شيت الإكسيل المعدل أو اسحبه هنا'}
                </h4>
                <p className="text-stone-500 text-[11px]">
                  يدعم ملفات: <strong>.xlsx</strong> (Excel) و <strong>.xls</strong> و <strong>.csv</strong>
                </p>
              </div>
            )}
          </div>

          {/* Parse Error Banner */}
          {parseError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl font-bold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-black text-xs">تعذر معالجة الملف:</span>
                <span className="text-[11px] font-medium">{parseError}</span>
              </div>
            </div>
          )}

          {/* Parse Result Summary & Preview Table */}
          {parseResult && (
            <div className="space-y-4 pt-2 border-t border-stone-200">
              
              {/* Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-stone-500 text-[10px] block font-bold">إجمالي أصناف الشيت</span>
                  <span className="text-base sm:text-lg font-black text-stone-900 font-mono">{parseResult.totalRows}</span>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-800 text-[10px] block font-bold">تغييرات رصيد المخزن</span>
                  <span className="text-base sm:text-lg font-black text-amber-900 font-mono">{stockChangesCount} صنف</span>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] block font-bold">تغييرات السعر العادي</span>
                  <span className="text-base sm:text-lg font-black text-emerald-900 font-mono">{priceChangesCount} صنف</span>
                </div>

                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <span className="text-purple-800 text-[10px] block font-bold">تغييرات سعر التجار</span>
                  <span className="text-base sm:text-lg font-black text-purple-900 font-mono">{wholesaleChangesCount} صنف</span>
                </div>

                <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200 col-span-2 sm:col-span-1">
                  <span className="text-indigo-800 text-[10px] block font-bold">أصناف جديدة مضافة</span>
                  <span className="text-base sm:text-lg font-black text-indigo-900 font-mono">{newItemsCount} صنف</span>
                </div>
              </div>

              {/* Warnings / Errors in rows */}
              {parseResult.errors && parseResult.errors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>ملاحظات في بعض الأسطر تم تخطيها:</span>
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                    {parseResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li>... و {parseResult.errors.length - 5} أخطاء أخرى</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Detailed Changes Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-stone-900 text-xs">
                    {lang === 'en' ? 'Changes Preview (Detailed):' : 'معاينة التعديلات المكتشفة في الشيت:'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {changedUpdates.length} صنف عليه تعديل
                  </span>
                </div>

                {changedUpdates.length === 0 ? (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center text-stone-500 text-xs font-bold">
                    ✓ الشيت مطابق تماماً لبيانات المتجر الحالية ولا توجد أي فروقات في الأسعار أو الكميات.
                  </div>
                ) : (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white max-h-56 overflow-y-auto shadow-2xs">
                    <table className={`w-full ${lang === 'en' ? 'text-left' : 'text-right'} text-[11px]`}>
                      <thead className="bg-stone-100 text-stone-700 font-black border-b border-stone-200 sticky top-0">
                        <tr>
                          <th className="p-2">الصنف</th>
                          <th className="p-2 text-center">الرصيد بالمخزن</th>
                          <th className="p-2 text-center">السعر العادي (قطاعي)</th>
                          <th className="p-2 text-center">سعر التجار (جملة)</th>
                          <th className="p-2">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono">
                        {changedUpdates.map((u, idx) => (
                          <tr key={u.targetId || idx} className="hover:bg-stone-50/80">
                            <td className="p-2 font-sans">
                              <span className="font-bold text-stone-900 block">{u.product.name}</span>
                              <span className="text-[10px] text-stone-400 font-mono">#{u.targetId}</span>
                            </td>

                            {/* Stock Comparison */}
                            <td className="p-2 text-center">
                              {u.stockChanged ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-stone-400 line-through text-[10px]">{u.oldStock}</span>
                                  <span>←</span>
                                  <span className={`font-black font-mono px-1.5 py-0.2 rounded ${
                                    u.newStock > u.oldStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {u.newStock} طبق
                                  </span>
                                </div>
                              ) : (
                                <span className="text-stone-500 font-bold">{u.newStock} طبق</span>
                              )}
                            </td>

                            {/* Retail Price Comparison */}
                            <td className="p-2 text-center">
                              {u.priceChanged ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-stone-400 line-through text-[10px]">{u.oldPrice}</span>
                                  <span>←</span>
                                  <span className="font-black text-emerald-700 font-mono">
                                    {u.newPrice} ج.م
                                  </span>
                                </div>
                              ) : (
                                <span className="text-stone-500 font-bold">{u.newPrice} ج.م</span>
                              )}
                            </td>

                            {/* Wholesale Price Comparison */}
                            <td className="p-2 text-center">
                              {u.wholesalePriceChanged ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-stone-400 line-through text-[10px]">{u.oldWholesalePrice}</span>
                                  <span>←</span>
                                  <span className="font-black text-purple-700 font-mono">
                                    {u.newWholesalePrice} ج.م
                                  </span>
                                </div>
                              ) : (
                                <span className="text-stone-500 font-bold">{u.newWholesalePrice} ج.م</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-2 font-sans">
                              {u.isNew ? (
                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                                  صنف جديد ➕
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  تحديث بيانات ✓
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleExportNow}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1.5 transition-colors text-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>تنزيل شيت المخزن الحالي 📥</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold transition-colors text-xs"
              >
                {lang === 'en' ? 'Cancel' : 'إلغاء'}
              </button>

              <button
                type="button"
                disabled={!parseResult || changedUpdates.length === 0}
                onClick={handleConfirmApply}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black rounded-xl transition-all shadow-md flex items-center gap-2 text-xs"
              >
                <Check className="w-4 h-4" />
                <span>
                  {lang === 'en' 
                    ? `Confirm & Apply (${changedUpdates.length} Updates)` 
                    : `تأكيد وتطبيق التحديثات في المخزن (${changedUpdates.length} صنف) ✓`}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
