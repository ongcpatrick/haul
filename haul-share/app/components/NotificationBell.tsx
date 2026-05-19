'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type NotifPayload = {
  id: string;
  type: string;
  body: string | null;
  read: boolean;
  from_user: { username: string; display_name: string | null } | null;
};

const TYPE_VERB: Record<string, string> = {
  reaction: 'reacted to your haul',
  comment: 'commented on your haul',
  follow: 'started following you',
  fork: 'forked your haul',
  message: 'sent you a message',
};

function buildBrowserBody(n: NotifPayload): string {
  const name = n.from_user?.display_name ?? n.from_user?.username ?? 'Someone';
  const verb = TYPE_VERB[n.type] ?? 'sent you a notification';
  if (n.type === 'message' && n.body) {
    // body is "Name: preview text" — strip the name prefix so we don't double it
    const preview = n.body.includes(': ') ? n.body.split(': ').slice(1).join(': ') : n.body;
    return `${name}: ${preview}`;
  }
  if ((n.type === 'comment') && n.body) return `${name} ${verb}: "${n.body}"`;
  return `${name} ${verb}`;
}

function fireNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico', tag: `haul-${Date.now()}` });
  } catch { /* some browsers restrict outside user gesture */ }
}

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const seenIds = useRef<Set<string>>(new Set());
  const isFirstPoll = useRef(true);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!json.success || !Array.isArray(json.data)) return;

        const notifs: NotifPayload[] = json.data;
        const unreadCount = typeof json.unread_count === 'number' ? json.unread_count : notifs.filter((n) => !n.read).length;
        setUnread(unreadCount);

        const unreadNotifs = notifs.filter((n) => !n.read);

        if (isFirstPoll.current) {
          // On first load: fire one browser notification summarising all unread
          if (unreadNotifs.length > 0 && Notification.permission === 'granted') {
            if (unreadNotifs.length === 1) {
              fireNotification('Haul', buildBrowserBody(unreadNotifs[0]));
            } else {
              fireNotification('Haul', `You have ${unreadNotifs.length} unread notifications`);
            }
          }
          // Seed seen IDs so we don't re-fire on next poll
          for (const n of notifs) seenIds.current.add(n.id);
          isFirstPoll.current = false;
          return;
        }

        // Subsequent polls: fire browser notification for each new notification
        for (const n of unreadNotifs) {
          if (!seenIds.current.has(n.id)) {
            seenIds.current.add(n.id);
            fireNotification('Haul', buildBrowserBody(n));
          }
        }
      } catch {
        // ignore
      }
    }

    poll();
    const id = setInterval(poll, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
      className="relative hidden sm:flex items-center justify-center w-9 h-9 rounded-full hover:bg-[var(--bg)] transition-colors text-[var(--muted)] hover:text-[var(--text)]"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
