import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import NotificationBell from './NotificationBell';

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Wordmark */}
        <Link href="/" className="flex items-center">
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: '1.5rem', letterSpacing: '-0.01em', color: 'var(--text)' }}>
            Haul
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <SignedIn>
            <NavLink href="/feed">Discover</NavLink>
            <NavLink href="/people">People</NavLink>
            <NavLink href="/circles">Groups</NavLink>
            <NavLink href="/messages">Messages</NavLink>
          </SignedIn>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in" className="text-xs font-medium tracking-wide text-[var(--muted)] hover:text-[var(--text)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-xs font-semibold tracking-wide text-white bg-[var(--text)] hover:opacity-80 px-4 py-2 rounded-full transition-opacity"
            >
              Join
            </Link>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8 ring-1 ring-[var(--border)]',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--muted)] hover:text-[var(--text)] transition-colors"
    >
      {children}
    </Link>
  );
}
