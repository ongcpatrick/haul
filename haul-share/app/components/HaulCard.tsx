'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import CommentDrawer from './CommentDrawer';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

interface HaulCardProps {
  haul: HaulWithAuthor;
  currentUserId?: string | null;
  onReact?: (haulId: string, emoji: 'heart') => Promise<void>;
  onDelete?: (haulId: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HaulCard({ haul, currentUserId, onReact, onDelete }: HaulCardProps) {
  const [heartCount, setHeartCount] = useState<number>(haul.reaction_counts?.heart ?? 0);
  const [hearted, setHearted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commentCount, setCommentCount] = useState(haul.comment_count ?? 0);
  const [deleting, setDeleting] = useState(false);

  const isOwn = !!currentUserId && haul.author.id === currentUserId;
  const safeProducts = Array.isArray(haul.products) ? haul.products : [];
  const viewHref = haul.share_id ? `/view/${haul.share_id}` : `/u/${haul.author.username}`;

  const handleHeart = async () => {
    if (!currentUserId || !onReact || busy) return;
    setBusy(true);
    const next = !hearted;
    setHearted(next);
    setHeartCount((c) => c + (next ? 1 : -1));
    try { await onReact(haul.id, 'heart'); } catch {
      setHearted(!next);
      setHeartCount((c) => c + (next ? -1 : 1));
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this haul?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hauls?id=${haul.id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(haul.id);
    } finally { setDeleting(false); }
  };

  return (
    <article className="group bg-white overflow-hidden" style={{ borderRadius: 16, border: '1px solid var(--border)' }}>

      {/* Image collage — editorial layout */}
      <Link href={viewHref} className="block relative" style={{ height: 300 }}>
        <ImageCollage products={safeProducts} />

        {/* Author overlay — bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)' }}>
          <Link href={`/u/${haul.author.username}`} className="flex items-center gap-2">
            {haul.author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={haul.author.avatar_url} alt="" className="w-7 h-7 rounded-full flex-shrink-0" style={{ border: '1.5px solid rgba(255,255,255,0.5)' }} />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--primary)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' }}>
                {haul.author.username[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="text-xs font-medium text-white/90">@{haul.author.username}</span>
          </Link>
          <span className="text-[10px] text-white/60">{timeAgo(haul.created_at)}</span>
        </div>

        {isOwn && (
          <button
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            disabled={deleting}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-40"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            aria-label="Delete"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </Link>

      {/* Card body */}
      <div className="px-4 pt-3 pb-3">
        <Link href={viewHref}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.25, color: 'var(--text)', letterSpacing: '-0.01em' }}
            className="line-clamp-2 hover:opacity-70 transition-opacity">
            {haul.title ?? 'Untitled'}
          </h3>
        </Link>
        <p className="mt-0.5 text-[11px] tracking-wide" style={{ color: 'var(--muted)' }}>
          {safeProducts.length} {safeProducts.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {/* Action bar */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <button
          type="button"
          onClick={handleHeart}
          disabled={!currentUserId || busy}
          className="flex items-center gap-1.5 transition-all disabled:opacity-40"
          style={{ color: hearted ? '#e07070' : 'var(--muted)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill={hearted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{heartCount || ''}</span>
        </button>

        <CommentDrawer
          haulId={haul.id}
          initialCount={commentCount}
          isLoggedIn={!!currentUserId}
          onCountChange={setCommentCount}
        />

        <div className="flex-1" />

        <Link
          href={viewHref}
          className="text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-60"
          style={{ color: 'var(--text)' }}
        >
          View →
        </Link>
      </div>
    </article>
  );
}

// ── Editorial image collage ───────────────────────────────────────────────────

function ImageCollage({ products }: { products: HaulWithAuthor['products'] }) {
  const thumbs = products.slice(0, 3);

  if (thumbs.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'var(--surface)' }}>
        <FashionIllustration />
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>No preview</span>
      </div>
    );
  }

  if (thumbs.length === 1) {
    return (
      <div className="w-full h-full" style={{ background: '#f5f3ef' }}>
        <ProductThumb product={thumbs[0]} />
      </div>
    );
  }

  if (thumbs.length === 2) {
    return (
      <div className="w-full h-full grid grid-cols-2" style={{ gap: 1, background: 'var(--border)' }}>
        {thumbs.map((p) => <ProductThumb key={p.id} product={p} />)}
      </div>
    );
  }

  // 3+ — editorial split: large left (60%), stacked right (40%)
  const remaining = products.length - 3;
  return (
    <div className="w-full h-full flex" style={{ gap: 1, background: 'var(--border)' }}>
      <div className="h-full" style={{ flex: '0 0 60%' }}>
        <ProductThumb product={thumbs[0]} />
      </div>
      <div className="h-full flex flex-col" style={{ flex: '0 0 calc(40% - 1px)', gap: 1 }}>
        <div className="flex-1"><ProductThumb product={thumbs[1]} /></div>
        <div className="flex-1 relative"><ProductThumb product={thumbs[2]} />
          {remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              +{remaining}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ product }: { product: { id: string; name: string; imageUrl: string | null; siteName: string } }) {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'failed'>('direct');
  const proxyUrl = product.imageUrl
    ? `${WORKER}/proxy-image?url=${encodeURIComponent(product.imageUrl)}`
    : null;

  const src = stage === 'direct' ? product.imageUrl : stage === 'proxy' ? proxyUrl : null;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ background: '#f5f3ef' }}>
      {src && stage !== 'failed' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={stage}
          src={src}
          alt={product.name}
          className="w-full h-full object-contain"
          style={{ padding: '10%' }}
          onError={() => {
            if (stage === 'direct' && proxyUrl) setStage('proxy');
            else setStage('failed');
          }}
        />
      ) : (
        <span className="text-2xl font-light" style={{ fontFamily: 'var(--font-display)', color: 'var(--muted)' }}>
          {product.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

// Thin-line fashion illustration for empty state
function FashionIllustration() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', opacity: 0.5 }}>
      {/* Hanger */}
      <path d="M32 10 C32 10, 32 14, 36 16" />
      <circle cx="32" cy="9" r="2" />
      <path d="M36 16 L52 28 Q56 30 52 32 L12 32 Q8 30 12 28 L28 16 C32 14 32 10 32 10" />
      {/* Garment body */}
      <path d="M16 32 L14 52 Q14 54 16 54 L48 54 Q50 54 50 52 L48 32" />
      {/* Subtle fold line */}
      <path d="M22 38 Q32 42 42 38" strokeOpacity="0.5" />
    </svg>
  );
}
