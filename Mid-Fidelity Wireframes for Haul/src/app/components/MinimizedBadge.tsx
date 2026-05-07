import { MiniBadge } from './ui/MiniBadge';

export function MinimizedBadge() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 3: Minimized Badge</h2>
        <p className="text-slate-600">Persistent floating badge shows save count, click to expand to tray</p>
      </div>

      <div className="bg-[#fafafa] rounded-lg p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-[#e5e5e5]" style={{ minHeight: '500px' }}>
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Browse Naturally</h3>
              <p className="text-slate-600 leading-relaxed">
                The badge stays in the corner while you continue shopping across different tabs and sites.
                It never blocks content and shows your current save count at a glance. Items are automatically organized by category.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded-lg" />
              ))}
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-lg p-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-700 font-medium">
                  Continue browsing across sites
                </p>
                <p className="text-xs text-slate-500">
                  Badge follows you • Items auto-categorized
                </p>
              </div>
            </div>
          </div>

          {/* Badge in corner */}
          <MiniBadge count={4} />
        </div>

        {/* Annotation */}
        <div className="mt-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-900 mb-2">Minimized Mode</h4>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>• Fixed position: bottom-right corner of every tab</li>
            <li>• Shows total item count with red notification badge</li>
            <li>• Click to expand into side tray with <strong>category organization</strong></li>
            <li>• Stays visible but unobtrusive while browsing</li>
            <li>• Hover effect indicates it's interactive</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
