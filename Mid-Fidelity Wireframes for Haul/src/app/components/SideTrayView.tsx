import { X, Maximize2, Filter } from 'lucide-react';
import { ProductCard } from './ui/ProductCard';

export function SideTrayView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 4: Side Tray View</h2>
        <p className="text-slate-600">Compact panel with items organized by category - quick glances while browsing</p>
      </div>

      <div className="bg-[#fafafa] rounded-lg p-8">
        <div className="max-w-5xl mx-auto flex gap-4">
          {/* Main page content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-[#e5e5e5] p-8" style={{ minHeight: '600px' }}>
            <h3 className="text-xl font-semibold text-[#1a1a1a] mb-4">Shopping Site</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded-lg" />
              ))}
            </div>
          </div>

          {/* Side Tray */}
          <div className="w-[320px] bg-white rounded-lg shadow-lg border border-[#e5e5e5] flex flex-col" style={{ height: '600px' }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">Your Saves</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-md">4 items</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-[10px] font-bold ml-1 shadow-sm">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>AI</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-white rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <ProductCard
                image=""
                name="Air Max 270 React - Men's Running Shoes"
                price="$150"
                originalPrice="$180"
                badges={[{ type: 'drop', label: '↓ $30' }]}
                compact
                onRemove={() => {}}
              />
              <ProductCard
                image=""
                name="Classic Leather Sneakers - White"
                price="$89"
                badges={[{ type: 'sale', label: '20% OFF' }]}
                compact
                onRemove={() => {}}
              />
              <ProductCard
                image=""
                name="Running Shoes - Sport Collection"
                price="$120"
                compact
                onRemove={() => {}}
              />
              <ProductCard
                image=""
                name="High-Top Canvas Sneakers"
                price="$65"
                badges={[{ type: 'stock', label: 'Low Stock' }]}
                compact
                onRemove={() => {}}
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-sm">
                <Maximize2 className="w-4 h-4" />
                <span>Compare All</span>
              </button>
              <button className="w-full text-sm font-medium text-slate-600 hover:text-slate-900 py-2">
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Annotation */}
        <div className="mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-2">Side Tray Features</h4>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>• Slides in from right, 320px wide</li>
            <li>• <strong>Items grouped by category</strong> with dividers and counts</li>
            <li>• Compact cards show thumbnail, name, price, badges</li>
            <li>• Remove items individually with X button on hover</li>
            <li>• Filter button to sort by price, category, or date</li>
            <li>• "Compare All" opens full dashboard view</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
