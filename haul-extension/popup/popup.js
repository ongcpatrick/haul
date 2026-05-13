// Haul popup — v0.4 premium UI

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

  // ── Stat: item count
  document.getElementById('count').textContent = products.length;

  // ── Stat: total savings
  const totalSaved = products.reduce((sum, p) => {
    if (p.originalPrice && p.price && p.originalPrice > p.price) {
      return sum + (p.originalPrice - p.price);
    }
    return sum;
  }, 0);
  document.getElementById('savings-total').textContent =
    totalSaved > 0 ? `$${totalSaved.toFixed(0)}` : '$0';

  // ── Compare button state
  const compareBtn   = document.getElementById('compare-btn');
  const compareLabel = document.getElementById('compare-btn-label');
  const compareHint  = document.getElementById('compare-hint');
  const trayLabel    = document.getElementById('tray-btn-label');

  if (products.length >= 2) {
    compareBtn.disabled = false;
    compareLabel.textContent = `Compare ${products.length} Products`;
  } else if (products.length === 1) {
    compareHint.style.display = 'block';
  }

  if (products.length > 0) {
    trayLabel.textContent = `View ${products.length} Saved Item${products.length !== 1 ? 's' : ''}`;
  }

  // ── Thumbnail strip (all products, scrollable)
  if (products.length > 0) {
    const strip = document.getElementById('thumb-strip');
    strip.classList.add('visible');

    const PLACEHOLDER_SVG = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><polyline points="16 3 12 7 8 3"/></svg>`;

    products.forEach((p) => {
      const wrap = document.createElement('div');
      wrap.className = 'thumb-wrap';

      const imgBox = document.createElement('div');
      imgBox.className = 'thumb-img-box';

      const imgSrc = safeUrl(p.imageUrl);
      if (imgSrc) {
        const img = document.createElement('img');
        img.alt = '';
        img.src = imgSrc;
        img.addEventListener('error', () => { img.style.display = 'none'; });
        imgBox.appendChild(img);
      } else {
        imgBox.innerHTML = `<div class="thumb-placeholder">${PLACEHOLDER_SVG}</div>`;
      }

      const productUrl = safeUrl(p.sourceUrl);
      if (productUrl) {
        imgBox.style.cursor = 'pointer';
        imgBox.addEventListener('click', () => {
          chrome.tabs.create({ url: productUrl });
          window.close();
        });
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'thumb-name';
      nameEl.textContent = (p.name || '').split(' ').slice(0, 4).join(' ');

      const priceEl = document.createElement('div');
      priceEl.className = 'thumb-price';
      priceEl.textContent = p.price != null ? formatPrice(p.price) : '';

      wrap.appendChild(imgBox);
      wrap.appendChild(nameEl);
      wrap.appendChild(priceEl);
      strip.appendChild(wrap);
    });
  }
});

// ── Auth row: show connected state or prompt to connect ──────────────────────
chrome.runtime.sendMessage({ type: 'GET_EXT_TOKEN' }, (res) => {
  const authRow = document.getElementById('auth-row');
  const authDot = document.getElementById('auth-dot');
  const authLabel = document.getElementById('auth-label');
  if (res?.username) {
    authDot.classList.add('connected');
    authRow.classList.add('connected');
    authLabel.textContent = `@${res.username}`;
    authRow.title = 'Connected to Haul — your posts go to your feed';
    authRow.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_HAUL_SITE' });
      window.close();
    });
  } else {
    authLabel.textContent = 'Connect to Haul';
    authRow.title = 'Visit haul-share.com to link your account';
    authRow.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_HAUL_SITE' });
      window.close();
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
