import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOAuthState, stateCookieOpts } from '@/lib/oauth-crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_URL!));

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) return NextResponse.json({ error: 'Facebook not configured' }, { status: 503 });

  const state = generateOAuthState();
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/facebook/callback`;

  const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'public_profile,email,user_friends');
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');

  const res = NextResponse.redirect(url.toString());
  res.headers.set('Set-Cookie', stateCookieOpts('__haul_fb_state', state));
  return res;
}
