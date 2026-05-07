import { X, ExternalLink, Star } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  brand?: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  badges?: Array<{ type: 'drop' | 'sale' | 'stock'; label: string }>;
  compact?: boolean;
  onRemove?: () => void;
  onOpen?: () => void;
}

export function ProductCard({
  image,
  name,
  brand,
  price,
  originalPrice,
  rating,
  reviewCount,
  category,
  badges = [],
  compact = false,
  onRemove,
  onOpen,
}: ProductCardProps) {
  if (compact) {
    return (
      <div className="bg-white border border-[#e5e5e5] rounded-lg p-3 hover:border-[#d0d0d0] transition-colors group relative">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-[#f5f5f5] rounded flex-shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-[#1a1a1a] truncate mb-1">{name}</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-[#1a1a1a]">{price}</span>
              {originalPrice && (
                <span className="text-xs text-[#999] line-through">{originalPrice}</span>
              )}
            </div>
            {badges.length > 0 && (
              <div className="flex gap-1.5">
                {badges.map((badge, i) => (
                  <StatusBadge key={i} type={badge.type} label={badge.label} />
                ))}
              </div>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded opacity-0 group-hover:opacity-100 hover:bg-[#f5f5f5] transition-all shadow-sm"
          >
            <X className="w-3.5 h-3.5 text-[#666]" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden hover:border-[#d0d0d0] transition-colors group">
      <div className="aspect-square bg-[#f5f5f5] relative">
        <div className="w-full h-full bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5]" />
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {badges.map((badge, i) => (
              <StatusBadge key={i} type={badge.type} label={badge.label} />
            ))}
          </div>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-white rounded opacity-0 group-hover:opacity-100 hover:bg-[#f5f5f5] transition-all shadow-sm z-20"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>
        )}
      </div>
      <div className="p-4">
        {category && (
          <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md mb-2">
            {category}
          </span>
        )}
        {brand && <p className="text-xs text-[#999] mb-1">{brand}</p>}
        <h4 className="text-sm font-medium text-[#1a1a1a] mb-2 line-clamp-2">{name}</h4>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-semibold text-[#1a1a1a]">{price}</span>
          {originalPrice && (
            <span className="text-sm text-[#999] line-through">{originalPrice}</span>
          )}
        </div>
        {rating !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating)
                      ? 'fill-[#f59e0b] text-[#f59e0b]'
                      : 'text-[#e5e5e5]'
                  }`}
                />
              ))}
            </div>
            {reviewCount && (
              <span className="text-xs text-[#666]">({reviewCount})</span>
            )}
          </div>
        )}
        {onOpen && (
          <button
            onClick={onOpen}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <span>Go to Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ type, label }: { type: 'drop' | 'sale' | 'stock'; label: string }) {
  const styles = {
    drop: 'bg-emerald-500 text-white shadow-sm',
    sale: 'bg-amber-500 text-white shadow-sm',
    stock: 'bg-rose-500 text-white shadow-sm',
  };

  return (
    <span className={`inline-block text-xs font-bold px-2 py-1 rounded-md ${styles[type]}`}>
      {label}
    </span>
  );
}
