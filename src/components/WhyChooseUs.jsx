import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Truck, Snowflake, Clock } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Clock,
      title: 'جاهز للتسوية الفورية',
      desc: 'وفري تعب ووقفة المطبخ لساعات؛ استلمي المحشي ملفوف ومتبل والكوردن بلو والكفتة جاهزة للطهي مباشرة.'
    },
    {
      icon: Snowflake,
      title: 'حفظ وتجميد -18°C',
      desc: 'تجميد فوري يحافظ على القيمة الغذائية والنكهة الطازجة بدون أي مواد حافظة أو إضافات صناعية ضارة.'
    },
    {
      icon: ShieldCheck,
      title: 'نظافة وجودة بيتي 100%',
      desc: 'غسيل وتعقيم كامل بالخل والليمون ولحوم ودواجن بلدية طازجة مختارة بعناية فائقة.'
    },
    {
      icon: Truck,
      title: 'شحن ذكي عبر أوبر',
      desc: 'مساهمة 50% من بونابيتي للطلبات من 10 كجم، وشحن مجاني 100% للطلبات من 20 كجم فأكثر.'
    },
    {
      icon: HeartHandshake,
      title: 'تجهيز الكانتينات والعزومات',
      desc: 'قوائم خاصة وأسعار جملة لكانتينات الكنائس والشركات مع نظام سداد أجل أوردر معتمد.'
    },
    {
      icon: Sparkles,
      title: 'قسم صيامي متكامل',
      desc: 'تشكيلة واسعة من الأكلات الصيامية والنباتية اللذيذة تلبي جميع مناسبات الصيام بجودة عالية.'
    }
  ];

  return (
    <section className="py-14 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            لماذا تختار بونابيتي؟
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            سر الطعم البيتي الأصيل والراحة التامة
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            نعتني بأدق التفاصيل لتستمتعي أنتِ وعائلتك أو رواد كانتينك بأشهى وأجود الأطباق
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-stone-50 hover:bg-brand-50/40 border border-stone-200 hover:border-brand-200 transition-all duration-300 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-stone-200 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {feat.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
