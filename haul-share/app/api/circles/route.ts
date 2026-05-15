import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson, requireString } from '@/lib/api';
import sql from '@/lib/db';
import { getUserIdFromExtensionToken } from '@/lib/extension-auth';

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

  const [circle] = await sql`
    INSERT INTO circles (name, description, created_by)
    VALUES (${name}, ${body.description ?? null}, ${dbUserId})
    RETURNING *
  `;
  if (!circle) return fail('Failed to create circle', 500);

  await sql`
    INSERT INTO circle_members (circle_id, user_id, role)
    VALUES (${circle.id}, ${dbUserId}, 'owner')
  `;

  return ok(circle);
}

export async function GET(req: Request) {
  let dbUserId: string | null = await getUserIdFromExtensionToken(req);
  if (!dbUserId) dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const memberships = await sql<{ circle_id: string }[]>`
    SELECT circle_id FROM circle_members WHERE user_id = ${dbUserId}
  `;
  const ids = memberships.map((m) => m.circle_id);
  if (ids.length === 0) return ok([]);

  const circles = await sql`
    SELECT * FROM circles
    WHERE id = ANY(${ids}::uuid[])
    ORDER BY created_at DESC
  `;
  return ok(circles);
}
