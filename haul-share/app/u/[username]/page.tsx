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

  const [hauls, friendCountRow, viewerId, topReactedRow] = await Promise.all([
    sql`SELECT * FROM hauls WHERE user_id = ${user.id} AND is_public = true ORDER BY created_at DESC LIMIT 60`,
    sql<[{ count: string }]>`
      SELECT COUNT(*) AS count FROM friendships
      WHERE (requester_id = ${user.id} OR addressee_id = ${user.id}) AND status = 'accepted'
    `,
    getCurrentDbUserId(),
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
    const products = h.products as { price?: number; originalPrice?: number }[];
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-[var(--border)]">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt={user.username} className="w-24 h-24 rounded-full border-2 border-[var(--border)]" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-3xl font-bold text-[var(--muted)]">
            {user.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">{user.display_name ?? user.username}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">@{user.username}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((b) => <BadgeChip key={b.label} {...b} />)}
            </div>
          )}
          {user.bio && <p className="mt-3 text-sm text-[var(--text)] leading-relaxed max-w-prose">{user.bio}</p>}
          <p className="mt-3 text-xs text-[var(--muted)]">
            Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        {!isSelf && viewerId && <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />}
      </header>

      <section className="grid grid-cols-3 gap-3 mt-8">
        <Stat label="Hauls" value={hauls.length.toString()} />
        <Stat label="Friends" value={friendCount.toString()} />
        <Stat label="Savings found" value={`$${totalSavings.toFixed(0)}`} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--text)] mb-4">Public hauls</h2>
        <ProfileHauls
          initialHauls={cards}
          currentUserId={viewerId}
          profileUsername={user.username}
          profileDisplayName={user.display_name ?? null}
        />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5 text-center">
      <div className="text-2xl font-extrabold text-[var(--text)]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">{label}</div>
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
