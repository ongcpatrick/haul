// Haul comparison dashboard JS.

let allProducts = [];
let activeFilter = 'all';

// Escape text for safe insertion into innerHTML templates.
function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

// Validate http/https URLs before using as src or opening.
function safeUrl(url) {
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
}

function formatPrice(price) {
  if (price == null) return '—';
  return '$' + price.toFixed(2);
}

function getCategory(product) {
  const host = (product.siteName || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  if (host.includes('nike') || host.includes('adidas') || host.includes('converse') || name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) return 'Shoes';
  if (host.includes('bestbuy') || host.includes('newegg') || host.includes('bhphotovideo') || name.includes('laptop') || name.includes('monitor') || name.includes('gpu') || name.includes('phone') || name.includes('tablet')) return 'Electronics';
  if (host.includes('asos') || host.includes('zara') || host.includes('hm') || host.includes('nordstrom') || name.includes('shirt') || name.includes('jacket') || name.includes('dress')) return 'Clothing';
  if (host.includes('wayfair') || host.includes('ikea') || name.includes('sofa') || name.includes('desk') || name.includes('chair') || name.includes('bed')) return 'Home';
  return 'Other';
}

function getCategories(products) {
  const cats = new Set(products.map(getCategory));
  return ['all', ...Array.from(cats)];
}

function filteredProducts() {
  if (activeFilter === 'all') return allProducts;
  return allProducts.filter((p) => getCategory(p) === activeFilter);
}

function renderFilters() {
  const bar = document.getElementById('filters-bar');
  const cats = getCategories(allProducts);
  bar.innerHTML = cats.map((cat) => {
    const label = cat === 'all'
      ? `All (${allProducts.length})`
      : `${esc(cat)} (${allProducts.filter((p) => getCategory(p) === cat).length})`;
    return `<button class="filter-btn${activeFilter === cat ? ' active' : ''}" data-cat="${esc(cat)}">${label}</button>`;
  }).join('');
  bar.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderTable();
    });
  });
}

// Attach onerror fallbacks after innerHTML — inline onerror is blocked by MV3 CSP.
function attachImageFallbacks(container) {
  container.querySelectorAll('.product-img-cell img').forEach((img) => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
}

// Attach Go-to-Site click handlers after innerHTML — inline onclick is blocked by MV3 CSP.
function attachGoButtons(container) {
  container.querySelectorAll('.go-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = safeUrl(btn.dataset.url);
      if (url) chrome.tabs.create({ url });
    });
  });
}

function renderTable() {
  const content = document.getElementById('main-content');
  const sub = document.getElementById('header-sub');
  const products = filteredProducts();

  sub.textContent = `${allProducts.length} item${allProducts.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    content.innerHTML = `
      <div class="empty">
        <div class="empty-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <polyline points="16 3 12 7 8 3"/>
          </svg>
        </div>
        <h2>No items to compare</h2>
        <p>Save products while browsing to compare them here.</p>
      </div>`;
    return;
  }

  const rows = [
    { label: 'Product', key: 'image' },
    { label: 'Name',    key: 'name'  },
    { label: 'Price',   key: 'price' },
    { label: 'Site',    key: 'site'  },
    { label: 'Link',    key: 'link'  },
  ];

  const thead = `
    <thead>
      <tr>
        <th class="row-label"></th>
        ${products.map((p) => `
          <th class="product-col-header">
            <button class="remove-col-btn" data-id="${esc(p.id)}" title="Remove">
              <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </th>`).join('')}
      </tr>
    </thead>`;

  const buildRow = (row) => {
    const cells = products.map((p) => {
      const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
      const savings = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;

      if (row.key === 'image') {
        const badge = hasDrop ? `<span class="price-drop-badge">↓ $${esc(savings)}</span>` : '';
        const safeImg = safeUrl(p.imageUrl);
        const imgTag = safeImg ? `<img src="${esc(safeImg)}" alt="" />` : '';
        return `<td><div class="product-img-cell">${imgTag}${badge}</div></td>`;
      }
      if (row.key === 'name') {
        return `<td class="data-cell" style="font-weight:500;">${esc(p.name)}</td>`;
      }
      if (row.key === 'price') {
        const orig = hasDrop ? `<span class="price-orig">${formatPrice(p.originalPrice)}</span>` : '';
        return `<td class="data-cell"><div class="price-display"><span class="price-main">${formatPrice(p.price)}</span>${orig}</div></td>`;
      }
      if (row.key === 'site') {
        return `<td class="data-cell" style="color:#9ca3af;">${esc(p.siteName)}</td>`;
      }
      if (row.key === 'link') {
        const safe = safeUrl(p.sourceUrl);
        return safe
          ? `<td><button class="go-btn" data-url="${esc(safe)}">Go to Site</button></td>`
          : `<td><span style="color:#9ca3af;font-size:12px;">No URL</span></td>`;
      }
      return `<td></td>`;
    }).join('');

    return `<tr><td class="row-label">${row.label}</td>${cells}</tr>`;
  };

  const tbody = `<tbody>${rows.map(buildRow).join('')}</tbody>`;

  content.innerHTML = `<div class="table-wrapper"><table>${thead}${tbody}</table></div>`;

  attachImageFallbacks(content);
  attachGoButtons(content);

  content.querySelectorAll('.remove-col-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'REMOVE_PRODUCT', id: btn.dataset.id }, () => {
        allProducts = allProducts.filter((p) => p.id !== btn.dataset.id);
        renderFilters();
        renderTable();
      });
    });
  });
}

function shareComparison() {
  const json = JSON.stringify(allProducts);
  const encoded = btoa(encodeURIComponent(json));
  const shareUrl = `${window.location.href.split('?')[0]}?data=${encoded}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    const toast = document.getElementById('share-toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
  }).catch(() => {});
}

function isValidProductArray(data) {
  return Array.isArray(data) &&
    data.every((p) => p !== null && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string');
}

const params = new URLSearchParams(window.location.search);
const sharedData = params.get('data');

if (sharedData) {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(sharedData)));
    if (!isValidProductArray(parsed)) throw new Error('Invalid shape');
    allProducts = parsed;
    document.getElementById('close-btn').style.display = 'none';
  } catch {
    document.getElementById('header-sub').textContent = 'Could not load shared data';
  }
  renderFilters();
  renderTable();
} else {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
    if (chrome.runtime.lastError) return;
    allProducts = response.products || [];
    renderFilters();
    renderTable();
  });
}

document.getElementById('share-btn').addEventListener('click', shareComparison);
document.getElementById('close-btn').addEventListener('click', () => window.close());

chrome.storage.onChanged.addListener((changes) => {
  if (changes['haul_products'] && !sharedData) {
    allProducts = changes['haul_products'].newValue || [];
    renderFilters();
    renderTable();
  }
});
