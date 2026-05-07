import { ShoppingBag } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 1: Empty State</h2>
        <p className="text-slate-600">No products saved yet - clean, minimal starting point</p>
      </div>

      <div className="w-[380px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden" style={{ height: '480px' }}>
        <div className="h-full flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-center text-lg">No items saved</h3>
          <p className="text-sm text-slate-600 text-center max-w-[280px] leading-relaxed mb-6">
            Browse any shopping site and click "Save" on products you're considering
          </p>
          <div className="w-full max-w-[260px] space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <span>Works on Nike, ASOS, Amazon, and more</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <span>AI extracts price and details automatically</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
              <span>Auto-organized by category for easy comparison</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
