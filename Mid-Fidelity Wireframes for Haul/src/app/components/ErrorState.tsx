import { Header } from './ui/Header';
import { ErrorBanner } from './ui/ErrorBanner';
import { PrimaryButton } from './ui/PrimaryButton';

export function ErrorState() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Screen 5: Error State</h2>
        <p className="text-[#666]">Clean error handling with clear next steps</p>
      </div>

      <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
        <Header />

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <ErrorBanner message="Unable to organize tabs. Check your Claude API key in settings." />
          <div className="mt-6 space-y-2 w-full max-w-[280px]">
            <PrimaryButton>Open Settings</PrimaryButton>
            <button className="w-full text-sm text-[#666] hover:text-[#1a1a1a] py-2">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
