// Haul background service worker — handles storage, badge updates, and side panel.

importScripts('lib/storage.js');

const STORAGE_KEY = 'haul_products';

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY]) {
    const count = (changes[STORAGE_KEY].newValue || []).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;

  if (message.type === 'SAVE_PRODUCT') {
    const product = message.product;
    if (!product || typeof product !== 'object' || typeof product.id !== 'string') {
      sendResponse({ success: false, error: 'Invalid product payload' });
      return false;
    }
    saveProduct(product)
      .then((products) => sendResponse({ success: true, count: products.length }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'GET_PRODUCTS') {
    getProducts()
      .then((products) => sendResponse({ products }))
      .catch((err) => sendResponse({ products: [], error: err.message }));
    return true;
  }

  if (message.type === 'REMOVE_PRODUCT') {
    if (typeof message.id !== 'string' || !message.id) {
      sendResponse({ success: false, error: 'Invalid id' });
      return false;
    }
    removeProduct(message.id)
      .then((products) => sendResponse({ success: true, count: products.length }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'CLEAR_ALL') {
    clearAll()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'OPEN_DASHBOARD') {
    chrome.windows.create({
      url: chrome.runtime.getURL('dashboard/dashboard.html'),
      type: 'popup',
      width: 960,
      height: 680,
    });
    sendResponse({ success: true });
    return false;
  }

  return false;
});

async function setBadgeFromStorage() {
  const products = await getProducts().catch(() => []);
  const count = products.length;
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
}

chrome.runtime.onStartup.addListener(setBadgeFromStorage);
chrome.runtime.onInstalled.addListener(setBadgeFromStorage);
