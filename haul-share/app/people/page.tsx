import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import PeopleSocialSuggestions from './PeopleSocialSuggestions';
import PeopleList from './PeopleList';

export const dynamic = 'force-dynamic';

const SOURCE_BADGE: Record<string, { label: string; color: string }> = {
  facebook: { label: 'Facebook friend', color: '#1877F2' },
  twitter: { label: 'On X', color: '#000' },
  instagram: { label: 'On Instagram', color: '#E1306C' },
  mutual: { label: 'Mutual friend', color: '#6366f1' },
};

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ connected?: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/people');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const { connected } = await searchParams;

  const [people, followingRows, socialConnections] = await Promise.all([
    sql<{ id: string; username: string; display_name: string | null; avatar_url: string | null; haul_count: string }[]>`
      SELECT u.id, u.username, u.display_name, u.avatar_url,
             COUNT(h.id) AS haul_count
      FROM users u
      LEFT JOIN hauls h ON h.user_id = u.id AND h.is_public = true
      WHERE u.id != ${dbUserId}
      GROUP BY u.id
      ORDER BY haul_count DESC, u.created_at DESC
      LIMIT 60
    `,
    sql<{ addressee_id: string }[]>`
      SELECT addressee_id FROM friendships
      WHERE requester_id = ${dbUserId} AND status = 'accepted'
    `,
    sql<{ platform: string }[]>`
      SELECT platform FROM social_connections WHERE user_id = ${dbUserId}
    `.catch(() => []),
  ]);

  const followingIds = new Set(followingRows.map((r) => r.addressee_id));
  const connectedPlatforms = socialConnections.map((c) => c.platform);
  const hasAnySocialConnection = connectedPlatforms.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Connected success banner */}
      {connected && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className="text-sm font-semibold text-green-800">
            {connected === 'facebook' && 'Facebook connected — we\'ve suggested your Facebook friends below.'}
            {connected === 'twitter' && 'X (Twitter) connected — your handle is now on your profile.'}
            {connected === 'instagram' && 'Instagram connected — your IG handle is visible on your profile.'}
            {connected === 'apple' && 'Apple ID connected — your Apple account is linked to your Haul profile.'}
          </p>
        </div>
      )}

      {/* Connect banner if no social connections yet */}
      {!hasAnySocialConnection && (
        <div
          className="mb-8 rounded-3xl p-6"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #9333ea 100%)', color: '#fff' }}
        >
          <h2 className="text-xl font-extrabold mb-1" style={{ color: '#fff' }}>Find your friends on Haul</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.88)' }}>
            Connect Facebook, X, or Instagram to automatically discover people you know.
          </p>
          <Link
            href="/connect"
            className="inline-flex items-center gap-2 bg-white font-bold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            style={{ color: 'var(--primary)' }}
          >
            Connect social accounts
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Social-powered suggestions (client component — fetches /api/friends/discover) */}
      {hasAnySocialConnection && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[var(--text)]">From your social networks</h2>
            <Link href="/connect" className="text-xs font-semibold text-[var(--primary)] hover:underline">
              Manage accounts
            </Link>
          </div>
          <PeopleSocialSuggestions
            currentUserId={dbUserId}
            sourceBadge={SOURCE_BADGE}
            alreadyFollowingIds={[...followingIds]}
          />
        </section>
      )}

      {/* All users */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">
            {hasAnySocialConnection ? 'Everyone on Haul' : 'Discover People'}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Follow people to see their hauls in your feed.</p>
        </div>
        {hasAnySocialConnection && (
          <Link href="/connect" className="text-xs font-semibold text-[var(--primary)] border border-[var(--primary)] px-3 py-1.5 rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors">
            + Connect more
          </Link>
        )}
      </header>

      <PeopleList
        people={people}
        currentUserId={dbUserId}
        followingIds={[...followingIds]}
      />
    </div>
  );
}
