import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/db';
import { fail, ok, readJson, requireString } from '@/lib/api';

interface SyncBody {
  clerkId?: string;
  username?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export async function POST(req: Request) {
  const body = await readJson<SyncBody>(req);
  if (!body) return fail('Invalid JSON body');

  let clerkId: string;
  let username: string;
  try {
    clerkId = requireString(body.clerkId, 'clerkId');
    username = requireString(body.username, 'username').toLowerCase();
  } catch (e: unknown) {
    return fail(e instanceof Error ? e.message : 'Invalid request');
  }

  const { userId } = await auth();
  if (userId && userId !== clerkId) return fail('Cannot sync a different user', 403);

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return fail('Username must be 3-30 chars (a-z, 0-9, underscore)');
  }

  const rows = await sql`
    INSERT INTO users (clerk_id, username, display_name, avatar_url, bio)
    VALUES (${clerkId}, ${username}, ${body.displayName ?? null}, ${body.avatarUrl ?? null}, ${body.bio ?? null})
    ON CONFLICT (clerk_id) DO UPDATE SET
      username = EXCLUDED.username,
      display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url,
      bio = EXCLUDED.bio
    RETURNING *
  `;
  if (!rows[0]) return fail('Failed to sync user', 500);
  return ok(rows[0]);
}
