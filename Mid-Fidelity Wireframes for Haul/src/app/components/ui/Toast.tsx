import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="bg-[#1a1a1a] text-white px-4 py-3 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-center gap-2.5 text-sm font-medium">
      <div className="w-5 h-5 bg-[#4caf78] rounded-full flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-3.5 h-3.5 text-white" />
      </div>
      <span>{message}</span>
    </div>
  );
}
