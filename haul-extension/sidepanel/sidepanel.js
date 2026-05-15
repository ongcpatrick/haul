// Haul side panel — v0.4 premium UI

let products = [];
let folders  = [];
let activeFolder = 'all';

const FOLDER_COLORS = ['#7a9e76','#93bedf','#b07d4a','#c97b7b','#8a7e72','#5a8055'];
const PROXY_BASE    = 'https://haul-ai.haulapp.workers.dev/proxy-image?url=';

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

function safeUrl(url) {
  return url && url.startsWith('https://') ? url : null;
}

function formatPrice(price) {
  if (price == null) return '—';
  return '$' + price.toFixed(2);
}

// ── Folder bar (inside header as second row) ────────────────────────────────

function renderFolderRow() {
  const row = document.getElementById('folder-row');

  if (folders.length === 0) {
    row.classList.remove('visible');
    return;
  }

  row.classList.add('visible');

  const allCount = products.length;
  const tabs = [
    `<button class="folder-tab${activeFolder === 'all' ? ' active' : ''}" data-folder="all">All (${allCount})</button>`,
    ...folders.map((f) => {
      const count    = products.filter((p) => (p.folderId || []).includes(f.id)).length;
      const isActive = activeFolder === f.id;
      const dotColor = isActive ? '#fff' : f.color;
      return `<button class="folder-tab${isActive ? ' active' : ''}" data-folder="${esc(f.id)}">
        <span class="folder-dot" style="background:${dotColor}"></span>
        ${esc(f.name)} (${count})
      </button>`;
    }),
    `<button class="new-folder-btn" id="new-folder-btn">+ New</button>`,
  ].join('');

  row.innerHTML = tabs;

  row.querySelectorAll('.folder-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFolder = btn.dataset.folder;
      renderFolderRow();
      renderProducts();
    });
  });

  document.getElementById('new-folder-btn').addEventListener('click', () => {
    const name = prompt('Folder name:');
    if (!name?.trim()) return;
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

// ── Image fallback ──────────────────────────────────────────────────────────

function attachImageFallbacks(container) {
  container.querySelectorAll('img.product-img').forEach((img) => {
    img.addEventListener('error', () => {
      const original = img.dataset.originalSrc || img.src;
      if (!img.dataset.proxied && original && !original.startsWith(PROXY_BASE)) {
        img.dataset.proxied = '1';
        img.src = PROXY_BASE + encodeURIComponent(original);
      } else {
        img.style.display = 'none';
        img.nextElementSibling?.style && (img.nextElementSibling.style.display = 'flex');
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

// ── Product list ────────────────────────────────────────────────────────────

function visibleProducts() {
  if (activeFolder === 'all') return products;
  return products.filter((p) => (p.folderId || []).includes(activeFolder));
}

function renderProducts() {
  const contentArea  = document.getElementById('content-area');
  const footer       = document.getElementById('footer');
  const countBadge   = document.getElementById('count-badge');
  const compareLabel = document.getElementById('compare-btn-label');
  const shown        = visibleProducts();

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

  footer.style.display = 'block';
  if (compareLabel) {
    compareLabel.textContent = shown.length >= 2
      ? `Compare ${shown.length} Products →`
      : 'Compare All';
  }

  const list = shown.map((p) => {
    const hasDrop  = p.originalPrice && p.price && p.originalPrice > p.price;
    const savings  = hasDrop ? (p.originalPrice - p.price).toFixed(2) : null;
    const inFolderObjs = (p.folderId || []).map((fid) => folders.find((f) => f.id === fid)).filter(Boolean);

    const priceHtml = p.price != null ? `<span class="price">${formatPrice(p.price)}</span>` : '<span class="price">—</span>';
    const origHtml  = hasDrop ? `<span class="original-price">${formatPrice(p.originalPrice)}</span>` : '';
    const dropBadge = hasDrop ? `<span class="badge-drop">Save $${esc(savings)}</span>` : '';

    const folderDotsHtml = inFolderObjs.length
      ? `<span class="folder-dots">${inFolderObjs.map((f) => `<span title="${esc(f.name)}" class="folder-dot" style="background:${f.color}"></span>`).join('')}</span>`
      : '';

    const safeImg = safeUrl(p.imageUrl);
    const imgHtml = safeImg
      ? `<img class="product-img" src="${esc(safeImg)}" alt="" /><div class="product-img-placeholder" style="display:none;">${PLACEHOLDER_SVG}</div>`
      : `<div class="product-img-placeholder">${PLACEHOLDER_SVG}</div>`;

    const assignBtn = folders.length > 0
      ? `<button class="action-btn assign-action" data-id="${esc(p.id)}" title="Add to folder"><svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></button>`
      : '';

    const safeSource = safeUrl(p.sourceUrl);

    return `
      <div class="product-card" data-id="${esc(p.id)}"${safeSource ? ` data-url="${esc(safeSource)}"` : ''}>
        <div class="product-img-wrap">${imgHtml}</div>
        <div class="product-info">
          <div class="product-name">${esc(p.name)}</div>
          <div class="product-meta">
            <span class="product-site">${esc(p.siteName || '')}</span>
            ${folderDotsHtml}
          </div>
          <div class="price-row">
            ${priceHtml}${origHtml}${dropBadge}
          </div>
        </div>
        <div class="card-actions-col">
          <button class="action-btn remove-action" data-id="${esc(p.id)}" title="Remove">
            <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          ${assignBtn}
        </div>
      </div>`;
  }).join('');

  contentArea.innerHTML = `<div class="product-list">${list}</div>`;
  attachImageFallbacks(contentArea);

  // Stagger card entrances
  contentArea.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });

  // Pulse compare button when first item added
  const compareBtn = document.getElementById('compare-btn');
  if (shown.length === 1 && compareBtn) {
    compareBtn.classList.remove('pulse');
    requestAnimationFrame(() => compareBtn.classList.add('pulse'));
    compareBtn.addEventListener('animationend', () => compareBtn.classList.remove('pulse'), { once: true });
  }

  // Card click → open product page
  contentArea.querySelectorAll('.product-card[data-url]').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('.action-btn')) return;
      chrome.tabs.create({ url: card.dataset.url, active: true });
    });
  });

  // Remove
  contentArea.querySelectorAll('.remove-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const doRemove = () => {
        chrome.runtime.sendMessage({ type: 'REMOVE_PRODUCT', id: btn.dataset.id }, (res) => {
          if (!chrome.runtime.lastError && res?.success) loadAll();
        });
      };
      if (card) {
        card.classList.add('removing');
        card.addEventListener('animationend', doRemove, { once: true });
      } else {
        doRemove();
      }
    });
  });

  // Assign to folder
  contentArea.querySelectorAll('.assign-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (folders.length === 0) return;
      const pid = btn.dataset.id;
      const product = products.find((p) => p.id === pid);
      const currentFolders = product?.folderId || [];

      const menu = document.createElement('div');
      menu.style.cssText = 'position:fixed;background:#f2ede4;border:1px solid #ddd8cf;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12);padding:6px;z-index:9999;min-width:140px;font-family:-apple-system,sans-serif;';
      const rect = btn.getBoundingClientRect();
      menu.style.top   = `${rect.bottom + 4}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;

      folders.forEach((f) => {
        const inFolder = currentFolders.includes(f.id);
        const item = document.createElement('button');
        item.style.cssText = 'width:100%;text-align:left;padding:6px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;color:#3d3529;';
        item.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${f.color};flex-shrink:0;"></span>${esc(f.name)}${inFolder ? ' ✓' : ''}`;
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
        const close = () => {
          if (document.body.contains(menu)) document.body.removeChild(menu);
          document.removeEventListener('click', close);
        };
        document.addEventListener('click', close);
      }, 0);
    });
  });
}

// ── Load & events ───────────────────────────────────────────────────────────

function loadAll() {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (res) => {
    if (chrome.runtime.lastError) return;
    products = res.products || [];
    chrome.runtime.sendMessage({ type: 'GET_FOLDERS' }, (res2) => {
      folders = res2?.folders || [];
      renderFolderRow();
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
