'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { HaulWithAuthor } from '@/lib/types';

const WORKER = 'https://haul-ai.haulapp.workers.dev';
const REACTIONS = ['heart', 'fire', 'eyes'] as const;
type ReactionKey = (typeof REACTIONS)[number];

interface HaulCardProps {
  haul: HaulWithAuthor;
  currentUserId?: string | null;
  onReact?: (haulId: string, emoji: ReactionKey) => Promise<void>;
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

function formatPrice(n: number): string {
  return '$' + n.toFixed(2);
}

function ReactionIcon({ kind }: { kind: ReactionKey }) {
  const common = 'w-4 h-4';
  if (kind === 'heart')
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  if (kind === 'fire')
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function HaulCard({ haul, currentUserId, onReact }: HaulCardProps) {
  const [counts, setCounts] = useState<Record<string, number>>(haul.reaction_counts ?? {});
  const [busy, setBusy] = useState<ReactionKey | null>(null);

  const totalSavings = haul.products.reduce((sum, p) => {
    if (p.originalPrice != null && p.price != null && p.originalPrice > p.price) {
      return sum + (p.originalPrice - p.price);
    }
    return sum;
  }, 0);

  const thumbs = haul.products.slice(0, 3);
  const remaining = haul.products.length - thumbs.length;

  const href = haul.share_id ? `/view/${haul.share_id}` : `/u/${haul.author.username}`;

  const handleReact = async (e: React.MouseEvent, key: ReactionKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || !onReact || busy) return;
    setBusy(key);
    setCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    try {
      await onReact(haul.id, key);
    } catch {
      setCounts((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 1) - 1) }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-shadow">
      <Link href={href} className="block">
        {/* Image grid */}
        <div className="grid grid-cols-3 gap-1 bg-[var(--bg)] p-2 h-44">
          {thumbs.map((p, i) => (
            <div
              key={p.id}
              className="bg-white rounded-lg overflow-hidden flex items-center justify-center relative border border-[var(--border)]"
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${WORKER}/proxy-image?url=${encodeURIComponent(p.imageUrl)}`}
                  alt={p.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-[var(--muted)] text-xs">No image</div>
              )}
              {i === 2 && remaining > 0 && (
                <div className="absolute inset-0 bg-[var(--text)]/60 flex items-center justify-center text-white font-bold text-lg">
                  +{remaining}
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - thumbs.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="bg-white/50 rounded-lg border border-dashed border-[var(--border)]"
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-bold text-[var(--text)] leading-snug line-clamp-2">
            {haul.title ?? 'Untitled haul'}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>
              {haul.products.length} item{haul.products.length === 1 ? '' : 's'}
            </span>
            {totalSavings > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="font-semibold text-[var(--price)]">
                  Save {formatPrice(totalSavings)}
                </span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/u/${haul.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 group"
            >
              {haul.author.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={haul.author.avatar_url}
                  alt={haul.author.username}
                  className="w-7 h-7 rounded-full border border-[var(--border)]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-[var(--muted)]">
                  {haul.author.username[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                @{haul.author.username}
              </span>
            </Link>
            <span className="text-xs text-[var(--muted)] ml-auto">
              {timeAgo(haul.created_at)}
            </span>
          </div>
        </div>
      </Link>

      {/* Reaction bar */}
      <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-3 bg-[var(--bg)]/40">
        {REACTIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={(e) => handleReact(e, r)}
            disabled={!currentUserId || busy === r}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--primary)] disabled:opacity-50 transition-colors"
            aria-label={`React with ${r}`}
          >
            <ReactionIcon kind={r} />
            <span>{counts[r] ?? 0}</span>
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <CommentIcon />
          <span>{haul.comment_count ?? 0}</span>
        </div>
      </div>
    </article>
  );
}
