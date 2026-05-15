import { ok, fail } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';

export async function GET(req: Request) {
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 1) return ok([]);

  const pattern = `%${q.toLowerCase()}%`;

  const users = await sql`
    SELECT id, username, display_name, avatar_url
    FROM users
    WHERE id != ${userId}
      AND (LOWER(username) LIKE ${pattern} OR LOWER(COALESCE(display_name, '')) LIKE ${pattern})
    ORDER BY username ASC
    LIMIT 20
  `;

  return ok(users);
}
