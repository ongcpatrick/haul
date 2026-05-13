// Haul popup JS.

function safeUrl(url) {
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
}

function formatPrice(price) {
  if (price == null) return '';
  return '$' + Number(price).toFixed(2);
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
  if (chrome.runtime.lastError) return;
  const products = response.products || [];

  document.getElementById('count').textContent = products.length;

  if (products.length >= 2) {
    document.getElementById('compare-btn').disabled = false;
  }

  // Render the 3 most recently saved items as clickable rows
  const recent = products.slice(0, 3);
  if (recent.length > 0) {
    const list = document.getElementById('recent-list');
    list.classList.add('visible');

    recent.forEach((p) => {
      const url = safeUrl(p.sourceUrl);
      if (!url) return;

      const btn = document.createElement('button');
      btn.className = 'recent-item';

      const imgHtml = safeUrl(p.imageUrl)
        ? `<img class="recent-thumb" src="${esc(p.imageUrl)}" alt="" />`
        : `<div class="recent-thumb-placeholder"></div>`;

      btn.innerHTML = `
        ${imgHtml}
        <div class="recent-info">
          <div class="recent-name">${esc(p.name || 'Untitled product')}</div>
          ${p.price != null ? `<div class="recent-price">${formatPrice(p.price)}</div>` : ''}
        </div>
        <span class="recent-arrow">›</span>
      `;

      // Fix img error after innerHTML (inline onerror blocked by MV3 CSP)
      const img = btn.querySelector('img');
      if (img) {
        img.addEventListener('error', () => {
          img.replaceWith(Object.assign(document.createElement('div'), { className: 'recent-thumb-placeholder' }));
        });
      }

      btn.addEventListener('click', () => {
        chrome.tabs.create({ url });
        window.close();
      });

      list.appendChild(btn);
    });
  }
});

document.getElementById('open-tray-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.sidePanel.open({ tabId: tabs[0].id });
      window.close();
    }
  });
});

document.getElementById('compare-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  window.close();
});
