import { Crown, Sparkles } from 'lucide-react';

interface ProBadgeProps {
  variant?: 'compact' | 'full';
}

export function ProBadge({ variant = 'compact' }: ProBadgeProps) {
  if (variant === 'full') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-lg text-xs font-bold shadow-sm">
        <Crown className="w-3 h-3" />
        <span>PRO</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded-md text-[10px] font-bold">
      <Crown className="w-2.5 h-2.5" />
      PRO
    </span>
  );
}

export function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-[10px] font-bold shadow-sm">
      <Sparkles className="w-2.5 h-2.5" />
      AI
    </span>
  );
}
