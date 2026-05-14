import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="bg-[var(--bg)]">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
          Shopping, together
        </span>
        <h1 className="mt-4 text-5xl sm:text-6xl font-extrabold text-[var(--text)] tracking-tight leading-[1.05]">
          Compare hauls.
          <br />
          <span className="text-[var(--primary)]">Shop with friends.</span>
        </h1>
        <p className="mt-6 text-lg text-[var(--muted)] max-w-xl mx-auto">
          Haul is a shopping comparison extension and social space. Save products,
          compare side by side, and share what you&apos;re buying with the people
          whose taste you trust.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-flex items-center px-7 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-bold transition-colors"
            >
              Get started, it&apos;s free
            </Link>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-7 py-3 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] text-sm font-bold transition-colors"
            >
              Add to Chrome
            </a>
          </SignedOut>
          <SignedIn>
            <Link
              href="/feed"
              className="inline-flex items-center px-7 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-bold transition-colors"
            >
              Open your feed
            </Link>
            <Link
              href="/circles"
              className="inline-flex items-center px-7 py-3 rounded-full bg-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] text-sm font-bold transition-colors"
            >
              Browse circles
            </Link>
          </SignedIn>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Save from any site',
            body: 'One click in the Haul extension grabs the product, price, and image.',
          },
          {
            title: 'Compare side by side',
            body: 'Spec out the differences, spot the savings, and decide with confidence.',
          },
          {
            title: 'Share with your circle',
            body: 'Post hauls to private circles, react, comment, and shop together.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white border border-[var(--border)] rounded-2xl p-6 shadow-card"
          >
            <h3 className="font-bold text-[var(--text)]">{f.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
