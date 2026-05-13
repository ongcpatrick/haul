'use client';

import { useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase-browser';
import type { HaulWithAuthor, Haul } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';
import ErrorBoundary from '@/app/components/ErrorBoundary';

interface Props {
  currentUserId: string;
  initialHauls: HaulWithAuthor[];
}

export default function FeedClient({ currentUserId, initialHauls }: Props) {
  const supabase = useSupabaseBrowser();
  const [hauls, setHauls] = useState<HaulWithAuthor[]>(initialHauls);

  useEffect(() => {
    const channel = supabase
      .channel('feed-hauls')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'hauls' },
        async (payload) => {
          const newHaul = payload.new as Haul;
          if (!newHaul.is_public) return;
          // Confirm author is followed
          const { data: follow } = await supabase
            .from('friendships')
            .select('id')
            .eq('requester_id', currentUserId)
            .eq('addressee_id', newHaul.user_id)
            .eq('status', 'accepted')
            .maybeSingle();
          if (!follow) return;

          const { data: author } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url')
            .eq('id', newHaul.user_id)
            .maybeSingle();
          if (!author) return;

          setHauls((prev) => [
            {
              ...newHaul,
              author,
              reaction_counts: {},
              comment_count: 0,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId]);

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
        description="Follow friends to see what they’re shopping for. Hauls appear here in real time."
        ctaLabel="Find people to follow"
        ctaHref="/circles"
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {hauls.map((h) => (
          <HaulCard
            key={h.id}
            haul={h}
            currentUserId={currentUserId}
            onReact={handleReact}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
}
