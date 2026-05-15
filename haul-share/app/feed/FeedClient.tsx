'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';
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
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const loadExplore = useCallback(async () => {
    if (exploreLoaded) return;
    setExploreLoading(true);
    try {
      const res = await fetch('/api/explore?limit=24');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setExploreHauls(json.data);
        setExploreLoaded(true);
      }
    } finally {
      setExploreLoading(false);
    }
  }, [exploreLoaded]);

  // Load explore immediately if it's the default tab
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeHauls;
    return activeHauls.filter((h) => {
      if (h.title?.toLowerCase().includes(q)) return true;
      if (h.author.username.toLowerCase().includes(q)) return true;
      return h.products.some((p) => p.name?.toLowerCase().includes(q));
    });
  }, [activeHauls, query]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setQuery('');
    if (t === 'explore') loadExplore();
  };

  return (
    <ErrorBoundary>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)]">
        <TabButton active={tab === 'following'} onClick={() => switchTab('following')}>
          Following
        </TabButton>
        <TabButton active={tab === 'explore'} onClick={() => switchTab('explore')}>
          Explore
        </TabButton>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={searchRef}
          type="search"
          placeholder={tab === 'explore' ? 'Search all hauls...' : 'Search your feed...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      {tab === 'following' && followingHauls.length === 0 ? (
        <EmptyState
          title="Your feed is empty"
          description="Find people to follow, or explore public hauls from the community."
          ctaLabel="Explore public hauls"
          ctaHref="#"
          onCtaClick={() => switchTab('explore')}
        />
      ) : tab === 'explore' && exploreLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'explore' && exploreHauls.length === 0 && exploreLoaded ? (
        <EmptyState
          title="No public hauls yet"
          description="Share a comparison from the Haul extension to be the first!"
        />
      ) : filtered.length === 0 && query ? (
        <p className="text-center text-sm text-[var(--muted)] py-12">
          No hauls match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="flex flex-col gap-5">
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

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
        active
          ? 'bg-white text-[var(--primary)] shadow-sm'
          : 'text-[var(--muted)] hover:text-[var(--text)]'
      }`}
    >
      {children}
    </button>
  );
}
