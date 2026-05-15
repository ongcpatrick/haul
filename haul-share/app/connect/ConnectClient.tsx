'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  connectedPlatforms: ('facebook' | 'twitter' | 'instagram')[];
  platformUsernames: Record<string, string | null>;
}

const PLATFORMS = [
  {
    id: 'facebook' as const,
    label: 'Facebook',
    color: '#1877F2',
    bg: '#EFF5FF',
    description: 'Find Facebook friends already on Haul — automatically suggested as connections.',
    power: 'Best for friend discovery',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'twitter' as const,
    label: 'X (Twitter)',
    color: '#000000',
    bg: '#F5F5F5',
    description: 'Connect your X account so mutual followers on X can find you on Haul.',
    power: 'Username matching',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'instagram' as const,
    label: 'Instagram',
    color: '#E1306C',
    bg: '#FFF0F5',
    description: 'Link your Instagram Business or Creator account to add your handle to your profile.',
    power: 'Professional accounts only',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
] as const;

export default function ConnectClient({ connectedPlatforms, platformUsernames }: Props) {
  const [copied, setCopied] = useState(false);
  const connectedSet = new Set(connectedPlatforms);

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/people` : '';

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  // iMessage deep link — opens Messages on Apple devices pre-filled
  const iMessageHref = `sms:&body=Hey! Come see my hauls on Haul — ${inviteLink}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Connect with friends</h1>
        <p className="mt-2 text-sm text-[var(--muted)] max-w-sm mx-auto">
          Link your social accounts to find friends already on Haul — or invite them directly.
        </p>
      </header>

      {/* Social platform cards */}
      <div className="flex flex-col gap-3 mb-8">
        {PLATFORMS.map((p) => {
          const isConnected = connectedSet.has(p.id);
          const username = platformUsernames[p.id];
          return (
            <div
              key={p.id}
              className="bg-white border border-[var(--border)] rounded-2xl p-4 flex items-center gap-4"
              style={{ borderLeftColor: isConnected ? p.color : undefined, borderLeftWidth: isConnected ? 3 : undefined }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: p.bg, color: p.color }}>
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-[var(--text)]">{p.label}</p>
                  {isConnected && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: p.color }}>
                      Connected
                    </span>
                  )}
                </div>
                {isConnected && username ? (
                  <p className="text-xs text-[var(--muted)] truncate">@{username}</p>
                ) : (
                  <p className="text-xs text-[var(--muted)]">{p.description}</p>
                )}
                <p className="text-[10px] font-semibold text-[var(--primary)] mt-0.5">{p.power}</p>
              </div>
              {isConnected ? (
                <span className="text-green-600 flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              ) : (
                <a
                  href={`/api/auth/${p.id}`}
                  className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ background: p.color }}
                >
                  Connect
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Invite divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Or invite directly</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Invite actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* iMessage — opens on iOS/macOS */}
        <a
          href={iMessageHref}
          className="flex items-center gap-3 bg-[#34C759] text-white rounded-2xl px-4 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
            <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z" />
          </svg>
          iMessage
        </a>

        {/* Copy invite link */}
        <button
          type="button"
          onClick={copyInvite}
          className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-2xl px-4 py-3.5 font-semibold text-sm hover:border-[var(--primary)] transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy link
            </>
          )}
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link href="/people" className="text-sm font-semibold text-[var(--primary)] hover:underline">
          See who&apos;s already on Haul
        </Link>
      </div>
    </div>
  );
}
