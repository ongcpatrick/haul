// Haul side panel JS.

let products = [];

// Escape text for safe insertion into innerHTML templates.
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

// Only allow http/https URLs for images; reject data: and javascript: URLs.
function safeImgUrl(url) {
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
}

function formatPrice(price) {
  if (price == null) return '—';
  return '$' + price.toFixed(2);
}

// Attach onerror fallbacks to product images after innerHTML is set.
// Inline onerror attributes are blocked by MV3 CSP, so we use addEventListener.
function attachImageFallbacks(container) {
  container.querySelectorAll('img.product-img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const placeholder = img.nextElementSibling;
      if (placeholder) placeholder.style.display = 'flex';
    });
  });
}

const PLACEHOLDER_SVG = `
  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`;

function renderProducts() {
  const contentArea = document.getElementById('content-area');
  const footer = document.getElementById('footer');
  const countBadge = document.getElementById('count-badge');

  countBadge.textContent = `${products.length} item${products.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    footer.style.display = 'none';
    contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <polyline points="16 3 12 7 8 3"/>
          </svg>
        </div>
        <div class="empty-title">No saves yet</div>
        <div class="empty-desc">Visit any shopping site and click the<br><strong>Save to Haul</strong> button on a product.</div>
      </div>`;
    return;
  }

  footer.style.display = 'flex';

  const list = products.map((p) => {
    const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
    const savings = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;

    const priceHtml = p.price != null
      ? `<span class="price">${formatPrice(p.price)}</span>`
      : '<span class="price">—</span>';

    const origHtml = hasDrop
      ? `<span class="original-price">${formatPrice(p.originalPrice)}</span>`
      : '';

    const dropBadge = hasDrop
      ? `<span class="badge-drop">↓ $${esc(savings)}</span>`
      : '';

    const safeImg = safeImgUrl(p.imageUrl);
    const imgHtml = safeImg
      ? `<img class="product-img" src="${esc(safeImg)}" alt="" />
         <div class="product-img-placeholder" style="display:none;">${PLACEHOLDER_SVG}</div>`
      : `<div class="product-img-placeholder">${PLACEHOLDER_SVG}</div>`;

    return `
      <div class="product-card" data-id="${esc(p.id)}">
        ${imgHtml}
        <div class="product-info">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-site">${esc(p.siteName)}</div>
          <div class="price-row">${priceHtml}${origHtml}${dropBadge}</div>
        </div>
        <button class="remove-btn" data-id="${esc(p.id)}" title="Remove">
          <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`;
  }).join('');

  contentArea.innerHTML = `<div class="product-list">${list}</div>`;

  attachImageFallbacks(contentArea);

  contentArea.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'REMOVE_PRODUCT', id: btn.dataset.id }, (response) => {
        if (!chrome.runtime.lastError && response?.success) loadProducts();
      });
    });
  });
}

function loadProducts() {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
    if (chrome.runtime.lastError) return;
    products = response.products || [];
    renderProducts();
  });
}

document.getElementById('compare-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  if (!confirm('Clear all saved items?')) return;
  chrome.runtime.sendMessage({ type: 'CLEAR_ALL' }, () => loadProducts());
});

document.getElementById('refresh-btn').addEventListener('click', loadProducts);

chrome.storage.onChanged.addListener((changes) => {
  if (changes['haul_products']) {
    products = changes['haul_products'].newValue || [];
    renderProducts();
  }
});

loadProducts();
