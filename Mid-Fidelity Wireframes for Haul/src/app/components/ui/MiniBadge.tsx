import { ShoppingBag } from 'lucide-react';

interface MiniBadgeProps {
  count: number;
  onClick?: () => void;
}

export function MiniBadge({ count, onClick }: MiniBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2.5 hover:bg-indigo-700 hover:scale-105 transition-all group"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5" />
        {count > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-white">{count}</span>
          </div>
        )}
      </div>
      <span className="font-semibold text-sm">{count} saved</span>
    </button>
  );
}
