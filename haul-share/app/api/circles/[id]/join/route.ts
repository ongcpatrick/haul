import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';

interface JoinBody {
  inviteCode?: string;
}

/**
 * Join a circle either by circle id (the [id] route param) or via an invite code in the body.
 * If the route param matches a circle id and the inviteCode matches that circle's invite_code, join.
 * Otherwise inviteCode alone (with route id == 'by-code') is accepted.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const { id } = await ctx.params;
  const body = (await readJson<JoinBody>(req)) ?? {};
  const admin = getSupabaseAdminClient();

  let circleId: string | null = null;

  if (id === 'by-code') {
    if (!body.inviteCode) return fail('inviteCode required');
    const { data: c } = await admin
      .from('circles')
      .select('id')
      .eq('invite_code', body.inviteCode)
      .maybeSingle();
    if (!c) return fail('Invalid invite code', 404);
    circleId = c.id as string;
  } else {
    const { data: c } = await admin
      .from('circles')
      .select('id, invite_code')
      .eq('id', id)
      .maybeSingle();
    if (!c) return fail('Circle not found', 404);
    if (body.inviteCode && body.inviteCode !== c.invite_code) {
      return fail('Invalid invite code', 403);
    }
    circleId = c.id as string;
  }

  const { error } = await admin
    .from('circle_members')
    .upsert(
      { circle_id: circleId, user_id: dbUserId, role: 'member' },
      { onConflict: 'circle_id,user_id' }
    );

  if (error) return fail(error.message, 500);
  return ok({ circleId });
}
