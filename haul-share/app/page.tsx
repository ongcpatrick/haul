import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">

        {/* Floating dress — far left */}
        <div className="absolute hidden lg:block" style={{ left: -30, top: 10, opacity: 0.14, transform: 'rotate(-6deg)' }}>
          <DressIllustration />
        </div>

        {/* Floating stiletto — far right */}
        <div className="absolute hidden lg:block" style={{ right: -20, top: 60, opacity: 0.13, transform: 'rotate(10deg)' }}>
          <StilettoIllustration />
        </div>

        {/* Floating quilted bag — lower left */}
        <div className="absolute hidden lg:block" style={{ left: 50, bottom: 20, opacity: 0.11, transform: 'rotate(8deg)' }}>
          <BagIllustration />
        </div>

        {/* Floating perfume — upper right */}
        <div className="absolute hidden lg:block" style={{ right: 70, top: 20, opacity: 0.12, transform: 'rotate(-8deg)' }}>
          <PerfumeIllustration />
        </div>

        {/* Floating rose — lower right */}
        <div className="absolute hidden lg:block" style={{ right: 40, bottom: 30, opacity: 0.10, transform: 'rotate(5deg)' }}>
          <RoseIllustration />
        </div>

        {/* Scattered stars */}
        <StarDot style={{ position: 'absolute', left: 130, top: 55 }} />
        <StarDot style={{ position: 'absolute', right: 170, top: 75 }} size={10} />
        <StarDot style={{ position: 'absolute', left: 210, bottom: 45 }} size={8} />
        <StarDot style={{ position: 'absolute', right: 230, bottom: 35 }} size={12} />

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

// ── Decoration helpers ────────────────────────────────────────────────────────

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

// ── Hero floating illustrations — feminine editorial ──────────────────────────

function DressIllustration() {
  return (
    <svg width="90" height="180" viewBox="0 0 90 180" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Spaghetti straps */}
      <line x1="34" y1="4" x2="32" y2="22" />
      <line x1="56" y1="4" x2="58" y2="22" />
      {/* Neckline — gentle scoop */}
      <path d="M32 22 Q45 32 58 22" />
      {/* Bodice sides */}
      <line x1="32" y1="22" x2="30" y2="64" />
      <line x1="58" y1="22" x2="60" y2="64" />
      {/* Waist seam */}
      <line x1="30" y1="64" x2="60" y2="64" />
      {/* A-line skirt */}
      <line x1="30" y1="64" x2="8" y2="172" />
      <line x1="60" y1="64" x2="82" y2="172" />
      {/* Hem */}
      <line x1="8" y1="172" x2="82" y2="172" />
    </svg>
  );
}

function StilettoIllustration() {
  return (
    <svg width="200" height="110" viewBox="0 0 100 55" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Shoe upper — from pointed toe curving back */}
      <path d="M4 42 Q6 34 18 28 Q34 22 56 23 Q70 24 78 32" />
      {/* Back of shoe */}
      <line x1="78" y1="32" x2="82" y2="32" />
      {/* Heel — thin stiletto blade */}
      <line x1="82" y1="32" x2="88" y2="6" />
      <line x1="91" y1="6" x2="85" y2="32" />
      {/* Sole — bottom of shoe */}
      <path d="M4 46 Q45 50 83 46" />
      {/* Toe tip */}
      <path d="M4 42 Q2 43 4 46" />
      {/* Heel base */}
      <line x1="85" y1="46" x2="91" y2="46" />
      {/* Vamp line — decorative cut */}
      <path d="M28 30 Q44 26 62 30" strokeOpacity="0.5" />
    </svg>
  );
}

function BagIllustration() {
  return (
    <svg width="160" height="150" viewBox="0 0 80 75" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Handle — arched */}
      <path d="M26 20 Q26 6 40 5 Q54 6 54 20" />
      {/* Bag body */}
      <rect x="10" y="20" width="60" height="48" rx="3" />
      {/* Flap fold */}
      <path d="M10 20 L10 38 Q40 46 70 38 L70 20" />
      {/* Flap bottom edge */}
      <path d="M10 38 Q40 47 70 38" />
      {/* Lock */}
      <rect x="34" y="34" width="12" height="8" rx="2" />
      {/* Lock shackle */}
      <path d="M37 34 Q37 30 40 30 Q43 30 43 34" />
    </svg>
  );
}

function PerfumeIllustration() {
  return (
    <svg width="100" height="170" viewBox="0 0 50 85" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Spray button */}
      <rect x="23" y="2" width="8" height="4" rx="1" />
      {/* Nozzle arm */}
      <line x1="31" y1="4" x2="38" y2="4" />
      <line x1="38" y1="4" x2="38" y2="9" />
      {/* Cap */}
      <rect x="17" y="6" width="16" height="8" rx="2" />
      {/* Neck */}
      <rect x="19" y="14" width="12" height="8" />
      {/* Shoulder taper */}
      <line x1="19" y1="22" x2="10" y2="28" />
      <line x1="31" y1="22" x2="40" y2="28" />
      {/* Body */}
      <rect x="10" y="28" width="30" height="52" rx="3" />
      {/* Label */}
      <rect x="15" y="40" width="20" height="18" rx="1" strokeOpacity="0.5" />
      {/* Label lines */}
      <line x1="19" y1="47" x2="31" y2="47" strokeOpacity="0.4" />
      <line x1="19" y1="52" x2="31" y2="52" strokeOpacity="0.4" />
    </svg>
  );
}

function RoseIllustration() {
  return (
    <svg width="100" height="160" viewBox="0 0 50 80" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Stem */}
      <line x1="25" y1="78" x2="25" y2="44" />
      {/* Leaf left */}
      <path d="M25 62 Q16 58 14 64 Q16 70 25 66" />
      {/* Leaf right */}
      <path d="M25 54 Q34 50 36 56 Q34 62 25 58" />
      {/* Sepal / bud base */}
      <path d="M19 44 Q17 40 19 36" />
      <path d="M31 44 Q33 40 31 36" />
      {/* Outer petals */}
      <path d="M19 36 Q10 28 14 18 Q18 10 25 18" />
      <path d="M31 36 Q40 28 36 18 Q32 10 25 18" />
      {/* Inner petals */}
      <path d="M25 18 Q17 14 18 8 Q22 4 25 10" />
      <path d="M25 18 Q33 14 32 8 Q28 4 25 10" />
      {/* Center bud */}
      <path d="M25 10 Q22 8 23 6 Q25 5 27 6 Q28 8 25 10" />
    </svg>
  );
}

// ── Feature card illustrations ────────────────────────────────────────────────

function SaveIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
      <rect x="4" y="10" width="20" height="15" rx="2" />
      <path d="M9,10 C9,5 19,5 19,10" />
      <path d="M20,5 L21,3 L22,5 L24,6 L22,7 L21,9 L20,7 L18,6 Z" fill="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function CompareIllustration() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
      <path d="M9,8 C9,5 13,5 13,8" />
      <circle cx="11" cy="4" r="1.5" />
      <path d="M11,6 L5,12 L5,20 L17,20 L17,12 L11,6" />
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
      <circle cx="14" cy="8" r="3.5" />
      <circle cx="6" cy="21" r="3.5" />
      <circle cx="22" cy="21" r="3.5" />
      <line x1="11.5" y1="10.5" x2="7.5" y2="18.5" />
      <line x1="16.5" y1="10.5" x2="20.5" y2="18.5" />
      <line x1="9.5" y1="21" x2="18.5" y2="21" />
    </svg>
  );
}
