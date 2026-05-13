// Haul AI Worker — Cloudflare Worker proxy between the extension and Anthropic.
// The ANTHROPIC_API_KEY is stored as a Wrangler secret (never in extension code).
//
// Endpoints:
//   GET  /proxy-image?url=<encoded>              → proxied image bytes
//   POST /categorize  { name, siteName }         → { category }
//   POST /advise      { products: [...] }         → { winner_id, summary, insights }

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

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await request.json().catch(() => null);
    if (!body) return jsonResponse({ error: 'Invalid JSON' }, 400);

    if (url.pathname === '/categorize') return handleCategorize(body, env);
    if (url.pathname === '/advise') return handleAdvise(body, env);
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

// ─── Util ─────────────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}
