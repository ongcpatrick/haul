// Product data extraction for supported shopping sites.
// Detection waterfall: Schema.org JSON-LD → Open Graph → URL patterns → DOM signals.
// Extraction waterfall: Schema.org → site-specific CSS → Open Graph → generic DOM.

// ─── Shared helpers ────────────────────────────────────────────────────────────

function getHostname() {
  return window.location.hostname.replace(/^www\./, '');
}

function cleanPrice(raw) {
  if (!raw) return null;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function getFirstText(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent.trim()) return el.textContent.trim();
  }
  return null;
}

function getFirstAttr(selectors, attr) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.getAttribute(attr)) return el.getAttribute(attr);
  }
  return null;
}

function toAbsoluteUrl(url) {
  if (!url || url.startsWith('http')) return url || null;
  try { return new URL(url, window.location.origin).href; } catch { return null; }
}

// ─── Strategy 1: Schema.org JSON-LD ───────────────────────────────────────────

function findProductInSchema(data) {
  if (!data) return null;
  const type = data['@type'];
  if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) return data;
  if (data['@graph']) {
    for (const item of data['@graph']) {
      if (item['@type'] === 'Product') return item;
    }
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findProductInSchema(item);
      if (found) return found;
    }
  }
  return null;
}

function getSchemaProduct() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const product = findProductInSchema(JSON.parse(script.textContent));
      if (product) return product;
    } catch {}
  }
  return null;
}

function extractFromSchema(schemaProduct) {
  if (!schemaProduct) return null;
  const offers = Array.isArray(schemaProduct.offers) ? schemaProduct.offers[0] : schemaProduct.offers;
  const priceVal = offers?.price ?? offers?.lowPrice ?? null;
  const rawImg = Array.isArray(schemaProduct.image) ? schemaProduct.image[0] : schemaProduct.image;
  const imageUrl = typeof rawImg === 'string' ? rawImg : (rawImg?.url || null);
  return {
    name: schemaProduct.name || null,
    price: cleanPrice(priceVal),
    originalPrice: null,
    imageUrl: toAbsoluteUrl(imageUrl),
  };
}

// ─── Strategy 2: Open Graph meta tags ─────────────────────────────────────────

function extractFromOpenGraph() {
  const ogType = document.querySelector('meta[property="og:type"]')?.content;
  const priceRaw =
    document.querySelector('meta[property="product:price:amount"]')?.content ||
    document.querySelector('meta[property="og:price:amount"]')?.content;
  if (ogType !== 'product' && !priceRaw) return null;
  return {
    name: document.querySelector('meta[property="og:title"]')?.content || null,
    price: cleanPrice(priceRaw),
    originalPrice: null,
    imageUrl: toAbsoluteUrl(document.querySelector('meta[property="og:image"]')?.content),
  };
}

// ─── Strategy 3: Site-specific CSS handlers ───────────────────────────────────

const SITE_HANDLERS = [
  {
    canHandle: (host) => host.includes('amazon.'),
    siteName: 'amazon.com',
    extract() {
      const name = getFirstText(['#productTitle', 'span#productTitle']);
      const whole = document.querySelector('.a-price-whole');
      const frac = document.querySelector('.a-price-fraction');
      const price = whole
        ? parseFloat(`${whole.textContent.replace(/[^0-9]/g, '')}.${frac ? frac.textContent.replace(/[^0-9]/g, '') : '00'}`)
        : null;
      const originalPriceRaw = getFirstText(['.basisPrice .a-offscreen', '#priceblock_saleprice', '#listPrice', '.a-text-strike']);
      const imageUrl = toAbsoluteUrl(
        getFirstAttr(['#landingImage', '#imgBlkFront', 'img#main-image'], 'src') ||
        getFirstAttr(['#landingImage'], 'data-old-hires')
      );
      if (!name) return null;
      return { name, price: isNaN(price) ? null : price, originalPrice: cleanPrice(originalPriceRaw), imageUrl };
    },
  },
  {
    canHandle: (host) => host.includes('nike.'),
    siteName: 'nike.com',
    extract() {
      const name = getFirstText(['[data-test="product-title"]', 'h1.headline-5', 'h1[class*="headline"]']);
      const price = cleanPrice(getFirstText(['[data-test="product-price"]', '.product-price', '[class*="product-price"]']));
      const originalPrice = cleanPrice(getFirstText(['[data-test="product-price-reduced"]', '.product-price__was', '[class*="price--strikethrough"]']));
      const imageUrl = toAbsoluteUrl(getFirstAttr(['[data-test="hero-image"] img', '.product-image img', 'img[class*="product-image"]'], 'src'));
      if (!name) return null;
      return { name, price, originalPrice, imageUrl };
    },
  },
  {
    canHandle: (host) => host.includes('asos.'),
    siteName: 'asos.com',
    extract() {
      const name = getFirstText(['h1[class*="product-hero"]', '[data-test="product-title"]', 'h1']);
      const price = cleanPrice(getFirstText(['[data-test="current-price"]', '[class*="current-price"]', '[class*="sale"]']));
      const originalPrice = cleanPrice(getFirstText(['[data-test="previous-price"]', '[class*="previous-price"]', '[class*="was-price"]']));
      const imageUrl = toAbsoluteUrl(getFirstAttr(['img[class*="image"]', 'img[data-auto-id*="image"]'], 'src'));
      if (!name) return null;
      return { name, price, originalPrice, imageUrl };
    },
  },
  {
    canHandle: (host) => host.includes('target.'),
    siteName: 'target.com',
    extract() {
      const name = getFirstText(['[data-test="product-title"]', 'h1[class*="Heading"]', 'h1']);
      const price = cleanPrice(getFirstText(['[data-test="product-price"]', '[class*="CurrentPricestyle"]', '[class*="current-retail"]']));
      const originalPrice = cleanPrice(getFirstText(['[data-test="product-regular-price"]', '[class*="regular-retail"]']));
      const imageUrl = toAbsoluteUrl(getFirstAttr(['[data-test="product-image"] img', 'picture img'], 'src'));
      if (!name) return null;
      return { name, price, originalPrice, imageUrl };
    },
  },
  {
    canHandle: (host) => host.includes('bestbuy.'),
    siteName: 'bestbuy.com',
    extract() {
      const name = getFirstText(['.sku-title h1', 'h1.heading-5', 'h1[class*="heading"]']);
      const price = cleanPrice(getFirstText(['.priceView-customer-price span', '[class*="pb-final-price"]', '.priceView-hero-price span']));
      const originalPrice = cleanPrice(getFirstText(['.pricing-price__regular-price', '[class*="regular-price"]']));
      const imageUrl = toAbsoluteUrl(getFirstAttr(['.primary-button img', 'img.primary-image', '[class*="gallery"] img'], 'src'));
      if (!name) return null;
      return { name, price, originalPrice, imageUrl };
    },
  },
  {
    canHandle: (host) => host.includes('zara.'),
    siteName: 'zara.com',
    extract() {
      const name = getFirstText(['h1.product-detail-info__header-name', 'h1[class*="product"]', 'h1']);
      const price = cleanPrice(getFirstText(['.price__amount', '[class*="price-current"]', 'span[class*="price"]']));
      const originalPrice = cleanPrice(getFirstText(['.price__amount--old', '[class*="price-old"]']));
      const imageUrl = toAbsoluteUrl(
        getFirstAttr(['img.media-image__image', 'img[class*="media-image"]'], 'src') ||
        getFirstAttr(['img.media-image__image'], 'data-src')
      );
      if (!name) return null;
      return { name, price, originalPrice, imageUrl };
    },
  },
];

// ─── Strategy 4: Generic DOM fallback ─────────────────────────────────────────

function extractGeneric() {
  return {
    name: getFirstText([
      'h1[itemprop="name"]', '[itemprop="name"] h1', 'h1.product-title',
      'h1.product-name', 'h1[class*="product"]', 'h1[class*="title"]', 'h1',
    ]) || document.title,
    price: cleanPrice(getFirstText([
      '[itemprop="price"]', '[class*="sale-price"]', '[class*="current-price"]',
      '[class*="price__current"]', '[class*="price-current"]', '[class*="selling-price"]',
      '[class*="product-price"]', '[class*="price"]',
    ])),
    originalPrice: cleanPrice(getFirstText([
      '[class*="original-price"]', '[class*="was-price"]', '[class*="strike"]',
      '[class*="list-price"]', '[class*="regular-price"]', 's[class*="price"]', 'del[class*="price"]',
    ])),
    imageUrl: toAbsoluteUrl(
      getFirstAttr(['[itemprop="image"]', 'img.product-image', 'img[class*="product"]', 'img[class*="hero"]', '.product-gallery img', 'img[data-zoom]'], 'src') ||
      getFirstAttr(['[itemprop="image"]', 'img.product-image', 'img[class*="product"]', 'img[class*="hero"]', '.product-gallery img'], 'data-src') ||
      getFirstAttr(['[itemprop="image"]', 'img[class*="product"]', 'img[class*="hero"]'], 'data-lazy-src') ||
      getFirstAttr(['[itemprop="image"]', 'img[class*="product"]'], 'data-original') ||
      getFirstAttr(['[itemprop="image"]', 'img[class*="product"]'], 'data-image')
    ),
  };
}

// ─── Extraction quality score ──────────────────────────────────────────────────

function computeExtractionQuality(product) {
  const keyFields = ['name', 'price', 'imageUrl'];
  const missingFields = keyFields.filter((f) => product[f] == null);
  const extractionQuality = Math.round(((keyFields.length - missingFields.length) / keyFields.length) * 100);
  return { extractionQuality, missingFields };
}

// ─── Product page detection ────────────────────────────────────────────────────

const PRODUCT_URL_PATTERNS = [
  /amazon\.(com|co\.uk)\/.*\/dp\/[A-Z0-9]{10}/,
  /nike\.com\/.+\/t\//,
  /asos\.com\/.+\/prd\//,
  /target\.com\/p\//,
  /bestbuy\.com\/site\/.+\/[0-9]+\.p/,
  /zara\.com\/.+\/p[0-9]+/,
  /hm\.com\/.+\.html/,
  /nordstrom\.com\/s\//,
  /wayfair\.com\/.+\//,
  /ebay\.com\/itm\//,
  /adidas\.com\/.+\//,
  /converse\.com\/p\//,
  // Additional common sites
  /pacsun\.com\/.+\.html/,
  /walmart\.com\/ip\//,
  /costco\.com\/.*\.product\./,
  /homedepot\.com\/p\//,
  /macys\.com\/.+\/product\//,
  /uniqlo\.com\/.+\/products\//,
  /gap\.com\/.+\/product\//,
  /oldnavy\.com\/.+\/product\//,
  /urbanoutfitters\.com\/.+\/\d+/,
  /forever21\.com\/products\//,
];

const NON_RETAIL_HOSTS = [
  'google.com', 'google.co', 'youtube.com', 'twitter.com', 'x.com',
  'reddit.com', 'facebook.com', 'instagram.com', 'linkedin.com',
  'github.com', 'stackoverflow.com', 'wikipedia.org', 'nytimes.com',
  'cnn.com', 'bbc.com', 'medium.com', 'substack.com', 'notion.so',
  'docs.google.com', 'mail.google.com', 'calendar.google.com',
  'netflix.com', 'hulu.com', 'spotify.com', 'twitch.tv',
];

function isProductPage() {
  const host = getHostname();

  // Hard block: never show on non-retail sites
  if (NON_RETAIL_HOSTS.some((h) => host.includes(h))) return false;

  // Known retail URL patterns → always show
  if (PRODUCT_URL_PATTERNS.some((p) => p.test(window.location.href))) return true;

  // Open Graph product signals → show (requires price meta tag to avoid false positives)
  const hasOgProductPrice = !!document.querySelector('meta[property="product:price:amount"]');
  const ogType = document.querySelector('meta[property="og:type"]')?.content;
  if (ogType === 'product' && hasOgProductPrice) return true;

  // Require BOTH a cart/buy button AND a price signal AND an h1 for generic detection
  const hasCartBtn = !!(
    document.querySelector('button[class*="add-to-cart"]') ||
    document.querySelector('button[class*="addtocart"]') ||
    document.querySelector('[data-test*="add-to-cart"]') ||
    document.querySelector('[id*="add-to-cart"]') ||
    document.querySelector('button[class*="buy-now"]') ||
    document.querySelector('[data-test*="buy-now"]')
  );
  const hasPrice = !!(
    document.querySelector('[itemprop="price"]') ||
    document.querySelector('meta[property="product:price:amount"]') ||
    document.querySelector('[class*="product-price"]') ||
    document.querySelector('[class*="buying-price"]')
  );
  return hasCartBtn && hasPrice && !!document.querySelector('h1');
}

// ─── Main extraction entry point ───────────────────────────────────────────────

function extractProduct() {
  const host = getHostname();

  const schemaNode = getSchemaProduct();
  const schemaData = schemaNode ? extractFromSchema(schemaNode) : null;

  const handler = SITE_HANDLERS.find((h) => h.canHandle(host));
  const siteData = handler ? handler.extract() : null;
  const siteName = handler ? handler.siteName : host;

  const ogData = siteData ? null : extractFromOpenGraph();

  let merged;
  if (siteData && schemaData) {
    merged = {
      name: siteData.name || schemaData.name,
      price: siteData.price ?? schemaData.price,
      originalPrice: siteData.originalPrice ?? schemaData.originalPrice,
      imageUrl: siteData.imageUrl || schemaData.imageUrl,
    };
  } else {
    merged = siteData || schemaData || ogData || extractGeneric();
  }

  const base = {
    ...merged,
    siteName,
    sourceUrl: window.location.href,
    pageTitle: document.title,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
  };

  return { ...base, ...computeExtractionQuality(base) };
}
