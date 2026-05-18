import { ok, fail, readJson } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import { ensureMessagingTables } from '@/lib/messaging-tables';

interface CreateConvBody {
  userIds?: string[];
  name?: string;
}

// GET /api/messages — list conversations for current user
export async function GET() {
  await ensureMessagingTables();
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  let convIds: { conversation_id: string }[] = [];
  try {
    convIds = await sql<{ conversation_id: string }[]>`
      SELECT conversation_id FROM conversation_members WHERE user_id = ${userId}
    `;
  } catch { return ok([]); }
  if (!convIds.length) return ok([]);

  const ids = convIds.map((r) => r.conversation_id);

  const [convs, allMembers, lastMsgs, unreadCounts] = await Promise.all([
    sql`SELECT * FROM conversations WHERE id = ANY(${ids}::uuid[]) ORDER BY created_at DESC`,
    sql`
      SELECT cm.conversation_id, u.id, u.username, u.display_name, u.avatar_url
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = ANY(${ids}::uuid[])
    `,
    sql`
      SELECT DISTINCT ON (m.conversation_id)
        m.conversation_id, m.body, m.haul_id, m.created_at, u.username AS sender_username
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ANY(${ids}::uuid[])
      ORDER BY m.conversation_id, m.created_at DESC
    `,
    sql`
      SELECT m.conversation_id, COUNT(*) AS cnt
      FROM messages m
      JOIN conversation_members cm
        ON cm.conversation_id = m.conversation_id AND cm.user_id = ${userId}
      WHERE m.conversation_id = ANY(${ids}::uuid[])
        AND m.created_at > cm.last_read_at
        AND m.sender_id != ${userId}
      GROUP BY m.conversation_id
    `,
  ]);

  const memberMap = new Map<string, { id: string; username: string; display_name: string | null; avatar_url: string | null }[]>();
  for (const m of allMembers) {
    const list = memberMap.get(m.conversation_id as string) ?? [];
    list.push({ id: m.id as string, username: m.username as string, display_name: m.display_name as string | null, avatar_url: m.avatar_url as string | null });
    memberMap.set(m.conversation_id as string, list);
  }

  const lastMsgMap = new Map(lastMsgs.map((m) => [m.conversation_id as string, m]));
  const unreadMap = new Map(unreadCounts.map((r) => [r.conversation_id as string, Number(r.cnt)]));

  const data = convs.map((c) => ({
    id: c.id,
    type: c.type,
    name: c.name,
    created_by: c.created_by,
    created_at: c.created_at,
    members: memberMap.get(c.id as string) ?? [],
    last_message: lastMsgMap.get(c.id as string) ?? null,
    unread_count: unreadMap.get(c.id as string) ?? 0,
  }));

  // Sort by last message time desc
  data.sort((a, b) => {
    const ta = a.last_message?.created_at ?? a.created_at;
    const tb = b.last_message?.created_at ?? b.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  return ok(data);
}

// POST /api/messages — create a new conversation
export async function POST(req: Request) {
  await ensureMessagingTables();
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  const body = await readJson<CreateConvBody>(req);
  if (!body?.userIds?.length) return fail('userIds required');

  const allUserIds = Array.from(new Set([userId, ...body.userIds]));
  if (allUserIds.length < 2) return fail('Need at least one other user');

  const type = allUserIds.length === 2 ? 'direct' : 'group';

  // For direct messages, check if a DM already exists between these two users
  if (type === 'direct') {
    const otherId = body.userIds[0];
    const [existing] = await sql`
      SELECT c.id FROM conversations c
      JOIN conversation_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ${userId}
      JOIN conversation_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ${otherId}
      WHERE c.type = 'direct'
      LIMIT 1
    `;
    if (existing) return ok({ id: existing.id, existing: true });
  }

  let conv: { id: string };
  try {
    const [row] = await sql<{ id: string }[]>`
      INSERT INTO conversations (type, name, created_by)
      VALUES (${type}, ${body.name ?? null}, ${userId})
      RETURNING id
    `;
    if (!row) return fail('Failed to create conversation', 500);
    conv = row;
  } catch (e: unknown) {
    return fail(e instanceof Error ? e.message : 'Database error', 500);
  }

  try {
    await sql`
      INSERT INTO conversation_members (conversation_id, user_id)
      SELECT ${conv.id}, unnest(${allUserIds}::uuid[])
    `;
  } catch (e: unknown) {
    return fail(e instanceof Error ? e.message : 'Failed to add members', 500);
  }

  return ok({ id: conv.id, existing: false });
}
