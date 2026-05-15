'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import CommentDrawer from './CommentDrawer';

const WORKER = 'https://haul-ai.haulapp.workers.dev';
const REACTIONS = ['heart'] as const;
type ReactionKey = (typeof REACTIONS)[number];

interface HaulCardProps {
  haul: HaulWithAuthor;
  currentUserId?: string | null;
  onReact?: (haulId: string, emoji: ReactionKey) => Promise<void>;
  onDelete?: (haulId: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function fmt(n: number) { return '$' + n.toFixed(2); }

const EMOJI: Record<ReactionKey, string> = { heart: '♥' };

export default function HaulCard({ haul, currentUserId, onReact, onDelete }: HaulCardProps) {
  const [counts, setCounts] = useState<Record<string, number>>(haul.reaction_counts ?? {});
  const [myReacts, setMyReacts] = useState<Set<ReactionKey>>(new Set());
  const [busy, setBusy] = useState<ReactionKey | null>(null);
  const [commentCount, setCommentCount] = useState(haul.comment_count ?? 0);
  const [deleting, setDeleting] = useState(false);
  const [forking, setForking] = useState(false);
  const [forked, setForked] = useState(false);

  const isOwn = !!currentUserId && haul.author.id === currentUserId;
  const safeProducts = Array.isArray(haul.products) ? haul.products : [];

  const prices = safeProducts.map((p) => p.price).filter((p): p is number => p != null);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const priceRange = minPrice != null
    ? minPrice === maxPrice ? fmt(minPrice) : `${fmt(minPrice)} – ${fmt(maxPrice!)}`
    : null;

  const totalSavings = safeProducts.reduce((sum, p) => {
    if (p.originalPrice != null && p.price != null && p.originalPrice > p.price)
      return sum + (p.originalPrice - p.price);
    return sum;
  }, 0);

  const thumbs = safeProducts.slice(0, 3);
  const remaining = safeProducts.length - thumbs.length;
  const viewHref = haul.share_id ? `/view/${haul.share_id}` : `/u/${haul.author.username}`;

  const handleReact = async (key: ReactionKey) => {
    if (!currentUserId || !onReact || busy) return;
    const isToggle = myReacts.has(key);
    setBusy(key);
    setMyReacts((prev) => {
      const next = new Set(prev);
      if (isToggle) next.delete(key);
      else next.add(key);
      return next;
    });
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + (isToggle ? -1 : 1)) }));
    try { await onReact(haul.id, key); } catch {
      setMyReacts((prev) => {
        const next = new Set(prev);
        if (isToggle) next.add(key);
        else next.delete(key);
        return next;
      });
      setCounts((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + (isToggle ? 1 : -1)) }));
    } finally { setBusy(null); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this haul? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hauls?id=${haul.id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(haul.id);
    } finally { setDeleting(false); }
  };

  const handleFork = async () => {
    if (!currentUserId) { window.location.href = '/sign-in'; return; }
    if (forked || forking) return;
    setForking(true);
    try {
      const res = await fetch('/api/hauls', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ products: haul.products, title: haul.title, isPublic: true }),
      });
      if (res.ok) setForked(true);
    } finally { setForking(false); }
  };

  return (
    <article className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-card">

      {/* Author row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
        <Link href={`/u/${haul.author.username}`} className="flex items-center gap-2.5 group flex-1 min-w-0">
          {haul.author.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={haul.author.avatar_url} alt="" className="w-9 h-9 rounded-full border border-[var(--border)] flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {haul.author.username[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--primary)] truncate">
              @{haul.author.username}
            </p>
            <p className="text-xs text-[var(--muted)]">{timeAgo(haul.created_at)}</p>
          </div>
        </Link>

        {isOwn && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete haul"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19,6l-1,14H6L5,6" />
              <path d="M10,11v6M14,11v6" />
              <path d="M9,6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      {/* Product image collage */}
      <Link href={viewHref} className="block">
        <div className={`grid gap-0.5 bg-[var(--bg)] ${thumbs.length === 1 ? 'grid-cols-1' : thumbs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`} style={{ height: 220 }}>
          {thumbs.map((p, i) => (
            <div key={p.id} className="relative overflow-hidden bg-white flex items-center justify-center">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${WORKER}/proxy-image?url=${encodeURIComponent(p.imageUrl)}`}
                  alt={p.name}
                  className="w-full h-full object-contain p-3"
                />
              ) : (
                <span className="text-xs text-[var(--muted)]">No image</span>
              )}
              {i === 2 && remaining > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                  +{remaining}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Title + meta */}
        <div className="px-4 pt-3 pb-2">
          <h3 className="font-bold text-[var(--text)] text-base leading-snug line-clamp-2">
            {haul.title ?? 'Untitled haul'}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            <span>{safeProducts.length} item{safeProducts.length !== 1 ? 's' : ''}</span>
            {priceRange && <span className="font-semibold text-[var(--text)]">{priceRange}</span>}
            {totalSavings > 0 && (
              <span className="font-semibold text-[var(--price)] bg-[var(--price-bg,#fef3c7)] px-2 py-0.5 rounded-full">
                Save {fmt(totalSavings)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action bar */}
      <div className="px-4 py-2.5 flex items-center gap-4 border-t border-[var(--border)]">
        {/* Reactions */}
        <div className="flex items-center gap-3 flex-1">
          {REACTIONS.map((r) => {
            const active = myReacts.has(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleReact(r)}
                disabled={!currentUserId || busy === r}
                className={`flex items-center gap-1 text-sm font-semibold transition-all disabled:opacity-40 ${
                  active ? 'text-[var(--primary)] scale-110' : 'text-[var(--muted)] hover:text-[var(--primary)]'
                }`}
              >
                <span>{EMOJI[r]}</span>
                <span className="text-xs">{counts[r] ?? 0}</span>
              </button>
            );
          })}

          <CommentDrawer
            haulId={haul.id}
            initialCount={commentCount}
            isLoggedIn={!!currentUserId}
            onCountChange={setCommentCount}
          />
        </div>

        {/* View + Fork */}
        <div className="flex items-center gap-2">
          <Link
            href={viewHref}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] transition-colors"
          >
            View
          </Link>
          <button
            type="button"
            onClick={handleFork}
            disabled={forking || forked}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${
              forked
                ? 'bg-green-500 text-white'
                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-h)]'
            }`}
          >
            {forked ? 'Forked!' : forking ? 'Forking…' : '+ Fork'}
          </button>
        </div>
      </div>
    </article>
  );
}
