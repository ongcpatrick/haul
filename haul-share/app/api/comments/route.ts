import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson, requireString } from '@/lib/api';

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

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('comments')
    .insert({ haul_id: haulId, user_id: dbUserId, body: text })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const haulId = searchParams.get('haulId');
  if (!haulId) return fail('haulId required');

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('comments')
    .select('*')
    .eq('haul_id', haulId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) return fail(error.message, 500);

  const userIds = Array.from(new Set((data ?? []).map((c) => c.user_id as string)));
  let authors: Record<string, unknown> = {};
  if (userIds.length) {
    const { data: users } = await admin
      .from('users')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);
    authors = Object.fromEntries((users ?? []).map((u) => [u.id, u]));
  }

  return ok({ comments: data ?? [], authors });
}
