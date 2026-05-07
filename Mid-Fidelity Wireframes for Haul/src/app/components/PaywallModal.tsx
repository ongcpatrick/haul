import { Crown, Check, X, Sparkles, TrendingDown, Tag, Zap } from 'lucide-react';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';

export function PaywallModal() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 10: Paywall Modal</h2>
        <p className="text-slate-600">Shown when user tries to access AI-powered features</p>
      </div>

      {/* Modal Overlay */}
      <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-8 flex items-center justify-center" style={{ minHeight: '600px' }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 px-6 py-8 text-center">
            <button className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Haul Pro</h3>
            <p className="text-indigo-100 text-sm">Unlock AI-powered shopping insights</p>
          </div>

          {/* Features List */}
          <div className="px-6 py-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Pro Features</h4>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">AI Auto-Categorization</p>
                <p className="text-xs text-slate-600">Automatically organize items by type</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Price Drop Alerts</p>
                <p className="text-xs text-slate-600">Get notified when prices decrease</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Smart Recommendations</p>
                <p className="text-xs text-slate-600">AI suggests best value products</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Advanced Extraction</p>
                <p className="text-xs text-slate-600">Extract data from any site using AI</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Included Free</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span>Unlimited product saves</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span>Manual comparison dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <span>Schema.org data extraction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-4">
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">$4.99</span>
                <span className="text-slate-600 text-sm">/month</span>
              </div>
              <p className="text-center text-xs text-slate-600">Cancel anytime • 7-day free trial</p>
            </div>

            <div className="space-y-2">
              <PrimaryButton>Start Free Trial</PrimaryButton>
              <SecondaryButton>Maybe Later</SecondaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Annotation */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-2">Freemium Business Model</h4>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-semibold mb-1">Free Features:</p>
            <ul className="space-y-1 text-xs ml-4">
              <li>• Save unlimited products</li>
              <li>• Manual side-by-side comparison</li>
              <li>• Schema.org extraction (works on major retailers)</li>
              <li>• Export and share comparisons</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Pro Features ($4.99/mo):</p>
            <ul className="space-y-1 text-xs ml-4">
              <li>• AI auto-categorization</li>
              <li>• Price drop tracking & alerts</li>
              <li>• Smart recommendations (best value)</li>
              <li>• Advanced AI extraction (any site)</li>
              <li>• Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
