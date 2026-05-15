import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({ title, description, ctaLabel, ctaHref, onCtaClick }: EmptyStateProps) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-10 text-center">
      <svg
        className="mx-auto w-12 h-12 text-[var(--muted)] mb-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">{description}</p>
      )}
      {ctaLabel && (onCtaClick || ctaHref) && (
        onCtaClick ? (
          <button
            type="button"
            onClick={onCtaClick}
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold transition-colors"
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            href={ctaHref!}
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-h)] text-white text-sm font-semibold transition-colors"
          >
            {ctaLabel}
          </Link>
        )
      )}
    </div>
  );
}
