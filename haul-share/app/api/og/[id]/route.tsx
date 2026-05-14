import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

interface Product {
  id: string;
  name: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  siteName: string;
  category: string | null;
}

function fmt(price: number | null) {
  if (price == null) return 'N/A';
  return '$' + price.toFixed(2);
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let products: Product[] = [];
  let title = 'Haul Comparison';

  try {
    const res = await fetch(`${WORKER}/api/${id}`);
    if (res.ok) {
      const data = await res.json();
      products = data.products ?? [];
      title = data.title ?? title;
    }
  } catch {}

  // Show up to 3 products in the OG card
  const shown = products.slice(0, 3);
  const extra = products.length > 3 ? products.length - 3 : 0;

  // Fetch product images as data URLs so they render in the OG image
  const images: (string | null)[] = await Promise.all(
    shown.map(async (p) => {
      if (!p.imageUrl) return null;
      try {
        const r = await fetch(`${WORKER}/proxy-image?url=${encodeURIComponent(p.imageUrl)}`);
        if (!r.ok) return null;
        const buf = await r.arrayBuffer();
        const mime = r.headers.get('content-type') || 'image/jpeg';
        const b64 = Buffer.from(buf).toString('base64');
        return `data:${mime};base64,${b64}`;
      } catch {
        return null;
      }
    })
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#fafaf7',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "-apple-system, 'Segoe UI', sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 48px 0', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: '#7a9e76', letterSpacing: '-1px' }}>Haul</span>
            <span style={{ fontSize: 14, color: '#8a7e72', marginTop: 6 }}>Shopping Comparison</span>
          </div>
          <span style={{ fontSize: 14, color: '#8a7e72' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} compared
          </span>
        </div>

        {/* Title */}
        <div style={{ padding: '20px 48px 24px', display: 'flex' }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#3d3529' }}>{truncate(title, 60)}</span>
        </div>

        {/* Product cards */}
        <div style={{ display: 'flex', gap: 20, padding: '0 48px', flex: 1, alignItems: 'flex-start' }}>
          {shown.map((p, i) => {
            const hasDrop = p.originalPrice != null && p.price != null && p.originalPrice > p.price;
            const savings = hasDrop ? (p.originalPrice! - p.price!).toFixed(2) : null;
            const imgSrc = images[i];

            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e8e2d8',
                  borderRadius: 16,
                  overflow: 'hidden',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 24px rgba(61,53,41,0.08)',
                }}
              >
                {/* Image */}
                <div style={{ background: '#f5f1ea', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgSrc
                    ? <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
                    : <span style={{ fontSize: 13, color: '#8a7e72', fontWeight: 600 }}>No image</span>
                  }
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#3d3529', lineHeight: 1.4 }}>
                    {truncate(p.name, 50)}
                  </span>
                  <span style={{ fontSize: 11, color: '#8a7e72' }}>{p.siteName}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#b07d4a' }}>{fmt(p.price)}</span>
                    {hasDrop && <span style={{ fontSize: 13, color: '#8a7e72', textDecoration: 'line-through' }}>{fmt(p.originalPrice)}</span>}
                  </div>
                  {savings && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7a9e76', background: '#e8f0e6', padding: '2px 8px', borderRadius: 20, alignSelf: 'flex-start' }}>
                      ↓ Save ${savings}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* +N more card */}
          {extra > 0 && (
            <div style={{
              background: '#f2ede4',
              border: '1.5px dashed #c5d9c2',
              borderRadius: 16,
              flex: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#7a9e76' }}>+{extra}</span>
              <span style={{ fontSize: 13, color: '#8a7e72' }}>more item{extra !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', marginTop: 'auto' }}>
          <span style={{ fontSize: 13, color: '#8a7e72' }}>haul-share.vercel.app</span>
          <span style={{ fontSize: 13, color: '#8a7e72' }}>Tap to view full comparison →</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
