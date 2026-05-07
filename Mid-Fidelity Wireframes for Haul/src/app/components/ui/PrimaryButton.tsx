interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ children, onClick, disabled }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
        disabled
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {children}
    </button>
  );
}
