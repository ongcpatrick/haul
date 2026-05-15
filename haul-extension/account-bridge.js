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
  if (event.source !== window || event.data?.type !== 'HAUL_OPEN_PANEL') return;
  chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
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
