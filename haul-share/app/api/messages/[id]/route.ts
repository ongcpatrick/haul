import { ok, fail, readJson } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import { ensureMessagingTables } from '@/lib/messaging-tables';

interface SendBody {
  body?: string;
  haulId?: string | null;
}

// GET /api/messages/[id] — get messages in conversation + mark read
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureMessagingTables();
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const { id } = await params;

  // Verify membership
  const [member] = await sql`
    SELECT 1 FROM conversation_members WHERE conversation_id = ${id} AND user_id = ${userId}
  `;
  if (!member) return fail('Not a member', 403);

  const { searchParams } = new URL(req.url);
  const before = searchParams.get('before');

  const messages = before
    ? await sql`
        SELECT m.*,
          u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url,
          h.title AS haul_title, h.share_id AS haul_share_id,
          h.products->0->>'imageUrl' AS haul_image_url
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        LEFT JOIN hauls h ON h.id = m.haul_id
        WHERE m.conversation_id = ${id} AND m.created_at < ${before}
        ORDER BY m.created_at DESC LIMIT 40
      `
    : await sql`
        SELECT m.*,
          u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url,
          h.title AS haul_title, h.share_id AS haul_share_id,
          h.products->0->>'imageUrl' AS haul_image_url
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        LEFT JOIN hauls h ON h.id = m.haul_id
        WHERE m.conversation_id = ${id}
        ORDER BY m.created_at DESC LIMIT 40
      `;

  // Mark read (fire-and-forget)
  sql`
    UPDATE conversation_members SET last_read_at = NOW()
    WHERE conversation_id = ${id} AND user_id = ${userId}
  `.catch(() => {});

  const data = messages.reverse().map((m) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    body: m.body,
    haul_id: m.haul_id,
    haul_title: m.haul_title ?? null,
    haul_image_url: m.haul_image_url ?? null,
    haul_share_id: m.haul_share_id ?? null,
    created_at: m.created_at,
    sender: { id: m.sender_id, username: m.sender_username, display_name: m.sender_display_name, avatar_url: m.sender_avatar_url },
  }));

  return ok(data);
}

// POST /api/messages/[id] — send a message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureMessagingTables();
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const { id } = await params;

  const [member] = await sql`
    SELECT 1 FROM conversation_members WHERE conversation_id = ${id} AND user_id = ${userId}
  `;
  if (!member) return fail('Not a member', 403);

  const body = await readJson<SendBody>(req);
  if (!body?.body?.trim() && !body?.haulId) return fail('body or haulId required');

  const text = body.body?.trim()?.slice(0, 2000) ?? null;

  const [msg] = await sql`
    INSERT INTO messages (conversation_id, sender_id, body, haul_id)
    VALUES (${id}, ${userId}, ${text}, ${body.haulId ?? null})
    RETURNING *
  `;

  const [user] = await sql`SELECT id, username, display_name, avatar_url FROM users WHERE id = ${userId} LIMIT 1`;

  return ok({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    body: msg.body,
    haul_id: msg.haul_id,
    created_at: msg.created_at,
    sender: user,
  });
}
