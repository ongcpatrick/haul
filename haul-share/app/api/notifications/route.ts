import { NextResponse } from 'next/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';

function ok<T>(data: T, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, ...extra });
}
function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, data: null, error: msg }, { status });
}

export async function GET(req: Request) {
  const userId = await getCurrentDbUserId();
  if (!userId) return err('Unauthorized', 401);

  const { searchParams } = new URL(req.url);
  const countOnly = searchParams.get('countOnly') === 'true';

  if (countOnly) {
    const [row] = await sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${userId} AND read = false
    `;
    return ok(null, { unread_count: parseInt(row?.count ?? '0', 10) });
  }

  const notifications = await sql`
    SELECT n.*, u.username AS from_username, u.display_name AS from_display_name, u.avatar_url AS from_avatar_url
    FROM notifications n
    LEFT JOIN users u ON u.id = n.from_user_id
    WHERE n.user_id = ${userId}
    ORDER BY n.created_at DESC
    LIMIT 40
  `;

  const [unreadRow] = await sql<[{ count: string }]>`
    SELECT COUNT(*) AS count FROM notifications WHERE user_id = ${userId} AND read = false
  `;

  const data = notifications.map((n) => ({
    id: n.id,
    user_id: n.user_id,
    from_user_id: n.from_user_id,
    type: n.type,
    haul_id: n.haul_id,
    body: n.body,
    read: n.read,
    created_at: n.created_at,
    from_user: n.from_user_id
      ? { id: n.from_user_id, username: n.from_username, display_name: n.from_display_name, avatar_url: n.from_avatar_url }
      : null,
  }));

  return ok(data, { unread_count: parseInt(unreadRow?.count ?? '0', 10) });
}

export async function PATCH() {
  const userId = await getCurrentDbUserId();
  if (!userId) return err('Unauthorized', 401);

  await sql`UPDATE notifications SET read = true WHERE user_id = ${userId} AND read = false`;
  return ok(null);
}
