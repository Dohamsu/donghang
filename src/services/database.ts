// Type imports for database schema definition (prefixed with _ to indicate intentionally unused)
import type {
  TravelPlan as _TravelPlan,
  Place as _Place,
  Schedule as _Schedule,
  BudgetItem as _BudgetItem,
  PackingItem as _PackingItem,
  ReviewItem as _ReviewItem,
  TemporaryPlace as _TemporaryPlace,
  User as _User,
} from '../types';

export class LocalDatabase {
  private static instance: LocalDatabase;
  private dbName = 'TravelPlannerDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  private constructor() {}

  public static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('travelPlans')) {
          const travelPlansStore = db.createObjectStore('travelPlans', {
            keyPath: 'id',
          });
          travelPlansStore.createIndex('ownerId', 'ownerId', { unique: false });
        }

        if (!db.objectStoreNames.contains('places')) {
          db.createObjectStore('places', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('schedules')) {
          const schedulesStore = db.createObjectStore('schedules', {
            keyPath: 'id',
          });
          schedulesStore.createIndex('planId', 'planId', { unique: false });
          schedulesStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('budgetItems')) {
          const budgetStore = db.createObjectStore('budgetItems', {
            keyPath: 'id',
          });
          budgetStore.createIndex('planId', 'planId', { unique: false });
        }

        if (!db.objectStoreNames.contains('packingItems')) {
          const packingStore = db.createObjectStore('packingItems', {
            keyPath: 'id',
          });
          packingStore.createIndex('planId', 'planId', { unique: false });
        }

        if (!db.objectStoreNames.contains('reviews')) {
          const reviewsStore = db.createObjectStore('reviews', {
            keyPath: 'id',
          });
          reviewsStore.createIndex('planId', 'planId', { unique: false });
        }

        if (!db.objectStoreNames.contains('temporaryPlaces')) {
          const tempStore = db.createObjectStore('temporaryPlaces', {
            keyPath: 'id',
          });
          tempStore.createIndex('planId', 'planId', { unique: false });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      };
    });
  }

  private async getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  public async create<T extends { id: string }>(
    storeName: string,
    item: T
  ): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(new Error('Failed to create item'));
    });
  }

  public async read<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error('Failed to read item'));
    });
  }

  public async update<T extends { id: string }>(
    storeName: string,
    item: T
  ): Promise<T> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(new Error('Failed to update item'));
    });
  }

  public async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete item'));
    });
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get all items'));
    });
  }

  public async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: string
  ): Promise<T[]> {
    const store = await this.getStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get items by index'));
    });
  }
}

export class LocalStorageService {
  private static prefix = 'travel_planner_';

  public static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + key, serializedValue);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  }

  public static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  }

  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  }

  public static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
