'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';
import ErrorBoundary from '@/app/components/ErrorBoundary';

interface Props {
  currentUserId: string;
  initialHauls: HaulWithAuthor[];
}

export default function FeedClient({ currentUserId, initialHauls }: Props) {
  const [hauls, setHauls] = useState<HaulWithAuthor[]>(initialHauls);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    const res = await fetch('/api/feed?limit=40');
    if (!res.ok) return;
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) setHauls(json.data);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hauls;
    return hauls.filter((h) => {
      if (h.title?.toLowerCase().includes(q)) return true;
      if (h.author.username.toLowerCase().includes(q)) return true;
      return h.products.some((p) => p.name?.toLowerCase().includes(q));
    });
  }, [hauls, query]);

  if (hauls.length === 0) {
    return (
      <EmptyState
        title="Your feed is empty"
        description="Follow people to see what they're shopping for."
        ctaLabel="Discover people to follow"
        ctaHref="/people"
      />
    );
  }

  return (
    <ErrorBoundary>
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search hauls, people, or products..."
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

      {filtered.length === 0 ? (
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
