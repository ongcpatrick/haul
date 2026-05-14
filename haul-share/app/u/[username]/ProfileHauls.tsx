'use client';

import { useState, useCallback } from 'react';
import type { HaulWithAuthor } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';

interface Props {
  initialHauls: HaulWithAuthor[];
  currentUserId: string | null;
  profileUsername: string;
  profileDisplayName: string | null;
}

export default function ProfileHauls({ initialHauls, currentUserId, profileUsername, profileDisplayName }: Props) {
  const [hauls, setHauls] = useState<HaulWithAuthor[]>(initialHauls);

  const handleDelete = useCallback((haulId: string) => {
    setHauls((prev) => prev.filter((h) => h.id !== haulId));
  }, []);

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
        title="No public hauls yet"
        description={`${profileDisplayName ?? profileUsername} hasn't shared anything publicly.`}
      />
    );
  }

  return (
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
  );
}
