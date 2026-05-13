'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCircleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/circles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const body = (await res.json()) as { success: boolean; data?: { id: string }; error?: string };
      if (!res.ok || !body.success || !body.data) {
        throw new Error(body.error ?? 'Failed to create');
      }
      router.push(`/circles/${body.data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold transition-colors"
      >
        New circle
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => !busy && setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <h2 className="text-xl font-bold text-[var(--text)]">Create a circle</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              A private shopping space you share with friends.
            </p>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Apartment finds"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Description (optional)
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm resize-none"
                />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="px-4 py-2 rounded-full text-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="px-5 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold disabled:opacity-60"
              >
                {busy ? 'Creating…' : 'Create circle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
