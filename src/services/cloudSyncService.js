import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFirestoreDb, isFirebaseConfigured } from './firebase';

const ROOT_COLLECTION = 'bonne_appetit_erp';

/**
 * Test whether the current Firebase credentials can read and write to Firestore
 */
export async function testFirebaseConnection() {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('لم يتم تهيئة Firebase. برجاء التحقق من صحة المفاتيح.');
  }

  try {
    const testDocRef = doc(db, ROOT_COLLECTION, '_connection_test');
    await setDoc(testDocRef, {
      lastTest: new Date().toISOString(),
      clientTimestamp: Date.now()
    }, { merge: true });

    const snap = await getDoc(testDocRef);
    if (!snap.exists()) {
      throw new Error('تم الاتصال ولكن تعذر التحقق من كتابة البيانات.');
    }

    return { success: true, timestamp: snap.data().lastTest };
  } catch (err) {
    console.error('Firebase connection test failed:', err);
    let msg = err.message || 'فشل الاتصال بقاعدة بيانات Firebase.';
    if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      msg = 'تم رفض الإذن (Permission Denied). برجاء التأكد من تفعيل قواعد Firestore Rules وجعلها تسمح بالقراءة والكتابة: allow read, write: if true;';
    }
    throw new Error(msg);
  }
}

/**
 * Subscribe to real-time updates for a specific domain document
 * @param {string} docKey - e.g. 'products', 'inventory', 'expenses', etc.
 * @param {Function} onDataReceived - callback with unpacked data
 * @returns {Function} unsubscribe function
 */
export function subscribeToCloudDocument(docKey, onDataReceived) {
  const db = getFirestoreDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, ROOT_COLLECTION, docKey);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onDataReceived(data);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot error for [${docKey}]:`, error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error(`Failed to subscribe to [${docKey}]:`, err);
    return () => {};
  }
}

/**
 * Save a document's data to cloud Firestore
 * @param {string} docKey 
 * @param {object} payload 
 */
export async function saveDocumentToCloud(docKey, payload) {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const docRef = doc(db, ROOT_COLLECTION, docKey);
    await setDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp(),
      lastClientSync: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error(`Failed to save [${docKey}] to cloud:`, err);
    return false;
  }
}

/**
 * Master Upload: Push ALL current state from this laptop/browser into Firebase Cloud
 */
export async function uploadAllLocalDataToCloud(state) {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error('Firebase غير متصل. برجاء حفظ إعدادات المشروع أولاً.');
  }

  const {
    products,
    inventory,
    wholesaleUsers,
    wholesaleDiscountPct,
    invoices,
    orders,
    expenses,
    rawMaterials,
    recipes,
    wasteRecords,
    workers,
    productionLogs,
    stockMovements,
    businessInfo
  } = state;

  const promises = [];

  if (products) {
    promises.push(saveDocumentToCloud('products', { items: products }));
  }
  if (inventory) {
    promises.push(saveDocumentToCloud('inventory', { stock: inventory }));
  }
  if (wholesaleUsers || wholesaleDiscountPct !== undefined) {
    promises.push(saveDocumentToCloud('wholesale', { 
      users: wholesaleUsers || [], 
      discountPct: wholesaleDiscountPct ?? 15 
    }));
  }
  if (invoices) {
    promises.push(saveDocumentToCloud('invoices', { list: invoices }));
  }
  if (orders) {
    promises.push(saveDocumentToCloud('orders', { list: orders }));
  }
  if (expenses) {
    promises.push(saveDocumentToCloud('expenses', { list: expenses }));
  }
  if (rawMaterials || recipes) {
    promises.push(saveDocumentToCloud('rawMaterials', { 
      materials: rawMaterials || [], 
      recipes: recipes || {} 
    }));
  }
  if (wasteRecords) {
    promises.push(saveDocumentToCloud('waste', { records: wasteRecords }));
  }
  if (workers || productionLogs) {
    promises.push(saveDocumentToCloud('workers', { 
      workers: workers || [], 
      productionLogs: productionLogs || [] 
    }));
  }
  if (stockMovements) {
    promises.push(saveDocumentToCloud('stockMovements', { movements: stockMovements }));
  }
  if (businessInfo) {
    promises.push(saveDocumentToCloud('businessInfo', { info: businessInfo }));
  }

  await Promise.all(promises);
  return { success: true, count: promises.length };
}

/**
 * Master Fetch: Download all existing documents from Cloud Firestore
 */
export async function fetchAllCloudData() {
  const db = getFirestoreDb();
  if (!db) return null;

  const docKeys = [
    'products',
    'inventory',
    'wholesale',
    'invoices',
    'orders',
    'expenses',
    'rawMaterials',
    'waste',
    'workers',
    'stockMovements',
    'businessInfo'
  ];

  const results = {};
  for (const key of docKeys) {
    try {
      const snap = await getDoc(doc(db, ROOT_COLLECTION, key));
      if (snap.exists()) {
        results[key] = snap.data();
      }
    } catch (e) {
      console.warn(`Error fetching cloud doc ${key}:`, e);
    }
  }

  return results;
}
