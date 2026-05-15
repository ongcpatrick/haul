import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';
import sql from '@/lib/db';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const [circle] = await sql`SELECT * FROM circles WHERE id = ${id} LIMIT 1`;
  if (!circle) return fail('Circle not found', 404);

  const members = await sql`
    SELECT circle_id, user_id, role, joined_at FROM circle_members WHERE circle_id = ${id}
  `;

  const memberIds = members.map((m) => m.user_id as string);
  if (!memberIds.includes(dbUserId)) return fail('Not a member', 403);

  const [users, hauls] = await Promise.all([
    sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY(${memberIds}::uuid[])`,
    sql`SELECT * FROM hauls WHERE circle_id = ${id} ORDER BY created_at DESC LIMIT 30`,
  ]);

  const normalizedHauls = hauls.map((h) => ({
    ...h,
    products: Array.isArray(h.products) ? h.products : [],
  }));

  return ok({ circle, members, users, hauls: normalizedHauls });
}
