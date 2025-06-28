
/**
 * CACHE PERSISTANT - READ APP v0.15
 * 
 * Cache IndexedDB pour données critiques (liste de lecture, livres)
 * Survit aux rechargements et améliore les temps de chargement
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en ms
}

class PersistentCache {
  private dbName = 'ReadAppCache';
  private dbVersion = 1;
  private storeName = 'cache';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async set<T>(key: string, data: T, ttl: number = 300000): Promise<void> {
    await this.init();
    if (!this.db) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry, key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }
        
        // Vérifier l'expiration
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.delete(key); // Nettoyer l'entrée expirée
          resolve(null);
          return;
        }
        
        resolve(entry.data);
      };
    });
  }

  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const persistentCache = new PersistentCache();

// Hooks utilitaires
export const usePersistentCache = () => {
  return {
    set: persistentCache.set.bind(persistentCache),
    get: persistentCache.get.bind(persistentCache),
    delete: persistentCache.delete.bind(persistentCache),
    clear: persistentCache.clear.bind(persistentCache)
  };
};
