import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdminClient } from '@/lib/supabase-server';
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

  // If the caller is authenticated, enforce that they only sync their own record
  const { userId } = await auth();
  if (userId && userId !== clerkId) {
    return fail('Cannot sync a different user', 403);
  }

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return fail('Username must be 3-30 chars (a-z, 0-9, underscore)');
  }

  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from('users')
    .upsert(
      {
        clerk_id: clerkId,
        username,
        display_name: body.displayName ?? null,
        avatar_url: body.avatarUrl ?? null,
        bio: body.bio ?? null,
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}
