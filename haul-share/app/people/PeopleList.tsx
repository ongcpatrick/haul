'use client';

import { useState } from 'react';
import Link from 'next/link';
import FollowButtonWrapper from './FollowButtonWrapper';

interface Person {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  haul_count: string;
}

interface Props {
  people: Person[];
  currentUserId: string;
  followingIds: string[];
}

export default function PeopleList({ people, currentUserId, followingIds }: Props) {
  const [query, setQuery] = useState('');
  const followingSet = new Set(followingIds);

  const filtered = query.trim()
    ? people.filter(
        (p) =>
          p.username.toLowerCase().includes(query.toLowerCase()) ||
          (p.display_name ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : people;

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--muted)] text-sm mb-3">
            {query ? `No users match "${query}"` : 'No other users yet.'}
          </p>
          {!query && (
            <Link href="/connect" className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Invite friends to join
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-4 bg-white border border-[var(--border)] rounded-2xl p-4 hover:shadow-sm transition-shadow"
            >
              {person.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-[var(--border)]" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                  {(person.display_name ?? person.username).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/u/${person.username}`} className="font-semibold text-[var(--text)] hover:text-[var(--primary)] truncate block transition-colors">
                  {person.display_name ?? person.username}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  @{person.username} &middot; {person.haul_count} haul{person.haul_count === '1' ? '' : 's'}
                </p>
              </div>
              <FollowButtonWrapper
                targetUserId={person.id}
                currentUserId={currentUserId}
                initiallyFollowing={followingSet.has(person.id)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
