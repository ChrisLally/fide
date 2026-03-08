import { FIDE_SIM_DB_KEY, FIDE_SIM_DB_NAME, FIDE_SIM_DB_STORE } from './constants.js';

export async function openSimulatorDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(FIDE_SIM_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FIDE_SIM_DB_STORE)) {
        db.createObjectStore(FIDE_SIM_DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSimulatorState<T>(key: string): Promise<T | null> {
  const db = await openSimulatorDb();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIDE_SIM_DB_STORE, 'readonly');
    const req = tx.objectStore(FIDE_SIM_DB_STORE).get(key);
    req.onsuccess = () => resolve((req.result as T | null) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function setSimulatorState<T>(key: string, value: T): Promise<void> {
  const db = await openSimulatorDb();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIDE_SIM_DB_STORE, 'readwrite');
    tx.objectStore(FIDE_SIM_DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSimulatorState(key: string): Promise<void> {
  const db = await openSimulatorDb();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FIDE_SIM_DB_STORE, 'readwrite');
    tx.objectStore(FIDE_SIM_DB_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
