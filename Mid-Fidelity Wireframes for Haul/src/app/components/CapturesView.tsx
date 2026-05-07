import { Header } from './ui/Header';
import { TabGroup } from './ui/TabGroup';
import { Sparkles } from 'lucide-react';

export function CapturesView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Screen 2: Organized Tabs View</h2>
        <p className="text-[#666]">AI automatically groups tabs by topic</p>
      </div>

      <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
        <Header />

        <div className="px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4caf78]" />
              <span className="text-sm font-medium text-[#1a1a1a]">12 tabs organized</span>
            </div>
            <button className="text-xs text-[#666] hover:text-[#1a1a1a] font-medium">
              Clear all
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <TabGroup
            name="Climate Research"
            count={4}
            color="#4caf78"
            tabs={[
              { title: 'Renewable Energy Cost Trends | Nature', url: 'nature.com/articles/...' },
              { title: 'Climate Action Report 2024 | IPCC', url: 'ipcc.ch/reports/...' },
              { title: 'Solar Panel Efficiency Study', url: 'mit.edu/news/...' },
              { title: 'Wind Energy Statistics', url: 'energy.gov/...' },
            ]}
          />

          <TabGroup
            name="Shopping"
            count={5}
            color="#6366f1"
            tabs={[
              { title: 'Laptop Reviews 2024 - TechRadar', url: 'techradar.com/reviews/...' },
              { title: 'Amazon.com: MacBook Pro', url: 'amazon.com/...' },
              { title: 'Best Buy - Electronics', url: 'bestbuy.com/...' },
              { title: 'Dell XPS 15 Specs', url: 'dell.com/...' },
              { title: 'Apple Store', url: 'apple.com/store' },
            ]}
          />

          <TabGroup
            name="Documentation"
            count={3}
            color="#f59e0b"
            collapsed
            tabs={[
              { title: 'React Documentation', url: 'react.dev' },
              { title: 'Tailwind CSS', url: 'tailwindcss.com' },
              { title: 'MDN Web Docs', url: 'developer.mozilla.org' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
