// Enhanced local storage using IndexedDB for better performance
// Prepared for Capacitor conversion for Android (SMS reading capability)
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FinanceDB extends DBSchema {
  transactions: {
    key: string;
    value: any;
  };
  bankAccounts: {
    key: string;
    value: any;
  };
  incomes: {
    key: string;
    value: any;
  };
  fixedExpenses: {
    key: string;
    value: any;
  };
  sips: {
    key: string;
    value: any;
  };
  insurances: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'FinanceHubDB';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FinanceDB> | null = null;

async function getDB(): Promise<IDBPDatabase<FinanceDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions');
      }
      if (!db.objectStoreNames.contains('bankAccounts')) {
        db.createObjectStore('bankAccounts');
      }
      if (!db.objectStoreNames.contains('incomes')) {
        db.createObjectStore('incomes');
      }
      if (!db.objectStoreNames.contains('fixedExpenses')) {
        db.createObjectStore('fixedExpenses');
      }
      if (!db.objectStoreNames.contains('sips')) {
        db.createObjectStore('sips');
      }
      if (!db.objectStoreNames.contains('insurances')) {
        db.createObjectStore('insurances');
      }
    },
  });

  return dbInstance;
}

export async function saveData<T>(storeName: keyof FinanceDB, key: string, data: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, data, key);
}

export async function getData<T>(storeName: keyof FinanceDB, key: string): Promise<T | undefined> {
  const db = await getDB();
  return await db.get(storeName, key);
}

export async function deleteData(storeName: keyof FinanceDB, key: string): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, key);
}

export async function getAllData<T>(storeName: keyof FinanceDB): Promise<T[]> {
  const db = await getDB();
  return await db.getAll(storeName);
}

// Fallback to localStorage if IndexedDB is not available
export const storage = {
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  },

  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : (defaultValue ?? null);
    } catch (error) {
      console.error('Failed to read from localStorage', error);
      return defaultValue ?? null;
    }
  }
};

/* 
 * CAPACITOR CONVERSION NOTES FOR ANDROID:
 * 
 * When converting to Capacitor for Android app:
 * 
 * 1. Install Capacitor:
 *    npm install @capacitor/core @capacitor/cli
 *    npx cap init
 * 
 * 2. Add Android platform:
 *    npm install @capacitor/android
 *    npx cap add android
 * 
 * 3. For SMS Reading capability:
 *    - Install SMS plugin: npm install @capacitor-community/sms
 *    - Add permissions in android/app/src/main/AndroidManifest.xml:
 *      <uses-permission android:name="android.permission.READ_SMS" />
 *      <uses-permission android:name="android.permission.RECEIVE_SMS" />
 * 
 * 4. SMS Transaction Parser (to be implemented):
 *    - Read SMS using Capacitor SMS plugin
 *    - Parse transaction details (amount, merchant, date)
 *    - Auto-categorize based on merchant/keywords
 *    - Add to transactions automatically
 * 
 * 5. Build and deploy:
 *    npm run build
 *    npx cap copy
 *    npx cap open android
 * 
 * This IndexedDB storage will work seamlessly in both web and Capacitor environments.
 * Data stays local on device - no cloud sync unless explicitly added.
 */