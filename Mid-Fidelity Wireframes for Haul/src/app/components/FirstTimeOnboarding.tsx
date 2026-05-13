import { ShoppingBag, Sparkles, LayoutGrid, X } from 'lucide-react';

export function FirstTimeOnboarding() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#3d3529] mb-2">Screen 8: First-Time Tutorial</h2>
        <p className="text-[#8a7e72]">3-step overlay explaining the core workflow</p>
      </div>

      <div className="bg-[#fafafa] rounded-lg p-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1 - Save */}
          <div className="bg-[#fafaf7] rounded-lg shadow-lg border border-[#ddd8cf] mb-6 overflow-hidden relative">
            <button className="absolute top-4 right-4 p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors z-10">
              <X className="w-5 h-5 text-[#8a7e72]" />
            </button>

            <div className="p-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-[#e8f0e6] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <ShoppingBag className="w-10 h-10 text-[#7a9e76]" />
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="w-8 h-8 bg-[#7a9e76] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">1</span>
                  <span className="text-xs font-semibold text-[#8a7e72]">of 3</span>
                </div>
                <h3 className="text-2xl font-bold text-[#3d3529] mb-3">Save Products with One Click</h3>
                <p className="text-[#8a7e72] leading-relaxed mb-6">
                  Browse any shopping site normally. When you find something you like, click the Save button. Details are extracted automatically from the page.
                </p>

                {/* Visual Example */}
                <div className="bg-[#f5f5f5] rounded-lg p-6 mb-6">
                  <div className="relative inline-block">
                    <div className="w-48 h-32 bg-gradient-to-br from-[#e5e5e5] to-[#d0d0d0] rounded-lg mb-2" />
                    <div className="absolute bottom-4 right-4">
                      <button className="bg-[#fafaf7] px-4 py-2 rounded-full shadow-lg text-sm font-medium border border-[#ddd8cf] flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-[#7a9e76]" />
                        <span>Save to Haul</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button className="px-8 py-3 bg-[#7a9e76] text-white font-bold rounded-xl hover:bg-[#6a8c66] transition-colors shadow-sm">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 - Browse */}
          <div className="bg-[#fafaf7] rounded-lg shadow-lg border border-[#ddd8cf] mb-6 overflow-hidden relative">
            <button className="absolute top-4 right-4 p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors z-10">
              <X className="w-5 h-5 text-[#8a7e72]" />
            </button>

            <div className="p-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-[#e8f0e6] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Sparkles className="w-10 h-10 text-[#7a9e76]" />
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="w-8 h-8 bg-[#7a9e76] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">2</span>
                  <span className="text-xs font-semibold text-[#8a7e72]">of 3</span>
                </div>
                <h3 className="text-2xl font-bold text-[#3d3529] mb-3">Keep Shopping Freely</h3>
                <p className="text-[#8a7e72] leading-relaxed mb-6">
                  Your saved items stay in a small badge at the bottom corner. Continue browsing across different sites and tabs - we'll keep everything organized for you.
                </p>

                {/* Visual Example */}
                <div className="bg-[#f5f5f5] rounded-lg p-6 mb-6 relative">
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-[#d0d0d0] rounded w-3/4" />
                    <div className="h-3 bg-[#d0d0d0] rounded w-1/2" />
                    <div className="h-3 bg-[#d0d0d0] rounded w-5/6" />
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-[#7a9e76] text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      <span>4 saved</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button className="px-6 py-3 border border-[#ddd8cf] text-[#8a7e72] font-semibold rounded-lg hover:border-[#3d3529] transition-colors">
                    Back
                  </button>
                  <button className="px-8 py-3 bg-[#7a9e76] text-white font-semibold rounded-lg hover:bg-[#6a8c66] transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Compare */}
          <div className="bg-[#fafaf7] rounded-lg shadow-lg border border-[#ddd8cf] overflow-hidden relative">
            <button className="absolute top-4 right-4 p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors z-10">
              <X className="w-5 h-5 text-[#8a7e72]" />
            </button>

            <div className="p-8">
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 bg-[#f2ede4] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <LayoutGrid className="w-10 h-10 text-[#b07d4a]" />
                </div>
                <div className="mb-2 flex items-center justify-center gap-2">
                  <span className="w-8 h-8 bg-[#7a9e76] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">3</span>
                  <span className="text-xs font-semibold text-[#8a7e72]">of 3</span>
                </div>
                <h3 className="text-2xl font-bold text-[#3d3529] mb-3">Compare and Decide</h3>
                <p className="text-[#8a7e72] leading-relaxed mb-6">
                  When you're ready, open the dashboard to see everything side-by-side. Compare prices, ratings, sizes, and make the best decision.
                </p>

                {/* Visual Example */}
                <div className="bg-[#f5f5f5] rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-1">
                        <div className="aspect-square bg-gradient-to-br from-[#d0d0d0] to-[#b0b0b0] rounded" />
                        <div className="h-2 bg-[#d0d0d0] rounded" />
                        <div className="h-2 bg-[#d0d0d0] rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>

                <button className="px-8 py-3 bg-[#7a9e76] text-white font-semibold rounded-lg hover:bg-[#6a8c66] transition-colors mb-3">
                  Get Started
                </button>
                <p className="text-xs text-[#8a7e72]">Revisit this tutorial anytime in Settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation */}
      <div className="bg-[#e8f0e6] border-2 border-[#7a9e76] rounded-xl p-4">
        <h4 className="text-sm font-bold text-[#3d3529] mb-2">Onboarding Best Practices</h4>
        <ul className="space-y-1.5 text-sm text-[#3d3529]">
          <li>• Show on first install only (can be dismissed with X)</li>
          <li>• 3 steps max - keep it quick</li>
          <li>• Visual examples show exactly what to expect</li>
          <li>• Each step has one clear action (Next / Get Started)</li>
          <li>• Can skip entire tutorial - don't force it</li>
          <li>• Accessible later from Settings {">"} Help</li>
        </ul>
      </div>
    </div>
  );
}
