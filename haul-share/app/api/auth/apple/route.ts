import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateOAuthState, stateCookieOpts } from '@/lib/oauth-crypto';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_URL!));

  if (!process.env.APPLE_SERVICE_ID) {
    return NextResponse.json({ error: 'Apple Sign In not configured' }, { status: 503 });
  }

  const state = generateOAuthState();
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth/apple/callback`;

  const url = new URL('https://appleid.apple.com/auth/authorize');
  url.searchParams.set('client_id', process.env.APPLE_SERVICE_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code id_token');
  url.searchParams.set('response_mode', 'form_post'); // Apple always POSTs back
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('state', state);

  const res = NextResponse.redirect(url.toString());
  res.headers.set('Set-Cookie', stateCookieOpts('__haul_ap_state', state));
  return res;
}
