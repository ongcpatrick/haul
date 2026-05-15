import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function CircleJoinPage({ params }: Props) {
  const { userId } = await auth();
  const { code } = await params;

  if (!userId) {
    redirect(`/sign-in?redirect_url=/circles/join/${code}`);
  }

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const [circle] = await sql<{ id: string; name: string }[]>`
    SELECT id, name FROM circles WHERE invite_code = ${code} LIMIT 1
  `;

  if (!circle) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold mb-2">Invalid invite link</h1>
          <p className="text-gray-500 mb-6">This invite link is invalid or has expired.</p>
          <Link href="/circles" className="text-sm text-indigo-600 hover:underline">Browse your circles</Link>
        </div>
      </main>
    );
  }

  await sql`
    INSERT INTO circle_members (circle_id, user_id, role)
    VALUES (${circle.id}, ${dbUserId}, 'member')
    ON CONFLICT (circle_id, user_id) DO NOTHING
  `;

  redirect(`/circles/${circle.id}`);
}
