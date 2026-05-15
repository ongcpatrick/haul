import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import type { Circle, User } from '@/lib/types';
import CreateCircleButton from './CreateCircleButton';

export const dynamic = 'force-dynamic';

interface CircleSummary {
  circle: Circle & { is_private: boolean; cover_color: string; member_count: number };
  members: Pick<User, 'id' | 'username' | 'avatar_url'>[];
  isOwner: boolean;
}

export default async function CirclesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/circles');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const summaries = await loadCircles(dbUserId);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Page header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Your Groups</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Private spaces to share and discuss hauls with the people you trust.</p>
        </div>
        <CreateCircleButton />
      </header>

      {summaries.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-[var(--surface)] border-2 border-dashed border-[var(--border)] rounded-3xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">No groups yet</h3>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
            Create a private group to shop together, compare hauls, and get opinions from the people whose taste you trust.
          </p>
          <CreateCircleButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {summaries.map(({ circle, members, isOwner }) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="group bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {/* Group cover — colored banner */}
              <div
                className="h-20 relative flex items-end px-4 pb-3"
                style={{ background: `linear-gradient(135deg, ${circle.cover_color}cc, ${circle.cover_color})` }}
              >
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')]" />
                <div className="flex items-center gap-2 relative">
                  {circle.is_private && (
                    <span className="text-[10px] font-bold bg-black/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Private
                    </span>
                  )}
                  {isOwner && (
                    <span className="text-[10px] font-bold bg-black/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Admin</span>
                  )}
                </div>
              </div>

              {/* Group info */}
              <div className="px-5 py-4">
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                  {circle.name}
                </h3>
                {circle.description && (
                  <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">{circle.description}</p>
                )}

                {/* Member avatars */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {members.slice(0, 5).map((m) =>
                      m.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={m.id} src={m.avatar_url} alt={m.username} className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      ) : (
                        <div key={m.id} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ background: circle.cover_color }}>
                          {m.username[0]?.toUpperCase()}
                        </div>
                      )
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted)] font-medium">
                    {circle.member_count} member{circle.member_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function loadCircles(dbUserId: string): Promise<CircleSummary[]> {
  const memberships = await sql<{ circle_id: string }[]>`
    SELECT circle_id FROM circle_members WHERE user_id = ${dbUserId}
  `;
  const circleIds = memberships.map((m) => m.circle_id);
  if (circleIds.length === 0) return [];

  const [circles, allMembers] = await Promise.all([
    sql`SELECT * FROM circles WHERE id = ANY(${circleIds}::uuid[]) ORDER BY created_at DESC`,
    sql<{ circle_id: string; user_id: string }[]>`
      SELECT circle_id, user_id FROM circle_members WHERE circle_id = ANY(${circleIds}::uuid[])
    `,
  ]);

  const memberIds = Array.from(new Set(allMembers.map((m) => m.user_id)));
  const users = memberIds.length
    ? await sql`SELECT id, username, avatar_url FROM users WHERE id = ANY(${memberIds}::uuid[])`
    : [];

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'avatar_url'>>();
  for (const u of users) userMap.set(u.id as string, u as unknown as User);

  const byCircle = new Map<string, string[]>();
  for (const m of allMembers) {
    const list = byCircle.get(m.circle_id) ?? [];
    list.push(m.user_id);
    byCircle.set(m.circle_id, list);
  }

  return circles.map((c) => {
    const ms = byCircle.get(c.id as string) ?? [];
    return {
      circle: c as unknown as CircleSummary['circle'],
      isOwner: c.created_by === dbUserId,
      members: ms.map((uid) => userMap.get(uid)).filter((u): u is Pick<User, 'id' | 'username' | 'avatar_url'> => Boolean(u)),
    };
  });
}
