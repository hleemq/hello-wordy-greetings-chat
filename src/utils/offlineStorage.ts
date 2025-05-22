
// IndexedDB for offline data storage
const DB_NAME = 'we-finance-offline-db';
const DB_VERSION = 1;
const EXPENSES_STORE = 'expenses';
const GOALS_STORE = 'goals';
const PENDING_OPERATIONS_STORE = 'pendingOperations';

interface PendingOperation {
  id: string;
  timestamp: number;
  type: 'ADD' | 'UPDATE' | 'DELETE';
  storeName: string;
  data: any;
}

// Initialize the IndexedDB database
export const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(EXPENSES_STORE)) {
        db.createObjectStore(EXPENSES_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(GOALS_STORE)) {
        db.createObjectStore(GOALS_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(PENDING_OPERATIONS_STORE)) {
        db.createObjectStore(PENDING_OPERATIONS_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Store data in IndexedDB
export const storeData = async <T extends { id: string }>(
  storeName: string, 
  data: T
): Promise<void> => {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(data);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to store data in ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

// Get all data from a store
export const getAllData = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get data from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting data:', error);
    return [];
  }
};

// Queue a pending operation
export const queueOperation = async (operation: Omit<PendingOperation, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const pendingOp: PendingOperation = {
      ...operation,
      id: crypto.randomUUID(), 
      timestamp: Date.now()
    };
    
    await storeData(PENDING_OPERATIONS_STORE, pendingOp);
    
    // Register for sync when online
    // Using a more TypeScript-friendly approach without direct sync API
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Post a message to the service worker instead of using sync API
      navigator.serviceWorker.controller?.postMessage({
        type: 'SCHEDULE_SYNC',
        payload: {
          tag: 'sync-pending-operations'
        }
      });
    }
  } catch (error) {
    console.error('Error queueing operation:', error);
  }
};

// Get all pending operations
export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  return getAllData<PendingOperation>(PENDING_OPERATIONS_STORE);
};

// Clear a pending operation after it's processed
export const clearPendingOperation = async (id: string): Promise<void> => {
  try {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PENDING_OPERATIONS_STORE, 'readwrite');
      const store = transaction.objectStore(PENDING_OPERATIONS_STORE);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error('Failed to clear pending operation'));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('Error clearing pending operation:', error);
  }
};

// Export data to JSON file for download
export const exportDataToJson = async (): Promise<string> => {
  try {
    // Get all data from stores
    const [expenses, goals] = await Promise.all([
      getAllData(EXPENSES_STORE),
      getAllData(GOALS_STORE),
    ]);
    
    const data = {
      expenses,
      goals,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// Helper function to trigger file download
export const triggerDownload = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
