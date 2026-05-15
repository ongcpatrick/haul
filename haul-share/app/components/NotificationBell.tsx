'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/notifications?countOnly=true');
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (typeof json.unread_count === 'number') setUnread(json.unread_count);
      } catch {
        // ignore network errors silently
      }
    }

    poll();
    const id = setInterval(poll, 45_000);
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
