'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';

type PendingPost = { products: Product[]; title: string; timestamp: number };

export default function NewHaulClient({ username }: { username: string }) {
  const [pending, setPending] = useState<PendingPost | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const attempts = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window || event.data?.type !== 'HAUL_PENDING_POST') return;
      if (done.current) return;
      done.current = true;
      const data = event.data.data as PendingPost | null;
      setPending(data);
      if (data?.title) setTitle(data.title);
      setLoaded(true);
    }

    window.addEventListener('message', onMessage);

    function request() {
      window.postMessage({ type: 'HAUL_GET_PENDING_POST' }, '*');
      attempts.current++;
    }

    request();
    const id = setInterval(() => {
      if (done.current || attempts.current >= 8) { clearInterval(id); setLoaded(true); return; }
      request();
    }, 400);

    return () => {
      window.removeEventListener('message', onMessage);
      clearInterval(id);
    };
  }, []);

  async function publish() {
    if (!pending?.products.length) return;
    setPublishing(true);
    setError('');
    try {
      const res = await fetch('/api/hauls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: pending.products, title: title.trim() || 'My Haul', isPublic: true }),
      });
      if (!res.ok) throw new Error('Failed to publish');
      setPublished(true);
      setTimeout(() => router.push(`/u/${username}`), 1500);
    } catch {
      setError('Could not publish. Please try again.');
      setPublishing(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
        <p className="text-[var(--muted)] text-sm">Loading your haul from the extension…</p>
      </div>
    );
  }

  if (!pending || !pending.products.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="text-5xl">🛍️</div>
        <h2 className="text-xl font-bold text-[var(--text)]">No haul found</h2>
        <p className="text-[var(--muted)] text-sm max-w-xs">
          Open the Haul extension, select some products, and click &ldquo;Post to My Feed + Explore&rdquo; to share here.
        </p>
        <a href="/feed" className="mt-2 text-sm font-semibold text-[var(--primary)] hover:underline">
          Go to Feed →
        </a>
      </div>
    );
  }

  if (published) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-[var(--text)]">Haul published!</h2>
        <p className="text-[var(--muted)] text-sm">Redirecting to your profile…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Review your haul</h1>
        <p className="text-[var(--muted)] text-sm mt-1">{pending.products.length} item{pending.products.length !== 1 ? 's' : ''} ready to share</p>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Give your haul a name…"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-40"
        />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {pending.products.map((p) => (
          <div key={p.id} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full aspect-square object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full aspect-square bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] text-3xl">🛍️</div>
            )}
            <div className="p-3 flex flex-col gap-0.5 flex-1">
              <p className="text-xs font-semibold text-[var(--text)] line-clamp-2 leading-snug">{p.name}</p>
              {p.siteName && <p className="text-[10px] text-[var(--muted)]">{p.siteName}</p>}
              {p.price != null && (
                <p className="text-xs font-bold text-[var(--primary)] mt-auto pt-1">${p.price.toFixed(2)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={publish}
          disabled={publishing}
          className="flex-1 py-3 px-6 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {publishing ? 'Publishing…' : 'Publish to Feed'}
        </button>
        <a
          href="/feed"
          className="py-3 px-5 rounded-xl border border-[var(--border)] text-[var(--muted)] font-semibold text-sm hover:bg-[var(--surface)] transition-colors"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
