(function installHaulProductSchema(root) {
  const VALID_CATEGORIES = new Set([
    'Electronics', 'Clothing', 'Footwear', 'Home', 'Beauty',
    'Sports', 'Toys', 'Books', 'Food', 'Other',
  ]);

  const PRIVATE_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^0\./,
    /^\[?::1\]?$/i,
    /\.local$/i,
    /\.localhost$/i,
  ];

  function cleanText(value, maxLength) {
    if (typeof value !== 'string') return null;
    const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned ? cleaned.slice(0, maxLength) : null;
  }

  function cleanIdentifier(value, maxLength) {
    const cleaned = cleanText(value, maxLength);
    return cleaned ? cleaned.replace(/[<>"'`]/g, '') : null;
  }

  function cleanPrice(value) {
    if (value == null || value === '') return null;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 1_000_000) return null;
    return Math.round(number * 100) / 100;
  }

  function cleanHttpsUrl(value) {
    if (typeof value !== 'string' || value.length > 2048) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') return null;
      if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  function sanitizeProduct(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    const name = cleanText(input.name, 240);
    if (!name) return null;
    const folderId = Array.isArray(input.folderId)
      ? input.folderId.map((id) => cleanIdentifier(id, 80)).filter(Boolean).slice(0, 20)
      : undefined;

    return {
      id: cleanIdentifier(input.id, 120) || `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      price: cleanPrice(input.price),
      originalPrice: cleanPrice(input.originalPrice),
      imageUrl: cleanHttpsUrl(input.imageUrl),
      sourceUrl: cleanHttpsUrl(input.sourceUrl),
      siteName: cleanText(input.siteName, 80) || '',
      category: VALID_CATEGORIES.has(input.category) ? input.category : null,
      ...(folderId ? { folderId } : {}),
      savedAt: Number.isFinite(Number(input.savedAt)) ? Number(input.savedAt) : Date.now(),
      extractionQuality: Number.isFinite(Number(input.extractionQuality)) ? Number(input.extractionQuality) : undefined,
      missingFields: Array.isArray(input.missingFields) ? input.missingFields.map((field) => cleanText(field, 40)).filter(Boolean) : undefined,
    };
  }

  function sanitizeProducts(products, options) {
    const maxCount = options && options.maxCount ? options.maxCount : 25;
    if (!Array.isArray(products) || products.length === 0 || products.length > maxCount) return [];
    return products.map(sanitizeProduct).filter(Boolean);
  }

  const api = { cleanHttpsUrl, cleanIdentifier, cleanPrice, cleanText, sanitizeProduct, sanitizeProducts };
  root.HaulProductSchema = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(globalThis);
