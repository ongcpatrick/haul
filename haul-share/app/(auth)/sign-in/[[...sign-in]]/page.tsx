import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Sign in to your Haul account.</p>
        </div>
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-white border border-[var(--border)] shadow-card rounded-2xl',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
