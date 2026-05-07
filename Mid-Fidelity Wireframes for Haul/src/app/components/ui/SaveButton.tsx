import { ShoppingBag, Check } from 'lucide-react';

interface SaveButtonProps {
  saved?: boolean;
  onClick?: () => void;
  floating?: boolean;
}

export function SaveButton({ saved = false, onClick, floating = false }: SaveButtonProps) {
  if (floating) {
    return (
      <button
        onClick={onClick}
        className={`fixed bottom-5 right-5 px-3 py-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center gap-1.5 font-medium text-xs transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 ${
          saved
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        {saved ? (
          <>
            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span>Saved</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-2.5 h-2.5 text-indigo-600" />
            </div>
            <span>Save</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
        saved
          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {saved ? (
        <span className="flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          Saved to Haul
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Save to Haul
        </span>
      )}
    </button>
  );
}
