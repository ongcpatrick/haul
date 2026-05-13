import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient, getCurrentDbUserId } from '@/lib/supabase-server';
import type { Circle, CircleMember, Haul, HaulWithAuthor, User } from '@/lib/types';
import CircleClient from './CircleClient';

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

  const admin = getSupabaseAdminClient();

  const { data: circle } = await admin
    .from('circles')
    .select('*')
    .eq('id', id)
    .maybeSingle<Circle>();
  if (!circle) notFound();

  const { data: rawMembers } = await admin
    .from('circle_members')
    .select('*')
    .eq('circle_id', id);

  const memberRows = (rawMembers ?? []) as CircleMember[];
  const isMember = memberRows.some((m) => m.user_id === dbUserId);
  if (!isMember) redirect('/circles');

  const memberIds = memberRows.map((m) => m.user_id);
  const { data: users } = await admin
    .from('users')
    .select('id, username, display_name, avatar_url')
    .in('id', memberIds);

  const userMap = new Map<string, Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>>();
  for (const u of users ?? []) userMap.set(u.id as string, u as User);

  const members: CircleMember[] = memberRows.map((m) => ({
    ...m,
    user: userMap.get(m.user_id),
  }));

  const { data: rawHauls } = await admin
    .from('hauls')
    .select('*')
    .eq('circle_id', id)
    .order('created_at', { ascending: false })
    .limit(60);

  const hauls = (rawHauls ?? []) as Haul[];
  const haulIds = hauls.map((h) => h.id);
  const userIdsFromHauls = Array.from(new Set(hauls.map((h) => h.user_id)));

  const [{ data: extraUsers }, { data: reactions }, { data: comments }] = await Promise.all([
    admin
      .from('users')
      .select('id, username, display_name, avatar_url')
      .in('id', userIdsFromHauls),
    haulIds.length
      ? admin.from('reactions').select('haul_id, emoji').in('haul_id', haulIds)
      : Promise.resolve({ data: [] as { haul_id: string; emoji: string }[] }),
    haulIds.length
      ? admin.from('comments').select('haul_id').in('haul_id', haulIds)
      : Promise.resolve({ data: [] as { haul_id: string }[] }),
  ]);

  for (const u of extraUsers ?? []) userMap.set(u.id as string, u as User);

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

  const enrichedHauls: HaulWithAuthor[] = hauls.map((h) => ({
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

  return (
    <CircleClient
      circle={circle}
      members={members}
      initialHauls={enrichedHauls}
      currentUserId={dbUserId}
    />
  );
}
