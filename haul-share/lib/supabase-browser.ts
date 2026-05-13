'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Hook returning a Supabase browser client that injects the current Clerk
 * JWT on every request. Suitable for realtime subscriptions and reads.
 */
export function useSupabaseBrowser(): SupabaseClient {
  const { getToken } = useAuth();

  return useMemo(
    () =>
      createClient(SUPABASE_URL, SUPABASE_ANON, {
        global: {
          fetch: async (input, init = {}) => {
            const token = await getToken({ template: 'supabase' }).catch(() => null);
            const headers = new Headers(init.headers);
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return fetch(input, { ...init, headers });
          },
        },
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 5 } },
      }),
    [getToken]
  );
}

/**
 * Anonymous browser client — for unauthenticated reads (e.g. public profile pages).
 */
export function createAnonBrowserClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
