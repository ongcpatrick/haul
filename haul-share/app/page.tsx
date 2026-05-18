import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Editorial split hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh' }}>

        {/* Right: editorial photo collage — covers full right portion */}
        <div className="absolute inset-y-0 right-0 hidden lg:block" style={{ width: '46%' }}>
          <EditorialCollage />
        </div>

        {/* Left: content */}
        <div className="relative max-w-6xl mx-auto px-6 flex items-center" style={{ minHeight: '92vh' }}>
          <div style={{ maxWidth: 500 }}>

            <p className="text-[11px] font-medium tracking-[0.22em] uppercase mb-8"
              style={{ color: 'var(--muted)' }}>
              Style, curated with friends
            </p>

            <h1 style={{ lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              <span className="block" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.4rem, 5.5vw, 5.5rem)',
                fontWeight: 700,
                fontStyle: 'italic',
                color: 'var(--text)',
              }}>
                Dress better,
              </span>
              <span className="block" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(3.4rem, 5.5vw, 5.5rem)',
                fontWeight: 600,
                fontStyle: 'italic',
                color: 'var(--primary)',
              }}>
                together.
              </span>
            </h1>

            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 400, marginBottom: '2.5rem' }}>
              Save pieces from anywhere, compare them side by side, and get honest opinions from people whose taste you actually trust.
            </p>

            <div className="flex flex-wrap gap-3">
              <SignedOut>
                <Link href="/sign-up"
                  className="inline-flex items-center px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-80"
                  style={{ background: 'var(--text)' }}>
                  Join free
                </Link>
                <a href="https://chromewebstore.google.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wide border transition-colors hover:border-[var(--text)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <ChromeIcon />
                  Add to Chrome
                </a>
              </SignedOut>
              <SignedIn>
                <Link href="/feed"
                  className="inline-flex items-center px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide transition-opacity hover:opacity-80"
                  style={{ background: 'var(--text)' }}>
                  Open feed
                </Link>
                <Link href="/circles"
                  className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold tracking-wide border transition-colors hover:border-[var(--text)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  Browse groups
                </Link>
              </SignedIn>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works divider ─────────────────────────────────────── */}
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

      {/* ── Pull-quote ───────────────────────────────────────────────── */}
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

// ── Editorial photo collage ───────────────────────────────────────────────────

const PHOTOS = [
  // Woman in dark coat holding shopping bags — very editorial
  'photo-1483985988355-763728e1935b',
  // Model in yellow matching coordinated outfit
  'photo-1515886657613-9f3515b0c78f',
  // Clothing rack with neutral-toned garments hung on a branch
  'photo-1490481651871-ab68de25d43d',
  // Boutique clothing racks, warm tones
  'photo-1445205170230-053b83016050',
  // Woman green bralette, yellow wall — colorful editorial
  'photo-1469334031218-e382a71b716b',
];

function unsplash(id: string, w = 800) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;
}

function EditorialCollage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Warm editorial background wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #f7f0e8 0%, #ede0cc 100%)',
      }} />

      {/* Photo 1 — large, top-left, slight counter-clockwise tilt */}
      <div style={{
        position: 'absolute',
        top: '3%',
        left: '4%',
        width: '65%',
        height: '48%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 28px 72px rgba(0,0,0,0.18)',
        transform: 'rotate(-3deg)',
        zIndex: 3,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unsplash(PHOTOS[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Photo 2 — medium, top-right, clockwise tilt */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '2%',
        width: '52%',
        height: '40%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 56px rgba(0,0,0,0.14)',
        transform: 'rotate(2.5deg)',
        zIndex: 2,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unsplash(PHOTOS[4])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Photo 3 — large, middle-left, slight tilt */}
      <div style={{
        position: 'absolute',
        top: '36%',
        left: '6%',
        width: '70%',
        height: '38%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        transform: 'rotate(1.5deg)',
        zIndex: 4,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unsplash(PHOTOS[1])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Photo 4 — bottom-right, counter-clockwise */}
      <div style={{
        position: 'absolute',
        bottom: '3%',
        right: '4%',
        width: '58%',
        height: '36%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 20px 52px rgba(0,0,0,0.12)',
        transform: 'rotate(-2deg)',
        zIndex: 3,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unsplash(PHOTOS[2])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Photo 5 — small accent, bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '2%',
        width: '38%',
        height: '28%',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 16px 44px rgba(0,0,0,0.10)',
        transform: 'rotate(2deg)',
        zIndex: 2,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unsplash(PHOTOS[3], 500)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

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

// ── Icons ─────────────────────────────────────────────────────────────────────

function ChromeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8 L21 8M6.5 19.5 L11 12M17.5 19.5 L13 12" />
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
