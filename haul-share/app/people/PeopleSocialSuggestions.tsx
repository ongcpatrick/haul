'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  haul_count: number;
  source: 'facebook' | 'twitter' | 'instagram' | 'mutual';
  source_username?: string;
}

interface Props {
  currentUserId: string;
  sourceBadge: Record<string, { label: string; color: string }>;
  alreadyFollowingIds: string[];
}

export default function PeopleSocialSuggestions({ currentUserId, sourceBadge, alreadyFollowingIds }: Props) {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState<Set<string>>(new Set(alreadyFollowingIds));

  useEffect(() => {
    fetch('/api/friends/discover')
      .then((r) => r.json())
      .then((j) => { if (j.success && Array.isArray(j.data)) setSuggestions(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const follow = async (userId: string) => {
    setFollowed((prev) => new Set([...prev, userId]));
    await fetch('/api/friends', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-44 h-40 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-6 text-center">
        <p className="text-sm text-[var(--muted)]">No matches yet — invite friends to join!</p>
        <Link href="/connect" className="mt-2 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">
          Invite via iMessage or link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {suggestions.map((u) => {
        const badge = sourceBadge[u.source];
        const isFollowed = followed.has(u.id);
        return (
          <div
            key={u.id}
            className="flex-shrink-0 w-44 bg-white border border-[var(--border)] rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-sm transition-shadow"
          >
            <Link href={`/u/${u.username}`}>
              {u.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border border-[var(--border)] mb-2" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xl mb-2">
                  {(u.display_name ?? u.username).charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <p className="font-semibold text-xs text-[var(--text)] truncate w-full">
              {u.display_name ?? u.username}
            </p>
            <p className="text-[10px] text-[var(--muted)] truncate w-full mb-1">@{u.username}</p>
            {badge && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white mb-2"
                style={{ background: badge.color }}
              >
                {badge.label}
              </span>
            )}
            <p className="text-[10px] text-[var(--muted)] mb-3">{u.haul_count} haul{u.haul_count !== 1 ? 's' : ''}</p>
            {isFollowed ? (
              <span className="text-xs font-semibold text-green-600">Following</span>
            ) : (
              <button
                type="button"
                onClick={() => follow(u.id)}
                className="w-full text-xs font-bold py-1.5 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-h)] transition-colors"
              >
                Follow
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
