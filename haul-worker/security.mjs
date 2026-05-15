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

export function sanitizeText(value, maxLength, fieldName = 'value') {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    throw new Error(`${fieldName} is required`);
  }
  return cleaned.slice(0, maxLength);
}

export function sanitizeOptionalText(value, maxLength) {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

export function sanitizeIdentifier(value, maxLength = 120) {
  const cleaned = sanitizeOptionalText(value, maxLength);
  return cleaned ? cleaned.replace(/[<>"'`]/g, '') : null;
}

export function sanitizePrice(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1_000_000) return null;
  return Math.round(number * 100) / 100;
}

export function sanitizeHttpsUrl(value, maxLength = 2048) {
  if (typeof value !== 'string' || value.length > maxLength) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function sanitizeProduct(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('product must be an object');
  }

  const id = sanitizeIdentifier(input.id, 120) || `p_${crypto.randomUUID()}`;
  const name = sanitizeText(input.name, 240, 'product name');
  const folderIds = Array.isArray(input.folderId)
    ? input.folderId.map((idValue) => sanitizeIdentifier(idValue, 80)).filter(Boolean).slice(0, 20)
    : undefined;

  return {
    id,
    name,
    price: sanitizePrice(input.price),
    originalPrice: sanitizePrice(input.originalPrice),
    imageUrl: sanitizeHttpsUrl(input.imageUrl),
    sourceUrl: sanitizeHttpsUrl(input.sourceUrl),
    siteName: sanitizeOptionalText(input.siteName, 80) || '',
    category: VALID_CATEGORIES.has(input.category) ? input.category : null,
    ...(folderIds ? { folderId: folderIds } : {}),
    savedAt: Number.isFinite(Number(input.savedAt)) ? Number(input.savedAt) : Date.now(),
  };
}

export function sanitizeProducts(products, { maxCount = 25 } = {}) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('at least one product is required');
  }
  if (products.length > maxCount) {
    throw new Error(`too many products; max ${maxCount}`);
  }
  return products.map(sanitizeProduct);
}

export function sanitizeMessages(messages, { maxCount = 20, maxLength = 500 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages array required');
  }
  return messages.slice(-maxCount).map((message) => ({
    role: message?.role === 'assistant' ? 'assistant' : 'user',
    content: sanitizeText(String(message?.content ?? ''), maxLength, 'message'),
  }));
}

export function isAllowedProxyUrl(value) {
  return sanitizeHttpsUrl(value) !== null;
}

export async function hashSecret(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
}

export async function enforceRateLimit(env, key, { limit, windowSeconds }) {
  const store = env.HAUL_RATE_LIMITS || env.HAUL_SHARES;
  if (!store) return;

  const bucket = `_rate:${key}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const current = await store.get(bucket).then((raw) => raw ? JSON.parse(raw) : null).catch(() => null);
  const resetAt = current?.resetAt && current.resetAt > now ? current.resetAt : now + windowMs;
  const count = current?.resetAt && current.resetAt > now ? Number(current.count || 0) + 1 : 1;

  if (count > limit) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
    const error = new Error('Rate limit exceeded');
    error.status = 429;
    error.retryAfter = retryAfter;
    throw error;
  }

  await store.put(bucket, JSON.stringify({ count, resetAt }), { expirationTtl: windowSeconds + 30 });
}
