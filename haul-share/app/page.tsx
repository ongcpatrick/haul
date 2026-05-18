import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">

        {/* Floating coat — far left */}
        <div className="absolute hidden lg:block" style={{ left: -20, top: 20, opacity: 0.13, transform: 'rotate(-8deg)' }}>
          <CoatIllustration />
        </div>

        {/* Floating heels — far right */}
        <div className="absolute hidden lg:block" style={{ right: -10, top: 40, opacity: 0.12, transform: 'rotate(6deg)' }}>
          <HeelIllustration />
        </div>

        {/* Floating bag — lower left */}
        <div className="absolute hidden lg:block" style={{ left: 60, bottom: 30, opacity: 0.10, transform: 'rotate(10deg)' }}>
          <BagIllustration size={100} />
        </div>

        {/* Floating sunglasses — upper right */}
        <div className="absolute hidden lg:block" style={{ right: 80, top: 30, opacity: 0.11, transform: 'rotate(-5deg)' }}>
          <GlassesIllustration />
        </div>

        {/* Scattered stars */}
        <StarDot style={{ position: 'absolute', left: 120, top: 60 }} />
        <StarDot style={{ position: 'absolute', right: 160, top: 80 }} size={10} />
        <StarDot style={{ position: 'absolute', left: 200, bottom: 50 }} size={8} />
        <StarDot style={{ position: 'absolute', right: 220, bottom: 40 }} size={12} />

        {/* Tag line */}
        <p className="relative inline-block text-[11px] font-medium tracking-[0.22em] uppercase mb-6"
          style={{ color: 'var(--muted)' }}>
          Style, curated with friends
        </p>

        {/* Headline */}
        <h1 className="relative" style={{ lineHeight: 1.08, letterSpacing: '-0.03em' }}>
          <span className="block" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--text)',
          }}>
            Dress better,
          </span>
          <span className="block" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
            fontWeight: 600,
            fontStyle: 'italic',
            color: 'var(--primary)',
          }}>
            together.
          </span>
        </h1>

        {/* Sub */}
        <p className="relative mt-6 mx-auto max-w-md text-base leading-relaxed" style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
          Save pieces from anywhere, compare them side by side, and get honest opinions from people whose taste you actually trust.
        </p>

        {/* CTAs */}
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
          <SignedOut>
            <Link href="/sign-up" className="inline-flex items-center px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-80"
              style={{ background: 'var(--text)' }}>
              Join free
            </Link>
            <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-colors hover:border-[var(--text)]"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
              <ChromeIcon />
              Add to Chrome
            </a>
          </SignedOut>
          <SignedIn>
            <Link href="/feed" className="inline-flex items-center px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-80"
              style={{ background: 'var(--text)' }}>
              Open feed
            </Link>
            <Link href="/circles" className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-colors hover:border-[var(--text)]"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Browse groups
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* ── Editorial divider ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-6 mb-16">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-[10px] tracking-[0.25em] uppercase flex-shrink-0" style={{ color: 'var(--muted)' }}>
          How it works
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* ── Feature cards ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-28 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FeatureCard
          illustration={<SaveIllustration />}
          title="Save from anywhere"
          body="One click in the extension captures the piece, image, and details — no copy-paste."
        />
        <FeatureCard
          illustration={<CompareIllustration />}
          title="Compare side by side"
          body="Lay everything out, see how pieces relate, and make a decision you'll feel good about."
        />
        <FeatureCard
          illustration={<ShareIllustration />}
          title="Share with your circle"
          body="Post hauls to private groups, get reactions, and discover what your friends are into."
        />
      </section>

      {/* ── Bottom editorial pull-quote ──────────────────────────────── */}
      <section className="border-t pb-24 pt-20 text-center px-6" style={{ borderColor: 'var(--border)' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          fontWeight: 500,
          fontStyle: 'italic',
          color: 'var(--text)',
          lineHeight: 1.25,
          maxWidth: 700,
          margin: '0 auto',
          letterSpacing: '-0.02em',
        }}>
          &ldquo;Good taste is a team sport.&rdquo;
        </p>
        <p className="mt-4 text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Haul</p>
      </section>

    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ illustration, title, body }: { illustration: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl p-7 flex flex-col items-start gap-5"
      style={{ background: '#fff', border: '1px solid var(--border)' }}>
      <div className="w-14 h-14 flex items-center justify-center rounded-xl"
        style={{ background: 'var(--surface)' }}>
        {illustration}
      </div>
      <div>
        <h3 className="font-semibold mb-1.5 text-sm tracking-wide" style={{ color: 'var(--text)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{body}</p>
      </div>
    </div>
  );
}

// ── Floating decoration helpers ───────────────────────────────────────────────

function StarDot({ style, size = 14 }: { style?: React.CSSProperties; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...style, color: 'var(--muted)', opacity: 0.25 }}>
      <path d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5Z" fill="currentColor" />
    </svg>
  );
}

function ChromeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8 L21 8M6.5 19.5 L11 12M17.5 19.5 L13 12" />
    </svg>
  );
}

// ── Fashion illustrations (hero, floating) ───────────────────────────────────

function CoatIllustration() {
  return (
    <svg width="180" height="220" viewBox="0 0 90 110" fill="none" stroke="currentColor" strokeWidth="0.7"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Body */}
      <path d="M30,20 L18,35 L14,100 L76,100 L72,35 L60,20" />
      {/* Left lapel */}
      <path d="M30,20 L26,10 L38,6 L45,24" />
      {/* Right lapel */}
      <path d="M60,20 L64,10 L52,6 L45,24" />
      {/* Center seam */}
      <line x1="45" y1="24" x2="45" y2="100" />
      {/* Left sleeve */}
      <path d="M18,35 L8,65 L14,68 L20,50" />
      {/* Right sleeve */}
      <path d="M72,35 L82,65 L76,68 L70,50" />
      {/* Buttons */}
      <circle cx="45" cy="48" r="1.4" fill="currentColor" />
      <circle cx="45" cy="60" r="1.4" fill="currentColor" />
      <circle cx="45" cy="72" r="1.4" fill="currentColor" />
      <circle cx="45" cy="84" r="1.4" fill="currentColor" />
      {/* Left pocket */}
      <path d="M20,65 L28,65 L28,76 L20,76" />
      {/* Right pocket */}
      <path d="M70,65 L62,65 L62,76 L70,76" />
      {/* Belt hint */}
      <path d="M18,58 L72,58" strokeDasharray="2 3" />
    </svg>
  );
}

function HeelIllustration() {
  return (
    <svg width="160" height="130" viewBox="0 0 80 65" fill="none" stroke="currentColor" strokeWidth="0.75"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Sole platform */}
      <path d="M12,52 Q38,48 54,46 Q64,44 67,52 Q62,55 54,53 Q38,57 12,60 Q5,60 7,54 Z" />
      {/* Upper vamp */}
      <path d="M12,52 Q15,36 23,28 Q34,18 44,22 Q55,26 54,46" />
      {/* Ankle strap */}
      <path d="M22,30 Q28,26 35,27 Q40,28 44,32" />
      {/* Heel column */}
      <path d="M54,46 L64,44 L67,52 L58,55 Z" />
      {/* Toe detail */}
      <path d="M7,54 Q5,52 7,50 Q11,48 17,50" />
      {/* Second heel (smaller, behind) */}
      <g transform="translate(8, 8) scale(0.75)" opacity="0.5">
        <path d="M12,52 Q38,48 54,46 Q64,44 67,52 Q62,55 54,53 Q38,57 12,60 Q5,60 7,54 Z" />
        <path d="M12,52 Q15,36 23,28 Q34,18 44,22 Q55,26 54,46" />
        <path d="M54,46 L64,44 L67,52 L58,55 Z" />
      </g>
    </svg>
  );
}

function BagIllustration({ size = 130 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 65 65" fill="none" stroke="currentColor" strokeWidth="0.8"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Body */}
      <rect x="8" y="24" width="49" height="36" rx="3" />
      {/* Handle */}
      <path d="M21,24 C21,10 44,10 44,24" />
      {/* Clasp */}
      <rect x="27" y="21" width="11" height="6" rx="2" />
      {/* Middle divider */}
      <line x1="8" y1="42" x2="57" y2="42" />
      {/* Lock detail */}
      <rect x="28" y="45" width="9" height="7" rx="1" />
      <path d="M30,45 L30,43 Q32.5,40 35,43 L35,45" />
      {/* Stitching detail */}
      <rect x="11" y="27" width="43" height="30" rx="2" strokeDasharray="0" strokeOpacity="0.3" />
    </svg>
  );
}

function GlassesIllustration() {
  return (
    <svg width="160" height="70" viewBox="0 0 80 35" fill="none" stroke="currentColor" strokeWidth="0.75"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Left lens */}
      <ellipse cx="22" cy="18" rx="14" ry="12" />
      {/* Right lens */}
      <ellipse cx="58" cy="18" rx="14" ry="12" />
      {/* Bridge */}
      <path d="M36,18 Q40,14 44,18" />
      {/* Left arm */}
      <path d="M8,18 L2,20" />
      {/* Right arm */}
      <path d="M72,18 L78,20" />
      {/* Lens glare left */}
      <path d="M14,12 L16,10" strokeOpacity="0.5" />
      {/* Lens glare right */}
      <path d="M50,12 L52,10" strokeOpacity="0.5" />
    </svg>
  );
}

// ── Feature card illustrations ───────────────────────────────────────────────

function SaveIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
      {/* Bag */}
      <rect x="4" y="10" width="20" height="15" rx="2" />
      <path d="M9,10 C9,5 19,5 19,10" />
      {/* Sparkle */}
      <path d="M20,5 L21,3 L22,5 L24,6 L22,7 L21,9 L20,7 L18,6 Z" fill="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function CompareIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
      {/* Left hanger */}
      <path d="M9,8 C9,5 13,5 13,8" />
      <circle cx="11" cy="4" r="1.5" />
      <path d="M11,6 L5,12 L5,20 L17,20 L17,12 L11,6" />
      {/* Right hanger */}
      <path d="M19,8 C19,5 23,5 23,8" />
      <circle cx="21" cy="4" r="1.5" />
      <path d="M21,6 L15.5,11" />
      <path d="M26.5,11 L21,6 L15.5,11 L15.5,20 L27,20 L27,11 Z" />
    </svg>
  );
}

function ShareIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
      {/* Three circles connected */}
      <circle cx="14" cy="8" r="3.5" />
      <circle cx="6" cy="21" r="3.5" />
      <circle cx="22" cy="21" r="3.5" />
      {/* Connection lines */}
      <line x1="11.5" y1="10.5" x2="7.5" y2="18.5" />
      <line x1="16.5" y1="10.5" x2="20.5" y2="18.5" />
      <line x1="9.5" y1="21" x2="18.5" y2="21" />
    </svg>
  );
}
