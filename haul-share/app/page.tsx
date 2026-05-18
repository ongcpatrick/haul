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
    <svg width="160" height="260" viewBox="0 0 80 130" fill="none" stroke="currentColor"
      strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text)' }}>
      {/* Spaghetti straps */}
      <path d="M32 6 L28 28" />
      <path d="M48 6 L52 28" />
      {/* Sweetheart neckline */}
      <path d="M28 28 Q30 36 36 39 Q40 41 40 41 Q40 41 44 39 Q50 36 52 28" />
      {/* Bodice sides — gently fitted */}
      <path d="M28 28 L25 60" />
      <path d="M52 28 L55 60" />
      {/* Waist seam */}
      <path d="M25 60 Q40 57 55 60" />
      {/* Skirt — full A-line flare */}
      <path d="M25 60 Q14 82 6 118" />
      <path d="M55 60 Q66 82 74 118" />
      {/* Hem — gently curved */}
      <path d="M6 118 Q40 127 74 118" />
      {/* Skirt drape folds */}
      <path d="M34 63 Q27 85 22 112" strokeOpacity="0.38" />
      <path d="M40 62 Q40 85 40 114" strokeOpacity="0.38" />
      <path d="M46 63 Q53 85 58 112" strokeOpacity="0.38" />
      {/* Bodice ruching */}
      <path d="M33 32 Q31 46 32 56" strokeOpacity="0.45" />
      <path d="M40 30 Q40 46 40 57" strokeOpacity="0.45" />
      <path d="M47 32 Q49 46 48 56" strokeOpacity="0.45" />
      {/* Waist bow — left */}
      <path d="M32 60 Q28 55 25 60 Q28 65 32 60" />
      {/* Waist bow — right */}
      <path d="M48 60 Q52 55 55 60 Q52 65 48 60" />
      {/* Bow center knot */}
      <path d="M32 60 Q40 58 48 60" />
      {/* Strap shoulder detail */}
      <path d="M32 6 Q28 2 26 4" />
      <path d="M48 6 Q52 2 54 4" />
    </svg>
  );
}

function StilettoIllustration() {
  return (
    <svg width="180" height="120" viewBox="0 0 90 60" fill="none" stroke="currentColor"
      strokeWidth="0.68" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text)' }}>
      {/* Shoe sole — thin elegant platform */}
      <path d="M5 46 Q7 40 18 32 Q30 22 46 21 Q60 22 70 38 L76 38 L78 46 Q52 50 5 49 Q2 48 5 46 Z" />
      {/* Vamp (upper of shoe, covering foot) */}
      <path d="M5 46 Q8 38 20 30 Q32 20 48 21 Q62 22 70 38" />
      {/* Pointed toe detail */}
      <path d="M5 46 Q2 44 3 41 Q6 38 10 40" />
      {/* Ankle strap */}
      <path d="M22 32 Q32 25 44 27 Q52 29 56 36" />
      {/* Strap buckle */}
      <rect x="42" y="26" width="5" height="3.5" rx="0.8" />
      <path d="M44.5 26 L44.5 29.5" strokeOpacity="0.7" />
      {/* Stiletto heel — very thin spike */}
      <path d="M70 38 L77 6 L80 6 L76 38" />
      {/* Heel base on ground */}
      <path d="M76 46 Q77 46 80 46" />
      {/* Second shoe (3/4 view, behind) */}
      <g opacity="0.35" transform="translate(6 7) scale(0.85)">
        <path d="M5 46 Q7 40 18 32 Q30 22 46 21 Q60 22 70 38 L76 38 L78 46 Q52 50 5 49 Q2 48 5 46 Z" />
        <path d="M70 38 L77 6 L80 6 L76 38" />
      </g>
    </svg>
  );
}

function BagIllustration() {
  return (
    <svg width="140" height="130" viewBox="0 0 70 65" fill="none" stroke="currentColor"
      strokeWidth="0.68" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text)' }}>
      {/* Chain strap — looped links */}
      <path d="M11 24 Q8 14 18 8 Q30 3 40 5 Q54 8 60 18 Q64 22 60 24" />
      {/* Bag body with rounded corners */}
      <rect x="11" y="24" width="49" height="38" rx="5" />
      {/* Flap with gentle curve at bottom */}
      <path d="M11 24 L11 40 Q35.5 47 60 40 L60 24" />
      {/* Turn-lock clasp */}
      <ellipse cx="35.5" cy="41" rx="4.5" ry="3.5" />
      <path d="M31 41 L33 41" strokeOpacity="0.6" />
      <path d="M38 41 L40 41" strokeOpacity="0.6" />
      <path d="M35.5 37.5 L35.5 39.5" strokeOpacity="0.6" />
      <path d="M35.5 42.5 L35.5 44.5" strokeOpacity="0.6" />
      {/* Quilting on body below flap (y 44 to y 60) */}
      <path d="M11 60 L30 44" strokeOpacity="0.3" />
      <path d="M19 62 L40 44" strokeOpacity="0.3" />
      <path d="M29 62 L50 44" strokeOpacity="0.3" />
      <path d="M39 62 L60 44" strokeOpacity="0.3" />
      <path d="M50 62 L60 52" strokeOpacity="0.3" />
      <path d="M60 60 L41 44" strokeOpacity="0.3" />
      <path d="M52 62 L31 44" strokeOpacity="0.3" />
      <path d="M42 62 L21 44" strokeOpacity="0.3" />
      <path d="M32 62 L11 44" strokeOpacity="0.3" />
      <path d="M21 62 L11 54" strokeOpacity="0.3" />
    </svg>
  );
}

function PerfumeIllustration() {
  return (
    <svg width="100" height="150" viewBox="0 0 50 75" fill="none" stroke="currentColor"
      strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text)' }}>
      {/* Bottle body */}
      <path d="M12 36 Q9 36 9 40 L9 68 Q9 73 14 73 L36 73 Q41 73 41 68 L41 40 Q41 36 38 36" />
      {/* Shoulder curve — elegant taper */}
      <path d="M12 36 Q12 28 25 26 Q38 28 38 36" />
      {/* Neck (narrowing) */}
      <path d="M19 26 L19 17 L31 17 L31 26" />
      {/* Cap body */}
      <path d="M16 10 L16 17 L34 17 L34 10" />
      {/* Cap top — gently domed */}
      <path d="M16 10 Q16 6 25 6 Q34 6 34 10" />
      {/* Spray nozzle stem */}
      <path d="M25 6 L25 2" />
      <path d="M22 2 L28 2" />
      <circle cx="25" cy="2" r="0.8" fill="currentColor" />
      {/* Facet lines — horizontal */}
      <path d="M9 48 L41 48" strokeOpacity="0.35" />
      <path d="M9 60 L41 60" strokeOpacity="0.35" />
      {/* Label rectangle */}
      <rect x="14" y="51" width="22" height="13" rx="1.5" strokeOpacity="0.3" />
      {/* Vertical shoulder highlight */}
      <path d="M17 36 Q16 52 17 68" strokeOpacity="0.25" />
      {/* Decorative neck ring */}
      <path d="M19 22 L31 22" strokeOpacity="0.5" />
    </svg>
  );
}

function RoseIllustration() {
  return (
    <svg width="90" height="130" viewBox="0 0 45 65" fill="none" stroke="currentColor"
      strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text)' }}>
      {/* Stem */}
      <path d="M22 62 Q24 52 22 42" />
      {/* Leaf left */}
      <path d="M22 55 Q14 50 12 54 Q16 60 22 55" />
      {/* Leaf right */}
      <path d="M22 51 Q30 46 32 50 Q28 56 22 51" />
      {/* Sepal (base of flower) */}
      <path d="M18 42 Q14 38 15 34 Q22 32 22 38" strokeOpacity="0.6" />
      <path d="M26 42 Q30 38 29 34 Q22 32 22 38" strokeOpacity="0.6" />
      {/* Outer petals */}
      <path d="M14 36 Q8 28 12 20 Q18 14 22 22" />
      <path d="M30 36 Q36 28 32 20 Q26 14 22 22" />
      <path d="M22 40 Q18 46 13 42 Q10 34 16 28" />
      <path d="M22 40 Q26 46 31 42 Q34 34 28 28" />
      {/* Mid petals */}
      <path d="M16 28 Q12 20 16 14 Q22 12 24 20" />
      <path d="M28 28 Q32 20 28 14 Q22 12 20 20" />
      {/* Inner petals */}
      <path d="M20 22 Q16 16 19 11 Q22 10 24 14 Q26 18 22 22" />
      <path d="M22 10 Q22 8 22 6" strokeOpacity="0.5" />
      {/* Innermost curl */}
      <path d="M20 16 Q22 12 24 14 Q24 18 22 18 Q20 18 20 16" />
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
