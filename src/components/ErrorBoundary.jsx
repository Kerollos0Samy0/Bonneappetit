import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-center font-cairo" dir="rtl">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-stone-200 space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
              🛡️
            </div>
            <h2 className="text-xl font-black text-stone-900">لوحة الإدارة - تنبيه نظام</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              تم اكتشاف تحديث جديد. اضغط أدناه لإعادة تحميل الصفحة والمتابعة بسلاسة:
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                تحديث الصفحة والمتابعة 🔄
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('bonne_appetit_user');
                  } catch (e) {}
                  window.location.reload();
                }}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all border border-stone-200"
              >
                الرجوع للمتجر كزائر 🏪
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
