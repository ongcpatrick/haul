import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOAuthState, generatePKCEVerifier, computePKCEChallenge, stateCookieOpts } from '@/lib/oauth-crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_URL!));

  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'Twitter not configured' }, { status: 503 });

  const state = generateOAuthState();
  const verifier = generatePKCEVerifier();
  const challenge = computePKCEChallenge(verifier);
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/twitter/callback`;

  const url = new URL('https://twitter.com/i/oauth2/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'tweet.read users.read offline.access');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(url.toString());
  res.headers.append('Set-Cookie', stateCookieOpts('__haul_tw_state', state));
  res.headers.append('Set-Cookie', stateCookieOpts('__haul_tw_verifier', verifier));
  return res;
}
