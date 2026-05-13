import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import type { HaulWithAuthor, User } from '@/lib/types';
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
        <p className="mt-1 text-sm text-[var(--muted)]">Latest hauls from people you follow.</p>
      </header>
      <FeedClient currentUserId={dbUserId} initialHauls={initial} />
    </div>
  );
}

async function loadFeed(dbUserId: string): Promise<HaulWithAuthor[]> {
  const follows = await sql<{ addressee_id: string }[]>`
    SELECT addressee_id FROM friendships
    WHERE requester_id = ${dbUserId} AND status = 'accepted'
  `;
  const followIds = follows.map((f) => f.addressee_id);
  if (followIds.length === 0) return [];

  const hauls = await sql`
    SELECT * FROM hauls
    WHERE user_id = ANY(${followIds}::uuid[]) AND is_public = true
    ORDER BY created_at DESC LIMIT 40
  `;
  return enrichHauls(hauls as unknown as RawHaul[]);
}

type RawHaul = { id: string; user_id: string; products: unknown; is_public: boolean; created_at: string; [k: string]: unknown };

export async function enrichHauls(hauls: RawHaul[]): Promise<HaulWithAuthor[]> {
  if (hauls.length === 0) return [];

  const userIds = Array.from(new Set(hauls.map((h) => h.user_id)));
  const haulIds = hauls.map((h) => h.id);

  const [users, reactions, comments] = await Promise.all([
    sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY(${userIds}::uuid[])`,
    sql`SELECT haul_id, emoji FROM reactions WHERE haul_id = ANY(${haulIds}::uuid[])`,
    sql`SELECT haul_id FROM comments WHERE haul_id = ANY(${haulIds}::uuid[])`,
  ]);

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>>();
  for (const u of users) userMap.set(u.id as string, u as unknown as User);

  const reactionCounts = new Map<string, Record<string, number>>();
  for (const r of reactions) {
    const cur = reactionCounts.get(r.haul_id as string) ?? {};
    cur[r.emoji as string] = (cur[r.emoji as string] ?? 0) + 1;
    reactionCounts.set(r.haul_id as string, cur);
  }

  const commentCounts = new Map<string, number>();
  for (const c of comments) {
    commentCounts.set(c.haul_id as string, (commentCounts.get(c.haul_id as string) ?? 0) + 1);
  }

  return hauls.map((h) => ({
    ...(h as unknown as HaulWithAuthor),
    author: userMap.get(h.user_id) ?? { id: h.user_id, username: 'unknown', display_name: null, avatar_url: null },
    reaction_counts: reactionCounts.get(h.id) ?? {},
    comment_count: commentCounts.get(h.id) ?? 0,
  }));
}
