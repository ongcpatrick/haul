import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient, getCurrentDbUserId } from '@/lib/supabase-server';
import type { HaulWithAuthor, Haul, User } from '@/lib/types';
import FeedClient from './FeedClient';
import EmptyState from '@/app/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/feed');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Your Feed</h1>
        <EmptyState
          title="Finish setting up your profile"
          description="Open the Haul extension and complete profile setup to start following people."
        />
      </div>
    );
  }

  const initial = await loadFeed(dbUserId);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Your Feed</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Latest hauls from people you follow.
        </p>
      </header>
      <FeedClient currentUserId={dbUserId} initialHauls={initial} />
    </div>
  );
}

async function loadFeed(dbUserId: string): Promise<HaulWithAuthor[]> {
  const admin = getSupabaseAdminClient();

  const { data: follows } = await admin
    .from('friendships')
    .select('addressee_id')
    .eq('requester_id', dbUserId)
    .eq('status', 'accepted');

  const followIds = (follows ?? []).map((f) => f.addressee_id as string);
  if (followIds.length === 0) return [];

  const { data: hauls } = await admin
    .from('hauls')
    .select('*')
    .in('user_id', followIds)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(40);

  return enrichHauls(hauls ?? []);
}

export async function enrichHauls(hauls: Haul[]): Promise<HaulWithAuthor[]> {
  if (hauls.length === 0) return [];
  const admin = getSupabaseAdminClient();
  const userIds = Array.from(new Set(hauls.map((h) => h.user_id)));
  const haulIds = hauls.map((h) => h.id);

  const [{ data: users }, { data: reactions }, { data: comments }] = await Promise.all([
    admin.from('users').select('id, username, display_name, avatar_url').in('id', userIds),
    admin.from('reactions').select('haul_id, emoji').in('haul_id', haulIds),
    admin.from('comments').select('haul_id').in('haul_id', haulIds),
  ]);

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>>();
  for (const u of users ?? []) userMap.set(u.id as string, u as User);

  const reactionCounts = new Map<string, Record<string, number>>();
  for (const r of reactions ?? []) {
    const key = r.haul_id as string;
    const cur = reactionCounts.get(key) ?? {};
    cur[r.emoji as string] = (cur[r.emoji as string] ?? 0) + 1;
    reactionCounts.set(key, cur);
  }

  const commentCounts = new Map<string, number>();
  for (const c of comments ?? []) {
    const key = c.haul_id as string;
    commentCounts.set(key, (commentCounts.get(key) ?? 0) + 1);
  }

  return hauls.map((h) => ({
    ...h,
    author: userMap.get(h.user_id) ?? {
      id: h.user_id,
      username: 'unknown',
      display_name: null,
      avatar_url: null,
    },
    reaction_counts: reactionCounts.get(h.id) ?? {},
    comment_count: commentCounts.get(h.id) ?? 0,
  }));
}
