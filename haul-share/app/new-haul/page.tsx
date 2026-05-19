import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import NewHaulClient from './NewHaulClient';

export const dynamic = 'force-dynamic';

export default async function NewHaulPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/new-haul');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const [user] = await sql<{ username: string }[]>`
    SELECT username FROM users WHERE id = ${dbUserId} LIMIT 1
  `;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <NewHaulClient username={user?.username ?? ''} />
    </div>
  );
}
