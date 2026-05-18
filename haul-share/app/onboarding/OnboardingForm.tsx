'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/app/actions/onboarding';

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
  imageUrl: string;
  firstName: string;
  defaultUsername: string;
  defaultDisplayName: string;
}

export default function OnboardingForm({ imageUrl, firstName, defaultUsername, defaultDisplayName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (username.length < 3) return;
    setStep(2);
  }

  function toggleStyle(value: string) {
    setSelectedStyles((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function handleStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedStyles.length === 0) {
      setError('Pick at least one style to continue');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.set('username', username);
    formData.set('displayName', displayName);
    formData.set('fashionStyles', JSON.stringify(selectedStyles));

    startTransition(async () => {
      try {
        const result = await completeOnboarding(formData);
        if ('error' in result) {
          setError(result.error ?? 'Unknown error');
          return;
        }
        router.push('/feed');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unexpected error. Please try again.');
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <div className="w-full max-w-md">

        {/* Avatar + greeting */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Your avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-[var(--primary)] ring-offset-2"
          />
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', color: 'var(--text)', fontStyle: 'italic' }}>
            {step === 1 ? `Welcome, ${firstName}!` : 'What\'s your vibe?'}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {step === 1
              ? 'Set up your profile to start shopping with friends.'
              : 'Pick the styles that feel like you. Your feed will match.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: step === s ? 28 : 16,
                background: step >= s ? 'var(--primary)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        {/* ── Step 1: Username + display name ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] font-medium text-sm select-none">@</span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_]{3,30}"
                  placeholder="your_username"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">This is how friends find you</p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
                Display name <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="Your Name"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-white text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={username.length < 3}
              className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next — Pick your style →
            </button>
          </form>
        )}

        {/* ── Step 2: Style vibe picker ── */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {STYLE_OPTIONS.map((opt) => {
                const active = selectedStyles.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleStyle(opt.value)}
                    className="text-left p-3.5 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      background: active ? 'color-mix(in srgb, var(--primary) 8%, white)' : 'white',
                    }}
                  >
                    <span className="block text-sm font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text)' }}>
                      {opt.label}
                    </span>
                    <span className="block text-[11px] leading-tight mt-0.5" style={{ color: 'var(--muted)' }}>
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); }}
                className="px-5 py-3 rounded-xl border text-sm font-medium transition-colors hover:border-[var(--text)]"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPending || selectedStyles.length === 0}
                className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? 'Setting up…' : `Let's go — ${selectedStyles.length} style${selectedStyles.length !== 1 ? 's' : ''} selected`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
