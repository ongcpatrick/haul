import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import type { Circle, CircleMember, HaulWithAuthor, User } from '@/lib/types';
import CircleClient from './CircleClient';
import GroupGate from './GroupGate';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export default async function CirclePage({ params }: Params) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/circles/${id}`);

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/');

  const [circle] = await sql`SELECT * FROM circles WHERE id = ${id} LIMIT 1`;
  if (!circle) notFound();

  const memberRows = await sql<{ circle_id: string; user_id: string; role: string; joined_at: string }[]>`
    SELECT circle_id, user_id, role, joined_at FROM circle_members WHERE circle_id = ${id}
  `;
  const isMember = memberRows.some((m) => m.user_id === dbUserId);

  // Non-member gate: show join CTA instead of content
  if (!isMember) {
    // Check if they already have a pending request
    const [existingRequest] = await sql`
      SELECT status FROM circle_requests WHERE circle_id = ${id} AND user_id = ${dbUserId}
    `.catch(() => [null]);

    const memberIds = memberRows.slice(0, 5).map((m) => m.user_id);
    const previewUsers = memberIds.length
      ? await sql`SELECT id, username, avatar_url FROM users WHERE id = ANY(${memberIds}::uuid[])`
      : [];

    return (
      <GroupGate
        circle={circle as unknown as Circle & { is_private: boolean; cover_color: string; member_count: number }}
        memberCount={memberRows.length}
        previewMembers={previewUsers as unknown as Pick<User, 'id' | 'username' | 'avatar_url'>[]}
        pendingRequest={existingRequest?.status === 'pending'}
        currentUserId={dbUserId}
      />
    );
  }

  const memberIds = memberRows.map((m) => m.user_id);

  const [users, hauls] = await Promise.all([
    sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY(${memberIds}::uuid[])`,
    sql`
      SELECT * FROM hauls
      WHERE circle_id = ${id}
      ORDER BY created_at DESC LIMIT 60
    `,
  ]);

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>>();
  for (const u of users) userMap.set(u.id as string, u as unknown as User);

  const members: CircleMember[] = memberRows.map((m) => ({
    ...m,
    user: userMap.get(m.user_id),
  })) as CircleMember[];

  const haulIds = hauls.map((h) => h.id as string);
  const haulsUserIds = Array.from(new Set(hauls.map((h) => h.user_id as string)));

  const [extraUsers, reactions, comments] = await Promise.all([
    haulsUserIds.length
      ? sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY(${haulsUserIds}::uuid[])`
      : Promise.resolve([]),
    haulIds.length
      ? sql<{ haul_id: string; emoji: string }[]>`SELECT haul_id, emoji FROM reactions WHERE haul_id = ANY(${haulIds}::uuid[])`
      : Promise.resolve([]),
    haulIds.length
      ? sql<{ haul_id: string }[]>`SELECT haul_id FROM comments WHERE haul_id = ANY(${haulIds}::uuid[])`
      : Promise.resolve([]),
  ]);

  for (const u of extraUsers) userMap.set(u.id as string, u as unknown as User);

  const reactionCounts = new Map<string, Record<string, number>>();
  for (const r of reactions) {
    const cur = reactionCounts.get(r.haul_id) ?? {};
    cur[r.emoji] = (cur[r.emoji] ?? 0) + 1;
    reactionCounts.set(r.haul_id, cur);
  }
  const commentCounts = new Map<string, number>();
  for (const c of comments) {
    commentCounts.set(c.haul_id, (commentCounts.get(c.haul_id) ?? 0) + 1);
  }

  const enrichedHauls: HaulWithAuthor[] = hauls.map((h) => ({
    ...(h as unknown as HaulWithAuthor),
    products: Array.isArray(h.products) ? h.products : [],
    author: userMap.get(h.user_id as string) ?? { id: h.user_id as string, username: 'unknown', display_name: null, avatar_url: null },
    reaction_counts: reactionCounts.get(h.id as string) ?? {},
    comment_count: commentCounts.get(h.id as string) ?? 0,
  }));

  return (
    <CircleClient
      circle={circle as unknown as Circle}
      members={members}
      initialHauls={enrichedHauls}
      currentUserId={dbUserId}
    />
  );
}
