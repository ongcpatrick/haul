import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/view/:id',
  '/u/:username',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding',
  '/api/webhooks/(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Not signed in → allow public routes, gate everything else
  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next();
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Signed in → let through. Each protected page checks the DB itself
  // via getCurrentDbUserId() and redirects to /onboarding if needed.
  // Doing the onboarding check here requires JWT custom claims config in
  // the Clerk dashboard, which causes the "button does nothing" bug.
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
