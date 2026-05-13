import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient, getCurrentDbUserId } from '@/lib/supabase-server';
import type { Circle, CircleMember, User } from '@/lib/types';
import EmptyState from '@/app/components/EmptyState';
import CreateCircleButton from './CreateCircleButton';

export const dynamic = 'force-dynamic';

interface CircleSummary {
  circle: Circle;
  members: Pick<User, 'id' | 'username' | 'avatar_url'>[];
  memberCount: number;
}

export default async function CirclesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/circles');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Circles</h1>
        <EmptyState
          title="Finish profile setup"
          description="Sync your profile from the Haul extension first."
        />
      </div>
    );
  }

  const summaries = await loadCircles(dbUserId);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Circles</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shared shopping spaces with the people you trust.
          </p>
        </div>
        <CreateCircleButton />
      </header>

      {summaries.length === 0 ? (
        <EmptyState
          title="No circles yet"
          description="Create a circle to start shopping together. Invite friends with a private link."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaries.map(({ circle, members, memberCount }) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-card hover:shadow-lg hover:border-[var(--primary)] transition-all"
            >
              <h3 className="text-lg font-bold text-[var(--text)]">{circle.name}</h3>
              {circle.description && (
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                  {circle.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((m) =>
                    m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={m.id}
                        src={m.avatar_url}
                        alt={m.username}
                        className="w-7 h-7 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div
                        key={m.id}
                        className="w-7 h-7 rounded-full bg-[var(--surface)] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[var(--muted)]"
                      >
                        {m.username[0]?.toUpperCase()}
                      </div>
                    )
                  )}
                </div>
                <span className="text-xs text-[var(--muted)]">
                  {memberCount} member{memberCount === 1 ? '' : 's'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function loadCircles(dbUserId: string): Promise<CircleSummary[]> {
  const admin = getSupabaseAdminClient();
  const { data: memberships } = await admin
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', dbUserId);

  const circleIds = (memberships ?? []).map((m) => m.circle_id as string);
  if (circleIds.length === 0) return [];

  const { data: circles } = await admin
    .from('circles')
    .select('*')
    .in('id', circleIds)
    .order('created_at', { ascending: false });

  const { data: allMembers } = await admin
    .from('circle_members')
    .select('circle_id, user_id')
    .in('circle_id', circleIds);

  const memberIds = Array.from(new Set((allMembers ?? []).map((m) => m.user_id as string)));
  const { data: users } = await admin
    .from('users')
    .select('id, username, avatar_url')
    .in('id', memberIds);

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'avatar_url'>>();
  for (const u of users ?? []) userMap.set(u.id as string, u as User);

  const byCircle = new Map<string, CircleMember[]>();
  for (const m of allMembers ?? []) {
    const list = byCircle.get(m.circle_id as string) ?? [];
    list.push(m as CircleMember);
    byCircle.set(m.circle_id as string, list);
  }

  return (circles ?? []).map((c) => {
    const ms = byCircle.get(c.id) ?? [];
    return {
      circle: c as Circle,
      memberCount: ms.length,
      members: ms
        .map((m) => userMap.get(m.user_id))
        .filter((u): u is Pick<User, 'id' | 'username' | 'avatar_url'> => Boolean(u)),
    };
  });
}
