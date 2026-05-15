'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Circle, CircleMember, Haul, HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import AddHaulModal from '@/app/components/AddHaulModal';
import ErrorBoundary from '@/app/components/ErrorBoundary';

interface Props {
  circle: Circle;
  members: CircleMember[];
  initialHauls: HaulWithAuthor[];
  currentUserId: string;
}

export default function CircleClient({ circle, members, initialHauls, currentUserId }: Props) {
  const [hauls, setHauls] = useState<HaulWithAuthor[]>(initialHauls);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const inviteUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/circles/join/${circle.invite_code}`;
  }, [circle.invite_code]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/circles/${circle.id}`);
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data?.hauls)) setHauls(json.data.hauls);
  }, [circle.id]);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const copyInvite = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const compareInExtension = (): void => {
    const allProductIds = hauls.flatMap((h) => (Array.isArray(h.products) ? h.products : []).map((p) => p.id));
    window.location.href = `haul://compare?ids=${allProductIds.join(',')}`;
  };

  const handleReact = async (haulId: string, emoji: string): Promise<void> => {
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ haulId, emoji }),
    });
    if (!res.ok) throw new Error('Failed to react');
  };

  const handleDelete = useCallback((haulId: string) => {
    setHauls((prev) => prev.filter((h) => h.id !== haulId));
  }, []);

  // when a haul is posted to the circle via the modal, refresh so we get
  // the full enriched version (author, reactions, etc.)
  const handleHaulAdded = useCallback((_haul: Haul) => {
    refresh();
  }, [refresh]);

  return (
    <ErrorBoundary>
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* header */}
        <header className="pb-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-extrabold text-[var(--text)]">{circle.name}</h1>
          {circle.description && (
            <p className="mt-1.5 text-sm text-[var(--muted)] max-w-prose">{circle.description}</p>
          )}

          {/* member avatars */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {members.slice(0, 6).map((m) =>
                m.user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={m.user_id} src={m.user.avatar_url} alt={m.user.username} className="w-8 h-8 rounded-full border-2 border-white" title={`@${m.user.username}`} />
                ) : (
                  <div key={m.user_id} className="w-8 h-8 rounded-full bg-[var(--surface)] border-2 border-white flex items-center justify-center text-xs font-bold text-[var(--muted)]" title={m.user ? `@${m.user.username}` : ''}>
                    {m.user?.username[0]?.toUpperCase() ?? '?'}
                  </div>
                )
              )}
            </div>
            <span className="text-xs text-[var(--muted)]">{members.length} member{members.length === 1 ? '' : 's'}</span>
          </div>

          {/* actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post a haul
            </button>
            <button type="button" onClick={copyInvite} className="px-4 py-2 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary)] text-sm font-semibold text-[var(--text)]">
              {copied ? 'Copied!' : 'Invite friends'}
            </button>
            <button type="button" onClick={compareInExtension} disabled={hauls.length === 0} className="px-4 py-2 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary)] text-sm font-semibold text-[var(--text)] disabled:opacity-40">
              Compare all
            </button>
          </div>
        </header>

        {/* haul feed */}
        <section className="mt-6">
          {hauls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="font-bold text-[var(--text)] text-lg">Nothing shared yet</p>
              <p className="mt-1 text-sm text-[var(--muted)] max-w-xs">Be the first — post one of your hauls so the group can weigh in.</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white font-semibold text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Post a haul
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {hauls.map((h) => (
                <HaulCard
                  key={h.id}
                  haul={h}
                  currentUserId={currentUserId}
                  onReact={handleReact}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <AddHaulModal
          circleId={circle.id}
          onAdded={handleHaulAdded}
          onClose={() => setShowModal(false)}
        />
      )}
    </ErrorBoundary>
  );
}
