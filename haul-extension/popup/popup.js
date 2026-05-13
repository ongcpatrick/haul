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

  // ── Thumbnail strip (up to 3 most recent)
  const recent = products.slice(0, 3);
  if (recent.length > 0) {
    const strip = document.getElementById('thumb-strip');
    strip.classList.add('visible');

    recent.forEach((p, i) => {
      const wrap = document.getElementById(`thumb-${i}`);
      if (!wrap) return;
      wrap.classList.add('visible');

      const imgBox     = wrap.querySelector('.thumb-img-box');
      const nameEl     = wrap.querySelector('.thumb-name');
      const priceEl    = wrap.querySelector('.thumb-price');
      const placeholder = wrap.querySelector('.thumb-placeholder');

      // Name + price labels
      nameEl.textContent  = (p.name || '').split(' ').slice(0, 4).join(' ');
      priceEl.textContent = p.price != null ? formatPrice(p.price) : '';

      // Image
      const imgSrc = safeUrl(p.imageUrl);
      if (imgSrc) {
        const img = document.createElement('img');
        img.alt = '';
        img.src = imgSrc;
        img.addEventListener('error', () => {
          img.style.display = 'none';
        });
        placeholder.replaceWith(img);
      }

      // Click → open product page
      const productUrl = safeUrl(p.sourceUrl);
      if (productUrl) {
        imgBox.style.cursor = 'pointer';
        imgBox.addEventListener('click', () => {
          chrome.tabs.create({ url: productUrl });
          window.close();
        });
      }
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
