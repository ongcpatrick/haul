import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson, requireString } from '@/lib/api';
import sql from '@/lib/db';

interface CommentBody {
  haulId?: string;
  body?: string;
}

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const json = await readJson<CommentBody>(req);
  if (!json) return fail('Invalid body');

  let haulId: string;
  let text: string;
  try {
    haulId = requireString(json.haulId, 'haulId');
    text = requireString(json.body, 'body');
  } catch (e: unknown) {
    return fail(e instanceof Error ? e.message : 'Invalid request');
  }
  if (text.length > 500) return fail('Comment too long');

  const [comment] = await sql`
    INSERT INTO comments (haul_id, user_id, body)
    VALUES (${haulId}, ${dbUserId}, ${text})
    RETURNING *
  `;
  return ok(comment);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const haulId = searchParams.get('haulId');
  if (!haulId) return fail('haulId required');

  const comments = await sql`
    SELECT * FROM comments WHERE haul_id = ${haulId} ORDER BY created_at ASC LIMIT 200
  `;

  const userIds = Array.from(new Set(comments.map((c) => c.user_id as string)));
  const users = userIds.length
    ? await sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ANY(${userIds}::uuid[])`
    : [];

  const authors = Object.fromEntries(users.map((u) => [u.id, u]));
  return ok({ comments, authors });
}
