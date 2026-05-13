import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';
import sql from '@/lib/db';

export async function GET(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const before = searchParams.get('before');

  const followRows = await sql<{ addressee_id: string }[]>`
    SELECT addressee_id FROM friendships
    WHERE requester_id = ${dbUserId} AND status = 'accepted'
  `;
  const followIds = followRows.map((f) => f.addressee_id);
  if (followIds.length === 0) return ok([]);

  const hauls = before
    ? await sql`
        SELECT * FROM hauls
        WHERE user_id = ANY(${followIds}::uuid[])
          AND is_public = true
          AND created_at < ${before}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    : await sql`
        SELECT * FROM hauls
        WHERE user_id = ANY(${followIds}::uuid[])
          AND is_public = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

  return ok(hauls);
}
