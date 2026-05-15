import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import { generateAppleClientSecret, decodeAppleIdToken, encryptToken, clearCookie } from '@/lib/oauth-crypto';
import sql from '@/lib/db';
import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_URL!;

// Apple sends the OAuth callback as a POST with application/x-www-form-urlencoded body.
// response_mode=form_post is mandatory — Apple never uses query params.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(`${BASE}/sign-in`);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.redirect(`${BASE}/connect?error=apple_body`);
  }

  const code = formData.get('code') as string | null;
  const state = formData.get('state') as string | null;
  const idToken = formData.get('id_token') as string | null;
  const error = formData.get('error') as string | null;
  // `user` JSON only present on the very first authorization
  const userJson = formData.get('user') as string | null;

  if (error || !code || !state) {
    return NextResponse.redirect(`${BASE}/connect?error=apple_denied`);
  }

  // CSRF check against cookie
  const cookieStore = await cookies();
  const savedState = cookieStore.get('__haul_ap_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${BASE}/connect?error=apple_state`);
  }

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return NextResponse.redirect(`${BASE}/onboarding`);

  try {
    const redirectUri = `${BASE}/api/auth/apple/callback`;
    const clientSecret = generateAppleClientSecret();

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.APPLE_SERVICE_ID!,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenJson = await tokenRes.json() as {
      access_token?: string;
      id_token?: string;
      refresh_token?: string;
      error?: string;
    };

    if (tokenJson.error || (!tokenJson.id_token && !idToken)) {
      return NextResponse.redirect(`${BASE}/connect?error=apple_token`);
    }

    const rawIdToken = tokenJson.id_token ?? idToken!;
    const { sub: appleUserId, email } = decodeAppleIdToken(rawIdToken);

    // Name is only provided by Apple on first auth — parse it if present
    let displayName: string | null = null;
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson) as { name?: { firstName?: string; lastName?: string } };
        const first = parsed.name?.firstName ?? '';
        const last = parsed.name?.lastName ?? '';
        displayName = `${first} ${last}`.trim() || null;
      } catch { /* noop */ }
    }

    const encToken = tokenJson.refresh_token ? encryptToken(tokenJson.refresh_token) : null;
    const platformUsername = displayName ?? email ?? null;

    await sql`
      INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, encrypted_token)
      VALUES (${dbUserId}, 'apple', ${appleUserId}, ${platformUsername}, ${encToken})
      ON CONFLICT (user_id, platform) DO UPDATE
        SET platform_user_id  = EXCLUDED.platform_user_id,
            platform_username = COALESCE(EXCLUDED.platform_username, social_connections.platform_username),
            encrypted_token   = COALESCE(EXCLUDED.encrypted_token, social_connections.encrypted_token),
            connected_at      = NOW()
    `;

    const res = NextResponse.redirect(`${BASE}/people?connected=apple`);
    res.headers.set('Set-Cookie', clearCookie('__haul_ap_state'));
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    const code = message.includes('not configured') ? 'apple_config' : 'apple_failed';
    return NextResponse.redirect(`${BASE}/connect?error=${code}`);
  }
}
