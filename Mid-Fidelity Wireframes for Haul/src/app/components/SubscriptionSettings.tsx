import { Crown, Check, Settings as SettingsIcon } from 'lucide-react';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';

export function SubscriptionSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 11: Subscription Management</h2>
        <p className="text-slate-600">Manage Pro subscription and view feature access</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Free Tier Status */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900">Free Plan</h3>
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-1 rounded">Current</span>
              </div>
              <p className="text-sm text-slate-600">Limited AI features</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-slate-600" />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700">Unlimited saves & comparisons</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700">Manual categorization</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700">Basic extraction</span>
            </div>
          </div>

          <PrimaryButton>Upgrade to Pro</PrimaryButton>
        </div>

        {/* Pro Tier Preview */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">Haul Pro</h3>
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-indigo-100 text-sm">AI-powered shopping intelligence</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$4.99</p>
                <p className="text-xs text-indigo-200">/month</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-xs text-indigo-200 mb-1">AI Features</p>
                <p className="font-bold text-lg">Unlimited</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-xs text-indigo-200 mb-1">Price Alerts</p>
                <p className="font-bold text-lg">Real-time</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span>Auto-categorization with AI</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span>Price drop tracking & alerts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span>Smart recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span>Advanced AI extraction</span>
              </div>
            </div>

            <button className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Start 7-Day Free Trial
            </button>
          </div>
        </div>

        {/* Test Mode Toggle (Development Only) */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="w-5 h-5 text-amber-900" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 mb-1">Test Mode (Development)</h4>
              <p className="text-sm text-amber-800 mb-3">
                Toggle this to test Pro features without payment during development
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
                <span className="text-sm font-semibold text-amber-900">Enable All Pro Features</span>
              </label>
              <p className="text-xs text-amber-700 mt-2 font-semibold">
                WARNING: Remove this toggle before production deployment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Guide */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-2">Implementation Guide</h4>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-semibold mb-1">Environment Variable Setup:</p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs mb-2">
              <p># .env.development</p>
              <p>VITE_TEST_MODE=true</p>
              <p className="mt-2"># .env.production</p>
              <p>VITE_TEST_MODE=false</p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-1">Feature Gating Pattern:</p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-xs">
              <p className="text-emerald-400">const isProUser = checkSubscription();</p>
              <p className="text-emerald-400">const testMode = import.meta.env.VITE_TEST_MODE;</p>
              <p className="mt-2">if (isProUser || testMode) {'{'}</p>
              <p>  // Show AI features</p>
              <p>{'}'} else {'{'}</p>
              <p>  // Show paywall</p>
              <p>{'}'}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold mb-1">Features to Gate:</p>
            <ul className="space-y-1 text-xs ml-4">
              <li>• AI auto-categorization in side tray</li>
              <li>• Price drop badges and alerts</li>
              <li>• Smart recommendations section</li>
              <li>• Advanced AI extraction (Claude API calls)</li>
              <li>• Category filter tabs (Pro users see all, free see manual only)</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold mb-1">Deployment Checklist:</p>
            <ul className="space-y-1 text-xs ml-4">
              <li>• Set VITE_TEST_MODE=false in production</li>
              <li>• Remove test mode toggle from settings</li>
              <li>• Integrate Stripe/payment processor</li>
              <li>• Add subscription check to backend</li>
              <li>• Test paywall appears for free users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
