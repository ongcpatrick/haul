import { Sparkles } from 'lucide-react';

export function FloatingPill() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">Minimal Badge (Optional)</h2>
        <p className="text-[#666]">Unobtrusive indicator in browser toolbar</p>
      </div>

      <div className="bg-[#fafafa] rounded-lg p-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Browser Chrome Mockup */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#e5e5e5]">
            {/* Browser toolbar */}
            <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-[#4caf78]" />
              </div>
              <div className="flex-1 bg-white rounded px-3 py-1.5 text-xs text-[#666]">
                https://example.com/article
              </div>
              {/* Haul Extension Badge */}
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] rounded flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">12</span>
                </div>
              </div>
            </div>

            {/* Page content */}
            <div className="p-8 bg-white">
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-4">Sample Article</h3>
              <p className="text-sm text-[#666] leading-relaxed">
                Content goes here. The extension stays completely out of the way, only showing a small badge in the toolbar with the current tab count.
              </p>
            </div>
          </div>

          {/* Annotation */}
          <div className="bg-[#f0f9f4] border border-[#d4f0dd] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">Minimal Design Philosophy</h4>
            <ul className="space-y-1.5 text-sm text-[#666]">
              <li>• No floating elements or overlays on the page</li>
              <li>• Single toolbar icon with badge count</li>
              <li>• Click icon to open side panel with organized tabs</li>
              <li>• Works entirely in background - zero page interference</li>
              <li>• Side panel (400px) slides in only when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
