'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import CommentDrawer from '@/app/components/CommentDrawer';

const WORKER = 'https://haul-ai.haulapp.workers.dev';

interface Props {
  initialHauls: HaulWithAuthor[];
  currentUserId: string | null;
  profileUsername: string;
  profileDisplayName: string | null;
  isSelf?: boolean;
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

function ThumbImg({ imageUrl }: { imageUrl: string | null }) {
  const [stage, setStage] = useState<'direct' | 'proxy' | 'failed'>('direct');
  const proxyUrl = imageUrl ? `${WORKER}/proxy-image?url=${encodeURIComponent(imageUrl)}` : null;
  const src = stage === 'direct' ? imageUrl : stage === 'proxy' ? proxyUrl : null;
  if (!src) return <div className="w-full h-full bg-[var(--surface)]" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={stage}
      src={src}
      alt=""
      className="w-full h-full object-contain"
      style={{ padding: '8%' }}
      onError={() => {
        if (stage === 'direct' && proxyUrl) setStage('proxy');
        else setStage('failed');
      }}
    />
  );
}

// ── Expanded haul drawer ──────────────────────────────────────────────────────

function HaulDrawer({
  haul,
  currentUserId,
  onClose,
  onDelete,
  isSelf,
}: {
  haul: HaulWithAuthor;
  currentUserId: string | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  isSelf?: boolean;
}) {
  const [heartCount, setHeartCount] = useState(haul.reaction_counts?.heart ?? 0);
  const [hearted, setHearted] = useState(false);
  const [commentCount, setCommentCount] = useState(haul.comment_count ?? 0);
  const [deleting, setDeleting] = useState(false);
  const safeProducts = Array.isArray(haul.products) ? haul.products : [];
  const viewHref = haul.share_id ? `/view/${haul.share_id}` : null;

  const handleHeart = async () => {
    if (!currentUserId) return;
    const next = !hearted;
    setHearted(next);
    setHeartCount((c) => c + (next ? 1 : -1));
    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ haulId: haul.id, emoji: 'heart' }),
      });
    } catch {
      setHearted(!next);
      setHeartCount((c) => c + (next ? -1 : 1));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this haul?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hauls?id=${haul.id}`, { method: 'DELETE' });
      if (res.ok) { onDelete(haul.id); onClose(); }
    } finally { setDeleting(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-[var(--text)] text-base truncate leading-tight">
              {haul.title ?? 'Untitled haul'}
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {safeProducts.length} {safeProducts.length === 1 ? 'piece' : 'pieces'} · {timeAgo(haul.created_at)}
              {!haul.is_public && <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V6a3 3 0 0 0-3-3z"/></svg>Private</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg)] text-[var(--muted)] transition-colors flex-shrink-0 ml-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Products scroll */}
        <div className="flex-1 overflow-y-auto">
          {safeProducts.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-[var(--muted)]">No products yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {safeProducts.map((p: { id: string; name: string; imageUrl: string | null; price?: number; siteName: string; url?: string }) => (
                <a
                  key={p.id}
                  href={p.url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg)] transition-colors"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="w-16 h-16 rounded-xl bg-[var(--surface)] flex-shrink-0 overflow-hidden">
                    <ThumbImg imageUrl={p.imageUrl} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{p.siteName}</p>
                  </div>
                  {p.price != null && (
                    <p className="text-sm font-bold text-[var(--text)] flex-shrink-0">${p.price}</p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-[var(--border)] flex items-center gap-3">
          <button
            type="button"
            onClick={handleHeart}
            disabled={!currentUserId}
            className="flex items-center gap-1.5 transition-all disabled:opacity-30"
            style={{ color: hearted ? '#d94f4f' : 'var(--muted)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={hearted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{heartCount || ''}</span>
          </button>

          <CommentDrawer
            haulId={haul.id}
            initialCount={commentCount}
            isLoggedIn={!!currentUserId}
            onCountChange={setCommentCount}
          />

          <div className="flex-1" />

          {isSelf && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              Delete
            </button>
          )}

          {viewHref && (
            <Link
              href={viewHref}
              className="px-5 py-2.5 rounded-full text-white text-xs font-bold tracking-wide transition-opacity hover:opacity-80"
              style={{ background: 'var(--primary)' }}
            >
              Open haul →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grid tile ─────────────────────────────────────────────────────────────────

function HaulTile({
  haul,
  onClick,
}: {
  haul: HaulWithAuthor;
  onClick: () => void;
}) {
  const safeProducts = Array.isArray(haul.products) ? haul.products : [];
  const firstImg = safeProducts[0]?.imageUrl ?? null;
  const count = safeProducts.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ aspectRatio: '1 / 1' }}
    >
      {/* Main image */}
      <div className="w-full h-full">
        {firstImg ? (
          <ThumbImg imageUrl={firstImg} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="text-white text-center">
          <p className="text-sm font-bold">{count} {count === 1 ? 'piece' : 'pieces'}</p>
        </div>
      </div>

      {/* Corner badges */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {!haul.is_public && (
          <span className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V6a3 3 0 0 0-3-3z"/>
            </svg>
          </span>
        )}
        {count > 1 && (
          <span className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
        )}
      </div>

      {/* Title bar at bottom on hover */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 translate-y-full group-hover:translate-y-0 transition-transform"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
        <p className="text-white text-xs font-semibold truncate">{haul.title ?? 'Untitled'}</p>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfileHauls({ initialHauls, currentUserId, profileUsername, profileDisplayName, isSelf }: Props) {
  const [hauls, setHauls] = useState<HaulWithAuthor[]>(initialHauls);
  const [activeHaul, setActiveHaul] = useState<HaulWithAuthor | null>(null);
  const [tab, setTab] = useState<'all' | 'public' | 'private'>('all');

  const handleDelete = useCallback((haulId: string) => {
    setHauls((prev) => prev.filter((h) => h.id !== haulId));
  }, []);

  const displayed = hauls.filter((h) => {
    if (tab === 'public') return h.is_public;
    if (tab === 'private') return !h.is_public;
    return true;
  });

  const publicCount = hauls.filter((h) => h.is_public).length;
  const privateCount = hauls.filter((h) => !h.is_public).length;

  if (hauls.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <p className="font-semibold text-[var(--text)]">No hauls yet</p>
        <p className="text-sm text-[var(--muted)] mt-1">
          {isSelf ? 'Save items from the extension to create your first haul.' : `${profileDisplayName ?? profileUsername} hasn't shared anything yet.`}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Tabs (only shown to self since they have public + private) */}
      {isSelf && (privateCount > 0 || publicCount > 0) && (
        <div className="flex gap-0 mb-6 border-b border-[var(--border)]">
          {(['all', 'public', 'private'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2"
              style={{
                borderBottomColor: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
              }}
            >
              {t === 'all' ? `All (${hauls.length})` : t === 'public' ? `Public (${publicCount})` : `Private (${privateCount})`}
            </button>
          ))}
        </div>
      )}

      {/* Instagram-style 3-col grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {displayed.map((h) => (
          <HaulTile key={h.id} haul={h} onClick={() => setActiveHaul(h)} />
        ))}
      </div>

      {/* Drawer */}
      {activeHaul && (
        <HaulDrawer
          haul={activeHaul}
          currentUserId={currentUserId}
          onClose={() => setActiveHaul(null)}
          onDelete={handleDelete}
          isSelf={isSelf}
        />
      )}
    </>
  );
}
