// Haul content script — Save button and toast UI.
// Product detection and extraction are provided by lib/extractor.js, which is
// injected into the same isolated world before this file via manifest.json.

(function () {
  'use strict';

  const STORAGE_KEY = 'haul_products';

  let saveBtn = null;
  let toast = null;
  let checkTimeout = null;

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const STYLES = `
    @keyframes haul-btn-in {
      from { opacity: 0; transform: translateY(16px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }
    @keyframes haul-check-in {
      0%   { transform: scale(0); }
      60%  { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    #haul-save-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #7a9e76;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(122,158,118,0.45);
      transition: background 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
      user-select: none;
      animation: haul-btn-in 0.45s cubic-bezier(0.16,1,0.3,1) both;
    }
    #haul-save-btn:hover { background: #6a8c66; transform: translateY(-2px); }
    #haul-save-btn:active { transform: scale(0.94) !important; transition: transform 0.1s ease !important; }
    #haul-save-btn.saved { background: #6a8c66; opacity: 0.88; cursor: default; }
    #haul-save-btn.saved:hover { background: #6a8c66; transform: none; }
    #haul-save-btn.saved svg { animation: haul-check-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
    #haul-save-btn svg { flex-shrink: 0; }
    #haul-toast {
      position: fixed;
      bottom: 140px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: #3d3529;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
      font-weight: 500;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      animation: haul-toast-in 0.25s ease;
      max-width: 280px;
    }
    @keyframes haul-toast-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #haul-toast.haul-toast-out {
      animation: haul-toast-out 0.25s ease forwards;
    }
    @keyframes haul-toast-out {
      to { opacity: 0; transform: translateY(8px); }
    }
  `;

  function injectStyles() {
    if (document.getElementById('haul-styles')) return;
    const style = document.createElement('style');
    style.id = 'haul-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  // ─── Save button ─────────────────────────────────────────────────────────────

  const SAVE_SVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><polyline points="16 3 12 7 8 3"/></svg>`;
  const CHECK_SVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

  function setSavedState() {
    if (!saveBtn) return;
    saveBtn.disabled = true;
    saveBtn.classList.add('saved');
    saveBtn.innerHTML = `${CHECK_SVG} Saved`;
  }

  function showSaveButton() {
    if (saveBtn) return;
    document.getElementById('haul-save-btn')?.remove();
    injectStyles();
    saveBtn = document.createElement('button');
    saveBtn.id = 'haul-save-btn';
    saveBtn.innerHTML = `${SAVE_SVG} Save to Haul`;
    saveBtn.addEventListener('click', handleSave);
    document.body.appendChild(saveBtn);

    // Check if this page is already saved
    const currentUrl = window.location.href;
    const currentUrlBase = currentUrl.split('?')[0];
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) return;
      const saved = result[STORAGE_KEY] || [];
      const alreadySaved = saved.some((p) =>
        p.sourceUrl === currentUrl || p.sourceUrl?.split('?')[0] === currentUrlBase
      );
      if (alreadySaved) setSavedState();
    });
  }

  function hideSaveButton() {
    if (saveBtn) { saveBtn.remove(); saveBtn = null; }
  }

  // ─── Toast ───────────────────────────────────────────────────────────────────

  function showToast(productName) {
    if (toast) toast.remove();
    injectStyles();

    toast = document.createElement('div');
    toast.id = 'haul-toast';

    const icon = document.createElement('span');
    icon.innerHTML = CHECK_SVG.replace('currentColor', '#a5b4fc');

    const label = document.createElement('span');
    label.textContent = 'Saved! ';
    const strong = document.createElement('strong');
    strong.textContent = productName.slice(0, 40) + (productName.length > 40 ? '…' : '');
    label.appendChild(strong);

    toast.appendChild(icon);
    toast.appendChild(label);
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast) {
        toast.classList.add('haul-toast-out');
        setTimeout(() => { if (toast) { toast.remove(); toast = null; } }, 260);
      }
    }, 2500);
  }

  // ─── Direct storage save (no service worker dependency) ──────────────────────
  // Content scripts have direct access to chrome.storage.local.
  // This is the primary save path — no message round-trip required.

  function directSave(product) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        const existing = result[STORAGE_KEY] || [];
        const updated = [product, ...existing];
        chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(updated.length);
        });
      });
    });
  }

  // ─── Save handler ─────────────────────────────────────────────────────────────

  function resetSaveBtn() {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = `${SAVE_SVG} Save to Haul`; }
  }

  async function handleSave() {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    let product;
    try {
      product = extractProduct();
    } catch {
      saveBtn.textContent = 'Could not read page';
      setTimeout(resetSaveBtn, 2000);
      return;
    }

    // If price is null, wait up to 3 s for JS-rendered price to appear then re-extract.
    if (product.price == null) {
      product = await new Promise((resolve) => {
        const deadline = setTimeout(() => { observer.disconnect(); resolve(product); }, 3000);
        const observer = new MutationObserver(() => {
          const refreshed = extractProduct();
          if (refreshed.price != null) {
            clearTimeout(deadline);
            observer.disconnect();
            resolve(refreshed);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      });
    }

    // Save directly — reliable regardless of service worker state.
    let count;
    try {
      count = await directSave(product);
    } catch (err) {
      saveBtn.textContent = 'Save failed';
      setTimeout(resetSaveBtn, 2500);
      return;
    }

    // Best-effort: tell the background to open the side panel.
    // Don't block on this — storage.onChanged already refreshes the side panel.
    try {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    } catch {
      // Service worker unavailable — side panel won't auto-open, but save succeeded.
    }

    showToast(product.name);
    setSavedState();
  }

  // ─── Page lifecycle ──────────────────────────────────────────────────────────

  function checkPage() {
    if (isProductPage()) { showSaveButton(); } else { hideSaveButton(); }
  }

  checkPage();

  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(checkPage, 2000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// ── haul-share.com: auto-connect extension token ──────────────────────────────
// When user visits haul-share, silently fetch an extension token using their
// existing Clerk session and store it in the extension for API calls.
(function autoConnectToken() {
  const HAUL_SHARE_HOSTS = ['haul-share-production.up.railway.app'];
  if (!HAUL_SHARE_HOSTS.some((h) => window.location.hostname === h)) return;
  fetch('/api/extension/token', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data?.data?.token && data?.data?.username) {
        chrome.runtime.sendMessage({
          type: 'SET_EXT_TOKEN',
          token: data.data.token,
          username: data.data.username,
        });
      }
    })
    .catch(() => {});
})();

// ── haul-share.com: "Add to My Haul" handler ─────────────────────────────────
// The view page renders buttons with data-haul-import="<base64 JSON>".
// This content script (runs on all URLs) handles those clicks.

const HAUL_SHARE_IMPORT_HOSTS = ['haul-share-production.up.railway.app'];
if (HAUL_SHARE_IMPORT_HOSTS.some((h) => window.location.hostname === h)) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-haul-import]');
    if (!btn) return;
    const raw = btn.dataset.haulImport;
    if (!raw) return;
    try {
      const product = JSON.parse(atob(raw));
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = 'Saving…';
      chrome.runtime.sendMessage({ type: 'IMPORT_PRODUCTS', products: [product] }, (res) => {
        if (chrome.runtime.lastError || !res?.success) {
          btn.disabled = false;
          btn.textContent = original;
          return;
        }
        btn.textContent = 'Saved!';
        btn.style.background = '#7a9e76';
        btn.style.color = '#fff';
      });
    } catch { /* ignore malformed data */ }
  });
}
