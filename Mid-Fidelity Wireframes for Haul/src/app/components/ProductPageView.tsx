import { ShoppingBag, Star } from 'lucide-react';
import { SaveButton } from './ui/SaveButton';
import { SaveToast } from './ui/SaveToast';

export function ProductPageView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#3d3529] mb-2">Screen 2: Product Page with Save Button</h2>
        <p className="text-[#8a7e72]">Floating save button appears when user is on a product page</p>
      </div>

      <div className="bg-[#fafafa] rounded-lg p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Mock browser chrome */}
          <div className="bg-[#f5f5f5] border-b border-[#e5e5e5] px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1.5 text-xs text-[#666]">
              https://nike.com/product/air-max-270-react
            </div>
          </div>

          {/* Product page content */}
          <div className="p-8 relative" style={{ minHeight: '500px' }}>
            <div className="grid grid-cols-2 gap-8">
              {/* Product image */}
              <div className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded-lg" />

              {/* Product details */}
              <div>
                <p className="text-sm text-[#999] mb-2">Nike</p>
                <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                  Air Max 270 React
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4
                            ? 'fill-[#f59e0b] text-[#f59e0b]'
                            : 'text-[#e5e5e5]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#666]">(234 reviews)</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-bold text-[#1a1a1a]">$150</span>
                    <span className="text-lg text-[#999] line-through">$180</span>
                  </div>
                  <span className="inline-block text-sm font-semibold text-[#7a9e76] bg-[#e8f0e6] px-3 py-1 rounded">
                    16% OFF
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Select Size</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5'].map((size) => (
                      <button
                        key={size}
                        className="px-3 py-2 border border-[#ddd8cf] rounded hover:border-[#7a9e76] text-sm"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#666] leading-relaxed mb-6">
                  The Nike Air Max 270 React combines two legendary Nike cushioning technologies for the first time.
                  The design draws inspiration from heritage Nike running shoes, delivering a bold look.
                </p>

                <div className="space-y-3">
                  <button className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#333] transition-colors">
                    Add to Cart
                  </button>
                  <SaveButton />
                </div>
              </div>
            </div>

            {/* Floating Save Button */}
            <SaveButton floating />

            {/* Toast notification positioned bottom-center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <SaveToast productName="Air Max 270 React" price="$150" />
            </div>
          </div>
        </div>

        {/* Annotation */}
        <div className="mt-6 bg-[#e8f0e6] border-2 border-[#7a9e76] rounded-xl p-4">
          <h4 className="text-sm font-bold text-[#3d3529] mb-2">How It Works</h4>
          <ul className="space-y-1.5 text-sm text-[#3d3529]">
            <li>• Extension detects product page automatically</li>
            <li>• Floating "Save to Haul" button appears bottom-right</li>
            <li>• Click to save - AI extracts all details in background</li>
            <li>• Toast confirmation shows what was saved</li>
            <li>• Button changes to green "Saved" checkmark</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
