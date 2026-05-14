'use client';

import { useEffect, useState, useRef } from 'react';
import type { Haul } from '@/lib/types';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

interface Props {
  circleId: string;
  onAdded: (haul: Haul) => void;
  onClose: () => void;
}

function fmt(n: number) { return '$' + n.toFixed(2); }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AddHaulModal({ circleId, onAdded, onClose }: Props) {
  const [hauls, setHauls] = useState<Haul[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/hauls')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          // filter out hauls already in this circle
          setHauls(j.data.filter((h: Haul) => h.circle_id !== circleId));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [circleId]);

  // close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const post = async (haul: Haul) => {
    if (posting) return;
    setPosting(haul.id);
    try {
      const res = await fetch(`/api/hauls?id=${haul.id}&circleId=${circleId}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setDone((prev) => new Set(prev).add(haul.id));
      onAdded(json.data as Haul);
    } catch { /* noop */ }
    finally { setPosting(null); }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
    >
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Post a haul to this circle</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)]" aria-label="Close">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hauls.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--muted)]">You have no hauls to share yet.</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Save products from any store using the Haul extension, then come back here.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {hauls.map((h) => {
                const thumbs = h.products.slice(0, 3);
                const prices = h.products.map((p) => p.price).filter((p): p is number => p != null);
                const priceLabel = prices.length
                  ? `${fmt(Math.min(...prices))}${prices.length > 1 && Math.max(...prices) !== Math.min(...prices) ? ` – ${fmt(Math.max(...prices))}` : ''}`
                  : null;
                const isPosted = done.has(h.id);
                const isPosting = posting === h.id;

                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => !isPosted && post(h)}
                      disabled={isPosting || isPosted}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isPosted
                          ? 'border-green-200 bg-green-50'
                          : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface)] active:scale-[.98]'
                      } disabled:cursor-default`}
                    >
                      {/* thumbnail strip */}
                      <div className="flex gap-0.5 flex-shrink-0">
                        {thumbs.map((p) =>
                          p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={p.id}
                              src={`${WORKER}/proxy-image?url=${encodeURIComponent(p.imageUrl)}`}
                              alt={p.name}
                              className="w-14 h-14 rounded-lg object-contain bg-white border border-[var(--border)]"
                            />
                          ) : (
                            <div key={p.id} className="w-14 h-14 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--muted)]">
                              {p.siteName?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )
                        )}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--text)] truncate">
                          {h.title ?? `${h.products.length} item${h.products.length !== 1 ? 's' : ''}`}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {h.products.length} item{h.products.length !== 1 ? 's' : ''}
                          {priceLabel ? ` · ${priceLabel}` : ''}
                          {' · '}{timeAgo(h.created_at)}
                        </p>
                      </div>

                      {/* status */}
                      <div className="flex-shrink-0">
                        {isPosted ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Posted
                          </span>
                        ) : isPosting ? (
                          <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white">
                            Post
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
