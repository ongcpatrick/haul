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
    return NextResponse.redirect(`${BASE}/connect?error=twitter_denied`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('__haul_tw_state')?.value;
  const verifier = cookieStore.get('__haul_tw_verifier')?.value;

  if (!savedState || savedState !== state || !verifier) {
    return NextResponse.redirect(`${BASE}/connect?error=twitter_state`);
  }

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return NextResponse.redirect(`${BASE}/onboarding`);

  try {
    const redirectUri = `${BASE}/api/auth/twitter/callback`;
    const clientId = process.env.TWITTER_CLIENT_ID!;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET!;

    // Exchange code for token (PKCE — no client secret in body for public clients,
    // but Twitter requires Basic auth with client_id:client_secret for confidential clients)
    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });

    const tokenJson = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${BASE}/connect?error=twitter_token`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const profileJson = await profileRes.json() as { data?: { id: string; username: string; name: string } };
    const profile = profileJson.data;
    if (!profile) return NextResponse.redirect(`${BASE}/connect?error=twitter_profile`);

    const encToken = encryptToken(tokenJson.access_token);

    await sql`
      INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, encrypted_token)
      VALUES (${dbUserId}, 'twitter', ${profile.id}, ${profile.username}, ${encToken})
      ON CONFLICT (user_id, platform) DO UPDATE
        SET platform_user_id  = EXCLUDED.platform_user_id,
            platform_username = EXCLUDED.platform_username,
            encrypted_token   = EXCLUDED.encrypted_token,
            connected_at      = NOW()
    `;

    const res = NextResponse.redirect(`${BASE}/people?connected=twitter`);
    res.headers.append('Set-Cookie', clearCookie('__haul_tw_state'));
    res.headers.append('Set-Cookie', clearCookie('__haul_tw_verifier'));
    return res;
  } catch {
    return NextResponse.redirect(`${BASE}/connect?error=twitter_failed`);
  }
}
