import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Check, Boxes, AlertCircle } from 'lucide-react';
import { getLocalizedProduct } from '../../data/translations';

export default function ProductCombobox({
  products = [],
  inventory = {},
  selectedProductId = '',
  onSelectProduct,
  placeholder,
  lang = 'ar',
  currency = 'ج.م',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal search query with externally selected product
  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p.id === selectedProductId);
      if (prod) {
        const localized = getLocalizedProduct(prod, lang);
        setSearchQuery(localized.name || prod.name);
      }
    } else {
      setSearchQuery('');
    }
  }, [selectedProductId, products, lang]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        // If current search query doesn't match the selected product, reset or re-sync
        if (selectedProductId) {
          const prod = products.find((p) => p.id === selectedProductId);
          if (prod) {
            const localized = getLocalizedProduct(prod, lang);
            setSearchQuery(localized.name || prod.name);
          }
        } else {
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedProductId, products, lang]);

  // Filtered products list
  const filteredProducts = products.filter((prod) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const localized = getLocalizedProduct(prod, lang);
    const nameMatch = (localized.name || prod.name || '').toLowerCase().includes(query);
    const descMatch = (localized.description || prod.description || '').toLowerCase().includes(query);
    const catMatch = (prod.category || '').toLowerCase().includes(query);
    return nameMatch || descMatch || catMatch;
  });

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);

    // If input cleared completely, reset selected product
    if (!val.trim()) {
      onSelectProduct('', null);
    }
  };

  const handleSelect = (prod) => {
    const localized = getLocalizedProduct(prod, lang);
    setSearchQuery(localized.name || prod.name);
    setIsOpen(false);
    onSelectProduct(prod.id, prod);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchQuery('');
    onSelectProduct('', null);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // If exactly 1 match in filtered list, select it
      if (filteredProducts.length === 1) {
        handleSelect(filteredProducts[0]);
      } else if (filteredProducts.length > 0 && !selectedProductId) {
        handleSelect(filteredProducts[0]);
      }
    } else if (e.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  };

  const defaultPlaceholder = lang === 'en' 
    ? '-- Type to search or pick from list --' 
    : '-- اكتب للبحث أو اختر من القائمة --';

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      
      {/* Input & Action Icons Container */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className={`w-full p-2.5 ${lang === 'ar' ? 'pr-9 pl-14' : 'pl-9 pr-14'} rounded-xl border border-stone-300 bg-white font-medium text-xs sm:text-sm text-stone-900 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-xs`}
        />

        {/* Leading Search Icon */}
        <Search className={`w-4 h-4 text-stone-400 absolute ${lang === 'ar' ? 'right-3' : 'left-3'} pointer-events-none`} />

        {/* Trailing Controls: Clear (X) + Dropdown Chevron Arrow */}
        <div className={`absolute ${lang === 'ar' ? 'left-2.5' : 'right-2.5'} flex items-center gap-1`}>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              title={lang === 'en' ? 'Clear' : 'مسح'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title={lang === 'en' ? 'Toggle dropdown list' : 'فتح / إغلاق القائمة'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Dropdown List Popup */}
      {isOpen && (
        <div className="absolute z-50 inset-x-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header count info */}
          <div className="p-2 bg-stone-50 text-[11px] text-stone-500 flex items-center justify-between font-bold border-b border-stone-100">
            <span>
              {lang === 'en' ? 'Dishes Catalog' : 'قائمة الأصناف والمخزن'} ({filteredProducts.length})
            </span>
            <span className="text-[10px] text-stone-400">
              {lang === 'en' ? 'Type to filter' : 'اكتب للتصفية الفورية'}
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const localized = getLocalizedProduct(prod, lang);
              const isSelected = prod.id === selectedProductId;
              const stock = inventory[prod.id] !== undefined ? inventory[prod.id] : 0;
              
              // Stock indicator color
              let stockBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              if (stock <= 0) {
                stockBadgeClass = 'bg-red-50 text-red-700 border-red-200';
              } else if (stock <= 5) {
                stockBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
              }

              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSelect(prod)}
                  className={`w-full text-right p-2.5 flex items-center justify-between gap-2 text-xs transition-colors hover:bg-stone-50 active:bg-stone-100 ${
                    isSelected ? 'bg-brand-50/60 font-bold' : ''
                  }`}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Selected Checkmark */}
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected && <Check className="w-4 h-4 text-brand-600 font-black" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 truncate">
                          {localized.name}
                        </span>
                        {prod.isFasting && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold shrink-0">
                            صيامي 🌱
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 truncate">
                        {prod.unit} • {prod.weightKg} {lang === 'en' ? 'kg' : 'كجم'}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Price info */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${stockBadgeClass}`}>
                      {lang === 'en' ? 'Stock:' : 'مخزن:'} {stock}
                    </span>

                    <span className="font-mono font-black text-stone-900 text-xs">
                      {prod.price} {currency}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-stone-500 space-y-1">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
              <p className="font-bold text-stone-700">
                {lang === 'en' ? `No dishes match "${searchQuery}"` : `لا توجد أصناف تطابق "${searchQuery}"`}
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="text-brand-600 underline text-[11px] font-bold"
              >
                {lang === 'en' ? 'Show all dishes' : 'عرض كافة الأصناف'}
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
