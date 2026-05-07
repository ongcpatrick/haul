import { Header } from './ui/Header';
import { TabGroup } from './ui/TabGroup';
import { Lightbulb, Archive, Trash2 } from 'lucide-react';

export function BriefView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Screen 4: Smart Suggestions</h2>
        <p className="text-[#666]">AI-powered insights about your browsing</p>
      </div>

      <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
        <Header />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            <div className="bg-[#f8fdf9] border border-[#d4f0dd] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#4caf78] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[#1a1a1a] mb-1">Detected: Research Session</h3>
                  <p className="text-xs text-[#666] leading-relaxed mb-3">
                    You have 4 climate-related research tabs open. Consider bookmarking them as a collection.
                  </p>
                  <button className="text-xs font-medium text-[#4caf78] hover:text-[#45a06d]">
                    Save as Collection →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#fef9f3] border border-[#fed7aa] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#f59e0b] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Archive className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[#1a1a1a] mb-1">Stale Tabs Found</h3>
                  <p className="text-xs text-[#666] leading-relaxed mb-3">
                    3 documentation tabs haven't been viewed in 2 days. Archive them to reduce clutter?
                  </p>
                  <button className="text-xs font-medium text-[#f59e0b] hover:text-[#d97706]">
                    Archive Now →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#ef4444] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[#1a1a1a] mb-1">Duplicate Tabs</h3>
                  <p className="text-xs text-[#666] leading-relaxed mb-3">
                    You have Amazon.com open in 2 tabs. Close duplicates?
                  </p>
                  <button className="text-xs font-medium text-[#ef4444] hover:text-[#dc2626]">
                    Close Duplicates →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="border-t border-[#e5e5e5] pt-4">
              <h3 className="text-xs font-semibold text-[#666] uppercase tracking-wide mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fafafa] transition-colors text-sm text-[#1a1a1a]">
                  Close all Shopping tabs
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fafafa] transition-colors text-sm text-[#1a1a1a]">
                  Bookmark Climate Research
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fafafa] transition-colors text-sm text-[#1a1a1a]">
                  Create new workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
