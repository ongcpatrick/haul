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
            ? 'bg-[#7a9e76] text-white'
            : 'bg-[#fafaf7] text-[#3d3529] border border-[#ddd8cf] hover:border-[#7a9e76] hover:bg-[#e8f0e6]'
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
            <div className="w-4 h-4 bg-[#e8f0e6] rounded-full flex items-center justify-center">
              <ShoppingBag className="w-2.5 h-2.5 text-[#7a9e76]" />
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
          ? 'bg-[#7a9e76] text-white hover:bg-[#6a8c66]'
          : 'bg-[#7a9e76] text-white hover:bg-[#6a8c66]'
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
