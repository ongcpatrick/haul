interface LoadingSpinnerProps {
  label: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="w-10 h-10 border-[3px] border-[#e5e5e5] rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-t-[#4caf78] rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-sm text-[#666] font-medium">{label}</p>
    </div>
  );
}
