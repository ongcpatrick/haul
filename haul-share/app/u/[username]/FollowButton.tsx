'use client';

import { useState } from 'react';

interface Props {
  targetUserId: string;
  initialFollowing: boolean;
}

export default function FollowButton({ targetUserId, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetUserId, action: following ? 'unfollow' : 'follow' }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Request failed');
      }
      setFollowing(!following);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={
          following
            ? 'px-5 py-2.5 rounded-full bg-white border border-[var(--border)] text-[var(--text)] text-sm font-semibold hover:bg-[var(--surface)] disabled:opacity-60'
            : 'px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold disabled:opacity-60'
        }
      >
        {busy ? '…' : following ? 'Following' : 'Follow'}
      </button>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  );
}
