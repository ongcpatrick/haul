import { ok, fail } from '@/lib/api';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';

export interface SuggestedUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  haul_count: number;
  source: 'facebook' | 'twitter' | 'instagram' | 'mutual';
  source_username?: string;
}

export async function GET() {
  const userId = await getCurrentDbUserId();
  if (!userId) return fail('Unauthorized', 401);

  try {
    const [myConnections, alreadyFollowing] = await Promise.all([
      sql<{ platform: string; platform_friend_ids: string[] }[]>`
        SELECT platform, platform_friend_ids
        FROM social_connections
        WHERE user_id = ${userId}
      `,
      sql<{ addressee_id: string }[]>`
        SELECT addressee_id FROM friendships WHERE requester_id = ${userId}
      `,
    ]);

    const followingIds = new Set(alreadyFollowing.map((r) => r.addressee_id));
    const results: SuggestedUser[] = [];
    const seen = new Set<string>([userId]);

    // ── Facebook mutual matching ──────────────────────────────────────────────
    const fbConn = myConnections.find((c) => c.platform === 'facebook');
    if (fbConn && Array.isArray(fbConn.platform_friend_ids) && fbConn.platform_friend_ids.length > 0) {
      const fbMatches = await sql<SuggestedUser[]>`
        SELECT u.id, u.username, u.display_name, u.avatar_url,
               sc.platform_username AS source_username,
               COALESCE(
                 (SELECT COUNT(*) FROM hauls WHERE user_id = u.id AND is_public = true), 0
               ) AS haul_count
        FROM social_connections sc
        JOIN users u ON u.id = sc.user_id
        WHERE sc.platform = 'facebook'
          AND sc.platform_user_id = ANY(${fbConn.platform_friend_ids}::text[])
          AND sc.user_id != ${userId}
      `;
      for (const u of fbMatches) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          results.push({ ...u, haul_count: Number(u.haul_count), source: 'facebook' });
        }
      }
    }

    // ── Twitter username matching ─────────────────────────────────────────────
    const twConn = myConnections.find((c) => c.platform === 'twitter');
    if (twConn) {
      // Surface other Haul users who have connected Twitter (social proof)
      const twMatches = await sql<SuggestedUser[]>`
        SELECT u.id, u.username, u.display_name, u.avatar_url,
               sc.platform_username AS source_username,
               COALESCE(
                 (SELECT COUNT(*) FROM hauls WHERE user_id = u.id AND is_public = true), 0
               ) AS haul_count
        FROM social_connections sc
        JOIN users u ON u.id = sc.user_id
        WHERE sc.platform = 'twitter'
          AND sc.user_id != ${userId}
        ORDER BY u.created_at DESC
        LIMIT 10
      `;
      for (const u of twMatches) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          results.push({ ...u, haul_count: Number(u.haul_count), source: 'twitter' });
        }
      }
    }

    // ── Instagram username matching ───────────────────────────────────────────
    const igConn = myConnections.find((c) => c.platform === 'instagram');
    if (igConn) {
      const igMatches = await sql<SuggestedUser[]>`
        SELECT u.id, u.username, u.display_name, u.avatar_url,
               sc.platform_username AS source_username,
               COALESCE(
                 (SELECT COUNT(*) FROM hauls WHERE user_id = u.id AND is_public = true), 0
               ) AS haul_count
        FROM social_connections sc
        JOIN users u ON u.id = sc.user_id
        WHERE sc.platform = 'instagram'
          AND sc.user_id != ${userId}
        ORDER BY u.created_at DESC
        LIMIT 10
      `;
      for (const u of igMatches) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          results.push({ ...u, haul_count: Number(u.haul_count), source: 'instagram' });
        }
      }
    }

    // ── In-app mutual friend graph (friends-of-friends) ───────────────────────
    if (results.length < 20) {
      const mutuals = await sql<SuggestedUser[]>`
        SELECT DISTINCT u.id, u.username, u.display_name, u.avatar_url,
               NULL AS source_username,
               COALESCE(
                 (SELECT COUNT(*) FROM hauls WHERE user_id = u.id AND is_public = true), 0
               ) AS haul_count
        FROM friendships f1
        JOIN friendships f2 ON f2.requester_id = f1.addressee_id
        JOIN users u ON u.id = f2.addressee_id
        WHERE f1.requester_id = ${userId}
          AND f2.addressee_id != ${userId}
          AND f2.status = 'accepted'
          AND f1.status = 'accepted'
        LIMIT 15
      `;
      for (const u of mutuals) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          results.push({ ...u, haul_count: Number(u.haul_count), source: 'mutual' });
        }
      }
    }

    // Filter out people already followed
    const filtered = results.filter((u) => !followingIds.has(u.id));
    return ok(filtered);
  } catch {
    return ok([]);
  }
}
