'use client';

import Link from 'next/link';
import type { HaulWithAuthor } from '@/lib/types';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

export default function TrendingStrip({ hauls }: { hauls: HaulWithAuthor[] }) {
  if (!hauls.length) return null;

  return (
    <div>
      <p className="mb-3 text-[10px] font-medium tracking-[0.18em] uppercase" style={{ color: 'var(--muted)' }}>
        Trending
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {hauls.map((h) => {
          const thumb = h.products[0];
          const viewHref = h.share_id ? `/view/${h.share_id}` : `/u/${h.author.username}`;
          const reactions = Object.values(h.reaction_counts ?? {}).reduce((s, v) => s + v, 0);

          return (
            <Link
              key={h.id}
              href={viewHref}
              className="flex-shrink-0 overflow-hidden group"
              style={{ width: 120, borderRadius: 12, border: '1px solid var(--border)', background: '#fff' }}
            >
              {/* Image */}
              <div className="flex items-center justify-center overflow-hidden" style={{ height: 110, background: '#f5f3ef' }}>
                {thumb?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${WORKER}/proxy-image?url=${encodeURIComponent(thumb.imageUrl)}`}
                    alt={thumb.name}
                    className="w-full h-full object-contain"
                    style={{ padding: '12%' }}
                  />
                ) : (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--muted)', opacity: 0.4 }}>
                    {h.title?.charAt(0) ?? 'H'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="px-2.5 py-2">
                <p className="line-clamp-2 leading-snug text-[11px] font-medium group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text)' }}>
                  {h.title ?? 'Untitled'}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>@{h.author.username}</span>
                  {reactions > 0 && (
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{reactions} ♥</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
