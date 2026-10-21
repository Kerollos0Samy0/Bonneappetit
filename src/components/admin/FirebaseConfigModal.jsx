import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle, 
  UploadCloud, DownloadCloud, Key, ShieldCheck, ExternalLink, 
  HelpCircle, Copy, Check, Sparkles, Database
} from 'lucide-react';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  isFirebaseConfigured 
} from '../../services/firebase';
import { 
  testFirebaseConnection, 
  uploadAllLocalDataToCloud,
  fetchAllCloudData
} from '../../services/cloudSyncService';

export default function FirebaseConfigModal({
  isOpen,
  onClose,
  currentAppState = {},
  onCloudDataPulled = null,
  lang = 'ar'
}) {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const [pasteSnippet, setPasteSnippet] = useState('');
  const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'fields'

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [copiedRules, setCopiedRules] = useState(false);

  // Load existing config on open
  useEffect(() => {
    const existing = getFirebaseConfig();
    if (existing) {
      setApiKey(existing.apiKey || '');
      setProjectId(existing.projectId || '');
      setAuthDomain(existing.authDomain || '');
      setStorageBucket(existing.storageBucket || '');
      setMessagingSenderId(existing.messagingSenderId || '');
      setAppId(existing.appId || '');
    }
  }, [isOpen]);

  // Parse snippet when pasted
  const handleParseSnippet = (text) => {
    setPasteSnippet(text);
    if (!text) return;

    try {
      // Extract fields with regex patterns
      const extract = (pattern) => {
        const match = text.match(pattern);
        return match ? match[1] : '';
      };

      const extractedApiKey = extract(/apiKey["']?\s*:\s*["']([^"']+)["']/i);
      const extractedProjectId = extract(/projectId["']?\s*:\s*["']([^"']+)["']/i);
      const extractedAuthDomain = extract(/authDomain["']?\s*:\s*["']([^"']+)["']/i);
      const extractedStorageBucket = extract(/storageBucket["']?\s*:\s*["']([^"']+)["']/i);
      const extractedMessagingSenderId = extract(/messagingSenderId["']?\s*:\s*["']([^"']+)["']/i);
      const extractedAppId = extract(/appId["']?\s*:\s*["']([^"']+)["']/i);

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedProjectId) setProjectId(extractedProjectId);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
      if (extractedMessagingSenderId) setMessagingSenderId(extractedMessagingSenderId);
      if (extractedAppId) setAppId(extractedAppId);

      if (extractedApiKey && extractedProjectId) {
        setTestResult({
          success: true,
          message: 'تم التعرف على إعدادات المشروع بنجاح من النص الملصق! يمكنك حفظها واختبار الاتصال الآن.'
        });
      }
    } catch (e) {
      console.warn('Snippet parsing error:', e);
    }
  };

  // Handle Save
  const handleSave = () => {
    try {
      if (!apiKey.trim() || !projectId.trim()) {
        setTestResult({
          success: false,
          message: 'برجاء كتابة أو لصق كل من API Key و Project ID على الأقل.'
        });
        return;
      }

      saveFirebaseConfig({
        apiKey,
        projectId,
        authDomain,
        storageBucket,
        messagingSenderId,
        appId
      });

      setTestResult({
        success: true,
        message: 'تم حفظ إعدادات Firebase بنجاح! جاري الاتصال...'
      });

      // Quick test immediately
      handleTestConnection();
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message
      });
    }
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testFirebaseConnection();
      setTestResult({
        success: true,
        message: `✓ الاتصال بقاعدة بيانات Firestore سليم 100%! السحابة جاهزة للمزامنة اللحظية.`
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Push Local Data to Cloud
  const handleUploadLocalToCloud = async () => {
    if (!isFirebaseConfigured()) {
      alert('برجاء حفظ إعدادات Firebase والتأكد من نجاح الاتصال أولاً.');
      return;
    }

    if (!window.confirm('هل تريد رفع كامل بيانات هذا اللابتوب (الأصناف والأسعار والمخزن والفواتير) إلى السحابة؟ سيتمكن أي جهاز آخر من رؤيتها وتعديلها فوراً.')) {
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg('');

    try {
      const res = await uploadAllLocalDataToCloud(currentAppState);
      setSyncStatusMsg(`✓ تم بنجاح رفع كافة بيانات المتجر والمخازن إلى سحابة Firebase (${res.count} أقسام متزامنة)!`);
    } catch (err) {
      setSyncStatusMsg(`خطأ أثناء الرفع: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull Cloud Data to Local
  const handlePullCloudData = async () => {
    if (!isFirebaseConfigured()) {
      alert('برجاء حفظ إعدادات Firebase أولاً.');
      return;
    }

    if (!window.confirm('هل تريد سحب أحدث نسخة بيانات مخزنة على السحابة واستبدال البيانات المحلية بهذا الجهاز؟')) {
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg('');

    try {
      const cloudData = await fetchAllCloudData();
      if (!cloudData || Object.keys(cloudData).length === 0) {
        setSyncStatusMsg('لم يتم العثور على أي بيانات مسجلة في السحابة بعد. قم بالرفع أولاً من الجهاز الآخر.');
      } else {
        if (onCloudDataPulled) {
          onCloudDataPulled(cloudData);
        }
        setSyncStatusMsg('✓ تم استيراد وتحديث كافة البيانات من السحابة بنجاح!');
      }
    } catch (err) {
      setSyncStatusMsg(`خطأ أثناء السحب: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear config
  const handleDisconnect = () => {
    if (window.confirm('هل أنت متأكد من فصل ربط Firebase والعودة للتخزين المحلي فقط؟')) {
      clearFirebaseConfig();
      setApiKey('');
      setProjectId('');
      setAuthDomain('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setPasteSnippet('');
      setTestResult(null);
      setSyncStatusMsg('تم فصل الربط السحابي.');
    }
  };

  const configured = isFirebaseConfigured();

  const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fade-in"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 relative my-4 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
              configured ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  configured 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}>
                  {configured ? '🟢 سحابي متصل (Cloud Connected)' : '🟡 وضع محلي (Local Mode)'}
                </span>
                <span className="text-[11px] font-mono text-stone-400">Google Firestore</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'en' ? 'Firebase Real-time Cloud Sync' : 'إعدادات المزامنة السحابية اللحظية (Firebase)'}
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
          
          {/* Explanation Banner */}
          <div className="bg-sky-50 border border-sky-200 text-sky-950 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-black text-xs text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>حل مشكلة مزامنة التعديلات بين اللابتوبات والموبايل:</span>
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              عند ربط Firebase، سيتم حفظ ومزامنة أي تعديل تجريه على الأسعار، المخزن، الفواتير، المصاريف، أو إنتاج العمال في قاعدة بيانات سحابية لحظية <strong>تظهر فوراً على اللابتوب الآخر والهاتف في نفس الثانية دون الحاجة لتحديث الصفحة!</strong>
            </p>
          </div>

          {/* Test / Status Result Alert */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl font-bold flex items-start gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                : 'bg-red-50 border border-red-300 text-red-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatusMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 font-bold flex items-center gap-2 text-[11px]">
              <Database className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {/* Cloud Master Operations (If configured) */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3">
            <span className="font-extrabold text-stone-900 text-xs block">
              إجراءات المزامنة الفورية بين الأجهزة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Push Local to Cloud */}
              <button
                type="button"
                onClick={handleUploadLocalToCloud}
                disabled={isSyncing}
                className="p-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-black flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>رفع بيانات هذا الجهاز إلى السحابة ☁️⬆️</span>
              </button>

              {/* Pull Cloud to Local */}
              <button
                type="button"
                onClick={handlePullCloudData}
                disabled={isSyncing}
                className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-black flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <DownloadCloud className="w-4 h-4 text-emerald-400" />
                <span>سحب أحدث نسخة من السحابة 📥</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              * بمجرد رفع البيانات أول مرة، تصبح المزامنة تلقائية تماماً ولحظية عند أي تعديل.
            </p>
          </div>

          {/* Input Method Switcher */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-xs">
                مفاتيح ربط مشروع Firebase (Config):
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                    inputMode === 'paste' ? 'bg-white shadow-2xs text-stone-900 font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  📋 لصق الكود كاملاً (الأسهل)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('fields')}
                  className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors ${
                    inputMode === 'fields' ? 'bg-white shadow-2xs text-stone-900 font-black' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ✏️ إدخال يدوي
                </button>
              </div>
            </div>

            {/* Paste Snippet Option */}
            {inputMode === 'paste' ? (
              <div className="space-y-1.5">
                <label className="text-stone-600 block text-[11px]">
                  الصق هنا كود <code>firebaseConfig</code> المأخوذ من لوحة تحكم Firebase Console:
                </label>
                <textarea
                  rows="4"
                  dir="ltr"
                  value={pasteSnippet}
                  onChange={(e) => handleParseSnippet(e.target.value)}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "bonne-appetit.firebaseapp.com",\n  projectId: "bonne-appetit",\n  ...\n};`}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-[11px] bg-stone-50 focus:bg-white focus:outline-hidden focus:border-brand-500"
                />
              </div>
            ) : (
              /* Manual Fields Option */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]" dir="ltr">
                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">apiKey *:</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">projectId *:</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="bonne-appetit-erp"
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">authDomain:</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project.firebaseapp.com"
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">storageBucket:</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="project.appspot.com"
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">appId:</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-0.5">messagingSenderId:</label>
                  <input
                    type="text"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    placeholder="123456789"
                    className="w-full p-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Simple Guide for Creating Firebase */}
          <div className="bg-stone-100/70 border border-stone-200 rounded-2xl p-4 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-black text-stone-800 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-stone-600" />
                <span>طريقة جلب المفاتيح من Google Firebase في دقيقتين:</span>
              </span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:underline font-bold flex items-center gap-1"
              >
                <span>فتح Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 pr-1">
              <li>افتح <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-brand-600 font-bold underline">Firebase Console</a> بحساب جوجل واضغط <strong>Create a project</strong> باسم (Bonne Appetit).</li>
              <li>من القائمة الجانبية ادخل على <strong>Build</strong> ثم <strong>Firestore Database</strong> واضغط <strong>Create database</strong> (واختر Start in test mode).</li>
              <li>ادخل على إعدادات المشروع (Project Settings ⚙️) ثم من تبويب General أضف تطبيق ويب (Web &lt;/&gt;) وانسخ كود <code>firebaseConfig</code> والصقه هنا.</li>
            </ol>

            {/* Rules Tip */}
            <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-900 text-[10px]">
                <span>قواعد الحماية في Firestore Rules (لتصريح القراءة والكتابة للوحة التحكم):</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
                    setCopiedRules(true);
                    setTimeout(() => setCopiedRules(false), 2000);
                  }}
                  className="text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-200/70 px-2 py-0.5 rounded"
                >
                  {copiedRules ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRules ? 'تم النسخ' : 'نسخ القواعد'}</span>
                </button>
              </div>
              <pre className="bg-amber-100/60 p-1.5 rounded font-mono text-[9px] text-amber-950 overflow-x-auto" dir="ltr">
                {FIRESTORE_RULES_SNIPPET}
              </pre>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-50 px-5 sm:px-6 py-3.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div>
            {configured && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <CloudOff className="w-3.5 h-3.5" />
                <span>فصل الربط السحابي</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || (!apiKey && !projectId)}
              className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold text-stone-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-brand-600' : ''}`} />
              <span>{isTesting ? 'جاري الفحص...' : 'اختبار الاتصال 🔄'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتفعيل السحابة ✓</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
