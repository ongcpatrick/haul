import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import MessagesClient from './MessagesClient';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/messages');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const { c: activeId } = await searchParams;

  return <MessagesClient currentUserId={dbUserId} initialActiveId={activeId ?? null} />;
}
