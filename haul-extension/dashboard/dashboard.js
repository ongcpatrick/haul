// Haul comparison dashboard JS.

let allProducts = [];
let allFolders = [];
let activeFilter = 'all';
let activeFolderFilter = 'all';
let winnerId = null;

const WORKER_BASE = 'https://haul-ai.haulapp.workers.dev';

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
  // Use AI-assigned category when available (set by Claude in background worker).
  if (product.category) return product.category;

  const name = (product.name || '').toLowerCase();

  if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot') ||
      name.includes('sandal') || name.includes('heel') || name.includes('loafer') ||
      name.includes('trainer') || name.includes('slipper') || name.includes('cleat')) {
    return 'Footwear';
  }
  if (name.includes('pants') || name.includes('jacket') || name.includes('shirt') ||
      name.includes('dress') || name.includes('hoodie') || name.includes('shorts') ||
      name.includes('coat') || name.includes('suit') || name.includes('skirt') ||
      name.includes('legging') || name.includes('jeans') || name.includes('sweater') ||
      name.includes('sweatshirt') || name.includes('polo') || name.includes('blouse') ||
      name.includes('tee') || name.includes('tracksuit') || name.includes('track')) {
    return 'Clothing';
  }
  if (name.includes('laptop') || name.includes('monitor') || name.includes('headphone') ||
      name.includes('keyboard') || name.includes('camera') || name.includes('tablet') ||
      name.includes('phone') || name.includes('speaker') || name.includes('gpu')) {
    return 'Electronics';
  }
  if (name.includes('sofa') || name.includes('desk') || name.includes('chair') ||
      name.includes('bed') || name.includes('shelf') || name.includes('lamp') ||
      name.includes('rug') || name.includes('pillow')) {
    return 'Home';
  }

  // Site-based fallback only for single-category retailers.
  const host = (product.siteName || '').toLowerCase();
  if (host.includes('bestbuy') || host.includes('newegg')) return 'Electronics';
  if (host.includes('wayfair') || host.includes('ikea')) return 'Home';

  return 'Other';
}

function getCategories(products) {
  const cats = new Set(products.map(getCategory));
  return ['all', ...Array.from(cats)];
}

function folderProducts() {
  if (activeFolderFilter === 'all') return allProducts;
  return allProducts.filter((p) => (p.folderId || []).includes(activeFolderFilter));
}

function filteredProducts() {
  const base = folderProducts();
  if (activeFilter === 'all') return base;
  return base.filter((p) => getCategory(p) === activeFilter);
}

function renderFilters() {
  const bar = document.getElementById('filters-bar');
  const base = folderProducts();
  const cats = getCategories(base);

  // Folder selector
  const folderSelect = allFolders.length > 0
    ? `<select id="folder-select" style="padding:5px 10px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);font-size:12px;font-weight:600;color:var(--text);cursor:pointer;margin-right:4px;">
        <option value="all">All Folders</option>
        ${allFolders.map((f) => `<option value="${esc(f.id)}"${activeFolderFilter === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}
       </select>`
    : '';

  bar.innerHTML = folderSelect + cats.map((cat) => {
    const count = cat === 'all' ? base.length : base.filter((p) => getCategory(p) === cat).length;
    const label = cat === 'all' ? `All (${count})` : `${esc(cat)} (${count})`;
    return `<button class="filter-btn${activeFilter === cat ? ' active' : ''}" data-cat="${esc(cat)}">${label}</button>`;
  }).join('');

  const sel = document.getElementById('folder-select');
  if (sel) {
    sel.value = activeFolderFilter;
    sel.addEventListener('change', () => {
      activeFolderFilter = sel.value;
      activeFilter = 'all';
      renderFilters();
      renderTable();
    });
  }

  bar.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.cat;
      renderFilters();
      renderTable();
    });
  });
}

// Attach onerror fallbacks after innerHTML — inline onerror is blocked by MV3 CSP.
const PROXY_BASE = 'https://haul-ai.haulapp.workers.dev/proxy-image?url=';

function attachImageFallbacks(container) {
  container.querySelectorAll('.product-img-cell img').forEach((img) => {
    img.addEventListener('error', () => {
      const original = img.src;
      if (!img.dataset.proxied && original && !original.startsWith(PROXY_BASE)) {
        img.dataset.proxied = '1';
        img.src = PROXY_BASE + encodeURIComponent(original);
      } else {
        img.style.display = 'none';
      }
    });
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
        ${products.map((p) => {
          const isWinner = winnerId && winnerId === p.id;
          return `
          <th class="product-col-header${isWinner ? ' col-winner' : ''}">
            ${isWinner ? '<div class="winner-badge">🏆 Best Pick</div>' : ''}
            <button class="remove-col-btn" data-id="${esc(p.id)}" title="Remove">
              <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </th>`;
        }).join('')}
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
        return `<td class="data-cell" style="color:var(--muted);">${esc(p.siteName)}</td>`;
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

const shareOverlay = document.getElementById('share-overlay');
const shareModalBody = document.getElementById('share-modal-body');

function openShareModal() { shareOverlay.classList.add('open'); }
function closeShareModal() { shareOverlay.classList.remove('open'); }

document.getElementById('share-modal-close').addEventListener('click', closeShareModal);
shareOverlay.addEventListener('click', (e) => { if (e.target === shareOverlay) closeShareModal(); });

function showCopyToast(msg = '✓ Copied to clipboard') {
  const t = document.getElementById('copy-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

async function shareComparison() {
  const products = filteredProducts();
  if (products.length === 0) return;

  shareModalBody.innerHTML = `<div class="share-generating"><div class="claude-spinner"></div>Generating link…</div>`;
  openShareModal();

  let shareUrl;
  try {
    const res = await fetch(`${WORKER_BASE}/share`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ products, title: `Haul — ${products.length} item${products.length !== 1 ? 's' : ''}` }),
    });
    const data = await res.json();
    if (!data.url) throw new Error('no url');
    shareUrl = data.url;
  } catch {
    const json = JSON.stringify(products);
    shareUrl = `${window.location.href.split('?')[0]}?data=${btoa(encodeURIComponent(json))}`;
  }

  const waText = encodeURIComponent(`Check out my comparison on Haul 🛍️ ${shareUrl}`);
  const smsText = encodeURIComponent(`Check this out: ${shareUrl}`);
  const emailSubj = encodeURIComponent('My Haul Comparison');
  const emailBody = encodeURIComponent(`I compared some products on Haul — take a look:\n\n${shareUrl}`);
  const twitterText = encodeURIComponent(`Shopping smarter with Haul 🛍️ ${shareUrl}`);

  shareModalBody.innerHTML = `
    <div class="share-url-row">
      <span class="share-url-text" id="share-url-display">${esc(shareUrl)}</span>
      <button class="share-copy-btn" id="share-copy-btn">Copy</button>
    </div>
    <div class="share-platforms">
      <button class="share-platform-btn" data-platform="whatsapp">
        <span class="share-platform-icon">💬</span>WhatsApp
      </button>
      <button class="share-platform-btn" data-platform="sms">
        <span class="share-platform-icon">✉️</span>iMessage
      </button>
      <button class="share-platform-btn" data-platform="email">
        <span class="share-platform-icon">📧</span>Email
      </button>
      <button class="share-platform-btn" data-platform="twitter">
        <span class="share-platform-icon">𝕏</span>Post
      </button>
    </div>`;

  document.getElementById('share-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = document.getElementById('share-copy-btn');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      showCopyToast();
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  });

  shareModalBody.querySelectorAll('.share-platform-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;
      const urls = {
        whatsapp: `https://wa.me/?text=${waText}`,
        sms: `sms:?body=${smsText}`,
        email: `mailto:?subject=${emailSubj}&body=${emailBody}`,
        twitter: `https://x.com/intent/tweet?text=${twitterText}`,
      };
      chrome.tabs.create({ url: urls[platform] });
    });
  });
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
    chrome.runtime.sendMessage({ type: 'GET_FOLDERS' }, (res2) => {
      allFolders = res2?.folders || [];
      renderFilters();
      renderTable();
    });
  });
}

// ─── Ask Claude panel ─────────────────────────────────────────────────────────

const claudePanel = document.getElementById('claude-panel');
const claudePanelBody = document.getElementById('claude-panel-body');
const askClaudeBtn = document.getElementById('ask-claude-btn');

function openClaudePanel() { claudePanel.classList.add('open'); }
function closeClaudePanel() { claudePanel.classList.remove('open'); }

document.getElementById('claude-panel-close').addEventListener('click', closeClaudePanel);

askClaudeBtn.addEventListener('click', () => {
  if (allProducts.length === 0) return;

  askClaudeBtn.disabled = true;
  claudePanelBody.innerHTML = `
    <div class="claude-loading">
      <div class="claude-spinner"></div>
      Analyzing your haul…
    </div>`;
  openClaudePanel();

  chrome.runtime.sendMessage({ type: 'ASK_CLAUDE', products: allProducts }, (response) => {
    askClaudeBtn.disabled = false;
    if (chrome.runtime.lastError || !response?.success) {
      const msg = response?.error || chrome.runtime.lastError?.message || 'Something went wrong.';
      claudePanelBody.innerHTML = `<p class="claude-error">${esc(msg)}</p>`;
      return;
    }

    // Set winner and re-render table with badge.
    if (response.winner_id) {
      winnerId = response.winner_id;
      renderTable();
    }

    const insightsHtml = (response.insights || [])
      .map((i) => `<div class="claude-insight">${esc(i)}</div>`)
      .join('');

    claudePanelBody.innerHTML = `
      <p class="claude-summary">${esc(response.summary || '')}</p>
      ${insightsHtml ? `<div class="claude-insights">${insightsHtml}</div>` : ''}`;
  });
});

document.getElementById('share-btn').addEventListener('click', () => shareComparison());
document.getElementById('close-btn').addEventListener('click', () => window.close());

chrome.storage.onChanged.addListener((changes) => {
  if (!sharedData) {
    if (changes['haul_products']) allProducts = changes['haul_products'].newValue || [];
    if (changes['haul_folders']) allFolders = changes['haul_folders'].newValue || [];
    if (changes['haul_products'] || changes['haul_folders']) { renderFilters(); renderTable(); }
  }
});
