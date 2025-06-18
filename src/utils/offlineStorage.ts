
import { supabase } from '@/integrations/supabase/client';

// IndexedDB utilities for offline storage
const DB_NAME = 'WeFinanceOfflineDB';
const DB_VERSION = 1;

// Open IndexedDB connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for different data types
      if (!db.objectStoreNames.contains('expenses')) {
        db.createObjectStore('expenses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Store data locally
export const storeData = async <T extends { id: string }>(storeName: string, data: T): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    await store.put(data);
  } catch (error) {
    console.error('Error storing data locally:', error);
  }
};

// Get all data from a store
export const getAllData = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting local data:', error);
    return [];
  }
};

// Queue operation for when back online
export const queueOperation = async (operation: any): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    await store.add({
      ...operation,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error queuing operation:', error);
  }
};

// Export data functions
export const exportDataToJson = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch all user data
    const [expensesResult, goalsResult, profileResult] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      expenses: expensesResult.data || [],
      goals: goalsResult.data || [],
      profile: profileResult.data || null
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const triggerDownload = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importDataFromJson = async (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid JSON format');
  }
};
