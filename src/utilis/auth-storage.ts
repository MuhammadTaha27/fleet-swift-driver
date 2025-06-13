// Utility to store auth token in IndexedDB for service worker access
export const storeAuthTokenInIndexedDB = async (token: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("authStorage", 1)
  
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("tokens")) {
          db.createObjectStore("tokens")
        }
      }
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["tokens"], "readwrite")
        const store = transaction.objectStore("tokens")
  
        const putRequest = store.put({ value: token }, "authToken")
  
        putRequest.onsuccess = () => {
          resolve()
        }
  
        putRequest.onerror = () => {
          reject(new Error("Failed to store auth token"))
        }
      }
  
      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }
    })
  }
  
  export const removeAuthTokenFromIndexedDB = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("authStorage", 1)
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (db.objectStoreNames.contains("tokens")) {
          const transaction = db.transaction(["tokens"], "readwrite")
          const store = transaction.objectStore("tokens")
  
          const deleteRequest = store.delete("authToken")
  
          deleteRequest.onsuccess = () => {
            resolve()
          }
  
          deleteRequest.onerror = () => {
            reject(new Error("Failed to remove auth token"))
          }
        } else {
          resolve()
        }
      }
  
      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"))
      }
    })
  }
  