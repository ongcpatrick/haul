interface BadgeChipProps {
  icon: string;
  label: string;
  title: string;
}

export default function BadgeChip({ icon, label, title }: BadgeChipProps) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--primary)] bg-opacity-10 border border-[var(--primary)] border-opacity-20 text-xs font-semibold text-[var(--primary)]"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
