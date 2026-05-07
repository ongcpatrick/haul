interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function SecondaryButton({ children, onClick }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
