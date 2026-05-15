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
    return NextResponse.redirect(`${BASE}/connect?error=facebook_denied`);
  }

  // CSRF check
  const cookieStore = await cookies();
  const savedState = cookieStore.get('__haul_fb_state')?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${BASE}/connect?error=facebook_state`);
  }

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) return NextResponse.redirect(`${BASE}/onboarding`);

  try {
    const redirectUri = `${BASE}/api/auth/facebook/callback`;

    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`
    );
    const tokenJson = await tokenRes.json() as { access_token?: string; error?: unknown };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(`${BASE}/connect?error=facebook_token`);
    }
    const accessToken = tokenJson.access_token;

    // Fetch user profile
    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
    );
    const profile = await profileRes.json() as { id: string; name: string; picture?: { data?: { url?: string } } };

    // Fetch Facebook friends who have also authorized this app
    const friendsRes = await fetch(
      `https://graph.facebook.com/me/friends?fields=id&limit=500&access_token=${accessToken}`
    );
    const friendsJson = await friendsRes.json() as { data?: { id: string }[] };
    const friendIds = (friendsJson.data ?? []).map((f) => f.id);

    const encToken = encryptToken(accessToken);

    // Upsert connection
    await sql`
      INSERT INTO social_connections (user_id, platform, platform_user_id, platform_username, encrypted_token, platform_friend_ids)
      VALUES (${dbUserId}, 'facebook', ${profile.id}, ${profile.name ?? null}, ${encToken}, ${JSON.stringify(friendIds)})
      ON CONFLICT (user_id, platform) DO UPDATE
        SET platform_user_id    = EXCLUDED.platform_user_id,
            platform_username   = EXCLUDED.platform_username,
            encrypted_token     = EXCLUDED.encrypted_token,
            platform_friend_ids = EXCLUDED.platform_friend_ids,
            connected_at        = NOW()
    `;

    // Auto-follow Haul users who are mutual Facebook friends
    if (friendIds.length > 0) {
      const matched = await sql<{ user_id: string }[]>`
        SELECT user_id FROM social_connections
        WHERE platform = 'facebook'
          AND platform_user_id = ANY(${friendIds}::text[])
          AND user_id != ${dbUserId}
      `;
      for (const { user_id } of matched) {
        await sql`
          INSERT INTO friendships (requester_id, addressee_id, status)
          VALUES (${dbUserId}, ${user_id}, 'accepted')
          ON CONFLICT DO NOTHING
        `.catch(() => {});
      }
    }

    const res = NextResponse.redirect(`${BASE}/people?connected=facebook`);
    res.headers.set('Set-Cookie', clearCookie('__haul_fb_state'));
    return res;
  } catch {
    return NextResponse.redirect(`${BASE}/connect?error=facebook_failed`);
  }
}
