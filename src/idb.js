// src/idb.js

// IndexedDB utility object
export const idb = {
  // Property to store the database instance
  db: null,

  // Method to open the IndexedDB
  openCostsDB: async function (dbName, version) {
    return new Promise((resolve, reject) => {
      // Check for IndexedDB support in the browser
      const indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;

      if (!indexedDB) {
        console.log("The web browser doesn't support IndexedDB");
        reject(new Error("IndexedDB not supported"));
        return;
      }

      // Open the database and set up event listeners
      const request = indexedDB.open(dbName, version);

      request.onerror = (event) => {
        reject(new Error('Error with opening DB: ' + event.target.error));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        // Create an object store if not present
        const db = event.target.result;
        if (!db.objectStoreNames.contains('costs')) {
          db.createObjectStore('costs', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  },

  // Method to add a cost to the database
  addCost: async function (cost) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      // Create a transaction and add the cost to the object store
      const transaction = this.db.transaction(['costs'], 'readwrite');
      const objectStore = transaction.objectStore('costs');
      const request = objectStore.add(cost);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(new Error('Error with adding item: ' + event.target.error));
      };
    });
  },

  // Method to get all items from the database
  getAllItems: async function () {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized well'));
        console.log('Database not initialized well');
        return;
      }

      // Create a transaction and retrieve all items from the object store
      const transaction = this.db.transaction(['costs'], 'readonly');
      const objectStore = transaction.objectStore('costs');
      const request = objectStore.getAll();

      request.onerror = (event) => {
        reject(new Error('Error with getting the items: ' + event.target.error));
        console.log('Error with getting the items');
      };

      request.onsuccess = (event) => {
        const costs = event.target.result;
        console.log('all costs:', costs);
        resolve(costs);
      };
    });
  },

  // Method to clear the entire database
  clearDatabase: async function () {
    return new Promise((resolve, reject) => {
      // Create a transaction and clear the object store
      const transaction = this.db.transaction(['costs'], 'readwrite');
      const objectStore = transaction.objectStore('costs');
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve('Database cleared successfully');
      };

      request.onerror = (event) => {
        reject(new Error('Error clearing database: ' + event.target.error));
      };
    });
  },
};