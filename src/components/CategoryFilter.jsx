import React from 'react';
import { CATEGORIES } from '../data/products';

export default function CategoryFilter({
  activeCategory,
  onSelectCategory
}) {
  return (
    <div className="bg-white border-b border-stone-200 sticky top-[95px] sm:top-[85px] z-30 py-2.5 px-4 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? cat.activeStyle
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {/* Colored Dot matching cover image badges */}
              <span
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform ${
                  isActive ? 'bg-white scale-110' : cat.dotColor
                }`}
              />
              
              <span>{cat.name}</span>

              {cat.label && (
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
