import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';

interface FriendBody {
  targetUserId?: string;
  action?: 'follow' | 'unfollow';
}

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const body = await readJson<FriendBody>(req);
  if (!body?.targetUserId) return fail('targetUserId required');
  if (body.targetUserId === dbUserId) return fail('Cannot follow yourself');

  const admin = getSupabaseAdminClient();
  const action = body.action ?? 'follow';

  if (action === 'unfollow') {
    const { error } = await admin
      .from('friendships')
      .delete()
      .eq('requester_id', dbUserId)
      .eq('addressee_id', body.targetUserId);
    if (error) return fail(error.message, 500);
    return ok({ following: false });
  }

  // Auto-accept follows (Twitter-style). Switch to 'pending' for mutual-approval model.
  const { data, error } = await admin
    .from('friendships')
    .upsert(
      {
        requester_id: dbUserId,
        addressee_id: body.targetUserId,
        status: 'accepted',
      },
      { onConflict: 'requester_id,addressee_id' }
    )
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok({ following: true, friendship: data });
}

export async function GET() {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${dbUserId},addressee_id.eq.${dbUserId}`);

  if (error) return fail(error.message, 500);
  return ok(data ?? []);
}
