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
    #haul-save-btn {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #4f46e5;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(79,70,229,0.45);
      transition: background 0.15s, transform 0.15s;
      user-select: none;
    }
    #haul-save-btn:hover { background: #4338ca; transform: translateY(-1px); }
    #haul-save-btn:active { transform: translateY(0); }
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
      background: #1e1b4b;
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

  function showSaveButton() {
    if (saveBtn) return;
    document.getElementById('haul-save-btn')?.remove();
    injectStyles();
    saveBtn = document.createElement('button');
    saveBtn.id = 'haul-save-btn';
    saveBtn.innerHTML = `${SAVE_SVG} Save to Haul`;
    saveBtn.addEventListener('click', handleSave);
    document.body.appendChild(saveBtn);
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
    saveBtn.innerHTML = `${CHECK_SVG} Saved (${count})`;
    setTimeout(resetSaveBtn, 1800);
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
