'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b',
];

export default function CreateCircleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [color, setColor] = useState(COLORS[0]);
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
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          isPrivate,
          coverColor: color,
        }),
      });
      const body = (await res.json()) as { success: boolean; data?: { id: string }; error?: string };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error ?? 'Failed to create');
      router.push(`/circles/${body.data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
      setBusy(false);
    }
  };

  const close = () => { if (!busy) { setOpen(false); setName(''); setDescription(''); setError(null); } };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-bold transition-colors shadow-sm"
      >
        + New group
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={close}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Preview banner */}
            <div
              className="h-16 transition-colors duration-300"
              style={{ background: `linear-gradient(135deg, ${color}99, ${color})` }}
            />

            <div className="px-6 py-5">
              <h2 className="text-xl font-extrabold text-[var(--text)]">Create a group</h2>
              <p className="text-sm text-[var(--muted)] mt-0.5">A private space to share hauls with trusted friends.</p>

              <div className="mt-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">Group name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={60}
                    placeholder="e.g. Wedding dress picks"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">Description <span className="normal-case font-normal">(optional)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none text-sm resize-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20"
                  />
                </div>

                {/* Color picker */}
                <div>
                  <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-2">Group color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                        style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>

                {/* Privacy toggle */}
                <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isPrivate ? 'bg-[var(--primary)] bg-opacity-5' : 'hover:bg-[var(--bg)]'}`}
                  >
                    <svg className={`w-4 h-4 flex-shrink-0 ${isPrivate ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">Private</p>
                      <p className="text-xs text-[var(--muted)]">Members must request or be invited</p>
                    </div>
                    {isPrivate && <div className="ml-auto w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>}
                  </button>
                  <div className="h-px bg-[var(--border)]" />
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${!isPrivate ? 'bg-[var(--primary)] bg-opacity-5' : 'hover:bg-[var(--bg)]'}`}
                  >
                    <svg className={`w-4 h-4 flex-shrink-0 ${!isPrivate ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">Open</p>
                      <p className="text-xs text-[var(--muted)]">Anyone with the link can join</p>
                    </div>
                    {!isPrivate && <div className="ml-auto w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>}
                  </button>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={busy}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !name.trim()}
                  className="flex-1 px-5 py-2.5 rounded-2xl font-bold text-white text-sm disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ background: color }}
                >
                  {busy ? 'Creating…' : 'Create group'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
