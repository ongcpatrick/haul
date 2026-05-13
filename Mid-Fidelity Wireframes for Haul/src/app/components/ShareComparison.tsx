import { Copy, Check, Link2 } from 'lucide-react';
import { useState } from 'react';
import { PrimaryButton } from './ui/PrimaryButton';

export function ShareComparison() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#3d3529] mb-2">Screen 7: Share Comparison</h2>
        <p className="text-[#8a7e72]">Generate shareable link for collaborative decision-making</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-[#e5e5e5] p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#e8f0e6] rounded-xl flex items-center justify-center shadow-sm">
              <Link2 className="w-6 h-6 text-[#7a9e76]" />
            </div>
            <div>
              <h3 className="font-bold text-[#3d3529]">Share Your Comparison</h3>
              <p className="text-sm text-[#8a7e72]">Anyone with the link can view (but not edit)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Comparison Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue="haul.app/compare/abc123xyz"
                  readOnly
                  className="flex-1 px-3 py-2.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg text-sm text-[#666] font-mono"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm ${
                    copied
                      ? 'bg-[#7a9e76] text-white'
                      : 'bg-[#7a9e76] text-white hover:bg-[#6a8c66]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#666] mt-2">
                This link will remain active for 30 days or until you delete the comparison
              </p>
            </div>

            <div className="border-t border-[#e5e5e5] pt-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#6366f1]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Allow comments</p>
                  <p className="text-xs text-[#666]">Let others add notes to help you decide</p>
                </div>
              </label>
            </div>

            <div>
              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#6366f1]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Include prices</p>
                  <p className="text-xs text-[#666]">Show current prices in shared view</p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e5e5e5]">
            <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">Share via</h4>
            <div className="grid grid-cols-3 gap-2">
              <button className="px-4 py-2.5 border border-[#e5e5e5] rounded-lg hover:border-[#7a9e76] hover:bg-[#e8f0e6] transition-colors text-sm font-medium">
                WhatsApp
              </button>
              <button className="px-4 py-2.5 border border-[#e5e5e5] rounded-lg hover:border-[#7a9e76] hover:bg-[#e8f0e6] transition-colors text-sm font-medium">
                Email
              </button>
              <button className="px-4 py-2.5 border border-[#e5e5e5] rounded-lg hover:border-[#7a9e76] hover:bg-[#e8f0e6] transition-colors text-sm font-medium">
                SMS
              </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e5e5e5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-[#666] uppercase tracking-wide">Preview</h4>
            <span className="text-xs text-[#7a9e76] bg-[#e8f0e6] px-2 py-1 rounded font-medium">Read-only</span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Shoes Comparison</p>
              <p className="text-xs text-[#666]">4 items • Shared by you • 2 hours ago</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded" />
              ))}
            </div>
            <p className="text-xs text-[#999] italic">
              Shared comparisons are view-only. Recipients can't edit or remove items.
            </p>
          </div>
        </div>
      </div>

      {/* Annotation */}
      <div className="max-w-2xl mx-auto bg-[#e8f0e6] border-2 border-[#7a9e76] rounded-xl p-4">
        <h4 className="text-sm font-bold text-[#3d3529] mb-2">Sharing Features</h4>
        <ul className="space-y-1.5 text-sm text-[#3d3529]">
          <li>• Generate unique shareable link (no login required to view)</li>
          <li>• Optional: allow comments for collaborative feedback</li>
          <li>• Toggle price visibility in case of gifting</li>
          <li>• Quick share to WhatsApp, email, SMS</li>
          <li>• Links expire after 30 days or manual deletion</li>
          <li>• Preview shows what recipients will see</li>
        </ul>
      </div>
    </div>
  );
}
