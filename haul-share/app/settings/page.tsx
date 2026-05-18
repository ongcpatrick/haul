import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import sql from '@/lib/db';
import type { User } from '@/lib/types';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE clerk_id = ${userId} LIMIT 1
  `;
  if (!user) redirect('/onboarding');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          href={`/u/${user.username}`}
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Profile
        </Link>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <h1 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text)' }}>
          Settings
        </h1>
      </div>

      <SettingsForm
        initialDisplayName={user.display_name ?? ''}
        initialBio={user.bio ?? ''}
        initialStyles={Array.isArray(user.fashion_styles) ? user.fashion_styles : []}
        email={email}
        username={user.username}
      />
    </div>
  );
}
