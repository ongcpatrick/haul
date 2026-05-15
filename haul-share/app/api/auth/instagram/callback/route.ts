import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import { encryptToken, clearCookie } from '@/lib/oauth-crypto';
import sql from '@/lib/db';
import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_URL!;

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(`${BASE}/sign-in`);

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(`${BASE}/connect?error=instagram_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('__haul_ig_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${BASE}/connect?error=instagram_state`);
  }

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return NextResponse.redirect(`${BASE}/onboarding`);

  const appId = process.env.INSTAGRAM_APP_ID ?? process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET ?? process.env.FACEBOOK_APP_SECRET;

  try {
    const redirectUri = `${BASE}/api/auth/instagram/callback`;

    // Exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId!,
        client_secret: appSecret!,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });
    const tokenJson = await tokenRes.json() as { access_token?: string; user_id?: number; error_message?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${BASE}/connect?error=instagram_token`);
    }

    // Exchange short-lived for long-lived token
    const longRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${tokenJson.access_token}`
    );
    const longJson = await longRes.json() as { access_token?: string };
    const finalToken = longJson.access_token ?? tokenJson.access_token;

    // Fetch profile
    const profileRes = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,name&access_token=${finalToken}`
    );
    const profile = await profileRes.json() as { id: string; username: string; name?: string };

    const encToken = encryptToken(finalToken);

    await sql`
      INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, encrypted_token)
      VALUES (${dbUserId}, 'instagram', ${profile.id}, ${profile.username ?? null}, ${encToken})
      ON CONFLICT (user_id, platform) DO UPDATE
        SET platform_user_id  = EXCLUDED.platform_user_id,
            platform_username = EXCLUDED.platform_username,
            encrypted_token   = EXCLUDED.encrypted_token,
            connected_at      = NOW()
    `;

    const res = NextResponse.redirect(`${BASE}/people?connected=instagram`);
    res.headers.set('Set-Cookie', clearCookie('__haul_ig_state'));
    return res;
  } catch {
    return NextResponse.redirect(`${BASE}/connect?error=instagram_failed`);
  }
}
