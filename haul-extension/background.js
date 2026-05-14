// Haul background service worker.
// Storage is inlined here to avoid importScripts failures in MV3 service workers.

const STORAGE_KEY = 'haul_products';
const FOLDERS_KEY = 'haul_folders';
const EXT_TOKEN_KEY = 'haul_ext_token';
const EXT_USERNAME_KEY = 'haul_ext_username';

// ─── Haul Worker config ───────────────────────────────────────────────────────
const HAUL_WORKER_URL = 'https://haul-ai.haulapp.workers.dev';

// ─── Haul Share config ────────────────────────────────────────────────────────
// UPDATE to your actual Railway URL (check Railway dashboard → your haul-share service).
const HAUL_SHARE_BASE = 'https://haul-production.up.railway.app';

const VALID_CATEGORIES = [
  'Electronics', 'Clothing', 'Footwear', 'Home', 'Beauty',
  'Sports', 'Toys', 'Books', 'Food', 'Other',
];

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

function patchProduct(id, fields) {
  return getProducts().then((products) => {
    const updated = products.map((p) => p.id === id ? { ...p, ...fields } : p);
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(updated);
      });
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

async function refreshTokenViaTab() {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: `${HAUL_SHARE_BASE}/feed`, active: false }, (tab) => {
      // Give the content script time to run and send SET_EXT_TOKEN, then close the tab.
      setTimeout(() => {
        chrome.tabs.remove(tab.id, () => {});
        resolve();
      }, 4000);
    });
  });
}

async function postHaulToWebsite(products, title) {
  const { token } = await getExtToken();
  if (!token) return { success: false, reason: 'not_connected' };
  try {
    let res = await fetch(`${HAUL_SHARE_BASE}/api/hauls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ products, title, isPublic: true }),
    });
    if (res.status === 401) {
      // Token expired — silently refresh via background tab then retry once.
      await refreshTokenViaTab();
      const { token: newToken } = await getExtToken();
      if (!newToken) return { success: false, reason: 'token_expired' };
      res = await fetch(`${HAUL_SHARE_BASE}/api/hauls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
        body: JSON.stringify({ products, title, isPublic: true }),
      });
    }
    if (!res.ok) return { success: false, reason: `server_error_${res.status}` };
    const data = await res.json();
    return { success: true, data };
  } catch {
    return { success: false, reason: 'network_error' };
  }
}

// ─── Worker health check ──────────────────────────────────────────────────────

function workerReady() {
  return !HAUL_WORKER_URL.includes('YOUR_SUBDOMAIN');
}

// ─── AI via Haul Worker ───────────────────────────────────────────────────────

const categorizingIds = new Set();

async function categorizeProduct(product) {
  if (!workerReady()) return null;
  if (categorizingIds.has(product.id)) return null;
  categorizingIds.add(product.id);

  try {
    const res = await fetch(`${HAUL_WORKER_URL}/categorize`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: product.name, siteName: product.siteName }),
    });
    if (!res.ok) return null;
    const { category } = await res.json();
    return VALID_CATEGORIES.includes(category) ? category : null;
  } catch {
    return null;
  } finally {
    categorizingIds.delete(product.id);
  }
}

async function callClaudeAdvise(products) {
  if (!workerReady()) {
    throw new Error('Deploy the Haul Worker first — see haul-worker/wrangler.toml for instructions.');
  }

  const res = await fetch(`${HAUL_WORKER_URL}/advise`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ products }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Worker error ${res.status}`);
  }

  return res.json();
}

async function categorizePendingProducts() {
  if (!workerReady()) return;
  const products = await getProducts();
  const pending = products.filter((p) => !p.category && !categorizingIds.has(p.id));
  for (const p of pending) {
    const category = await categorizeProduct(p);
    if (category) {
      await patchProduct(p.id, { category }).catch(() => {});
    }
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

function updateBadge(count) {
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#7a9e76' });
}

chrome.storage.onChanged.addListener((changes) => {
  if (!changes[STORAGE_KEY]) return;
  const newList = changes[STORAGE_KEY].newValue || [];
  const oldList = changes[STORAGE_KEY].oldValue || [];
  updateBadge(newList.length);

  const oldIds = new Set(oldList.map((p) => p.id));
  const added = newList.filter((p) => !oldIds.has(p.id) && !p.category);
  for (const p of added) {
    categorizeProduct(p).then((cat) => {
      if (cat) patchProduct(p.id, { category: cat }).catch(() => {});
    });
  }
});

// On startup: update badge + categorize any uncategorized products.
getProducts().then((products) => {
  updateBadge(products.length);
  categorizePendingProducts();
});

// ─── Action click → open side panel ──────────────────────────────────────────

chrome.action.onClicked.addListener((tab) => {
  tryOpenSidePanel(tab.id);
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return false;

  if (message.type === 'SAVE_PRODUCT') {
    const product = message.product;
    if (!product || typeof product !== 'object' || typeof product.id !== 'string') {
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

  if (message.type === 'ASK_CLAUDE') {
    const products = message.products;
    if (!Array.isArray(products) || products.length === 0) {
      sendResponse({ success: false, error: 'No products to analyze.' });
      return false;
    }
    callClaudeAdvise(products)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  if (message.type === 'IMPORT_PRODUCTS') {
    const incoming = message.products;
    if (!Array.isArray(incoming) || incoming.length === 0) {
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
    const { products, messages } = message;
    if (!Array.isArray(products) || !Array.isArray(messages)) {
      sendResponse({ success: false, error: 'Invalid payload.' });
      return false;
    }
    fetch(`${HAUL_WORKER_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, messages }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || `Worker error ${r.status}`);
        return data;
      })
      .then((data) => sendResponse({ success: true, message: data.message || '', suggestedProducts: data.suggestedProducts }))
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
    if (!token || !username) { sendResponse({ success: false }); return false; }
    setExtToken(token, username).then(() => sendResponse({ success: true, username }));
    return true;
  }

  if (message.type === 'GET_EXT_TOKEN') {
    getExtToken().then(({ token, username }) => sendResponse({ token, username }));
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
