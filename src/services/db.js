/**
 * IndexedDB Setup for URL Shortcuts
 * Database: 'url-shortcuts-db'
 * Version: 1
 * Stores:
 * - shortcuts: Main shortcut data
 * - folders: Folder metadata
 * - search-index: Search optimization (future)
 */

const DB_NAME = 'url-shortcuts-db';
const DB_VERSION = 1;

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB initialized successfully');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create shortcuts store
      if (!database.objectStoreNames.contains('shortcuts')) {
        const shortcutsStore = database.createObjectStore('shortcuts', {
          keyPath: 'id',
        });
        shortcutsStore.createIndex('alias', 'alias', { unique: false });
        shortcutsStore.createIndex('folder', 'folder', { unique: false });
        shortcutsStore.createIndex('url', 'url', { unique: false });
        shortcutsStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        shortcutsStore.createIndex('accessCount', 'accessCount', { unique: false });
        shortcutsStore.createIndex('lastAccessedAt', 'lastAccessedAt', {
          unique: false,
        });
        console.log('Shortcuts store created');
      }

      // Create folders store
      if (!database.objectStoreNames.contains('folders')) {
        const foldersStore = database.createObjectStore('folders', {
          keyPath: 'name',
        });
        foldersStore.createIndex('name', 'name', { unique: true });
        console.log('Folders store created');
      }

      // Create undo stack store for deletions
      if (!database.objectStoreNames.contains('undoStack')) {
        database.createObjectStore('undoStack', { keyPath: 'id', autoIncrement: true });
        console.log('Undo stack store created');
      }

      console.log('Database schema upgraded to version', DB_VERSION);
    };
  });
};

/**
 * Get database instance
 * @returns {Promise<IDBDatabase>}
 */
export const getDB = async () => {
  if (!db) {
    await initDB();
  }
  return db;
};

/**
 * Get store transaction
 * @param {string} storeName
 * @param {string} mode - 'readonly' or 'readwrite'
 * @returns {IDBObjectStore}
 */
export const getStore = async (storeName, mode = 'readonly') => {
  const database = await getDB();
  const transaction = database.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

/**
 * Clear all data from database (for testing/reset)
 */
export const clearDB = async () => {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['shortcuts', 'folders', 'undoStack'], 'readwrite');

    transaction.oncomplete = () => {
      console.log('Database cleared');
      resolve();
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.objectStore('shortcuts').clear();
    transaction.objectStore('folders').clear();
    transaction.objectStore('undoStack').clear();
  });
};

/**
 * Close database connection
 */
export const closeDB = () => {
  if (db) {
    db.close();
    db = null;
  }
};

/**
 * Test database connection
 */
export const testDB = async () => {
  try {
    const database = await getDB();
    console.log('✓ Database connected');
    console.log('✓ Stores:', Array.from(database.objectStoreNames));
    return true;
  } catch (error) {
    console.error('✗ Database test failed:', error);
    return false;
  }
};
