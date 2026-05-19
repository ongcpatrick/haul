import { ok } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import type { HaulWithAuthor, Product, User } from '@/lib/types';

function parseProducts(raw: unknown): Product[] {
  if (Array.isArray(raw)) return raw as Product[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Product[]) : [];
    } catch { return []; }
  }
  return [];
}

async function enrichHauls(hauls: Record<string, unknown>[]): Promise<HaulWithAuthor[]> {
  if (!hauls.length) return [];

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

  return hauls.map((h) => ({
    ...(h as unknown as HaulWithAuthor),
    products: parseProducts(h.products),
    author: userMap.get(h.user_id as string) ?? { id: h.user_id as string, username: 'unknown', display_name: null, avatar_url: null },
    reaction_counts: reactionCounts.get(h.id as string) ?? {},
    comment_count: commentCounts.get(h.id as string) ?? 0,
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort');
  const limit = Math.min(Number(searchParams.get('limit') ?? 24), 50);
  const before = searchParams.get('before');

  const currentUserId = await getCurrentDbUserId();
  const exclude = currentUserId ? sql`AND h.user_id != ${currentUserId}::uuid` : sql``;
  const excludeFlat = currentUserId ? sql`AND user_id != ${currentUserId}::uuid` : sql``;

  // Personalized for-you feed: find hauls matching the user's saved product categories
  if (sort === 'for-you' && currentUserId) {
    const categoryRows = await sql`
      SELECT DISTINCT p->>'category' AS category
      FROM hauls
      CROSS JOIN LATERAL jsonb_array_elements(products) AS p
      WHERE user_id = ${currentUserId}
        AND p->>'category' IS NOT NULL
        AND p->>'category' != 'null'
      LIMIT 20
    `;
    const categories = categoryRows.map((r) => r.category as string).filter(Boolean);

    if (categories.length > 0) {
      const hauls = await sql`
        SELECT DISTINCT h.*
        FROM hauls h
        CROSS JOIN LATERAL jsonb_array_elements(h.products) AS p
        WHERE h.is_public = true
          AND h.user_id != ${currentUserId}::uuid
          AND p->>'category' = ANY(${categories})
        ORDER BY h.created_at DESC
        LIMIT ${limit}
      `;
      const result = await enrichHauls(hauls as unknown as Record<string, unknown>[]);
      return ok(result);
    }
    // Fall through to trending when user has no category data
  }

  if (sort === 'trending') {
    const hauls = await sql`
      SELECT h.*,
        (COUNT(DISTINCT r.id) * 2 + COUNT(DISTINCT c.id) * 3) /
        POWER(EXTRACT(EPOCH FROM (NOW() - h.created_at)) / 3600.0 + 2, 1.5) AS trend_score
      FROM hauls h
      LEFT JOIN reactions r ON r.haul_id = h.id AND r.created_at > NOW() - INTERVAL '7 days'
      LEFT JOIN comments c ON c.haul_id = h.id AND c.created_at > NOW() - INTERVAL '7 days'
      WHERE h.is_public = true AND h.created_at > NOW() - INTERVAL '30 days' ${exclude}
      GROUP BY h.id
      ORDER BY trend_score DESC
      LIMIT ${limit}
    `;
    const result = await enrichHauls(hauls as unknown as Record<string, unknown>[]);
    return ok(result);
  }

  const hauls = before
    ? await sql`SELECT * FROM hauls WHERE is_public = true ${excludeFlat} AND created_at < ${before} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM hauls WHERE is_public = true ${excludeFlat} ORDER BY created_at DESC LIMIT ${limit}`;

  const result = await enrichHauls(hauls as unknown as Record<string, unknown>[]);
  return ok(result);
}
