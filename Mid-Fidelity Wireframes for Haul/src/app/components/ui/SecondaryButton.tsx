interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function SecondaryButton({ children, onClick }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 rounded-xl font-semibold text-sm border-2 border-[#ddd8cf] text-[#3d3529] hover:bg-[#f2ede4] hover:border-[#3d3529] transition-all active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
