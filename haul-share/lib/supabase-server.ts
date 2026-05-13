import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

/**
 * Returns a Supabase client authenticated as the current Clerk user.
 * The Clerk JWT (with `supabase` template) is forwarded as Authorization
 * so Postgres RLS policies that read `auth.jwt() ->> 'sub'` work.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' }).catch(() => null);

  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: {
      fetch: (input, init = {}) => {
        const headers = new Headers(init.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client — bypasses RLS. Use only in trusted server contexts
 * (e.g. webhooks, user sync, admin operations).
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Look up the internal users.id for the currently signed-in Clerk user.
 * Returns null if unauthenticated or unsynced.
 */
export async function getCurrentDbUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();
  return data?.id ?? null;
}
