import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import CreateHaulClient from './CreateHaulClient';

export default async function CreatePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/create');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  return <CreateHaulClient />;
}
