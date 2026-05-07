import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <AlertCircle className="w-3.5 h-3.5 text-white" />
      </div>
      <p className="text-sm text-rose-900 leading-relaxed font-medium">{message}</p>
    </div>
  );
}
