'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import ErrorBoundary from '@/app/components/ErrorBoundary';

type Tab = 'following' | 'explore';

interface Props {
  currentUserId: string;
  initialHauls: HaulWithAuthor[];
  hasFollows: boolean;
}

export default function FeedClient({ currentUserId, initialHauls, hasFollows }: Props) {
  const [tab, setTab] = useState<Tab>(hasFollows ? 'following' : 'explore');
  const [followingHauls, setFollowingHauls] = useState<HaulWithAuthor[]>(initialHauls);
  const [exploreHauls, setExploreHauls] = useState<HaulWithAuthor[]>([]);
  const [exploreLoaded, setExploreLoaded] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const loadExplore = useCallback(async () => {
    if (exploreLoaded) return;
    setExploreLoading(true);
    try {
      // Try personalized for-you first, fall back to recent if empty
      const forYouRes = await fetch('/api/explore?sort=for-you&limit=24');
      let hauls: HaulWithAuthor[] = [];
      if (forYouRes.ok) {
        const json = await forYouRes.json();
        if (json.success && Array.isArray(json.data)) hauls = json.data;
      }
      if (hauls.length === 0) {
        const fallbackRes = await fetch('/api/explore?limit=24');
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          if (json.success && Array.isArray(json.data)) hauls = json.data;
        }
      }
      setExploreHauls(hauls);
      setExploreLoaded(true);
    } finally {
      setExploreLoading(false);
    }
  }, [exploreLoaded]);

  useEffect(() => {
    if (tab === 'explore') loadExplore();
  }, [tab, loadExplore]);

  const refreshFollowing = useCallback(async () => {
    const res = await fetch('/api/feed?limit=40');
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) setFollowingHauls(json.data);
  }, []);

  useEffect(() => {
    const id = setInterval(refreshFollowing, 30_000);
    return () => clearInterval(id);
  }, [refreshFollowing]);

  const handleReact = async (haulId: string, emoji: string): Promise<void> => {
    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ haulId, emoji }),
    });
    if (!res.ok) throw new Error('Failed to react');
  };

  const handleDeleteFollowing = useCallback((haulId: string) => {
    setFollowingHauls((prev) => prev.filter((h) => h.id !== haulId));
  }, []);

  const handleDeleteExplore = useCallback((haulId: string) => {
    setExploreHauls((prev) => prev.filter((h) => h.id !== haulId));
  }, []);

  const activeHauls = tab === 'following' ? followingHauls : exploreHauls;
  const handleDelete = tab === 'following' ? handleDeleteFollowing : handleDeleteExplore;

  const filtered = query.trim()
    ? activeHauls.filter((h) => {
        const q = query.toLowerCase();
        if (h.title?.toLowerCase().includes(q)) return true;
        if (h.author.username.toLowerCase().includes(q)) return true;
        return Array.isArray(h.products) && h.products.some((p) => p.name?.toLowerCase().includes(q));
      })
    : activeHauls;

  const switchTab = (t: Tab) => {
    setTab(t);
    setQuery('');
    setSearching(false);
    if (t === 'explore') loadExplore();
  };

  return (
    <ErrorBoundary>
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => switchTab('following')}
            className="transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              color: tab === 'following' ? 'var(--text)' : 'var(--muted)',
              opacity: tab === 'following' ? 1 : 0.45,
            }}
          >
            Following
          </button>
          <button
            onClick={() => switchTab('explore')}
            className="transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 600,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              color: tab === 'explore' ? 'var(--text)' : 'var(--muted)',
              opacity: tab === 'explore' ? 1 : 0.45,
            }}
          >
            Discover
          </button>
        </div>

        {/* Search toggle */}
        <div className="flex items-center gap-2">
          {searching && (
            <input
              ref={searchRef}
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)] w-40"
              style={{ color: 'var(--text)' }}
            />
          )}
          <button
            onClick={() => {
              setSearching((s) => !s);
              setQuery('');
            }}
            className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
            style={{ color: query ? 'var(--primary)' : 'var(--muted)' }}
            aria-label="Toggle search"
          >
            {searching
              ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            }
          </button>
        </div>
      </div>

      {/* Content */}
      {exploreLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'following' && followingHauls.length === 0 ? (
        <EmptyFeed onDiscover={() => switchTab('explore')} />
      ) : tab === 'explore' && exploreHauls.length === 0 && exploreLoaded ? (
        <EmptyExplore />
      ) : filtered.length === 0 && query ? (
        <p className="text-center py-20 text-sm" style={{ color: 'var(--muted)' }}>
          Nothing found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        // Two-column editorial grid
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((h) => (
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
    </ErrorBoundary>
  );
}

function EmptyFeed({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" style={{ color: 'var(--muted)', opacity: 0.4, marginBottom: 20 }}>
        <circle cx="24" cy="12" r="3" />
        <path d="M24 14 C24 14, 24 18, 27 20" />
        <path d="M27 20 L39 29 Q42 30.5 39 32 L9 32 Q6 30.5 9 29 L21 20 C24 18 24 14 24 14" />
        <path d="M12 32 L11 44 Q11 45.5 12.5 45.5 L35.5 45.5 Q37 45.5 37 44 L36 32" />
      </svg>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--text)', marginBottom: 6 }}>
        Your feed is quiet
      </p>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Follow people to see what they're building.</p>
      <button
        onClick={onDiscover}
        className="text-xs font-semibold tracking-widest uppercase px-6 py-2.5 rounded-full transition-colors"
        style={{ background: 'var(--text)', color: '#fff' }}
      >
        Discover
      </button>
    </div>
  );
}

function EmptyExplore() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--text)', marginBottom: 6 }}>
        Nothing here yet
      </p>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Be the first to share a haul from the extension.</p>
    </div>
  );
}
