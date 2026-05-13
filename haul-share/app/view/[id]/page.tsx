import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

interface Product {
  id: string;
  name: string;
  price: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  siteName: string;
  category: string | null;
  folderId?: string[];
}

interface ShareData {
  products: Product[];
  title: string | null;
  author: string | null;
  createdAt: number;
}

async function fetchShare(id: string): Promise<ShareData | null> {
  try {
    const res = await fetch(`${WORKER}/api/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchShare(id);
  const title = data?.title ?? 'Haul Comparison';
  const count = data?.products?.length ?? 0;
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://haul-share.vercel.app';

  return {
    title: `${title} — Haul`,
    description: `Compare ${count} product${count !== 1 ? 's' : ''} side by side on Haul.`,
    openGraph: {
      title: `${title} — Haul`,
      description: `Compare ${count} product${count !== 1 ? 's' : ''} side by side.`,
      images: [{ url: `${base}/api/og/${id}`, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Haul`,
      images: [`${base}/api/og/${id}`],
    },
  };
}

function fmt(price: number | null) {
  if (price == null) return '—';
  return '$' + price.toFixed(2);
}

export default async function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchShare(id);
  if (!data) notFound();

  const { products, title, author } = data;

  return (
    <div style={{ background: '#fafaf7', color: '#3d3529' }}>

        <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Hero */}
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a7e72', marginBottom: 10 }}>
            {author ? `Shared by ${author}` : 'Shared with you'}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{title ?? 'Haul Comparison'}</h1>
          <p style={{ fontSize: 14, color: '#8a7e72', marginBottom: 32 }}>{products.length} product{products.length !== 1 ? 's' : ''} compared</p>

          {/* Acquisition banner */}
          <div style={{ background: '#e8f0e6', border: '1px solid #c5d9c2', borderRadius: 14, padding: '16px 20px', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Want to build your own comparison?</p>
              <p style={{ fontSize: 13, color: '#8a7e72' }}>Haul is a free Chrome extension — save products from any site and compare in seconds.</p>
            </div>
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener"
              style={{ padding: '10px 22px', background: '#7a9e76', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
              Get Haul Free →
            </a>
          </div>

          {/* Products grid */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
            {products.map((p) => {
              const hasDrop = p.originalPrice != null && p.price != null && p.originalPrice > p.price;
              const savings = hasDrop ? (p.originalPrice! - p.price!).toFixed(2) : null;

              return (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e8e2d8', borderRadius: 18, overflow: 'hidden', width: 220, boxShadow: '0 2px 16px rgba(61,53,41,0.07)', display: 'flex', flexDirection: 'column' as const }}>
                  {/* Image */}
                  <div style={{ background: '#fafaf7', borderBottom: '1px solid #f0ebe2', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {p.imageUrl
                      ? <img src={`${WORKER}/proxy-image?url=${encodeURIComponent(p.imageUrl)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
                      : <span style={{ fontSize: 36 }}>🛍️</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 14px 18px', flex: 1, display: 'flex', flexDirection: 'column' as const }}>
                    {p.category && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#e8f0e6', color: '#7a9e76', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 8, alignSelf: 'flex-start' as const }}>{p.category}</span>
                    )}
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, marginBottom: 4, flex: 1 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: '#8a7e72', marginBottom: 10 }}>{p.siteName}</p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#b07d4a' }}>{fmt(p.price)}</span>
                      {hasDrop && <span style={{ fontSize: 13, color: '#8a7e72', textDecoration: 'line-through' }}>{fmt(p.originalPrice)}</span>}
                    </div>
                    {savings && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e8f0e6', color: '#7a9e76', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, alignSelf: 'flex-start' as const }}>↓ Save ${savings}</span>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {p.sourceUrl && (
                        <a href={p.sourceUrl} target="_blank" rel="noopener"
                          style={{ flex: 1, display: 'block', textAlign: 'center', padding: '9px 10px', background: '#7a9e76', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 10, textDecoration: 'none' }}>
                          View →
                        </a>
                      )}
                      {/* Add to My Haul — handled by the Haul extension content script */}
                      <button
                        data-haul-import={Buffer.from(JSON.stringify({
                          id: `share_${id}_${p.id}`,
                          name: p.name,
                          price: p.price,
                          originalPrice: p.originalPrice,
                          imageUrl: p.imageUrl,
                          sourceUrl: p.sourceUrl,
                          siteName: p.siteName,
                          category: p.category,
                          savedAt: Date.now(),
                        })).toString('base64')}
                        style={{ flex: 1, padding: '9px 10px', background: '#e8f0e6', color: '#5c8259', fontSize: 12, fontWeight: 700, borderRadius: 10, border: '1px solid #c5d9c2', cursor: 'pointer', fontFamily: 'inherit' }}>
                        + My Haul
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #ddd8cf', padding: '20px 24px', textAlign: 'center', fontSize: 12, color: '#8a7e72' }}>
          Made with <strong style={{ color: '#7a9e76' }}>Haul</strong> · Shopping comparison, simplified
        </footer>
    </div>
  );
}
