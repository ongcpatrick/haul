'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Circle, User } from '@/lib/types';

interface Props {
  circle: Circle & { is_private: boolean; cover_color: string; member_count: number };
  memberCount: number;
  previewMembers: Pick<User, 'id' | 'username' | 'avatar_url'>[];
  pendingRequest: boolean;
  currentUserId: string;
}

export default function GroupGate({ circle, memberCount, previewMembers, pendingRequest, currentUserId }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'joined' | 'loading'>(
    pendingRequest ? 'pending' : 'idle'
  );

  const join = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/circles/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ circleId: circle.id }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus(json.data?.status === 'joined' ? 'joined' : 'pending');
        if (json.data?.status === 'joined') {
          window.location.reload();
        }
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Group cover */}
      <div
        className="relative h-52 flex flex-col items-center justify-end pb-6"
        style={{ background: `linear-gradient(160deg, ${circle.cover_color}99, ${circle.cover_color})` }}
      >
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        {/* Lock icon for private groups */}
        {circle.is_private && (
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Private Group
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-white text-center px-6 drop-shadow-sm">
          {circle.name}
        </h1>
        {circle.description && (
          <p className="text-white/80 text-sm text-center px-8 mt-1 line-clamp-2">{circle.description}</p>
        )}
      </div>

      {/* Gate card */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden">

          {/* Member count + previews */}
          <div className="px-6 pt-6 pb-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {previewMembers.slice(0, 5).map((m) =>
                  m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={m.id} src={m.avatar_url} alt={m.username} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div key={m.id} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white" style={{ background: circle.cover_color }}>
                      {m.username[0]?.toUpperCase()}
                    </div>
                  )
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
                <p className="text-xs text-[var(--muted)]">in this group</p>
              </div>
            </div>
          </div>

          {/* Locked content preview */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Members-only content</p>
            </div>

            {/* Blurred placeholder rows */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 mb-3 opacity-40 blur-sm select-none" aria-hidden>
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Join / request CTA */}
          <div className="px-6 pb-6">
            {status === 'pending' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-sm font-semibold text-amber-800">Request sent</p>
                <p className="text-xs text-amber-600 mt-0.5">The group admin will review your request.</p>
              </div>
            ) : status === 'joined' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-center">
                <p className="text-sm font-semibold text-green-800">Joined! Refreshing…</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={join}
                disabled={status === 'loading'}
                className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: circle.cover_color }}
              >
                {status === 'loading'
                  ? 'Requesting…'
                  : circle.is_private
                  ? 'Request to join'
                  : 'Join group'}
              </button>
            )}

            <Link href="/circles" className="block text-center mt-3 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Back to your groups
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
