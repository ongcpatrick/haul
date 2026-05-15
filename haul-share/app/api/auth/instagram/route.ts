import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOAuthState, stateCookieOpts } from '@/lib/oauth-crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_URL!));

  const appId = process.env.INSTAGRAM_APP_ID ?? process.env.FACEBOOK_APP_ID;
  if (!appId) return NextResponse.json({ error: 'Instagram not configured' }, { status: 503 });

  const state = generateOAuthState();
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/instagram/callback`;

  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', appId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'instagram_business_basic');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  const res = NextResponse.redirect(url.toString());
  res.headers.set('Set-Cookie', stateCookieOpts('__haul_ig_state', state));
  return res;
}
