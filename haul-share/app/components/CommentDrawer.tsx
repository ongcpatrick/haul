'use client';

import { useEffect, useRef, useState } from 'react';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author: { username: string; avatar_url: string | null };
}

interface Props {
  haulId: string;
  initialCount: number;
  isLoggedIn: boolean;
  onCountChange?: (n: number) => void;
}

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentDrawer({ haulId, initialCount, isLoggedIn, onCountChange }: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/comments?haulId=${haulId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setComments(Array.isArray(d.data) ? d.data : []);
      })
      .finally(() => setLoading(false));
  }, [open, haulId]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ haulId, body: text }),
      });
      if (!res.ok) return;
      const d = await res.json();
      if (d.success && d.data) {
        setComments((prev) => [d.data, ...prev]);
        const next = count + 1;
        setCount(next);
        onCountChange?.(next);
        setBody('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="ml-auto flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        aria-label="View comments"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{count}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-bold text-[var(--text)]">Comments</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)]"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
              {loading && <p className="text-sm text-[var(--muted)] text-center py-4">Loading…</p>}
              {!loading && comments.length === 0 && (
                <p className="text-sm text-[var(--muted)] text-center py-4">No comments yet. Be first!</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {c.author.avatar_url ? (
                    <img src={c.author.avatar_url} alt="" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {c.author.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[var(--text)]">@{c.author.username}</span>
                      <span className="text-xs text-[var(--muted)]">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[var(--text)] mt-0.5 leading-snug">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {isLoggedIn ? (
              <form onSubmit={submit} className="px-5 py-4 border-t border-[var(--border)] flex gap-2">
                <textarea
                  ref={inputRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e as unknown as React.FormEvent); } }}
                  placeholder="Add a comment…"
                  rows={1}
                  className="flex-1 resize-none text-sm border border-[var(--border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg)] text-[var(--text)]"
                />
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {submitting ? '…' : 'Post'}
                </button>
              </form>
            ) : (
              <div className="px-5 py-4 border-t border-[var(--border)] text-center">
                <a href="/sign-in" className="text-sm text-[var(--primary)] font-semibold hover:underline">
                  Sign in to comment
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
