import { notFound } from 'next/navigation';
import { getSupabaseAdminClient, getCurrentDbUserId } from '@/lib/supabase-server';
import type { Haul, HaulWithAuthor, User } from '@/lib/types';
import HaulCard from '@/app/components/HaulCard';
import EmptyState from '@/app/components/EmptyState';
import FollowButton from './FollowButton';

interface Params {
  params: Promise<{ username: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: Params) {
  const { username } = await params;
  const admin = getSupabaseAdminClient();

  const { data: user } = await admin
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle<User>();

  if (!user) notFound();

  const [{ data: hauls }, { count: friendCount }, viewerId] = await Promise.all([
    admin
      .from('hauls')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(60),
    admin
      .from('friendships')
      .select('*', { count: 'exact', head: true })
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted'),
    getCurrentDbUserId(),
  ]);

  const list: Haul[] = hauls ?? [];

  const totalSavings = list.reduce((sum, h) => {
    return (
      sum +
      h.products.reduce((s, p) => {
        if (p.originalPrice != null && p.price != null && p.originalPrice > p.price) {
          return s + (p.originalPrice - p.price);
        }
        return s;
      }, 0)
    );
  }, 0);

  const cards: HaulWithAuthor[] = list.map((h) => ({
    ...h,
    author: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    },
  }));

  const isSelf = viewerId === user.id;
  const initialFollowing = await checkFollowing(viewerId, user.id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-[var(--border)]">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-24 h-24 rounded-full border-2 border-[var(--border)]"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-3xl font-bold text-[var(--muted)]">
            {user.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">
            {user.display_name ?? user.username}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">@{user.username}</p>
          {user.bio && (
            <p className="mt-3 text-sm text-[var(--text)] leading-relaxed max-w-prose">
              {user.bio}
            </p>
          )}
          <p className="mt-3 text-xs text-[var(--muted)]">
            Joined{' '}
            {new Date(user.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        {!isSelf && viewerId && (
          <FollowButton targetUserId={user.id} initialFollowing={initialFollowing} />
        )}
      </header>

      <section className="grid grid-cols-3 gap-3 mt-8">
        <Stat label="Hauls" value={list.length.toString()} />
        <Stat label="Friends" value={(friendCount ?? 0).toString()} />
        <Stat label="Savings found" value={`$${totalSavings.toFixed(0)}`} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--text)] mb-4">Public hauls</h2>
        {cards.length === 0 ? (
          <EmptyState
            title="No public hauls yet"
            description={`${user.display_name ?? user.username} hasn’t shared anything publicly.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((h) => (
              <HaulCard key={h.id} haul={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5 text-center">
      <div className="text-2xl font-extrabold text-[var(--text)]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
        {label}
      </div>
    </div>
  );
}

async function checkFollowing(viewerId: string | null, targetId: string): Promise<boolean> {
  if (!viewerId || viewerId === targetId) return false;
  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from('friendships')
    .select('id')
    .eq('requester_id', viewerId)
    .eq('addressee_id', targetId)
    .maybeSingle();
  return Boolean(data);
}
