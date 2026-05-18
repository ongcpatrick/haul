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

{/* ── Fashion plate illustrations ────────────────────────────────────── */}

function DressIllustration() {
  /* Sleek column gown — halter neck, draped skirt, side slit */
  return (
    <svg width="160" height="300" viewBox="0 0 80 150" fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Halter neck straps */}
      <path strokeWidth="0.9" d="M36 4 C34 8 32 14 30 22" />
      <path strokeWidth="0.9" d="M44 4 C46 8 48 14 50 22" />
      {/* Neckline V */}
      <path strokeWidth="1" d="M30 22 C33 30 38 34 40 36 C42 34 47 30 50 22" />
      {/* Bodice left + right seam */}
      <path strokeWidth="1" d="M30 22 C28 30 27 40 27 52" />
      <path strokeWidth="1" d="M50 22 C52 30 53 40 53 52" />
      {/* Waist seam line */}
      <path strokeWidth="0.8" d="M27 52 C33 50 47 50 53 52" />
      {/* Skirt — column with slight flare from knee */}
      <path strokeWidth="1" d="M27 52 C26 72 25 92 24 120 C22 132 18 140 14 146" />
      <path strokeWidth="1" d="M53 52 C54 72 55 92 56 120 C58 132 62 140 66 146" />
      {/* Hem */}
      <path strokeWidth="0.9" d="M14 146 C30 150 50 150 66 146" />
      {/* Side slit — left front opens from knee */}
      <path strokeWidth="0.7" d="M24 106 C28 108 32 110 36 118 C37 124 37 136 37 146" strokeOpacity="0.6" />
      {/* Bodice ruching lines */}
      <path strokeWidth="0.4" d="M35 26 C34 34 34 44 35 50" strokeOpacity="0.45" />
      <path strokeWidth="0.4" d="M40 24 C40 34 40 44 40 51" strokeOpacity="0.45" />
      <path strokeWidth="0.4" d="M45 26 C46 34 46 44 45 50" strokeOpacity="0.45" />
      {/* Skirt drape folds */}
      <path strokeWidth="0.4" d="M32 56 C30 78 29 104 28 130" strokeOpacity="0.35" />
      <path strokeWidth="0.4" d="M40 55 C40 80 40 108 40 138" strokeOpacity="0.35" />
      <path strokeWidth="0.4" d="M48 56 C50 78 51 104 52 130" strokeOpacity="0.35" />
      {/* Hip highlight curve */}
      <path strokeWidth="0.5" d="M27 68 C30 66 50 66 53 68" strokeOpacity="0.3" />
      {/* Halter tie at neck */}
      <path strokeWidth="0.6" d="M36 4 C38 2 40 1.5 42 2 C43 2.5 44 4 44 4" />
      <path strokeWidth="0.6" d="M40 2 L40 0" />
    </svg>
  );
}

function StilettoIllustration() {
  /* Elegant pointed-toe pump with kitten strap — side profile */
  return (
    <svg width="200" height="110" viewBox="0 0 100 55" fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Sole outline — thin, elegant */}
      <path strokeWidth="1" d="M4 44 C5 42 8 38 14 33 C22 27 34 22 50 21 C63 21 74 27 80 36 L84 36 L86 44 C60 48 6 48 4 44 Z" />
      {/* Upper vamp / toe box */}
      <path strokeWidth="0.85" d="M4 44 C7 38 16 30 28 24 C38 20 50 20 60 25 C70 30 78 37 80 36" />
      {/* Pointed toe fine detail */}
      <path strokeWidth="0.6" d="M4 44 C2 42 2 39 4 37 C7 35 11 37 13 40" strokeOpacity="0.7" />
      {/* Throat / vamp cut line */}
      <path strokeWidth="0.7" d="M28 31 C36 26 52 24 64 30" strokeOpacity="0.6" />
      {/* Ankle strap */}
      <path strokeWidth="0.85" d="M30 30 C36 24 50 22 58 28 C62 31 64 34 62 38" />
      <path strokeWidth="0.85" d="M30 30 C28 34 28 38 30 42" />
      {/* Buckle */}
      <rect strokeWidth="0.7" x="55" y="24" width="6" height="4" rx="1" />
      <path strokeWidth="0.5" d="M58 24 L58 28" strokeOpacity="0.8" />
      {/* Stiletto heel — blade thin */}
      <path strokeWidth="1" d="M80 36 L88 4 L91 4 L84 36" />
      {/* Heel tip */}
      <path strokeWidth="0.8" d="M84 44 L91 44" />
      {/* Inner shoe lining highlight */}
      <path strokeWidth="0.4" d="M14 38 C24 32 42 27 58 29" strokeOpacity="0.3" />
      {/* Sole bottom edge */}
      <path strokeWidth="0.5" d="M4 46 C40 50 82 46 86 46" strokeOpacity="0.4" />
    </svg>
  );
}

function BagIllustration() {
  /* Structured Kelly-style flap bag with lock, stitching, and handle */
  return (
    <svg width="160" height="150" viewBox="0 0 80 75" fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Handle — arched double strap */}
      <path strokeWidth="1" d="M26 18 C24 10 24 5 40 4 C56 5 56 10 54 18" />
      <path strokeWidth="0.6" d="M28 18 C26 11 26 7 40 6 C54 7 54 11 52 18" strokeOpacity="0.5" />
      {/* Gusset left */}
      <path strokeWidth="0.8" d="M10 20 L10 62 C10 64 11 65 13 65" />
      {/* Gusset right */}
      <path strokeWidth="0.8" d="M70 20 L70 62 C70 64 69 65 67 65" />
      {/* Bag body */}
      <rect strokeWidth="1" x="10" y="20" width="60" height="45" rx="3" />
      {/* Flap — curved bottom edge, covers top 40% of body */}
      <path strokeWidth="1" d="M10 20 L10 38 C10 42 14 44 18 44 C28 46 52 46 62 44 C66 44 70 42 70 38 L70 20" />
      {/* Flap curve line */}
      <path strokeWidth="1" d="M10 38 C14 44 22 46 40 47 C58 46 66 44 70 38" />
      {/* Lock clasp */}
      <rect strokeWidth="0.9" x="34" y="42" width="12" height="8" rx="1.5" />
      <path strokeWidth="0.8" d="M37 42 C37 39 39 37 40 37 C41 37 43 39 43 42" />
      <circle strokeWidth="0.7" cx="40" cy="46" r="1.5" />
      {/* Stitching — flap edge */}
      <path strokeWidth="0.35" d="M12 22 C14 36 16 40 18 43" strokeOpacity="0.4" strokeDasharray="1.5 2" />
      <path strokeWidth="0.35" d="M68 22 C66 36 64 40 62 43" strokeOpacity="0.4" strokeDasharray="1.5 2" />
      <path strokeWidth="0.35" d="M12 20 L68 20" strokeOpacity="0.4" strokeDasharray="1.5 2" />
      {/* Stitching — body perimeter */}
      <path strokeWidth="0.35" d="M12 48 L12 63" strokeOpacity="0.3" strokeDasharray="1.5 2" />
      <path strokeWidth="0.35" d="M68 48 L68 63" strokeOpacity="0.3" strokeDasharray="1.5 2" />
      <path strokeWidth="0.35" d="M12 63 L68 63" strokeOpacity="0.3" strokeDasharray="1.5 2" />
      {/* Handle attachment rings */}
      <rect strokeWidth="0.7" x="24" y="17" width="4" height="4" rx="1" />
      <rect strokeWidth="0.7" x="52" y="17" width="4" height="4" rx="1" />
      {/* Horizontal grain texture lines on body */}
      <path strokeWidth="0.3" d="M10 53 L70 53" strokeOpacity="0.2" />
      <path strokeWidth="0.3" d="M10 58 L70 58" strokeOpacity="0.2" />
    </svg>
  );
}

function PerfumeIllustration() {
  /* Tall rectangular bottle — J'adore / Chanel No.5 inspired */
  return (
    <svg width="100" height="170" viewBox="0 0 50 85" fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Spray pump head */}
      <path strokeWidth="0.7" d="M28 3 L34 3 L34 6 L28 6 Z" />
      <path strokeWidth="0.6" d="M31 3 L31 1 L35 1" />
      <path strokeWidth="0.5" d="M35 1 C37 1 38 2 38 3" strokeOpacity="0.6" />
      {/* Neck tube */}
      <path strokeWidth="0.8" d="M21 6 L21 16 L29 16 L29 6" />
      {/* Neck-to-shoulder transition */}
      <path strokeWidth="0.85" d="M21 16 C18 18 13 20 12 24" />
      <path strokeWidth="0.85" d="M29 16 C32 18 37 20 38 24" />
      {/* Shoulder ring / collar */}
      <path strokeWidth="0.7" d="M12 24 C12 22 15 21 25 21 C35 21 38 22 38 24" />
      {/* Main bottle body — slightly tapered */}
      <path strokeWidth="1" d="M12 24 L10 78 C10 82 12 84 25 84 C38 84 40 82 40 78 L38 24" />
      {/* Bottle shoulder taper inner */}
      <path strokeWidth="0.5" d="M13 26 L11 78" strokeOpacity="0.2" />
      <path strokeWidth="0.5" d="M37 26 L39 78" strokeOpacity="0.2" />
      {/* Glass facets — vertical highlights */}
      <path strokeWidth="0.4" d="M16 24 L14 82" strokeOpacity="0.2" />
      <path strokeWidth="0.4" d="M34 24 L36 82" strokeOpacity="0.2" />
      {/* Label area */}
      <rect strokeWidth="0.6" x="13" y="42" width="24" height="24" rx="1" strokeOpacity="0.45" />
      {/* Label lines (text suggestion) */}
      <path strokeWidth="0.4" d="M17 50 L33 50" strokeOpacity="0.35" />
      <path strokeWidth="0.4" d="M19 55 L31 55" strokeOpacity="0.35" />
      <path strokeWidth="0.4" d="M20 60 L30 60" strokeOpacity="0.3" />
      {/* Horizontal band below label */}
      <path strokeWidth="0.5" d="M10 68 L40 68" strokeOpacity="0.3" />
      {/* Base ring */}
      <path strokeWidth="0.6" d="M10 80 C10 83 17 84 25 84 C33 84 40 83 40 80" strokeOpacity="0.5" />
      {/* Cap gold ring */}
      <path strokeWidth="0.6" d="M21 14 L29 14" strokeOpacity="0.6" />
    </svg>
  );
}

function RoseIllustration() {
  /* Single long-stem rose — side view, detailed petals */
  return (
    <svg width="100" height="160" viewBox="0 0 50 80" fill="none" stroke="currentColor"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      {/* Long stem — slight natural curve */}
      <path strokeWidth="0.9" d="M25 78 C26 68 25 58 24 48" />
      <path strokeWidth="0.5" d="M25 78 C24 68 23 58 23 48" strokeOpacity="0.35" />
      {/* Thorn 1 */}
      <path strokeWidth="0.6" d="M25 68 C28 66 30 64 29 62" />
      {/* Thorn 2 */}
      <path strokeWidth="0.6" d="M24 60 C21 58 19 56 20 54" />
      {/* Leaf — left, larger */}
      <path strokeWidth="0.7" d="M25 62 C18 58 13 56 12 60 C14 66 20 66 25 62" />
      <path strokeWidth="0.4" d="M25 62 C20 61 16 60 13 61" strokeOpacity="0.4" />
      {/* Leaf — right */}
      <path strokeWidth="0.7" d="M25 55 C32 51 37 49 38 53 C36 59 30 58 25 55" />
      <path strokeWidth="0.4" d="M25 55 C30 53 34 52 37 53" strokeOpacity="0.4" />
      {/* Calyx / sepal base */}
      <path strokeWidth="0.7" d="M21 48 C18 44 17 40 18 36 C22 33 25 36 25 42" strokeOpacity="0.7" />
      <path strokeWidth="0.7" d="M29 48 C32 44 33 40 32 36 C28 33 25 36 25 42" strokeOpacity="0.7" />
      {/* Outer guard petals */}
      <path strokeWidth="0.85" d="M18 40 C12 32 14 22 18 16 C22 12 26 18 25 28" />
      <path strokeWidth="0.85" d="M32 40 C38 32 36 22 32 16 C28 12 24 18 25 28" />
      <path strokeWidth="0.85" d="M25 44 C18 48 12 44 10 36 C10 28 16 24 22 30" />
      <path strokeWidth="0.85" d="M25 44 C32 48 38 44 40 36 C40 28 34 24 28 30" />
      {/* Mid petals */}
      <path strokeWidth="0.75" d="M20 30 C14 22 16 12 20 8 C24 6 27 12 26 22" />
      <path strokeWidth="0.75" d="M30 30 C36 22 34 12 30 8 C26 6 23 12 24 22" />
      {/* Inner spiral petals */}
      <path strokeWidth="0.7" d="M22 22 C18 16 20 10 24 8 C27 8 29 12 27 18 C26 22 24 24 25 26" />
      <path strokeWidth="0.7" d="M28 22 C32 16 30 10 26 8 C23 8 21 12 23 18 C24 22 26 24 25 26" />
      {/* Rose heart / innermost curl */}
      <path strokeWidth="0.6" d="M23 18 C23 14 25 12 26 14 C27 16 26 20 25 22 C24 20 23 18 23 18" />
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
