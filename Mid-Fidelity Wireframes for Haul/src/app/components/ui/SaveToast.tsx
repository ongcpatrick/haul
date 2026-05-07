import { Check, ShoppingBag } from 'lucide-react';

interface SaveToastProps {
  productName: string;
  price: string;
}

export function SaveToast({ productName, price }: SaveToastProps) {
  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-start gap-3 max-w-sm border border-slate-700">
      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <Check className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm mb-0.5">Saved to Haul!</p>
        <p className="text-sm text-slate-200 truncate">{productName}</p>
        <p className="text-xs text-slate-400 mt-1">{price}</p>
      </div>
    </div>
  );
}
