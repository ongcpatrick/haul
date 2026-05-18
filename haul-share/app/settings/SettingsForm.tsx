'use client';

import { useState, useTransition } from 'react';
import { updateUserProfile } from '@/app/actions/profile';

const STYLE_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'streetwear',    label: 'Streetwear',    desc: 'Hoodies, sneakers, graphic tees' },
  { value: 'minimalist',   label: 'Minimalist',    desc: 'Clean lines, neutral tones' },
  { value: 'luxury',       label: 'Luxury',        desc: 'Designer pieces, elevated basics' },
  { value: 'vintage',      label: 'Vintage',       desc: 'Thrifted finds, retro classics' },
  { value: 'y2k',          label: 'Y2K',           desc: 'Low-rise, metallic, early 2000s' },
  { value: 'boho',         label: 'Boho',          desc: 'Flowy, earthy, free-spirited' },
  { value: 'athleisure',   label: 'Athleisure',    desc: 'Sport meets everyday wear' },
  { value: 'preppy',       label: 'Preppy',        desc: 'Blazers, loafers, clean-cut' },
  { value: 'indie',        label: 'Indie',         desc: 'Thrifted layers, artsy, eclectic' },
  { value: 'smart casual', label: 'Smart Casual',  desc: 'Polished but relaxed' },
];

interface Props {
  initialDisplayName: string;
  initialBio: string;
  initialStyles: string[];
  email: string;
  username: string;
}

export default function SettingsForm({ initialDisplayName, initialBio, initialStyles, email, username }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialStyles);

  function toggleStyle(value: string) {
    setSelectedStyles((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set('displayName', displayName);
    formData.set('bio', bio);
    formData.set('fashionStyles', JSON.stringify(selectedStyles));

    startTransition(async () => {
      try {
        const result = await updateUserProfile(formData);
        if ('error' in result) {
          setError(result.error ?? 'Unknown error');
        } else {
          setSaved(true);
        }
      } catch {
        setError('Unexpected error. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* ── Profile section ── */}
      <section>
        <h2 className="text-xs font-semibold tracking-[0.14em] uppercase mb-5" style={{ color: 'var(--muted)' }}>
          Profile
        </h2>

        <div className="space-y-4">
          {/* Username (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
              Username
            </label>
            <div className="px-3 py-2.5 rounded-xl border bg-[var(--surface)] text-sm text-[var(--muted)]"
              style={{ borderColor: 'var(--border)' }}>
              @{username}
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">Username cannot be changed after sign-up</p>
          </div>

          {/* Display name */}
          <div>
            <label htmlFor="displayName" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
              maxLength={80}
              placeholder="Your Name"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => { setBio(e.target.value); setSaved(false); }}
              maxLength={200}
              rows={3}
              placeholder="Tell people a bit about your style..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <p className="mt-1 text-xs text-right text-[var(--muted)]">{bio.length}/200</p>
          </div>
        </div>
      </section>

      {/* ── Style vibes ── */}
      <section>
        <h2 className="text-xs font-semibold tracking-[0.14em] uppercase mb-1" style={{ color: 'var(--muted)' }}>
          Style Vibes
        </h2>
        <p className="text-xs text-[var(--muted)] mb-4">
          Shown on your profile and used to personalise your feed.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => {
            const active = selectedStyles.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleStyle(opt.value)}
                className="text-left p-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  background: active ? 'color-mix(in srgb, var(--primary) 8%, white)' : 'white',
                }}
              >
                <span className="block text-sm font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text)' }}>
                  {opt.label}
                </span>
                <span className="block text-[10px] leading-tight mt-0.5" style={{ color: 'var(--muted)' }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Account section ── */}
      <section>
        <h2 className="text-xs font-semibold tracking-[0.14em] uppercase mb-4" style={{ color: 'var(--muted)' }}>
          Account
        </h2>
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div>
            <p className="text-xs text-[var(--muted)] mb-0.5">Email</p>
            <p className="text-sm font-medium text-[var(--text)]">{email}</p>
          </div>
          <p className="text-xs text-[var(--muted)] pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
            To change your password, connected accounts, or profile photo — click your avatar in the top-right menu.
          </p>
        </div>
      </section>

      {/* Save bar */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: 'var(--text)' }}
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && (
          <span className="text-sm font-medium text-green-600">Saved!</span>
        )}
      </div>

    </form>
  );
}
