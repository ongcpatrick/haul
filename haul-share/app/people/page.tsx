import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import FollowButtonWrapper from './FollowButtonWrapper';

export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/people');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const [people, followingRows] = await Promise.all([
    sql<{ id: string; username: string; display_name: string | null; avatar_url: string | null; haul_count: string }[]>`
      SELECT u.id, u.username, u.display_name, u.avatar_url,
             COUNT(h.id) AS haul_count
      FROM users u
      LEFT JOIN hauls h ON h.user_id = u.id AND h.is_public = true
      WHERE u.id != ${dbUserId}
      GROUP BY u.id
      ORDER BY haul_count DESC, u.created_at DESC
      LIMIT 60
    `,
    sql<{ addressee_id: string }[]>`
      SELECT addressee_id FROM friendships
      WHERE requester_id = ${dbUserId} AND status = 'accepted'
    `,
  ]);

  const followingIds = new Set(followingRows.map((r) => r.addressee_id));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Discover People</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Follow people to see their hauls in your feed.</p>
      </header>

      {people.length === 0 ? (
        <p className="text-[var(--muted)] text-sm">No other users yet. Invite friends!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-4 bg-white border border-[var(--border)] rounded-2xl p-4"
            >
              {person.avatar_url ? (
                <img src={person.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                  {(person.display_name ?? person.username).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/u/${person.username}`}
                  className="font-semibold text-[var(--text)] hover:underline truncate block"
                >
                  {person.display_name ?? person.username}
                </Link>
                <p className="text-xs text-[var(--muted)]">
                  @{person.username} &middot; {person.haul_count} haul{person.haul_count === '1' ? '' : 's'}
                </p>
              </div>
              <FollowButtonWrapper
                targetUserId={person.id}
                currentUserId={dbUserId}
                initiallyFollowing={followingIds.has(person.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
