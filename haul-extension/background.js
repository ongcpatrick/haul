// Haul background service worker.
// Storage is inlined here to avoid importScripts failures in MV3 service workers.
importScripts('lib/product-schema.js');

const STORAGE_KEY = 'haul_products';
const FOLDERS_KEY = 'haul_folders';
const EXT_TOKEN_KEY = 'haul_ext_token';
const EXT_USERNAME_KEY = 'haul_ext_username';
const CLOUD_CONSENT_KEY = 'haul_cloud_consent_v1';

// ─── Haul Worker config ───────────────────────────────────────────────────────
const HAUL_WORKER_URL = 'https://haul-ai.haulapp.workers.dev';

// ─── Haul Share config ────────────────────────────────────────────────────────
// UPDATE to your actual Railway URL (check Railway dashboard → your haul-share service).
const HAUL_SHARE_BASE = 'https://haul-production.up.railway.app';
const HAUL_SHARE_HOST = new URL(HAUL_SHARE_BASE).hostname;
const EXTENSION_ORIGIN = chrome.runtime.getURL('').slice(0, -1);

// ─── Storage ──────────────────────────────────────────────────────────────────

function getProducts() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

function saveProduct(product) {
  return getProducts().then((products) => {
    const updated = [product, ...products];
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
    });
  });
}

function removeProduct(id) {
  return getProducts().then((products) => {
    const updated = products.filter((p) => p.id !== id);
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
    });
  });
}

function clearAll() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
      else resolve();
    });
  });
}

// ─── Folder storage ───────────────────────────────────────────────────────────

function getFolders() {
  return new Promise((resolve) => {
    chrome.storage.local.get([FOLDERS_KEY], (result) => resolve(result[FOLDERS_KEY] || []));
  });
}

function saveFolder(folder) {
  return getFolders().then((folders) => {
    const updated = [...folders, folder];
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [FOLDERS_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
    });
  });
}

function removeFolder(id) {
  return Promise.all([getFolders(), getProducts()]).then(([folders, products]) => {
    const updatedFolders = folders.filter((f) => f.id !== id);
    const updatedProducts = products.map((p) => ({
      ...p,
      folderId: (p.folderId || []).filter((fid) => fid !== id),
    }));
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [FOLDERS_KEY]: updatedFolders, [STORAGE_KEY]: updatedProducts }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve({ folders: updatedFolders, products: updatedProducts });
      });
    });
  });
}

function assignProductToFolder(productId, folderId) {
  return getProducts().then((products) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      const existing = p.folderId || [];
      return { ...p, folderId: existing.includes(folderId) ? existing : [...existing, folderId] };
    });
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
    });
  });
}

function removeProductFromFolder(productId, folderId) {
  return getProducts().then((products) => {
    const updated = products.map((p) => {
      if (p.id !== productId) return p;
      return { ...p, folderId: (p.folderId || []).filter((fid) => fid !== folderId) };
    });
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
    });
  });
}

// ─── Extension token (links extension to haul-share.com account) ─────────────

function getExtToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get([EXT_TOKEN_KEY, EXT_USERNAME_KEY], (r) => {
      resolve({ token: r[EXT_TOKEN_KEY] || null, username: r[EXT_USERNAME_KEY] || null });
    });
  });
}

function setExtToken(token, username) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [EXT_TOKEN_KEY]: token, [EXT_USERNAME_KEY]: username }, resolve);
  });
}

function clearExtToken() {
  return new Promise((resolve) => {
    chrome.storage.local.remove([EXT_TOKEN_KEY, EXT_USERNAME_KEY], resolve);
  });
}

function getSenderUrl(sender) {
  return sender?.url || sender?.tab?.url || '';
}

function senderIsHaulShare(sender) {
  try {
    return new URL(getSenderUrl(sender)).hostname === HAUL_SHARE_HOST;
  } catch {
    return false;
  }
}

function senderIsExtensionPage(sender) {
  try {
    return new URL(getSenderUrl(sender)).origin === EXTENSION_ORIGIN;
  } catch {
    return false;
  }
}

function sanitizeProductsForCloud(products) {
  return globalThis.HaulProductSchema.sanitizeProducts(products, { maxCount: 25 });
}

async function postHaulToWebsite(products, title) {
  const { token } = await getExtToken();
  if (!token) return { success: false, reason: 'not_connected' };
  try {
    const safeProducts = sanitizeProductsForCloud(products);
    const safeTitle = globalThis.HaulProductSchema.cleanText(title || 'My Haul', 120) || 'My Haul';
    let res = await fetch(`${HAUL_SHARE_BASE}/api/hauls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ products: safeProducts, title: safeTitle, isPublic: true }),
    });
    if (res.status === 401) {
      await clearExtToken();
      return { success: false, reason: 'token_expired' };
    }
    if (!res.ok) return { success: false, reason: `server_error_${res.status}` };
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, reason: 'network_error' };
  }
}

// ─── Side panel helper ────────────────────────────────────────────────────────
// chrome.sidePanel.open was added in Chrome 116 — guard so Chrome 114/115 don't throw.

function tryOpenSidePanel(tabId) {
  if (tabId && chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
    chrome.sidePanel.open({ tabId });
  }
}

// ─── Badge ────────────────────────────────────────────────────────────────────

let _cartCount = 0;
let _unreadCount = 0;
let _prevUnreadCount = -1; // -1 = first poll, suppress desktop notification

function refreshBadge() {
  if (_unreadCount > 0) {
    chrome.action.setBadgeText({ text: _unreadCount > 99 ? '99+' : String(_unreadCount) });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // red for messages
  } else if (_cartCount > 0) {
    chrome.action.setBadgeText({ text: String(_cartCount) });
    chrome.action.setBadgeBackgroundColor({ color: '#7a9e76' }); // green for cart
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function updateBadge(count) {
  _cartCount = count;
  refreshBadge();
}

chrome.storage.onChanged.addListener((changes) => {
  if (!changes[STORAGE_KEY]) return;
  const newList = changes[STORAGE_KEY].newValue || [];
  updateBadge(newList.length);
});

// On startup: update badge.
getProducts().then((products) => {
  updateBadge(products.length);
});

// ─── Unread message badge + desktop notifications ─────────────────────────────

async function pollUnreadNotifications() {
  const { token } = await getExtToken();
  if (!token) {
    if (_unreadCount !== 0) { _unreadCount = 0; refreshBadge(); }
    return;
  }
  try {
    const res = await fetch(`${HAUL_SHARE_BASE}/api/notifications?countOnly=true`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return;
    const json = await res.json();
    const count = typeof json.unread_count === 'number' ? json.unread_count : 0;

    if (count > _prevUnreadCount && _prevUnreadCount !== -1) {
      const delta = count - _prevUnreadCount;
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Haul',
        message: delta === 1 ? 'You have a new message' : `You have ${delta} new messages`,
        priority: 2,
      });
    }

    _prevUnreadCount = count;
    _unreadCount = count;
    refreshBadge();
  } catch {
    // network error — keep current state
  }
}

// Open messages when clicking a desktop notification
chrome.notifications.onClicked.addListener((notifId) => {
  chrome.tabs.create({ url: `${HAUL_SHARE_BASE}/messages`, active: true });
  chrome.notifications.clear(notifId);
});

// Poll on startup and every 30 s via alarms
pollUnreadNotifications();
chrome.alarms.create('pollUnread', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pollUnread') pollUnreadNotifications();
});

// ─── Action click → open side panel ──────────────────────────────────────────

chrome.action.onClicked.addListener((tab) => {
  tryOpenSidePanel(tab.id);
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;

  if (message.type === 'SAVE_PRODUCT') {
    const product = globalThis.HaulProductSchema.sanitizeProduct(message.product);
    if (!product) {
      sendResponse({ success: false, error: 'Invalid product' });
      return false;
    }
    saveProduct(product)
      .then((products) => {
        sendResponse({ success: true, count: products.length });
        tryOpenSidePanel(sender.tab && sender.tab.id);
      })
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  if (message.type === 'GET_PRODUCTS') {
    getProducts()
      .then((products) => sendResponse({ products }))
      .catch(() => sendResponse({ products: [] }));
    return true;
  }

  if (message.type === 'REMOVE_PRODUCT') {
    if (typeof message.id !== 'string') {
      sendResponse({ success: false, error: 'Invalid id' });
      return false;
    }
    removeProduct(message.id)
      .then((products) => sendResponse({ success: true, count: products.length }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === 'CLEAR_ALL') {
    clearAll()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
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

  if (message.type === 'IMPORT_PRODUCTS') {
    const incoming = globalThis.HaulProductSchema.sanitizeProducts(message.products, { maxCount: 25 });
    if (incoming.length === 0) {
      sendResponse({ success: false, error: 'No products to import.' });
      return false;
    }
    getProducts().then((existing) => {
      const existingIds = new Set(existing.map((p) => p.id));
      const existingUrls = new Set(existing.map((p) => p.sourceUrl).filter(Boolean));
      const newOnes = incoming
        .filter((p) => !existingIds.has(p.id) && !existingUrls.has(p.sourceUrl))
        .map((p) => ({
          ...p,
          id: p.id || `import_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          savedAt: Date.now(),
        }));
      const updated = [...newOnes, ...existing];
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        chrome.action.setBadgeText({ text: updated.length > 0 ? String(updated.length) : '' });
        sendResponse({ success: true, count: newOnes.length });
      });
    });
    return true;
  }

  if (message.type === 'ASK_CLAUDE_CHAT') {
    let products;
    if (!Array.isArray(message.messages)) {
      sendResponse({ success: false, error: 'Invalid payload.' });
      return false;
    }
    try {
      products = sanitizeProductsForCloud(message.products);
    } catch (err) {
      sendResponse({ success: false, error: err.message || 'Invalid products.' });
      return false;
    }
    fetch(`${HAUL_WORKER_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, messages: message.messages }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `Worker error ${r.status}`);
        return data;
      })
      .then((data) => sendResponse({ success: true, message: (data.message || '').replace(/ — /g, ', '), suggestedProducts: data.suggestedProducts }))
      .catch((err) => sendResponse({ success: false, error: String(err).replace(/^Error:\s*/, '') }));
    return true;
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    tryOpenSidePanel(sender.tab && sender.tab.id);
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'GET_FOLDERS') {
    getFolders().then((folders) => sendResponse({ folders })).catch(() => sendResponse({ folders: [] }));
    return true;
  }

  if (message.type === 'CREATE_FOLDER') {
    const { folder } = message;
    if (!folder || typeof folder.id !== 'string' || typeof folder.name !== 'string') {
      sendResponse({ success: false, error: 'Invalid folder' });
      return false;
    }
    saveFolder(folder).then((folders) => sendResponse({ success: true, folders })).catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === 'REMOVE_FOLDER') {
    if (typeof message.id !== 'string') { sendResponse({ success: false }); return false; }
    removeFolder(message.id).then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === 'ASSIGN_TO_FOLDER') {
    const { productId, folderId } = message;
    if (!productId || !folderId) { sendResponse({ success: false }); return false; }
    assignProductToFolder(productId, folderId).then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === 'REMOVE_FROM_FOLDER') {
    const { productId, folderId } = message;
    if (!productId || !folderId) { sendResponse({ success: false }); return false; }
    removeProductFromFolder(productId, folderId).then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.type === 'SET_EXT_TOKEN') {
    const { token, username } = message;
    const safeUsername = globalThis.HaulProductSchema.cleanIdentifier(username, 30);
    if (!senderIsHaulShare(sender) || !/^[a-f0-9]{64}$/i.test(token) || !safeUsername) {
      sendResponse({ success: false });
      return false;
    }
    setExtToken(token, safeUsername).then(() => sendResponse({ success: true, username: safeUsername }));
    return true;
  }

  if (message.type === 'GET_EXT_TOKEN') {
    if (!senderIsExtensionPage(sender)) {
      sendResponse({ token: null, username: null });
      return false;
    }
    getExtToken().then(({ token, username }) => sendResponse({ token, username }));
    return true;
  }

  if (message.type === 'CLEAR_EXT_TOKEN') {
    clearExtToken().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'GET_CLOUD_CONSENT') {
    chrome.storage.local.get([CLOUD_CONSENT_KEY], (result) => {
      sendResponse({ allowed: result[CLOUD_CONSENT_KEY] === true });
    });
    return true;
  }

  if (message.type === 'SET_CLOUD_CONSENT') {
    chrome.storage.local.set({ [CLOUD_CONSENT_KEY]: Boolean(message.allowed) }, () => {
      sendResponse({ success: !chrome.runtime.lastError });
    });
    return true;
  }

  if (message.type === 'OPEN_HAUL_SITE') {
    chrome.tabs.create({ url: `${HAUL_SHARE_BASE}/feed`, active: true });
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'POST_HAUL_TO_WEBSITE') {
    const { products, title } = message;
    if (!Array.isArray(products)) { sendResponse({ success: false, reason: 'invalid_products' }); return false; }
    postHaulToWebsite(products, title)
      .then((result) => sendResponse(result))
      .catch(() => sendResponse({ success: false, reason: 'unknown' }));
    return true;
  }

  return false;
});
