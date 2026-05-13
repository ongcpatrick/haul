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
          ? 'bg-[#ddd8cf] text-[#8a7e72] cursor-not-allowed'
          : 'bg-[#7a9e76] text-white hover:bg-[#6a8c66] hover:shadow-md active:scale-[0.98]'
      }`}
    >
      {children}
    </button>
  );
}
