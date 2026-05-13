import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';
import sql from '@/lib/db';
import { randomBytes } from 'crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Complete profile setup first', 403);

  const [user] = await sql<{ username: string }[]>`
    SELECT username FROM users WHERE id = ${dbUserId} LIMIT 1
  `;
  if (!user) return fail('User not found', 404);

  // Keep existing valid token (just refresh expiry), create only when none exists.
  const newToken = randomBytes(32).toString('hex');
  const [row] = await sql<{ token: string; username: string }[]>`
    INSERT INTO extension_tokens (user_id, token, username)
    VALUES (${dbUserId}, ${newToken}, ${user.username})
    ON CONFLICT (user_id) DO UPDATE SET
      username = EXCLUDED.username,
      expires_at = now() + INTERVAL '30 days'
    RETURNING token, username
  `;

  return ok({ token: row.token, username: row.username });
}
