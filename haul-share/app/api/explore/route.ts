import { ok } from '@/lib/api';
import sql from '@/lib/db';
import type { HaulWithAuthor, User } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 24), 50);
  const before = searchParams.get('before');

  const hauls = before
    ? await sql`SELECT * FROM hauls WHERE is_public = true AND created_at < ${before} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM hauls WHERE is_public = true ORDER BY created_at DESC LIMIT ${limit}`;

  if (!hauls.length) return ok([]);

  const userIds = Array.from(new Set(hauls.map((h) => h.user_id as string)));
  const haulIds = hauls.map((h) => h.id as string);

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

  const result: HaulWithAuthor[] = hauls.map((h) => ({
    ...(h as unknown as HaulWithAuthor),
    author: userMap.get(h.user_id as string) ?? { id: h.user_id as string, username: 'unknown', display_name: null, avatar_url: null },
    reaction_counts: reactionCounts.get(h.id as string) ?? {},
    comment_count: commentCounts.get(h.id as string) ?? 0,
  }));

  return ok(result);
}
