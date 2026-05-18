'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import sql from '@/lib/db';

export async function completeOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated' };

  const username = (formData.get('username') as string | null)?.toLowerCase().trim() ?? '';
  const displayName = (formData.get('displayName') as string | null)?.trim() || null;
  const avatarUrl = (formData.get('avatarUrl') as string | null) || null;
  const fashionStylesRaw = (formData.get('fashionStyles') as string | null) ?? '[]';
  const fashionStyles: string[] = (() => {
    try { return JSON.parse(fashionStylesRaw); } catch { return []; }
  })();

  if (!username || !/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: 'Username must be 3–30 characters (letters, numbers, underscore only)' };
  }

  try {
    await sql`
      INSERT INTO users (clerk_id, username, display_name, avatar_url, fashion_styles)
      VALUES (${userId}, ${username}, ${displayName}, ${avatarUrl}, ${fashionStyles})
      ON CONFLICT (clerk_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        fashion_styles = EXCLUDED.fashion_styles
    `;

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { onboardingComplete: true, fashionStyles },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const pgErr = err as { code?: string };
    if (pgErr.code === '23505') {
      return { error: 'That username is already taken, try another' };
    }
    return { error: 'Something went wrong, please try again' };
  }
}
