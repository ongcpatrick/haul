import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getCurrentDbUserId } from '@/lib/supabase-server';
import sql from '@/lib/db';
import Link from 'next/link';
import type { Notification } from '@/lib/types';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_LABEL: Record<string, string> = {
  reaction: 'reacted to your haul',
  comment: 'commented on your haul',
  follow: 'followed you',
  fork: 'forked your haul',
};

type RawNotif = {
  id: string; user_id: string; from_user_id: string | null;
  type: string; haul_id: string | null; body: string | null;
  read: boolean; created_at: string;
  from_username: string | null; from_display_name: string | null; from_avatar_url: string | null;
};

export default async function NotificationsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=/notifications');

  const dbUserId = await getCurrentDbUserId();
  if (!dbUserId) redirect('/onboarding');

  const rows = await sql<RawNotif[]>`
    SELECT n.*, u.username AS from_username, u.display_name AS from_display_name, u.avatar_url AS from_avatar_url
    FROM notifications n
    LEFT JOIN users u ON u.id = n.from_user_id
    WHERE n.user_id = ${dbUserId}
    ORDER BY n.created_at DESC
    LIMIT 40
  `;

  // Mark all as read
  await sql`UPDATE notifications SET read = true WHERE user_id = ${dbUserId} AND read = false`;

  const notifications: (Notification & { from_username?: string })[] = rows.map((n) => ({
    id: n.id,
    user_id: n.user_id,
    from_user_id: n.from_user_id,
    type: n.type as Notification['type'],
    haul_id: n.haul_id,
    body: n.body,
    read: n.read,
    created_at: n.created_at,
    from_user: n.from_user_id ? {
      id: n.from_user_id,
      username: n.from_username ?? 'unknown',
      display_name: n.from_display_name,
      avatar_url: n.from_avatar_url,
    } : undefined,
  }));

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Notifications</h1>
      </header>

      {notifications.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-2xl p-10 text-center">
          <p className="text-[var(--muted)] text-sm">Nothing yet — reactions, comments, and follows will show up here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const actor = n.from_user;
            const actorName = actor?.display_name ?? actor?.username ?? 'Someone';
            const label = TYPE_LABEL[n.type] ?? n.type;

            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                  n.read ? 'bg-white border-[var(--border)]' : 'bg-[var(--primary)] bg-opacity-5 border-[var(--primary)] border-opacity-20'
                }`}
              >
                {/* Avatar */}
                {actor?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={actor.avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0 border border-[var(--border)]" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--muted)] flex-shrink-0">
                    {actorName[0]?.toUpperCase() ?? '?'}
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text)] leading-snug">
                    {actor?.username ? (
                      <Link href={`/u/${actor.username}`} className="font-semibold hover:text-[var(--primary)]">
                        @{actor.username}
                      </Link>
                    ) : (
                      <span className="font-semibold">{actorName}</span>
                    )}
                    {' '}{label}
                    {n.type === 'comment' && n.body && (
                      <span className="text-[var(--muted)]"> — &ldquo;{n.body}&rdquo;</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-[var(--muted)]">{timeAgo(n.created_at)}</p>
                    {n.haul_id && (
                      <Link
                        href={`/feed`}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline"
                      >
                        View haul →
                      </Link>
                    )}
                  </div>
                </div>

                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
