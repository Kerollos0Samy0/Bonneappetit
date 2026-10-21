import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const CONFIG_STORAGE_KEY = 'bonne_appetit_firebase_config';

/**
 * Retrieve current Firebase configuration from localStorage or Vite environment variables
 */
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Firebase config from localStorage:', e);
  }

  // Fallback to Vite environment variables if defined
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }

  return null;
}

/**
 * Check if Firebase is currently configured with valid credentials
 */
export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return !!(config && config.apiKey && config.projectId);
}

/**
 * Save Firebase configuration to localStorage and reload / reinitialize app
 */
export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('بيانات إعدادات Firebase غير مكتملة (مطلوب apiKey و projectId على الأقل)');
  }

  const cleanConfig = {
    apiKey: String(config.apiKey).trim(),
    authDomain: String(config.authDomain || '').trim() || `${String(config.projectId).trim()}.firebaseapp.com`,
    projectId: String(config.projectId).trim(),
    storageBucket: String(config.storageBucket || '').trim() || `${String(config.projectId).trim()}.appspot.com`,
    messagingSenderId: String(config.messagingSenderId || '').trim(),
    appId: String(config.appId || '').trim()
  };

  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cleanConfig));
  return cleanConfig;
}

/**
 * Clear Firebase configuration from localStorage
 */
export function clearFirebaseConfig() {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

/**
 * Initialize or get existing Firebase App instance
 */
let cachedApp = null;
let cachedDb = null;

export function getFirebaseAppInstance() {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(config);
    }
    return cachedApp;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

/**
 * Get Firestore database instance
 */
export function getFirestoreDb() {
  const app = getFirebaseAppInstance();
  if (!app) return null;

  try {
    if (!cachedDb) {
      cachedDb = getFirestore(app);
    }
    return cachedDb;
  } catch (error) {
    console.error('Firestore connection error:', error);
    return null;
  }
}
