import { Settings, ArrowLeft, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ showBack, onBack }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white">
      {showBack ? (
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">Haul</span>
        </div>
      )}
      {!showBack && (
        <button className="p-2 -mr-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Settings className="w-5 h-5 text-slate-500 hover:text-slate-700 transition-colors" />
        </button>
      )}
    </div>
  );
}
