import { auth, currentUser } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';
import OnboardingForm from './OnboardingForm';
import { setOnboardedCookie } from '@/app/actions/onboarding';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Check DB directly — reliable regardless of JWT claim config.
  const [existing] = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE clerk_id = ${userId} LIMIT 1
  `;
  if (existing) {
    // User is already onboarded — refresh the cookie in case it was cleared.
    setOnboardedCookie(await cookies());
    redirect('/feed');
  }

  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const emailPrefix = user.emailAddresses[0]?.emailAddress?.split('@')[0] ?? '';
  const defaultUsername = (user.username ?? emailPrefix)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 30);
  const defaultDisplayName = user.fullName ?? user.firstName ?? '';

  return (
    <OnboardingForm
      imageUrl={user.imageUrl}
      firstName={user.firstName ?? 'there'}
      defaultUsername={defaultUsername}
      defaultDisplayName={defaultDisplayName}
    />
  );
}
