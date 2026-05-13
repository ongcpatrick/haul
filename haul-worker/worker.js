// Haul AI Worker — Cloudflare Worker proxy between the extension and Anthropic.
// The ANTHROPIC_API_KEY is stored as a Wrangler secret (never in extension code).
//
// Endpoints:
//   GET  /proxy-image?url=<encoded>              → proxied image bytes
//   POST /categorize  { name, siteName }         → { category }
//   POST /advise      { products: [...] }         → { winner_id, summary, insights }
//   POST /share       { products, title? }        → { shareId, url }
//   GET  /view/:id                               → HTML friend-view page

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

    // ── Friend share view (GET) ────────────────────────────────────────────
    const viewMatch = url.pathname.match(/^\/view\/([A-Za-z0-9_-]{6,16})$/);
    if (viewMatch) {
      return handleView(viewMatch[1], env);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400);

    if (url.pathname === '/categorize') return handleCategorize(body, env);
    if (url.pathname === '/advise') return handleAdvise(body, env);
    if (url.pathname === '/share') return handleShare(body, env, url);
    return jsonResponse({ error: 'Not found' }, 404);
  },
};

// ─── Image proxy ──────────────────────────────────────────────────────────────

async function handleProxyImage(url) {
  const target = url.searchParams.get('url');
  if (!target || !/^https?:\/\//.test(target)) {
    return new Response('Bad url', { status: 400, headers: CORS_HEADERS });
  }
  try {
    const res = await fetch(target, {
      headers: { 'Referer': new URL(target).origin, 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return new Response('Not found', { status: 404, headers: CORS_HEADERS });
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return new Response(res.body, {
      status: 200,
      headers: { ...CORS_HEADERS, 'content-type': contentType, 'cache-control': 'public, max-age=86400' },
    });
  } catch {
    return new Response('Proxy error', { status: 502, headers: CORS_HEADERS });
  }
}

// ─── Claude helper ────────────────────────────────────────────────────────────

async function callClaude(env, maxTokens, content) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return (data.content?.[0]?.text || '').trim();
}

// ─── /categorize ──────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  'Electronics', 'Clothing', 'Footwear', 'Home',
  'Beauty', 'Sports', 'Toys', 'Books', 'Food', 'Other',
];

async function handleCategorize({ name, siteName }, env) {
  if (!name) return jsonResponse({ error: 'name required' }, 400);

  const text = await callClaude(
    env,
    20,
    `Categorize this product. Reply with ONLY one word from: ${VALID_CATEGORIES.join(', ')}.\nProduct: "${String(name).slice(0, 120)}", Site: "${siteName || ''}"`
  ).catch(() => 'Other');

  return jsonResponse({ category: VALID_CATEGORIES.includes(text) ? text : 'Other' });
}

// ─── /advise ──────────────────────────────────────────────────────────────────

async function handleAdvise({ products }, env) {
  if (!Array.isArray(products) || products.length === 0) {
    return jsonResponse({ error: 'products array required' }, 400);
  }

  const list = products.map((p) => {
    const price = p.price != null ? `$${Number(p.price).toFixed(2)}` : 'unknown';
    const sale =
      p.originalPrice && p.price && p.originalPrice > p.price
        ? ` (was $${Number(p.originalPrice).toFixed(2)}, ${Math.round((1 - p.price / p.originalPrice) * 100)}% off)`
        : '';
    return `ID:${p.id} | ${String(p.name).slice(0, 80)} | ${price}${sale} | ${p.siteName || ''} | ${p.category || '?'}`;
  }).join('\n');

  const text = await callClaude(
    env,
    400,
    `You are a direct shopping advisor. Reply ONLY with valid JSON — no markdown, no extra text:
{"winner_id":"exact product ID of the best buy","summary":"2-3 direct sentences: name the winner, explain why it wins, call out anything overpriced","insights":["one-line observation","one-line observation","one-line observation"]}

Products:
${list}`
  );

  let parsed;
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return jsonResponse({ error: 'Claude returned unparseable response' }, 502);
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return jsonResponse({ error: 'Claude returned unparseable response' }, 502);
    }
  }

  const validIds = new Set(products.map((p) => p.id));
  if (!validIds.has(parsed.winner_id)) parsed.winner_id = null;

  return jsonResponse(parsed);
}

// ─── /share ───────────────────────────────────────────────────────────────────

function randomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function handleShare({ products, title }, env, reqUrl) {
  if (!Array.isArray(products) || products.length === 0) {
    return jsonResponse({ error: 'products array required' }, 400);
  }
  if (!env.HAUL_SHARES) {
    return jsonResponse({ error: 'KV not configured' }, 500);
  }

  const shareId = randomId();
  const payload = JSON.stringify({ products, title: title || null, createdAt: Date.now() });
  await env.HAUL_SHARES.put(shareId, payload, { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days

  const base = `${reqUrl.protocol}//${reqUrl.host}`;
  return jsonResponse({ shareId, url: `${base}/view/${shareId}` });
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
    const price = p.price != null ? `$${Number(p.price).toFixed(2)}` : '—';
    const hasDrop = p.originalPrice && p.price && p.originalPrice > p.price;
    const origPrice = hasDrop
      ? `<span style="text-decoration:line-through;color:#8a7e72;font-size:13px;margin-left:6px;">$${Number(p.originalPrice).toFixed(2)}</span>`
      : '';
    const savings = hasDrop
      ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#e8f0e6;color:#7a9e76;font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;margin-top:6px;">↓ Save $${(p.originalPrice - p.price).toFixed(2)}</div>`
      : '';
    const imgHtml = p.imageUrl
      ? `<img src="${p.imageUrl}" alt="" style="width:100%;height:180px;object-fit:contain;padding:12px;" onerror="this.style.display='none'" loading="lazy"/>`
      : `<div style="width:100%;height:180px;background:linear-gradient(135deg,#ddd8cf,#ccc9c0);display:flex;align-items:center;justify-content:center;font-size:32px;">🛍️</div>`;
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
  <title>${esc(pageTitle)} — Haul</title>
  <meta property="og:title" content="${esc(pageTitle)} — Haul"/>
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
        <div style="font-size:13px;color:#8a7e72;">Haul is a free Chrome extension — save products from any site and compare in seconds.</div>
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
