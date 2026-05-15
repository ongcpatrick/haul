import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import ConnectClient from './ConnectClient';

export const dynamic = 'force-dynamic';

export default async function ConnectPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/connect');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const connections = await sql<{ platform: string; platform_username: string | null }[]>`
    SELECT platform, platform_username FROM social_connections WHERE user_id = ${dbUserId}
  `.catch(() => []);

  const connected = new Set(connections.map((c) => c.platform));
  const labels = Object.fromEntries(connections.map((c) => [c.platform, c.platform_username]));

  return (
    <ConnectClient
      connectedPlatforms={[...connected] as ('facebook' | 'twitter' | 'instagram')[]}
      platformUsernames={labels}
    />
  );
}
