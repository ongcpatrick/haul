// Haul background service worker.
// Storage is inlined here to avoid importScripts failures in MV3 service workers.

const STORAGE_KEY = 'haul_products';

// ─── Haul Worker config ───────────────────────────────────────────────────────
// After deploying haul-worker/, replace YOUR_SUBDOMAIN with your actual subdomain.
// Run: npx wrangler deploy && npx wrangler secret put ANTHROPIC_API_KEY
const HAUL_WORKER_URL = 'https://haul-ai.haulapp.workers.dev';

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
  chrome.action.setBadgeBackgroundColor({ color: '#4f46e5' });
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

  if (message.type === 'OPEN_SIDE_PANEL') {
    tryOpenSidePanel(sender.tab && sender.tab.id);
    sendResponse({ success: true });
    return false;
  }

  return false;
});
