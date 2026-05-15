import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok, readJson } from '@/lib/api';
import sql from '@/lib/db';

interface FriendBody {
  targetUserId?: string;
  action?: 'follow' | 'unfollow';
}

export async function POST(req: Request) {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const body = await readJson<FriendBody>(req);
  if (!body?.targetUserId) return fail('targetUserId required');
  if (body.targetUserId === dbUserId) return fail('Cannot follow yourself');

  if (body.action === 'unfollow') {
    await sql`
      DELETE FROM friendships
      WHERE requester_id = ${dbUserId} AND addressee_id = ${body.targetUserId}
    `;
    return ok({ following: false });
  }

  const [friendship] = await sql`
    INSERT INTO friendships (requester_id, addressee_id, status)
    VALUES (${dbUserId}, ${body.targetUserId}, 'accepted')
    ON CONFLICT (requester_id, addressee_id)
    DO UPDATE SET status = 'accepted'
    RETURNING *
  `;

  // Notify the person being followed (fire-and-forget)
  sql`
    INSERT INTO notifications (user_id, from_user_id, type, body)
    VALUES (${body.targetUserId}, ${dbUserId}, 'follow', 'followed you')
  `.catch(() => {});

  return ok({ following: true, friendship });
}

export async function GET() {
  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Unauthorized', 401);

  const friendships = await sql`
    SELECT * FROM friendships
    WHERE requester_id = ${dbUserId} OR addressee_id = ${dbUserId}
  `;
  return ok(friendships);
}
