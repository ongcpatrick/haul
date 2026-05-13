import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';
import type { Haul } from '@/lib/types';

export async function GET(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
  const before = searchParams.get('before');

  const admin = getSupabaseAdminClient();

  const { data: follows } = await admin
    .from('friendships')
    .select('addressee_id')
    .eq('requester_id', dbUserId)
    .eq('status', 'accepted');

  const followIds = (follows ?? []).map((f) => f.addressee_id as string);
  if (followIds.length === 0) return ok<Haul[]>([]);

  let q = admin
    .from('hauls')
    .select('*')
    .in('user_id', followIds)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) q = q.lt('created_at', before);

  const { data, error } = await q;
  if (error) return fail(error.message, 500);
  return ok(data ?? []);
}
