// Haul account bridge.
// Runs only on Haul's web app, never on arbitrary shopping pages.

(function autoConnectToken() {
  'use strict';

  fetch('/api/extension/token', { credentials: 'include' })
    .then((response) => (response.ok ? response.json() : null))
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

window.addEventListener('message', (event) => {
  'use strict';
  if (event.source !== window) return;

  if (event.data?.type === 'HAUL_OPEN_PANEL') {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    return;
  }

  if (event.data?.type === 'HAUL_GET_PENDING_POST') {
    chrome.storage.local.get(['haul_pending_post'], (result) => {
      const pending = result.haul_pending_post || null;
      window.postMessage({ type: 'HAUL_PENDING_POST', data: pending }, '*');
      if (pending) {
        chrome.storage.local.remove(['haul_pending_post']);
      }
    });
  }
});

document.addEventListener('click', (event) => {
  'use strict';

  const button = event.target.closest('[data-haul-import]');
  if (!button) return;

  const raw = button.dataset.haulImport;
  if (!raw) return;

  try {
    const product = globalThis.HaulProductSchema?.sanitizeProduct(JSON.parse(atob(raw)));
    if (!product) return;

    button.disabled = true;
    const original = button.textContent;
    button.textContent = 'Saving...';

    chrome.runtime.sendMessage({ type: 'IMPORT_PRODUCTS', products: [product] }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        button.disabled = false;
        button.textContent = original;
        return;
      }
      button.textContent = 'Saved!';
      button.style.background = '#7a9e76';
      button.style.color = '#fff';
    });
  } catch {
    // Ignore malformed page data.
  }
});
