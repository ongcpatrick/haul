import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in?redirect_url=/u/me');

  const [user] = await sql<{ username: string }[]>`
    SELECT username FROM users WHERE clerk_id = ${clerkId} LIMIT 1
  `;
  if (!user) redirect('/onboarding');

  redirect(`/u/${user.username}`);
}
