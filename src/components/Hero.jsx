import React from 'react';

export default function Hero() {
  return (
    <section className="bg-white border-b border-stone-200 py-4 sm:py-5 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-2">
        {/* Bonneappetite Categories Stickers (Compact & Calm) */}
        <div className="flex justify-center">
          <img
            src="/images/cover2.png"
            alt="Bonne Appetit Categories"
            className="h-9 sm:h-11 w-auto object-contain opacity-95"
          />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
          أكلات بيتي وتجهيزات فاخرة جاهزة للتسوية
        </h1>

        <p className="text-xs sm:text-[13px] text-stone-500 max-w-xl mx-auto leading-relaxed">
          سبشيال بونابيتي، لحوم ودواجن متبلة، أسماك طازجة، وقسم نباتي وصيامي متكامل. جاهز للتسوية الفورية.
        </p>
      </div>
    </section>
  );
}
