// Haul comparison dashboard — v0.4 premium UI

let allProducts = [];
let allFolders = [];
let activeFilter = 'all';
let activeFolderFilter = 'all';
let winnerId = null;

// Cached share URL — generated once per session per product set.
let cachedShareUrl = null;
let cachedShareProducts = null;

const WORKER_BASE = 'https://haul-ai.haulapp.workers.dev';
const PROXY_BASE  = `${WORKER_BASE}/proxy-image?url=`;

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function safeUrl(url) {
  return url && (url.startsWith('https://') || url.startsWith('http://')) ? url : null;
}

function formatPrice(price) {
  if (price == null) return '—';
  return '$' + price.toFixed(2);
}

function getCategory(product) {
  if (product.category) return product.category;
  const name = (product.name || '').toLowerCase();
  if (/shoe|sneaker|boot|sandal|heel|loafer|trainer|slipper|cleat/.test(name)) return 'Footwear';
  if (/pants|jacket|shirt|dress|hoodie|shorts|coat|suit|skirt|legging|jeans|sweater|sweatshirt|polo|blouse|tee|tracksuit|track/.test(name)) return 'Clothing';
  if (/laptop|monitor|headphone|keyboard|camera|tablet|phone|speaker|gpu/.test(name)) return 'Electronics';
  if (/sofa|desk|chair|bed|shelf|lamp|rug|pillow/.test(name)) return 'Home';
  const host = (product.siteName || '').toLowerCase();
  if (/bestbuy|newegg/.test(host)) return 'Electronics';
  if (/wayfair|ikea/.test(host))   return 'Home';
  return 'Other';
}

function getCategories(products) {
  return ['all', ...Array.from(new Set(products.map(getCategory)))];
}

function folderProducts() {
  if (activeFolderFilter === 'all') return allProducts;
  return allProducts.filter((p) => (p.folderId || []).includes(activeFolderFilter));
}

function filteredProducts() {
  const base = folderProducts();
  return activeFilter === 'all' ? base : base.filter((p) => getCategory(p) === activeFilter);
}

function totalSavings(products) {
  return products.reduce((sum, p) => {
    if (p.originalPrice && p.price && p.originalPrice > p.price) {
      return sum + (p.originalPrice - p.price);
    }
    return sum;
  }, 0);
}

// ── Filter bar ──────────────────────────────────────────────────────────────

function renderFilters() {
  const bar = document.getElementById('filters-bar');
  const base = folderProducts();
  const cats = getCategories(base);

  const folderSelect = allFolders.length > 0
    ? `<select id="folder-select" style="padding:5px 10px;border:1.5px solid var(--border);border-radius:20px;background:var(--bg);font-size:12px;font-weight:600;color:var(--text);cursor:pointer;margin-right:2px;">
        <option value="all">All Folders</option>
        ${allFolders.map((f) => `<option value="${esc(f.id)}"${activeFolderFilter === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}
       </select>`
    : '';

  const pillsHtml = cats.map((cat) => {
    const count = cat === 'all' ? base.length : base.filter((p) => getCategory(p) === cat).length;
    const label = cat === 'all' ? `All (${count})` : `${esc(cat)} (${count})`;
    return `<button class="filter-btn${activeFilter === cat ? ' active' : ''}" data-cat="${esc(cat)}">${label}</button>`;
  }).join('');

  const saved = totalSavings(base);
  const savingsBadge = saved > 0
    ? `<span class="savings-badge">Saving ${formatPrice(saved)}</span>`
    : '';

  bar.innerHTML = folderSelect + pillsHtml + savingsBadge;

  const sel = document.getElementById('folder-select');
  if (sel) {
    sel.value = activeFolderFilter;
    sel.addEventListener('change', () => {
      activeFolderFilter = sel.value;
      activeFilter = 'all';
      renderFilters();
      renderContent();
    });
  }

  bar.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderContent();
    });
  });
}

// ── Image fallbacks ─────────────────────────────────────────────────────────

function attachImageFallbacks(container) {
  container.querySelectorAll('img[data-src]').forEach((img) => {
    img.src = img.dataset.src;
    img.addEventListener('error', () => {
      if (!img.dataset.proxied && img.src && !img.src.startsWith(PROXY_BASE)) {
        img.dataset.proxied = '1';
        img.src = PROXY_BASE + encodeURIComponent(img.dataset.src);
      } else {
        img.style.display = 'none';
      }
    });
  });
}

// ── Card grid (≤4 products) ─────────────────────────────────────────────────

function renderCards(products) {
  const cards = products.map((p) => {
    const isWinner = winnerId && winnerId === p.id;
    const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
    const savings = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;
    const safeImg = safeUrl(p.imageUrl);

    const winnerRow = isWinner
      ? `<div class="card-winner-badge">🏆 Best Pick</div>`
      : '';

    const badge = hasDrop
      ? `<span class="card-badge badge-drop">↓ $${esc(savings)}</span>`
      : (p.onSale ? `<span class="card-badge badge-sale">SALE</span>` : '');

    const imgTag = safeImg
      ? `<img data-src="${esc(safeImg)}" alt="" />`
      : '';

    const origPrice = hasDrop
      ? `<span class="card-orig">${formatPrice(p.originalPrice)}</span>`
      : '';

    const savingsBadge = hasDrop
      ? `<span class="card-savings">Save $${esc(savings)}</span>`
      : '';

    const safeSource = safeUrl(p.sourceUrl);
    const viewBtn = safeSource
      ? `<button class="card-view-btn" data-url="${esc(safeSource)}">View →</button>`
      : `<button class="card-view-btn" disabled style="opacity:0.4;cursor:default;">No Link</button>`;

    return `
      <div class="product-card${isWinner ? ' card-winner' : ''}">
        ${winnerRow}
        <div class="card-img-wrap">
          ${imgTag}
          ${badge}
        </div>
        <div class="card-body">
          <div class="card-name">${esc(p.name)}</div>
          <div class="card-site">${esc(p.siteName || '')}</div>
          <div class="card-price-row">
            <span class="card-price">${formatPrice(p.price)}</span>
            ${origPrice}
          </div>
          ${savingsBadge}
          <div class="card-actions">
            ${viewBtn}
            <button class="card-remove-btn" data-id="${esc(p.id)}" title="Remove">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  return `<div class="card-grid">${cards}</div>`;
}

// ── Table (5+ products) ─────────────────────────────────────────────────────

function renderTable(products) {
  const rows = [
    { label: 'Product', key: 'image' },
    { label: 'Name',    key: 'name'  },
    { label: 'Price',   key: 'price' },
    { label: 'Site',    key: 'site'  },
    { label: 'Link',    key: 'link'  },
  ];

  const thead = `
    <thead><tr>
      <th class="row-label"></th>
      ${products.map((p) => {
        const isWinner = winnerId && winnerId === p.id;
        return `<th class="product-col-header${isWinner ? ' col-winner' : ''}">
          ${isWinner ? '<div class="winner-badge">🏆 Best Pick</div>' : ''}
          <button class="remove-col-btn" data-id="${esc(p.id)}" title="Remove">
            <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </th>`;
      }).join('')}
    </tr></thead>`;

  const buildRow = (row) => {
    const cells = products.map((p) => {
      const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
      const savings  = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;

      if (row.key === 'image') {
        const badge = hasDrop ? `<span class="price-drop-badge">↓ $${esc(savings)}</span>` : '';
        const safeImg = safeUrl(p.imageUrl);
        const imgTag = safeImg ? `<img data-src="${esc(safeImg)}" alt="" />` : '';
        return `<td><div class="product-img-cell">${imgTag}${badge}</div></td>`;
      }
      if (row.key === 'name')  return `<td class="data-cell" style="font-weight:500;">${esc(p.name)}</td>`;
      if (row.key === 'price') {
        const orig = hasDrop ? `<span class="price-orig">${formatPrice(p.originalPrice)}</span>` : '';
        return `<td class="data-cell"><div class="price-display"><span class="price-main">${formatPrice(p.price)}</span>${orig}</div></td>`;
      }
      if (row.key === 'site')  return `<td class="data-cell" style="color:var(--muted);">${esc(p.siteName)}</td>`;
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

  return `<div class="table-wrapper"><table>${thead}<tbody>${rows.map(buildRow).join('')}</tbody></table></div>`;
}

// ── Main render ─────────────────────────────────────────────────────────────

function renderContent() {
  const content = document.getElementById('main-content');
  const sub = document.getElementById('header-sub');
  const products = filteredProducts();

  // Header subtitle: product name previews
  const names = allProducts.slice(0, 3).map((p) => p.name?.split(' ').slice(0, 3).join(' ')).filter(Boolean);
  const namePrev = names.length ? names.join(', ') + (allProducts.length > 3 ? '…' : '') : '';
  sub.textContent = allProducts.length
    ? `${allProducts.length} item${allProducts.length !== 1 ? 's' : ''} · ${namePrev}`
    : '';

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

  // Cards for ≤4, table for 5+
  content.innerHTML = products.length <= 4 ? renderCards(products) : renderTable(products);

  attachImageFallbacks(content);

  // Card: view button
  content.querySelectorAll('.card-view-btn[data-url]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = safeUrl(btn.dataset.url);
      if (url) chrome.tabs.create({ url });
    });
  });
  // Card: remove button
  content.querySelectorAll('.card-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => removeProduct(btn.dataset.id));
  });
  // Table: go button
  content.querySelectorAll('.go-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = safeUrl(btn.dataset.url);
      if (url) chrome.tabs.create({ url });
    });
  });
  // Table: remove col button
  content.querySelectorAll('.remove-col-btn').forEach((btn) => {
    btn.addEventListener('click', () => removeProduct(btn.dataset.id));
  });
}

function removeProduct(id) {
  chrome.runtime.sendMessage({ type: 'REMOVE_PRODUCT', id }, () => {
    allProducts = allProducts.filter((p) => p.id !== id);
    cachedShareUrl = null;
    renderFilters();
    renderContent();
  });
}

// ── Share logic ─────────────────────────────────────────────────────────────

let shareOverlay, shareModalBody;

function openShareModal()  { shareOverlay?.classList.add('open');    }
function closeShareModal() { shareOverlay?.classList.remove('open'); }

async function getShareUrl() {
  const products = filteredProducts();
  if (products.length === 0) return null;

  // Return cached URL if products haven't changed
  const key = products.map((p) => p.id).join(',');
  if (cachedShareUrl && cachedShareProducts === key) return cachedShareUrl;

  try {
    const res = await fetch(`${WORKER_BASE}/share`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ products, title: `Haul — ${products.length} item${products.length !== 1 ? 's' : ''}` }),
    });
    const data = await res.json();
    if (!data.url) throw new Error('no url');
    cachedShareUrl = data.url;
    cachedShareProducts = key;
    return cachedShareUrl;
  } catch {
    return null;
  }
}

async function shareComparison() {
  const products = filteredProducts();
  if (products.length === 0) return;

  shareModalBody.innerHTML = `<div class="share-generating"><div class="claude-spinner"></div>Generating link…</div>`;
  openShareModal();

  const shareUrl = await getShareUrl() ||
    `${window.location.href.split('?')[0]}?data=${btoa(encodeURIComponent(JSON.stringify(products)))}`;

  renderShareModalBody(shareUrl, products);
}

function renderShareModalBody(shareUrl, products) {
  const waText    = encodeURIComponent(`Check out my comparison on Haul 🛍️ ${shareUrl}`);
  const emailSubj = encodeURIComponent('My Haul Comparison');
  const emailBody = encodeURIComponent(`I compared some products on Haul — take a look:\n\n${shareUrl}`);
  const tweetText = encodeURIComponent(`Shopping smarter with Haul 🛍️ ${shareUrl}`);
  const hasNative = typeof navigator.share === 'function';

  shareModalBody.innerHTML = `
    ${hasNative ? `
    <button class="share-native-btn" id="share-native-btn">
      <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      Share via Messages, AirDrop &amp; more…
    </button>` : ''}
    <div class="share-url-row">
      <span class="share-url-text">${esc(shareUrl)}</span>
      <button class="share-copy-btn" id="share-copy-btn">Copy</button>
    </div>
    <div class="share-platforms">
      <button class="share-platform-btn" data-url="https://wa.me/?text=${waText}">
        <span class="share-platform-icon">💬</span>WhatsApp
      </button>
      <button class="share-platform-btn" data-url="mailto:?subject=${emailSubj}&body=${emailBody}">
        <span class="share-platform-icon">📧</span>Email
      </button>
      <button class="share-platform-btn" data-url="https://x.com/intent/tweet?text=${tweetText}">
        <span class="share-platform-icon">𝕏</span>Post
      </button>
    </div>`;

  if (hasNative) {
    document.getElementById('share-native-btn').addEventListener('click', () => {
      navigator.share({ title: products[0]?.name ?? 'My Haul', text: 'Check out my comparison on Haul 🛍️', url: shareUrl })
        .then(() => closeShareModal()).catch(() => {});
    });
  }

  document.getElementById('share-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = document.getElementById('share-copy-btn');
      btn.textContent = 'Copied!'; btn.classList.add('copied');
      showCopyToast();
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });

  shareModalBody.querySelectorAll('.share-platform-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.url) chrome.tabs.create({ url: btn.dataset.url });
    });
  });
}

// Quick-share from the bottom bar: builds URL in background, opens directly
async function quickShare(platform) {
  const products = filteredProducts();
  if (products.length === 0) return;
  const shareUrl = await getShareUrl() || '';
  const waText    = encodeURIComponent(`Check out my comparison on Haul 🛍️ ${shareUrl}`);
  const emailSubj = encodeURIComponent('My Haul Comparison');
  const emailBody = encodeURIComponent(`I compared some products on Haul — take a look:\n\n${shareUrl}`);
  const tweetText = encodeURIComponent(`Shopping smarter with Haul 🛍️ ${shareUrl}`);
  const urls = {
    wa:    `https://wa.me/?text=${waText}`,
    email: `mailto:?subject=${emailSubj}&body=${emailBody}`,
    x:     `https://x.com/intent/tweet?text=${tweetText}`,
  };
  if (urls[platform]) chrome.tabs.create({ url: urls[platform] });
}

function showCopyToast(msg = '✓ Copied to clipboard') {
  const t = document.getElementById('copy-toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Shared-data URL mode ────────────────────────────────────────────────────

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
  renderContent();
} else {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
    if (chrome.runtime.lastError) return;
    allProducts = response.products || [];
    chrome.runtime.sendMessage({ type: 'GET_FOLDERS' }, (res2) => {
      allFolders = res2?.folders || [];
      renderFilters();
      renderContent();
    });
  });
}

// ── Event wiring (DOMContentLoaded safe) ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  shareOverlay   = document.getElementById('share-overlay');
  shareModalBody = document.getElementById('share-modal-body');

  document.getElementById('share-modal-close').addEventListener('click', (e) => {
    e.stopPropagation(); closeShareModal();
  });
  shareOverlay.addEventListener('click', (e) => {
    if (e.target === shareOverlay) closeShareModal();
  });
});

document.getElementById('close-btn').addEventListener('click', () => window.close());

// Share bar
document.getElementById('share-bar-btn').addEventListener('click', () => shareComparison());
document.getElementById('quick-wa').addEventListener('click',    () => quickShare('wa'));
document.getElementById('quick-email').addEventListener('click', () => quickShare('email'));
document.getElementById('quick-x').addEventListener('click',     () => quickShare('x'));

// ── Ask Claude FAB ──────────────────────────────────────────────────────────

const claudePanel     = document.getElementById('claude-panel');
const claudePanelBody = document.getElementById('claude-panel-body');
const claudeFab       = document.getElementById('claude-fab');

function openClaudePanel()  { claudePanel.classList.add('open');    }
function closeClaudePanel() { claudePanel.classList.remove('open'); }

document.getElementById('claude-panel-close').addEventListener('click', closeClaudePanel);

claudeFab.addEventListener('click', () => {
  if (allProducts.length === 0) return;
  claudeFab.disabled = true;
  claudePanelBody.innerHTML = `
    <div class="claude-loading">
      <div class="claude-spinner"></div>
      Analyzing your haul…
    </div>`;
  openClaudePanel();

  chrome.runtime.sendMessage({ type: 'ASK_CLAUDE', products: allProducts }, (response) => {
    claudeFab.disabled = false;
    if (chrome.runtime.lastError || !response?.success) {
      const msg = response?.error || chrome.runtime.lastError?.message || 'Something went wrong.';
      claudePanelBody.innerHTML = `<p class="claude-error">${esc(msg)}</p>`;
      return;
    }
    if (response.winner_id) { winnerId = response.winner_id; renderContent(); }

    const insightsHtml = (response.insights || [])
      .map((i) => `<div class="claude-insight">${esc(i)}</div>`)
      .join('');
    claudePanelBody.innerHTML = `
      <p class="claude-summary">${esc(response.summary || '')}</p>
      ${insightsHtml ? `<div class="claude-insights">${insightsHtml}</div>` : ''}`;
  });
});

// ── Storage sync ────────────────────────────────────────────────────────────

chrome.storage.onChanged.addListener((changes) => {
  if (!sharedData) {
    if (changes['haul_products']) { allProducts = changes['haul_products'].newValue || []; cachedShareUrl = null; }
    if (changes['haul_folders'])  allFolders  = changes['haul_folders'].newValue  || [];
    if (changes['haul_products'] || changes['haul_folders']) { renderFilters(); renderContent(); }
  }
});
