import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const admin = getSupabaseAdminClient();

  const { data: circle } = await admin.from('circles').select('*').eq('id', id).maybeSingle();
  if (!circle) return fail('Circle not found', 404);

  const { data: members } = await admin
    .from('circle_members')
    .select('circle_id, user_id, role, joined_at')
    .eq('circle_id', id);

  const memberIds = (members ?? []).map((m) => m.user_id as string);
  if (!memberIds.includes(dbUserId)) return fail('Not a member', 403);

  const { data: users } = await admin
    .from('users')
    .select('id, username, display_name, avatar_url')
    .in('id', memberIds);

  const { data: hauls } = await admin
    .from('hauls')
    .select('*')
    .eq('circle_id', id)
    .order('created_at', { ascending: false })
    .limit(30);

  return ok({ circle, members: members ?? [], users: users ?? [], hauls: hauls ?? [] });
}
