import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="bg-[#fdf0f0] border-2 border-[#c97b7b] rounded-xl p-4 flex items-start gap-3">
      <div className="w-5 h-5 bg-[#c97b7b] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <AlertCircle className="w-3.5 h-3.5 text-white" />
      </div>
      <p className="text-sm text-[#3d3529] leading-relaxed font-medium">{message}</p>
    </div>
  );
}
