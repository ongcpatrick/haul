'use client';

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { completeOnboarding } from '@/app/actions/onboarding';

interface Props {
  imageUrl: string;
  firstName: string;
  defaultUsername: string;
  defaultDisplayName: string;
}

export default function OnboardingForm({ imageUrl, firstName, defaultUsername, defaultDisplayName }: Props) {
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(defaultDisplayName);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('username', username);
    formData.set('displayName', displayName);

    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if ('error' in result) {
        setError(result.error ?? 'Unknown error');
        return;
      }
      await user?.reload();
      window.location.href = '/feed';
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={imageUrl}
            alt="Your avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-[var(--primary)] ring-offset-2"
          />
          <h1 className="text-2xl font-extrabold text-[var(--text)]">
            Welcome to Haul, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Set up your profile to start shopping with friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] font-medium text-sm select-none">
                @
              </span>
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || username.length < 3}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-h)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Setting up…' : 'Continue to Haul →'}
          </button>
        </form>
      </div>
    </div>
  );
}
