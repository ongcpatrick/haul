import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import { fail, ok } from '@/lib/api';
import sql from '@/lib/db';
import { createExtensionToken, hashExtensionToken } from '@/lib/extension-auth';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('Complete profile setup first', 403);

  const [user] = await sql<{ username: string }[]>`
    SELECT username FROM users WHERE id = ${dbUserId} LIMIT 1
  `;
  if (!user) return fail('User not found', 404);

  const newToken = createExtensionToken();
  const tokenHash = hashExtensionToken(newToken);
  const [row] = await sql<{ username: string }[]>`
    INSERT INTO extension_tokens (user_id, token_hash, username)
    VALUES (${dbUserId}, ${tokenHash}, ${user.username})
    ON CONFLICT (user_id) DO UPDATE SET
      token_hash = EXCLUDED.token_hash,
      username = EXCLUDED.username,
      created_at = now(),
      expires_at = now() + INTERVAL '7 days'
    RETURNING username
  `;

  return ok({ token: newToken, username: row.username });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return fail('Unauthorized', 401);

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return fail('User not synced', 400);

  await sql`
    DELETE FROM extension_tokens
    WHERE user_id = ${dbUserId}
  `;

  return ok({ revoked: true });
}
