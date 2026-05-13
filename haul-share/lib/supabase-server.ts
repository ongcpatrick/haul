import { auth } from '@clerk/nextjs/server';
import sql from './db';

export async function getCurrentDbUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE clerk_id = ${clerkId} LIMIT 1
  `;
  return rows[0]?.id ?? null;
}
