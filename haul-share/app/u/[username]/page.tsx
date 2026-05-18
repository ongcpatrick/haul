import { notFound } from 'next/navigation';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import type { HaulWithAuthor, User } from '@/lib/types';
import FollowButton from './FollowButton';
import ProfileHauls from './ProfileHauls';
import BadgeChip from '@/app/components/BadgeChip';

interface Params {
  params: Promise<{ username: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;

  const [user] = await sql<User[]>`
    SELECT * FROM users WHERE username = ${username.toLowerCase()} LIMIT 1
  `;
  if (!user) notFound();

  const viewerIdEarly = await getCurrentDbUserId();
  const isSelfEarly = viewerIdEarly === user.id;

  const [hauls, friendCountRow, viewerId, topReactedRow] = await Promise.all([
    // Show all hauls to yourself, only public to others
    isSelfEarly
      ? sql`SELECT * FROM hauls WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 120`
      : sql`SELECT * FROM hauls WHERE user_id = ${user.id} AND is_public = true ORDER BY created_at DESC LIMIT 60`,
    sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM friendships
      WHERE (requester_id = ${user.id} OR addressee_id = ${user.id}) AND status = 'accepted'
    `,
    Promise.resolve(viewerIdEarly),
    sql<[{ reaction_count: string }]>`
      SELECT COUNT(r.id) AS reaction_count
      FROM hauls h
      LEFT JOIN reactions r ON r.haul_id = h.id
      WHERE h.user_id = ${user.id} AND h.is_public = true
      GROUP BY h.id ORDER BY reaction_count DESC LIMIT 1
    `,
  ]);

  const friendCount = parseInt(friendCountRow[0]?.count ?? '0', 10);
  const maxReactions = parseInt(topReactedRow[0]?.reaction_count ?? '0', 10);

  const totalSavings = hauls.reduce((sum, h) => {
    const products = Array.isArray(h.products) ? h.products as { price?: number; originalPrice?: number }[] : [];
    return (
      sum +
      products.reduce((s, p) => {
        if (p.originalPrice != null && p.price != null && p.originalPrice > p.price) {
          return s + (p.originalPrice - p.price);
        }
        return s;
      }, 0)
    );
  }, 0);

  const cards: HaulWithAuthor[] = hauls.map((h) => ({
    ...(h as unknown as HaulWithAuthor),
    author: { id: user.id, username: user.username, display_name: user.display_name, avatar_url: user.avatar_url },
  }));

  const isSelf = viewerId === user.id;
  const initialFollowing = await checkFollowing(viewerId, user.id);

  const badges: { icon: string; label: string; title: string }[] = [];
  if (new Date(user.created_at) < new Date('2025-06-01'))
    badges.push({ icon: '⚡', label: 'Early Adopter', title: 'Joined Haul early' });
  if (totalSavings > 0)
    badges.push({ icon: '↓', label: 'Saver', title: 'Found real price savings across hauls' });
  if (hauls.length >= 5)
    badges.push({ icon: '◇', label: 'Curator', title: 'Posted 5+ public hauls' });
  if (friendCount >= 5)
    badges.push({ icon: '◎', label: 'Social', title: '5+ connections on Haul' });
  if (maxReactions >= 5)
    badges.push({ icon: '★', label: 'Trendsetter', title: 'A haul with 5+ reactions' });

  const publicCount = hauls.filter((h) => h.is_public).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Instagram-style header */}
      <header className="flex items-start gap-8 mb-10">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
              style={{ border: '3px solid var(--border)' }} />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl font-bold"
              style={{ background: 'var(--surface)', border: '3px solid var(--border)', color: 'var(--muted)' }}>
              {user.username[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
              {user.display_name ?? user.username}
            </h1>
            {!isSelf && viewerId && (
              <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
            )}
          </div>
          <p className="text-sm text-[var(--muted)] mb-3">@{user.username}</p>

          {/* Stats row */}
          <div className="flex gap-6 mb-3">
            <StatInline label="hauls" value={publicCount} />
            <StatInline label="friends" value={friendCount} />
            {totalSavings > 0 && <StatInline label="saved" value={`$${totalSavings.toFixed(0)}`} />}
          </div>

          {user.bio && <p className="text-sm text-[var(--text)] leading-relaxed max-w-sm">{user.bio}</p>}

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {badges.map((b) => <BadgeChip key={b.label} {...b} />)}
            </div>
          )}
        </div>
      </header>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }} />

      {/* Haul grid */}
      <ProfileHauls
        initialHauls={cards}
        currentUserId={viewerId}
        profileUsername={user.username}
        profileDisplayName={user.display_name ?? null}
        isSelf={isSelf}
      />
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <span className="text-base font-extrabold text-[var(--text)]">{value}</span>
      <span className="text-sm text-[var(--muted)] ml-1">{label}</span>
    </div>
  );
}

async function checkFollowing(viewerId: string | null, targetId: string): Promise<boolean> {
  if (!viewerId || viewerId === targetId) return false;
  const [row] = await sql`
    SELECT id FROM friendships WHERE requester_id = ${viewerId} AND addressee_id = ${targetId} LIMIT 1
  `;
  return Boolean(row);
}
