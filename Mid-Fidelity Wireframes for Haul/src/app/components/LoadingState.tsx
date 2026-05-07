import { Header } from './ui/Header';
import { TabGroup } from './ui/TabGroup';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function LoadingState() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Screen 3: AI Organizing</h2>
        <p className="text-[#666]">Analyzing and grouping tabs intelligently</p>
      </div>

      <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
        <Header />

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <LoadingSpinner label="Organizing 12 tabs..." />
          <p className="mt-2 text-xs text-[#999]">Analyzing page content and patterns</p>
        </div>
      </div>
    </div>
  );
}
