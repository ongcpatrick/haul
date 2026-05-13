import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';
import sql from '@/lib/db';

interface ReactBody {
  haulId?: string;
  emoji?: string;
}

const ALLOWED_EMOJIS = new Set(['❤️', '🔥', '👀', 'heart', 'fire', 'eyes']);

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const body = await readJson<ReactBody>(req);
  if (!body?.haulId || !body.emoji) return fail('haulId and emoji required');
  if (!ALLOWED_EMOJIS.has(body.emoji)) return fail('Unsupported reaction');

  const [existing] = await sql`
    SELECT id FROM reactions
    WHERE haul_id = ${body.haulId} AND user_id = ${dbUserId} AND emoji = ${body.emoji}
    LIMIT 1
  `;

  if (existing) {
    await sql`DELETE FROM reactions WHERE id = ${existing.id}`;
    return ok({ reacted: false });
  }

  await sql`
    INSERT INTO reactions (haul_id, user_id, emoji)
    VALUES (${body.haulId}, ${dbUserId}, ${body.emoji})
  `;
  return ok({ reacted: true });
}
