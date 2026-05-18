'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import sql from '@/lib/db';

export async function updateUserProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated' };

  const displayName = (formData.get('displayName') as string | null)?.trim() || null;
  const bio = (formData.get('bio') as string | null)?.trim() || null;
  const fashionStylesRaw = (formData.get('fashionStyles') as string | null) ?? '[]';
  const fashionStyles: string[] = (() => {
    try { return JSON.parse(fashionStylesRaw); } catch { return []; }
  })();

  try {
    await sql`
      UPDATE users
      SET display_name = ${displayName},
          bio = ${bio},
          fashion_styles = ${fashionStyles}
      WHERE clerk_id = ${userId}
    `;

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { onboardingComplete: true, fashionStyles },
    });

    return { success: true as const };
  } catch {
    return { error: 'Something went wrong, please try again' };
  }
}
