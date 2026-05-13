import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';
import type { Product } from '@/lib/types';

interface CreateHaulBody {
  shareId?: string | null;
  title?: string | null;
  products: Product[];
  isPublic?: boolean;
  circleId?: string | null;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('User not synced', 400);

  const body = await readJson<CreateHaulBody>(req);
  if (!body || !Array.isArray(body.products)) return fail('Invalid body');

  const admin = getSupabaseAdminClient();

  if (body.circleId) {
    const { data: member } = await admin
      .from('circle_members')
      .select('user_id')
      .eq('circle_id', body.circleId)
      .eq('user_id', dbUserId)
      .maybeSingle();
    if (!member) return fail('Not a member of that circle', 403);
  }

  const { data, error } = await admin
    .from('hauls')
    .insert({
      user_id: dbUserId,
      share_id: body.shareId ?? null,
      title: body.title ?? null,
      products: body.products,
      is_public: body.isPublic ?? true,
      circle_id: body.circleId ?? null,
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const limit = Math.min(Number(searchParams.get('limit') ?? 30), 100);

  const admin = getSupabaseAdminClient();

  let userId: string | null = null;
  if (username) {
    const { data: u } = await admin
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    if (!u) return ok([]);
    userId = u.id as string;
  } else {
    userId = await getCurrentDbUserId();
    if (!userId) return fail('Unauthorized', 401);
  }

  const { data, error } = await admin
    .from('hauls')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return fail(error.message, 500);
  return ok(data ?? []);
}
