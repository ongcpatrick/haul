import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import NotificationBell from './NotificationBell';

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)] backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/90">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-[var(--primary)]">
            Haul
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <SignedIn>
            <NavLink href="/feed">Feed</NavLink>
            <NavLink href="/people">People</NavLink>
            <NavLink href="/circles">Groups</NavLink>
            <NavLink href="/messages">Messages</NavLink>
            <NavLink href="/connect">Connect</NavLink>
          </SignedIn>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-h)] px-4 py-2 rounded-full transition-colors"
            >
              Sign up
            </Link>
          </SignedOut>
          <SignedIn>
            <NotificationBell />
            <Link
              href="/u/me"
              className="hidden sm:flex items-center text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-full hover:bg-[var(--bg)] transition-colors"
            >
              Profile
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9 ring-2 ring-[var(--border)]',
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
      className="text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)] px-4 py-2 rounded-full hover:bg-[var(--bg)] transition-colors"
    >
      {children}
    </Link>
  );
}
