import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import OnboardingForm from './OnboardingForm';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.onboardingComplete) redirect('/feed');

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
