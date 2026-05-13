import { getCurrentDbUserId, getSupabaseAdminClient } from '@/lib/supabase-server';
import { fail, ok, readJson, requireString } from '@/lib/api';

interface CreateCircleBody {
  name?: string;
  description?: string | null;
}

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const body = await readJson<CreateCircleBody>(req);
  if (!body) return fail('Invalid body');

  let name: string;
  try {
    name = requireString(body.name, 'name');
  } catch (e: unknown) {
    return fail(e instanceof Error ? e.message : 'Invalid request');
  }
  if (name.length > 60) return fail('Name too long');

  const admin = getSupabaseAdminClient();
  const { data: circle, error: cErr } = await admin
    .from('circles')
    .insert({
      name,
      description: body.description ?? null,
      created_by: dbUserId,
    })
    .select()
    .single();

  if (cErr || !circle) return fail(cErr?.message ?? 'Failed to create circle', 500);

  const { error: mErr } = await admin.from('circle_members').insert({
    circle_id: circle.id,
    user_id: dbUserId,
    role: 'owner',
  });
  if (mErr) return fail(mErr.message, 500);

  return ok(circle);
}

export async function GET() {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const admin = getSupabaseAdminClient();
  const { data: memberships } = await admin
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', dbUserId);

  const ids = (memberships ?? []).map((m) => m.circle_id as string);
  if (ids.length === 0) return ok([]);

  const { data, error } = await admin
    .from('circles')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error) return fail(error.message, 500);
  return ok(data ?? []);
}
