import { ok, fail } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';

// POST /api/circles/request — request to join a private circle
// Body: { circleId: string, action?: 'approve' | 'reject', requesterId?: string }
export async function POST(req: Request) {
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const body = await req.json().catch(() => ({})) as {
    circleId?: string;
    action?: 'approve' | 'reject';
    requesterId?: string;
  };

  if (!body.circleId) return fail('circleId required', 400);

  // Admin approving/rejecting a pending request
  if (body.action && body.requesterId) {
    if (!['approve', 'reject'].includes(body.action)) return fail('Invalid action', 400);

    // Verify caller is owner of the circle
    const [circle] = await sql`
      SELECT created_by FROM circles WHERE id = ${body.circleId}
    `;
    if (!circle || circle.created_by !== userId) return fail('Forbidden', 403);

    const status = body.action === 'approve' ? 'approved' : 'rejected';
    await sql`
      UPDATE circle_requests
      SET status = ${status}
      WHERE circle_id = ${body.circleId} AND user_id = ${body.requesterId}
    `;

    if (body.action === 'approve') {
      await sql`
        INSERT INTO circle_members (circle_id, user_id, role)
        VALUES (${body.circleId}, ${body.requesterId}, 'member')
        ON CONFLICT DO NOTHING
      `;
    }

    return ok({ status });
  }

  // Regular user requesting to join
  const [circle] = await sql`
    SELECT id, is_private FROM circles WHERE id = ${body.circleId}
  `;
  if (!circle) return fail('Circle not found', 404);

  // Public circle → join directly
  if (!circle.is_private) {
    await sql`
      INSERT INTO circle_members (circle_id, user_id, role)
      VALUES (${body.circleId}, ${userId}, 'member')
      ON CONFLICT DO NOTHING
    `;
    return ok({ status: 'joined' });
  }

  // Private circle → create join request
  await sql`
    INSERT INTO circle_requests (circle_id, user_id, status)
    VALUES (${body.circleId}, ${userId}, 'pending')
    ON CONFLICT (circle_id, user_id) DO UPDATE SET status = 'pending', created_at = NOW()
  `;

  return ok({ status: 'pending' });
}

// GET /api/circles/request?circleId=xxx — owner gets pending requests
export async function GET(req: Request) {
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const circleId = searchParams.get('circleId');
  if (!circleId) return fail('circleId required', 400);

  const [circle] = await sql`SELECT created_by FROM circles WHERE id = ${circleId}`;
  if (!circle || circle.created_by !== userId) return fail('Forbidden', 403);

  const requests = await sql`
    SELECT cr.user_id, cr.status, cr.created_at,
           u.username, u.display_name, u.avatar_url
    FROM circle_requests cr
    JOIN users u ON u.id = cr.user_id
    WHERE cr.circle_id = ${circleId} AND cr.status = 'pending'
    ORDER BY cr.created_at ASC
  `;

  return ok(requests);
}
