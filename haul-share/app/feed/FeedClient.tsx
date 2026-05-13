'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const refresh = useCallback(async () => {
    const res = await fetch('/api/feed?limit=20');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {hauls.map((h) => (
          <HaulCard key={h.id} haul={h} currentUserId={currentUserId} onReact={handleReact} />
        ))}
      </div>
    </ErrorBoundary>
  );
}
