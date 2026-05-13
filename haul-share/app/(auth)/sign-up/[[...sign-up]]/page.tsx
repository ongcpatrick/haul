import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--bg)] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Join Haul</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Compare, share, and shop with friends.
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
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
