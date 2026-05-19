// Chrome storage helpers for Haul product saves.
// Uses callback-based API for maximum compatibility with importScripts in MV3 service workers.

var STORAGE_KEY = 'haul_products';

function getProducts() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[STORAGE_KEY] || []);
      }
    });
  });
}

function saveProduct(product) {
  return getProducts().then((products) => {
    const updated = [product, ...products];
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(updated);
        }
      });
    });
  });
}

function removeProduct(id) {
  return getProducts().then((products) => {
    const updated = products.filter((p) => p.id !== id);
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(updated);
        }
      });
    });
  });
}

function clearAll() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
