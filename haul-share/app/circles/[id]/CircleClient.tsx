'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Circle, CircleMember, HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';
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
    const allProductIds = hauls.flatMap((h) => h.products.map((p) => p.id));
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

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="pb-8 border-b border-[var(--border)]">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">{circle.name}</h1>
          {circle.description && (
            <p className="mt-2 text-sm text-[var(--muted)] max-w-prose">{circle.description}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {members.slice(0, 6).map((m) =>
                  m.user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={m.user_id} src={m.user.avatar_url} alt={m.user.username} className="w-9 h-9 rounded-full border-2 border-white" title={`@${m.user.username}`} />
                  ) : (
                    <div key={m.user_id} className="w-9 h-9 rounded-full bg-[var(--surface)] border-2 border-white flex items-center justify-center text-xs font-bold text-[var(--muted)]" title={m.user ? `@${m.user.username}` : ''}>
                      {m.user?.username[0]?.toUpperCase() ?? '?'}
                    </div>
                  )
                )}
              </div>
              <span className="text-sm text-[var(--muted)]">{members.length} member{members.length === 1 ? '' : 's'}</span>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <button type="button" onClick={copyInvite} className="px-4 py-2 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary)] text-sm font-semibold text-[var(--text)]">
                {copied ? 'Copied!' : 'Copy invite link'}
              </button>
              <button type="button" onClick={compareInExtension} disabled={hauls.length === 0} className="px-4 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold disabled:opacity-50">
                Compare all in circle
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8">
          {hauls.length === 0 ? (
            <EmptyState title="No hauls in this circle yet" description="Share a haul from the Haul extension and tag this circle to get started." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hauls.map((h) => (
                <HaulCard key={h.id} haul={h} currentUserId={currentUserId} onReact={handleReact} />
              ))}
            </div>
          )}
        </section>
      </div>
    </ErrorBoundary>
  );
}
