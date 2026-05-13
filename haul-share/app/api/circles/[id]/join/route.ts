import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';
import sql from '@/lib/db';

interface JoinBody {
  inviteCode?: string;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const { id } = await ctx.params;
  const body = (await readJson<JoinBody>(req)) ?? {};

  let circleId: string;

  if (id === 'by-code') {
    if (!body.inviteCode) return fail('inviteCode required');
    const [c] = await sql`
      SELECT id FROM circles WHERE invite_code = ${body.inviteCode} LIMIT 1
    `;
    if (!c) return fail('Invalid invite code', 404);
    circleId = c.id as string;
  } else {
    const [c] = await sql`SELECT id, invite_code FROM circles WHERE id = ${id} LIMIT 1`;
    if (!c) return fail('Circle not found', 404);
    if (body.inviteCode && body.inviteCode !== c.invite_code) return fail('Invalid invite code', 403);
    circleId = c.id as string;
  }

  await sql`
    INSERT INTO circle_members (circle_id, user_id, role)
    VALUES (${circleId}, ${dbUserId}, 'member')
    ON CONFLICT (circle_id, user_id) DO NOTHING
  `;

  return ok({ circleId });
}
