import {
  enforceRateLimit,
  getClientIp,
  hashSecret,
  isAllowedProxyUrl,
  sanitizeHttpsUrl,
  sanitizeMessages,
  sanitizeOptionalText,
  sanitizePrice,
  sanitizeProducts,
} from './security.mjs';

// Haul AI Worker — Cloudflare Worker proxy between the extension and Anthropic.
// The ANTHROPIC_API_KEY is stored as a Wrangler secret (never in extension code).
//
// Endpoints:
//   GET  /proxy-image?url=<encoded>              → proxied image bytes
//   POST /chat        { products, messages }      → { message, suggestedProducts? }
//   POST /share       { products, title? }        → { shareId, url }
//   GET  /view/:id                               → HTML friend-view page

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://haul-production.up.railway.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ── Image proxy (GET) ──────────────────────────────────────────────────
    if (url.pathname === '/proxy-image') {
      return handleProxyImage(url);
    }

    // ── Friend share view → redirect to haul-share (GET) ─────────────────
    const haulShareBase = env.HAUL_SHARE_URL || 'https://haul-production.up.railway.app';
    const viewMatch = url.pathname.match(/^\/view\/([A-Za-z0-9_-]{6,16})$/);
    if (viewMatch) {
      return Response.redirect(`${haulShareBase}/view/${viewMatch[1]}`, 302);
    }

    // ── Raw share data JSON for Vercel SSR (GET) ───────────────────────────
    const apiMatch = url.pathname.match(/^\/api\/([A-Za-z0-9_-]{6,16})$/);
    if (apiMatch) {
      return handleApiGet(apiMatch[1], env);
    }

    // ── Public feed (GET) ──────────────────────────────────────────────────
    if (url.pathname === '/feed') return handleFeed(env);

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      await enforceEndpointRateLimit(request, env, url.pathname);
    } catch (error) {
      return jsonResponse(
        { error: error.message || 'Rate limit exceeded' },
        error.status || 429,
        error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {}
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400);

    if (url.pathname === '/chat') return handleChat(body, env);
    if (url.pathname === '/share') return handleShare(body, env, url);
    if (url.pathname === '/fork') return handleFork(body, env);
    if (url.pathname === '/delete-share') return handleDeleteShare(body, env);
    return jsonResponse({ error: 'Not found' }, 404);
  },
};

async function enforceEndpointRateLimit(request, env, pathname) {
  const ip = getClientIp(request);
  const policies = {
    '/chat': { limit: 20, windowSeconds: 600 },
    '/share': { limit: 30, windowSeconds: 600 },
    '/fork': { limit: 60, windowSeconds: 600 },
    '/delete-share': { limit: 30, windowSeconds: 600 },
  };
  const policy = policies[pathname] || { limit: 60, windowSeconds: 600 };
  await enforceRateLimit(env, `${pathname}:${ip}`, policy);
}

// ─── Image proxy ──────────────────────────────────────────────────────────────

async function handleProxyImage(url) {
  const target = url.searchParams.get('url');
  if (!target || !isAllowedProxyUrl(target)) {
    return new Response('Bad url', { status: 400, headers: CORS_HEADERS });
  }
  try {
    const res = await fetch(target, {
      headers: { 'Referer': new URL(target).origin, 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const contentLength = Number(res.headers.get('content-length') || 0);
    if (!contentType.startsWith('image/')) {
      return new Response('Unsupported media type', { status: 415, headers: CORS_HEADERS });
    }
    if (contentLength > 5 * 1024 * 1024) {
      return new Response('Image too large', { status: 413, headers: CORS_HEADERS });
    }
    return new Response(res.body, {
      status: 200,
      headers: { ...CORS_HEADERS, 'content-type': contentType, 'cache-control': 'public, max-age=86400' },
    });
  } catch {
    return new Response('Proxy error', { status: 502, headers: CORS_HEADERS });
  }
}

// ─── /chat ────────────────────────────────────────────────────────────────────

async function fetchOgImage(url) {
  const safeUrl = sanitizeHttpsUrl(url);
  if (!safeUrl) return null;
  try {
    const res = await fetch(safeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Haul/1.0; +https://haulapp.workers.dev)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
            || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m) return null;
    const src = m[1];
    return sanitizeHttpsUrl(src.startsWith('//') ? `https:${src}` : src);
  } catch {
    return null;
  }
}

async function handleChat({ products, messages }, env) {
  let safeProducts;
  let safeMessages;
  try {
    safeProducts = sanitizeProducts(products, { maxCount: 25 });
    safeMessages = sanitizeMessages(messages, { maxCount: 20, maxLength: 500 });
  } catch (error) {
    return jsonResponse({ error: error.message || 'Invalid payload' }, 400);
  }
  if (!env.ANTHROPIC_API_KEY) {
    return jsonResponse({ error: 'ANTHROPIC_API_KEY not configured' }, 500);
  }

  const list = safeProducts.map((p) => {
    const price = p.price != null ? `$${Number(p.price).toFixed(2)}` : 'unknown';
    const sale = p.originalPrice && p.price && p.originalPrice > p.price
      ? ` (was $${Number(p.originalPrice).toFixed(2)}, ${Math.round((1 - p.price / p.originalPrice) * 100)}% off)` : '';
    return `- ${String(p.name).slice(0, 80)} | ${price}${sale} | ${p.siteName || ''}`;
  }).join('\n');

  const systemPrompt =
    `You are a direct shopping assistant. The user is comparing these products:\n${list}\n\n` +
    `You have real-time web search. NEVER ask clarifying questions — always act immediately.\n` +
    `When the user asks for alternatives, similar items, other websites, or cheaper options: ` +
    `search right away using the product names and categories above as context. ` +
    `Your ENTIRE response must be ONLY this JSON block — no text before or after:\n` +
    `<products>[{"name":"Full product name","price":"$XX.XX","priceRaw":XX.XX,"url":"https://exact-product-page-url","siteName":"amazon.com"}]</products>\n` +
    `Use direct product page URLs (not search result pages). Up to 4 products. Omit priceRaw if unknown.\n\n` +
    `For non-search questions: plain text only, max 80 words, no em dashes.`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'web-search-2025-03-05',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: safeMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return jsonResponse({ error: err.error?.message || `API error ${res.status}` }, 502);
  }

  const data = await res.json();

  // Use only the LAST text block — earlier ones are Claude's internal narration before searching
  const textBlocks = (data.content || []).filter((b) => b.type === 'text');
  const fullText = (textBlocks[textBlocks.length - 1]?.text || '').trim();

  const prodMatch = fullText.match(/<products>([\s\S]*?)<\/products>/);
  let suggestedProducts = [];
  if (prodMatch) {
    try { suggestedProducts = JSON.parse(prodMatch[1]); } catch { /* ignore */ }
  }
  suggestedProducts = sanitizeSuggestedProducts(suggestedProducts);

  // Fetch og:image for each product in parallel so cards show real photos
  if (suggestedProducts.length) {
    suggestedProducts = await Promise.all(
      suggestedProducts.map(async (p) => ({
        ...p,
        image: p.url ? await fetchOgImage(p.url) : null,
      }))
    );
  }

  // When returning product cards, suppress text — cards speak for themselves
  const message = suggestedProducts.length
    ? ''
    : fullText.replace(/<products>[\s\S]*?<\/products>/, '').trim();

  return jsonResponse({ message, ...(suggestedProducts.length ? { suggestedProducts } : {}) });
}

function sanitizeSuggestedProducts(products) {
  if (!Array.isArray(products)) return [];
  return products.slice(0, 4).map((product) => {
    const name = sanitizeOptionalText(product?.name, 240);
    const url = sanitizeHttpsUrl(product?.url);
    if (!name || !url) return null;
    return {
      name,
      price: sanitizeOptionalText(product?.price, 40),
      priceRaw: sanitizePrice(product?.priceRaw),
      url,
      siteName: sanitizeOptionalText(product?.siteName, 80) || new URL(url).hostname.replace(/^www\./, ''),
    };
  }).filter(Boolean);
}

// ─── /api/:id ─────────────────────────────────────────────────────────────────

async function handleApiGet(shareId, env) {
  if (!env.HAUL_SHARES) return jsonResponse({ error: 'KV not configured' }, 500);
  const raw = await env.HAUL_SHARES.get(shareId);
  if (!raw) return jsonResponse({ error: 'Not found' }, 404);
  try {
    return jsonResponse(JSON.parse(raw));
  } catch {
    return jsonResponse({ error: 'Corrupt data' }, 500);
  }
}

// ─── /share ───────────────────────────────────────────────────────────────────

function randomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomSecret(bytes = 32) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
}

async function handleShare({ products, title, author, isPublic }, env) {
  if (!env.HAUL_SHARES) {
    return jsonResponse({ error: 'KV not configured' }, 500);
  }
  let safeProducts;
  try {
    safeProducts = sanitizeProducts(products, { maxCount: 25 });
  } catch (error) {
    return jsonResponse({ error: error.message || 'products array required' }, 400);
  }

  const shareId = randomId();
  const deleteToken = randomSecret();
  const deleteTokenHash = await hashSecret(deleteToken);
  const safeTitle = sanitizeOptionalText(title, 120);
  const safeAuthor = sanitizeOptionalText(author, 40);
  const payload = JSON.stringify({
    products: safeProducts,
    title: safeTitle,
    author: safeAuthor,
    isPublic: Boolean(isPublic),
    deleteTokenHash,
    createdAt: Date.now(),
  });
  await env.HAUL_SHARES.put(shareId, payload, { expirationTtl: 60 * 60 * 24 * 30 });

  if (isPublic) {
    await addToFeed(env, {
      id: shareId,
      title: safeTitle || 'Haul Comparison',
      author: safeAuthor,
      productCount: safeProducts.length,
      imageUrls: safeProducts.slice(0, 3).map((p) => p.imageUrl).filter(Boolean),
      createdAt: Date.now(),
    });
  }

  const haulShareBase = env.HAUL_SHARE_URL || 'https://haul-production.up.railway.app';
  return jsonResponse({ shareId, deleteToken, url: `${haulShareBase}/view/${shareId}` });
}

// ─── /feed ────────────────────────────────────────────────────────────────────

async function handleFeed(env) {
  if (!env.HAUL_SHARES) return jsonResponse([]);
  const raw = await env.HAUL_SHARES.get('_feed').catch(() => null);
  if (!raw) return jsonResponse([]);
  try {
    return jsonResponse(JSON.parse(raw));
  } catch {
    return jsonResponse([]);
  }
}

async function addToFeed(env, entry) {
  let feed = [];
  try {
    const raw = await env.HAUL_SHARES.get('_feed');
    if (raw) feed = JSON.parse(raw);
  } catch { /* ignore */ }
  feed = [entry, ...feed.filter((e) => e.id !== entry.id)].slice(0, 50);
  await env.HAUL_SHARES.put('_feed', JSON.stringify(feed), { expirationTtl: 60 * 60 * 24 * 90 });
}

// ─── /fork ────────────────────────────────────────────────────────────────────

async function handleFork({ id }, env) {
  const safeId = sanitizeOptionalText(id, 32);
  if (!safeId) return jsonResponse({ error: 'id required' }, 400);
  if (!env.HAUL_SHARES) return jsonResponse({ error: 'KV not configured' }, 500);
  const raw = await env.HAUL_SHARES.get(safeId).catch(() => null);
  if (!raw) return jsonResponse({ error: 'Not found' }, 404);
  try {
    const { products } = JSON.parse(raw);
    return jsonResponse({ products: sanitizeProducts(products || [], { maxCount: 25 }) });
  } catch {
    return jsonResponse({ error: 'Corrupt data' }, 500);
  }
}

// ─── /delete-share ────────────────────────────────────────────────────────────

async function handleDeleteShare({ id, deleteToken }, env) {
  const safeId = sanitizeOptionalText(id, 32);
  if (!safeId || !deleteToken) return jsonResponse({ error: 'id and deleteToken required' }, 400);
  if (!env.HAUL_SHARES) return jsonResponse({ error: 'KV not configured' }, 500);

  const raw = await env.HAUL_SHARES.get(safeId).catch(() => null);
  if (!raw) return jsonResponse({ error: 'Not found' }, 404);

  try {
    const haul = JSON.parse(raw);
    const providedHash = await hashSecret(deleteToken);
    if (!haul.deleteTokenHash || providedHash !== haul.deleteTokenHash) {
      return jsonResponse({ error: 'Not yours' }, 403);
    }
  } catch {
    return jsonResponse({ error: 'Corrupt data' }, 500);
  }

  // Remove from _feed list
  const feedRaw = await env.HAUL_SHARES.get('_feed').catch(() => null);
  if (feedRaw) {
    try {
      const feed = JSON.parse(feedRaw).filter((e) => e.id !== safeId);
      await env.HAUL_SHARES.put('_feed', JSON.stringify(feed), { expirationTtl: 60 * 60 * 24 * 90 });
    } catch { /* ignore */ }
  }

  await env.HAUL_SHARES.delete(safeId).catch(() => null);
  return jsonResponse({ success: true });
}

// ─── /view/:id ────────────────────────────────────────────────────────────────

async function handleView(shareId, env) {
  if (!env.HAUL_SHARES) {
    return new Response('Not configured', { status: 500 });
  }

  const raw = await env.HAUL_SHARES.get(shareId);
  if (!raw) {
    return new Response('Share link not found or expired.', {
      status: 404,
      headers: { 'content-type': 'text/html' },
    });
  }

  let data;
  try { data = JSON.parse(raw); } catch { return new Response('Corrupt data', { status: 500 }); }

  const { products, title } = data;
  const pageTitle = title || 'Haul Comparison';

  const productsHtml = products.map((p, i) => {
    const price = p.price != null ? `$${Number(p.price).toFixed(2)}` : 'N/A';
    const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
    const origPrice = hasDrop
      ? `<span style="text-decoration:line-through;color:#8a7e72;font-size:13px;margin-left:6px;">$${Number(p.originalPrice).toFixed(2)}</span>`
      : '';
    const savings = hasDrop
      ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#e8f0e6;color:#7a9e76;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;margin-top:6px;">↓ Save $${(p.originalPrice - p.price).toFixed(2)}</div>`
      : '';
    const imgHtml = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="" style="width:100%;height:180px;object-fit:contain;padding:12px;" onerror="this.style.display='none'" loading="lazy"/>`
      : `<div style="width:100%;height:180px;background:linear-gradient(135deg,#ddd8cf,#ccc9c0);display:flex;align-items:center;justify-content:center;font-size:13px;color:#8a7e72;font-weight:600;">No image</div>`;
    const category = p.category ? `<span style="font-size:10px;font-weight:700;background:#e8f0e6;color:#7a9e76;padding:2px 8px;border-radius:20px;">${esc(p.category)}</span>` : '';

    return `
      <div style="background:#fff;border:1px solid #e8e2d8;border-radius:18px;overflow:hidden;width:220px;box-shadow:0 2px 12px rgba(61,53,41,0.06);display:flex;flex-direction:column;">
        <div style="background:#fafaf7;border-bottom:1px solid #f0ebe2;">${imgHtml}</div>
        <div style="padding:14px 14px 18px;flex:1;display:flex;flex-direction:column;">
          <div style="margin-bottom:8px;">${category}</div>
          <div style="font-size:13px;font-weight:600;color:#3d3529;line-height:1.45;margin-bottom:4px;flex:1;">${esc(p.name)}</div>
          <div style="font-size:11px;color:#8a7e72;margin-bottom:10px;">${esc(p.siteName || '')}</div>
          <div style="display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
            <span style="font-size:20px;font-weight:800;color:#b07d4a;">${price}</span>${origPrice}
          </div>
          ${savings}
          ${p.sourceUrl ? `<a href="${p.sourceUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:14px;padding:9px 14px;background:#7a9e76;color:#fff;font-size:13px;font-weight:700;border-radius:10px;text-decoration:none;transition:filter 0.15s;" onmouseover="this.style.filter='brightness(0.92)'" onmouseout="this.style.filter='none'">View Product →</a>` : ''}
        </div>
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(pageTitle)} | Haul</title>
  <meta property="og:title" content="${esc(pageTitle)} | Haul"/>
  <meta property="og:description" content="Compare ${products.length} product${products.length !== 1 ? 's' : ''} side by side."/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafaf7;color:#3d3529;min-height:100vh;}
    a{color:inherit;}
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:#f2ede4;border-bottom:1px solid #ddd8cf;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;font-weight:800;color:#7a9e76;letter-spacing:-0.5px;">Haul</span>
      <span style="font-size:12px;color:#8a7e72;font-weight:500;">Shopping Comparison</span>
    </div>
    <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener"
       style="padding:7px 16px;background:#7a9e76;color:#fff;font-size:12px;font-weight:700;border-radius:20px;text-decoration:none;">
      Get Haul Free →
    </a>
  </div>

  <!-- Hero -->
  <div style="max-width:900px;margin:0 auto;padding:36px 24px 0;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8a7e72;margin-bottom:10px;">Shared with you</div>
    <h1 style="font-size:26px;font-weight:800;color:#3d3529;margin-bottom:6px;">${esc(pageTitle)}</h1>
    <p style="font-size:14px;color:#8a7e72;margin-bottom:28px;">${products.length} product${products.length !== 1 ? 's' : ''} compared</p>

    <!-- Get Haul banner -->
    <div style="background:#e8f0e6;border:1px solid #c5d9c2;border-radius:14px;padding:16px 20px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
      <div>
        <div style="font-size:14px;font-weight:700;color:#3d3529;margin-bottom:2px;">Want to compare your own products?</div>
        <div style="font-size:13px;color:#8a7e72;">Haul is a free Chrome extension. Save products from any site and compare in seconds.</div>
      </div>
      <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener"
         style="padding:10px 20px;background:#7a9e76;color:#fff;font-size:13px;font-weight:700;border-radius:10px;text-decoration:none;white-space:nowrap;flex-shrink:0;">
        Get Haul Free →
      </a>
    </div>
  </div>

  <!-- Products grid -->
  <div style="max-width:900px;margin:0 auto;padding:0 24px 60px;display:flex;gap:18px;flex-wrap:wrap;">
    ${productsHtml}
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #ddd8cf;padding:20px 24px;text-align:center;font-size:12px;color:#8a7e72;">
    Made with <span style="color:#7a9e76;font-weight:700;">Haul</span> · Shopping comparison, simplified
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8', ...CORS_HEADERS },
  });
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Util ─────────────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders, 'content-type': 'application/json' },
  });
}
