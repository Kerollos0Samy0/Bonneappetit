import React from 'react';
import { CATEGORIES } from '../data/products';
import { UI_TRANSLATIONS } from '../data/translations';

export default function CategoryFilter({
  activeCategory,
  onSelectCategory,
  lang = 'ar',
  t = UI_TRANSLATIONS.ar
}) {
  const getCatName = (cat) => {
    if (lang === 'en') {
      if (cat.id === 'all') return t.cat_all || 'All Dishes';
      return cat.label || cat.name;
    }
    return cat.name;
  };

  const getCatEmoji = (catId) => {
    switch (catId) {
      case 'all': return '🍽️';
      case 'special': return '⭐';
      case 'fish': return '🐟';
      case 'poultry': return '🍗';
      case 'beef': return '🥩';
      case 'vegetables': return '🥬';
      default: return '🍲';
    }
  };

  return (
    <div className="bg-stone-50/95 sm:bg-white border-b border-stone-200 py-2 px-3 sm:px-4 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const displayName = getCatName(cat);
          const emoji = getCatEmoji(cat.id);
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border active:scale-95 touch-manipulation ${
                isActive
                  ? cat.activeStyle + ' shadow-xs ring-1 ring-stone-900/10'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {/* Category Emoji & Colored Dot */}
              <span className="text-sm shrink-0">{emoji}</span>
              
              <span>{displayName}</span>

              {/* Show second language badge in Arabic mode */}
              {lang === 'ar' && cat.label && (
                <span
                  className={`text-[9px] font-mono tracking-wider px-1.5 py-0.2 rounded font-black uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-200/70 text-stone-500'
                  }`}
                >
                  {cat.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
