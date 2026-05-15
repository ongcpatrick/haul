'use client';

import Link from 'next/link';
import type { HaulWithAuthor } from '@/lib/types';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

function fmt(n: number) { return '$' + n.toFixed(2); }

function totalReactions(counts: Record<string, number> = {}) {
  return Object.values(counts).reduce((s, v) => s + v, 0);
}

export default function TrendingStrip({ hauls }: { hauls: HaulWithAuthor[] }) {
  if (!hauls.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Trending this week</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {hauls.map((h) => {
          const thumb = h.products[0];
          const viewHref = h.share_id ? `/view/${h.share_id}` : `/u/${h.author.username}`;
          const prices = h.products.map((p) => p.price).filter((p): p is number => p != null);
          const minPrice = prices.length ? Math.min(...prices) : null;
          const reactions = totalReactions(h.reaction_counts);

          return (
            <Link
              key={h.id}
              href={viewHref}
              className="flex-shrink-0 w-36 bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md hover:border-[var(--primary)] transition-all group"
            >
              {/* Thumbnail */}
              <div className="h-24 bg-[var(--bg)] flex items-center justify-center overflow-hidden">
                {thumb?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${WORKER}/proxy-image?url=${encodeURIComponent(thumb.imageUrl)}`}
                    alt={thumb.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-[var(--muted)]">No image</span>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-semibold text-[var(--text)] line-clamp-2 leading-snug group-hover:text-[var(--primary)]">
                  {h.title ?? 'Untitled haul'}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  {minPrice != null && (
                    <span className="text-xs text-[var(--primary)] font-bold">{fmt(minPrice)}+</span>
                  )}
                  {reactions > 0 && (
                    <span className="text-xs text-[var(--muted)]">{reactions} ♥</span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">@{h.author.username}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
