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

  const [inserted] = await sql`
    INSERT INTO reactions (haul_id, user_id, emoji)
    VALUES (${body.haulId}, ${dbUserId}, ${body.emoji})
    RETURNING haul_id
  `;

  // Notify haul owner (fire-and-forget, skip self-reactions)
  const [haul] = await sql`SELECT user_id FROM hauls WHERE id = ${inserted.haul_id} LIMIT 1`;
  if (haul && haul.user_id !== dbUserId) {
    sql`
      INSERT INTO notifications (user_id, from_user_id, type, haul_id, body)
      VALUES (${haul.user_id}, ${dbUserId}, 'reaction', ${inserted.haul_id}, ${body.emoji})
    `.catch(() => {});
  }

  return ok({ reacted: true });
}
