import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';

interface ReactBody {
  haulId?: string;
  emoji?: string;
}

const ALLOWED_EMOJIS = new Set(['heart', 'fire', 'eyes', '❤️', '🔥', '👀']);

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const body = await readJson<ReactBody>(req);
  if (!body?.haulId || !body.emoji) return fail('haulId and emoji required');
  if (!ALLOWED_EMOJIS.has(body.emoji)) return fail('Unsupported reaction');

  const admin = getSupabaseAdminClient();

  // Toggle: if reaction exists, delete; otherwise insert.
  const { data: existing } = await admin
    .from('reactions')
    .select('id')
    .eq('haul_id', body.haulId)
    .eq('user_id', dbUserId)
    .eq('emoji', body.emoji)
    .maybeSingle();

  if (existing) {
    const { error } = await admin.from('reactions').delete().eq('id', existing.id);
    if (error) return fail(error.message, 500);
    return ok({ reacted: false });
  }

  const { error } = await admin
    .from('reactions')
    .insert({ haul_id: body.haulId, user_id: dbUserId, emoji: body.emoji });
  if (error) return fail(error.message, 500);
  return ok({ reacted: true });
}
