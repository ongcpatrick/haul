'use client';

import { useState } from 'react';

interface Props {
  targetUserId: string;
  currentUserId: string;
  initiallyFollowing: boolean;
}

export default function FollowButtonWrapper({ targetUserId, initiallyFollowing }: Props) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async (): Promise<void> => {
    setBusy(true);
    try {
      await fetch('/api/friends', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targetUserId, action: following ? 'unfollow' : 'follow' }),
      });
      setFollowing(!following);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        following
          ? 'flex-shrink-0 px-4 py-2 rounded-full bg-white border border-[var(--border)] text-[var(--text)] text-sm font-semibold hover:bg-[var(--surface)] disabled:opacity-60'
          : 'flex-shrink-0 px-4 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold disabled:opacity-60'
      }
    >
      {busy ? '…' : following ? 'Following' : 'Follow'}
    </button>
  );
}
