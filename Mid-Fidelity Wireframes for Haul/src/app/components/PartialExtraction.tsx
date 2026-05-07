import { AlertTriangle, Edit3 } from 'lucide-react';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';

export function PartialExtraction() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 6: Partial Extraction State</h2>
        <p className="text-slate-600">When AI can't extract all details - allow manual editing</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-[#e5e5e5] p-6">
        <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Some details couldn't be extracted</h3>
            <p className="text-sm text-slate-700">
              We found the product but couldn't extract all information automatically. You can edit the details below or save as-is.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded-lg mb-3" />
              <button className="text-xs text-[#6366f1] hover:text-[#5558e3] font-medium">
                Change Image
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#666] mb-1.5">Product Name</label>
                <input
                  type="text"
                  defaultValue="Classic Running Shoes"
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#666] mb-1.5">Brand</label>
                <input
                  type="text"
                  defaultValue="Nike"
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">
                Price <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                placeholder="$0.00"
                className="w-full px-3 py-2 border-2 border-[#fecaca] bg-[#fef2f2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
              />
              <p className="text-xs text-[#ef4444] mt-1">Required field</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Original Price</label>
              <input
                type="text"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666] mb-1.5">Size Availability</label>
            <input
              type="text"
              placeholder="e.g., 8-12 or S, M, L, XL"
              className="w-full px-3 py-2 border-2 border-[#fecaca] bg-[#fef2f2] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
            />
            <p className="text-xs text-[#ef4444] mt-1">Missing from page</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Rating</label>
              <input
                type="text"
                placeholder="0.0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#666] mb-1.5">Reviews</label>
              <input
                type="text"
                placeholder="0"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#666] mb-1.5">Category</label>
            <select className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]">
              <option>Shoes</option>
              <option>Clothing</option>
              <option>Electronics</option>
              <option>Accessories</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <SecondaryButton>Cancel</SecondaryButton>
          <PrimaryButton>Save Product</PrimaryButton>
        </div>
      </div>

      {/* Annotation */}
      <div className="max-w-2xl mx-auto bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-2">Handling Extraction Failures</h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li>• Shows which fields were successfully extracted (green check)</li>
          <li>• Highlights missing required fields (red border + warning)</li>
          <li>• Pre-fills what was found, lets user complete the rest</li>
          <li>• Can save with missing optional fields</li>
          <li>• "Cancel" discards, "Save Product" adds to collection</li>
          <li>• Future: suggest similar products based on partial data</li>
        </ul>
      </div>
    </div>
  );
}
