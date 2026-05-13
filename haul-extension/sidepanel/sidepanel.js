// Haul side panel JS.

let products = [];
let folders = [];
let activeFolder = 'all'; // 'all' or folder id

const FOLDER_COLORS = ['#7a9e76','#93bedf','#b07d4a','#c97b7b','#8a7e72','#5a8055'];

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

const PROXY_BASE = 'https://haul-ai.haulapp.workers.dev/proxy-image?url=';

function attachImageFallbacks(container) {
  container.querySelectorAll('img.product-img').forEach((img) => {
    img.addEventListener('error', () => {
      const original = img.dataset.originalSrc || img.src;
      if (!img.dataset.proxied && original && !original.startsWith(PROXY_BASE)) {
        img.dataset.proxied = '1';
        img.src = PROXY_BASE + encodeURIComponent(original);
      } else {
        img.style.display = 'none';
        const placeholder = img.nextElementSibling;
        if (placeholder) placeholder.style.display = 'flex';
      }
    });
  });
}

const PLACEHOLDER_SVG = `
  <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`;

// ─── Folder bar ───────────────────────────────────────────────────────────────

function renderFolderBar() {
  const bar = document.getElementById('folder-bar');

  if (folders.length === 0) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';

  const allCount = products.length;
  const tabs = [
    `<button class="folder-tab${activeFolder === 'all' ? ' active' : ''}" data-folder="all">All (${allCount})</button>`,
    ...folders.map((f) => {
      const count = products.filter((p) => (p.folderId || []).includes(f.id)).length;
      const isActive = activeFolder === f.id;
      return `<button class="folder-tab${isActive ? ' active' : ''}" data-folder="${esc(f.id)}" style="${isActive ? '' : `--dot-color:${f.color}`}">
        <span class="folder-dot" style="background:${isActive ? '#fff' : f.color}"></span>
        ${esc(f.name)} (${count})
      </button>`;
    }),
    `<button class="new-folder-btn" id="new-folder-btn">+ New Folder</button>`,
  ].join('');

  bar.innerHTML = tabs;

  bar.querySelectorAll('.folder-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFolder = btn.dataset.folder;
      renderFolderBar();
      renderProducts();
    });
  });

  document.getElementById('new-folder-btn').addEventListener('click', () => {
    const name = prompt('Folder name:');
    if (!name || !name.trim()) return;
    const folder = {
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
      createdAt: Date.now(),
    };
    chrome.runtime.sendMessage({ type: 'CREATE_FOLDER', folder }, (res) => {
      if (res?.success) loadAll();
    });
  });
}

// ─── Product list ─────────────────────────────────────────────────────────────

function visibleProducts() {
  if (activeFolder === 'all') return products;
  return products.filter((p) => (p.folderId || []).includes(activeFolder));
}

function renderProducts() {
  const contentArea = document.getElementById('content-area');
  const footer = document.getElementById('footer');
  const countBadge = document.getElementById('count-badge');
  const shown = visibleProducts();

  countBadge.textContent = `${products.length} item${products.length !== 1 ? 's' : ''}`;

  if (shown.length === 0) {
    footer.style.display = 'none';
    const emptyMsg = activeFolder === 'all'
      ? `Visit any shopping site and click the<br><strong>Save to Haul</strong> button on a product.`
      : `No items in this folder yet.<br>Save a product then assign it here.`;
    contentArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <polyline points="16 3 12 7 8 3"/>
          </svg>
        </div>
        <div class="empty-title">No saves yet</div>
        <div class="empty-desc">${emptyMsg}</div>
      </div>`;
    return;
  }

  footer.style.display = 'flex';

  const folderOptions = folders.map((f) => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');

  const list = shown.map((p) => {
    const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
    const savings = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;
    const inFolders = (p.folderId || []).map((fid) => folders.find((f) => f.id === fid)).filter(Boolean);

    const priceHtml = p.price != null ? `<span class="price">${formatPrice(p.price)}</span>` : '<span class="price">—</span>';
    const origHtml = hasDrop ? `<span class="original-price">${formatPrice(p.originalPrice)}</span>` : '';
    const dropBadge = hasDrop ? `<span class="badge-drop">↓ $${esc(savings)}</span>` : '';
    const categoryBadge = p.category ? `<span class="badge-category">${esc(p.category)}</span>` : '';
    const folderDots = inFolders.map((f) =>
      `<span title="${esc(f.name)}" style="width:8px;height:8px;border-radius:50%;background:${f.color};display:inline-block;margin-right:3px;"></span>`
    ).join('');

    const safeImg = safeUrl(p.imageUrl);
    const imgHtml = safeImg
      ? `<img class="product-img" src="${esc(safeImg)}" alt="" /><div class="product-img-placeholder" style="display:none;">${PLACEHOLDER_SVG}</div>`
      : `<div class="product-img-placeholder">${PLACEHOLDER_SVG}</div>`;

    const productUrl = safeUrl(p.sourceUrl);
    const assignBtn = folders.length > 0
      ? `<button class="assign-btn" data-id="${esc(p.id)}" title="Add to folder">📁</button>`
      : '';

    return `
      <div class="product-card${productUrl ? ' product-card--link' : ''}" data-id="${esc(p.id)}" ${productUrl ? `data-url="${esc(productUrl)}"` : ''}>
        ${imgHtml}
        <div class="product-info">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-site">${esc(p.siteName)}${folderDots ? `<span style="margin-left:6px;">${folderDots}</span>` : ''}</div>
          <div class="price-row">${priceHtml}${origHtml}${dropBadge}</div>
          <div class="category-row">${categoryBadge}</div>
        </div>
        <button class="remove-btn" data-id="${esc(p.id)}" title="Remove">
          <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        ${assignBtn}
      </div>`;
  }).join('');

  contentArea.innerHTML = `<div class="product-list">${list}</div>`;
  attachImageFallbacks(contentArea);

  contentArea.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ type: 'REMOVE_PRODUCT', id: btn.dataset.id }, (res) => {
        if (!chrome.runtime.lastError && res?.success) loadAll();
      });
    });
  });

  contentArea.querySelectorAll('.product-card--link').forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.dataset.url;
      if (url) chrome.tabs.create({ url });
    });
  });

  contentArea.querySelectorAll('.assign-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (folders.length === 0) return;
      const pid = btn.dataset.id;
      const product = products.find((p) => p.id === pid);
      const currentFolders = product?.folderId || [];

      // Build quick-pick menu
      const menu = document.createElement('div');
      menu.style.cssText = 'position:fixed;background:#f2ede4;border:1px solid #ddd8cf;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12);padding:6px;z-index:9999;min-width:140px;font-family:-apple-system,sans-serif;';
      const rect = btn.getBoundingClientRect();
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;

      folders.forEach((f) => {
        const inFolder = currentFolders.includes(f.id);
        const item = document.createElement('button');
        item.style.cssText = 'width:100%;text-align:left;padding:6px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;color:#3d3529;';
        item.innerHTML = `<span style="width:9px;height:9px;border-radius:50%;background:${f.color};flex-shrink:0;"></span>${esc(f.name)}${inFolder ? ' ✓' : ''}`;
        item.addEventListener('mouseenter', () => { item.style.background = '#e8f0e6'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'none'; });
        item.addEventListener('click', () => {
          const type = inFolder ? 'REMOVE_FROM_FOLDER' : 'ASSIGN_TO_FOLDER';
          chrome.runtime.sendMessage({ type, productId: pid, folderId: f.id }, () => loadAll());
          document.body.removeChild(menu);
        });
        menu.appendChild(item);
      });

      document.body.appendChild(menu);
      setTimeout(() => {
        const close = () => { if (document.body.contains(menu)) document.body.removeChild(menu); document.removeEventListener('click', close); };
        document.addEventListener('click', close);
      }, 0);
    });
  });
}

// ─── Load ─────────────────────────────────────────────────────────────────────

function loadAll() {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (res) => {
    if (chrome.runtime.lastError) return;
    products = res.products || [];
    chrome.runtime.sendMessage({ type: 'GET_FOLDERS' }, (res2) => {
      folders = (res2?.folders || []);
      renderFolderBar();
      renderProducts();
    });
  });
}

document.getElementById('compare-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  if (!confirm('Clear all saved items?')) return;
  chrome.runtime.sendMessage({ type: 'CLEAR_ALL' }, () => loadAll());
});

document.getElementById('refresh-btn').addEventListener('click', loadAll);

chrome.storage.onChanged.addListener((changes) => {
  if (changes['haul_products'] || changes['haul_folders']) loadAll();
});

loadAll();
