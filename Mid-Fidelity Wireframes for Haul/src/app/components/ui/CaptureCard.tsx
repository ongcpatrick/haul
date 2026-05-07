interface CaptureCardProps {
  quote: string;
  source: string;
  timestamp: string;
}

export function CaptureCard({ quote, source, timestamp }: CaptureCardProps) {
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-4 space-y-3 hover:border-[#d0d0d0] transition-colors group">
      <div className="flex items-start gap-2">
        <div className="w-1 h-full bg-[#4caf78] rounded-full flex-shrink-0 mt-1" />
        <p className="text-sm text-[#1a1a1a] leading-relaxed">"{quote}"</p>
      </div>
      <div className="flex items-center justify-between text-xs text-[#666]">
        <span className="font-medium">{source}</span>
        <span>{timestamp}</span>
      </div>
    </div>
  );
}
