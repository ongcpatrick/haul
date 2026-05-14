import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';
import sql from '@/lib/db';
import type { Product } from '@/lib/types';

interface CreateHaulBody {
  shareId?: string | null;
  title?: string | null;
  products: Product[];
  isPublic?: boolean;
  circleId?: string | null;
}

async function getUserIdFromToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const [row] = await sql<{ user_id: string }[]>`
    SELECT user_id FROM extension_tokens
    WHERE token = ${token} AND expires_at > now()
    LIMIT 1
  `;
  return (row?.user_id as string) ?? null;
}

export async function POST(req: Request) {
  // Accept either a Bearer extension token or a Clerk browser session.
  let dbUserId: string | null = await getUserIdFromToken(req);

  if (!dbUserId) {
    const { userId } = await auth();
    if (!userId) return fail('Unauthorized', 401);
    dbUserId = await getCurrentDbUserId();
    if (!dbUserId) return fail('User not synced', 400);
  }

  const body = await readJson<CreateHaulBody>(req);
  if (!body || !Array.isArray(body.products)) return fail('Invalid body');

  if (body.circleId) {
    const [member] = await sql`
      SELECT user_id FROM circle_members
      WHERE circle_id = ${body.circleId} AND user_id = ${dbUserId} LIMIT 1
    `;
    if (!member) return fail('Not a member of that circle', 403);
  }

  const [haul] = await sql`
    INSERT INTO hauls (user_id, share_id, title, products, is_public, circle_id)
    VALUES (
      ${dbUserId},
      ${body.shareId ?? null},
      ${body.title ?? null},
      ${JSON.stringify(body.products)}::jsonb,
      ${body.isPublic ?? true},
      ${body.circleId ?? null}
    )
    RETURNING *
  `;
  if (!haul) return fail('Failed to create haul', 500);
  return ok(haul);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('User not synced', 400);

  const { searchParams } = new URL(req.url);
  const haulId = searchParams.get('id');
  const circleId = searchParams.get('circleId');
  if (!haulId) return fail('id required');
  if (!circleId) return fail('circleId required');

  // verify user is a member of the target circle
  const [member] = await sql`
    SELECT user_id FROM circle_members
    WHERE circle_id = ${circleId} AND user_id = ${dbUserId} LIMIT 1
  `;
  if (!member) return fail('Not a member of that circle', 403);

  const [updated] = await sql`
    UPDATE hauls SET circle_id = ${circleId}
    WHERE id = ${haulId} AND user_id = ${dbUserId}
    RETURNING *
  `;
  if (!updated) return fail('Not found or not yours', 404);
  return ok(updated);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('User not synced', 400);

  const { searchParams } = new URL(req.url);
  const haulId = searchParams.get('id');
  if (!haulId) return fail('id required');

  const [deleted] = await sql`
    DELETE FROM hauls
    WHERE id = ${haulId} AND user_id = ${dbUserId}
    RETURNING id
  `;
  if (!deleted) return fail('Not found or not yours', 404);
  return ok({ id: haulId });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const limit = Math.min(Number(searchParams.get('limit') ?? 30), 100);

  let userId: string | null = null;
  if (username) {
    const [u] = await sql`
      SELECT id FROM users WHERE username = ${username.toLowerCase()} LIMIT 1
    `;
    if (!u) return ok([]);
    userId = u.id as string;
  } else {
    userId = await getCurrentDbUserId();
    if (!userId) return fail('Unauthorized', 401);
  }

  const hauls = await sql`
    SELECT * FROM hauls
    WHERE user_id = ${userId} AND is_public = true
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return ok(hauls);
}
