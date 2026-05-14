import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/view/:id',
  '/u/:username',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding',
  '/api/(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Not signed in → allow public routes, gate everything else
  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next();
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // JWT claims require custom Clerk dashboard session token config.
  // Use the server-set cookie as the reliable fallback.
  const cookieOnboarded = req.cookies.get('haul_onboarded')?.value === '1';
  const onboarded = !!(sessionClaims?.metadata?.onboardingComplete) || cookieOnboarded;

  // Already onboarded visiting /onboarding → skip to feed
  if (isOnboardingRoute(req) && onboarded) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  // Signed in but not onboarded → send to /onboarding (except API + public routes)
  if (!onboarded && !isOnboardingRoute(req) && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
