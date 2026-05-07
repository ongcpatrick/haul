import { useState } from 'react';
import { Crown } from 'lucide-react';
import { ComponentsFrame } from './components/ComponentsFrame';
import { EmptyState } from './components/EmptyState';
import { ProductPageView } from './components/ProductPageView';
import { MinimizedBadge } from './components/MinimizedBadge';
import { SideTrayView } from './components/SideTrayView';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { PartialExtraction } from './components/PartialExtraction';
import { SettingsView } from './components/SettingsView';
import { FirstTimeOnboarding } from './components/FirstTimeOnboarding';
import { ShareComparison } from './components/ShareComparison';
import { PaywallModal } from './components/PaywallModal';
import { SubscriptionSettings } from './components/SubscriptionSettings';

export default function App() {
  const [currentView, setCurrentView] = useState('components');

  const views = [
    { id: 'components', label: 'Component Library' },
    { id: 'empty', label: '1. Empty State' },
    { id: 'product', label: '2. Product Page + Save' },
    { id: 'badge', label: '3. Minimized Badge' },
    { id: 'tray', label: '4. Side Tray' },
    { id: 'dashboard', label: '5. Comparison Dashboard' },
    { id: 'partial', label: '6. Partial Extraction' },
    { id: 'share', label: '7. Share Comparison' },
    { id: 'onboarding', label: '8. First-Time Tutorial' },
    { id: 'settings', label: '9. Settings' },
    { id: 'paywall', label: '10. Paywall Modal' },
    { id: 'subscription', label: '11. Subscription' },
  ];

  return (
    <div className="size-full bg-[#fafafa] flex">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 overflow-y-auto">
        <h1 className="font-semibold text-slate-900 mb-2">Haul Wireframes</h1>
        <p className="text-sm text-slate-600 mb-6">Shopping Comparison Extension</p>

        <nav className="space-y-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === view.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Design System</h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="font-semibold text-slate-900 mb-2">Color Palette</div>
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-medium text-slate-500 mb-1">PRIMARY</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 shadow-sm" />
                    <div>
                      <div className="font-medium text-slate-900">Indigo 600</div>
                      <div className="text-slate-500">#4f46e5</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-500 mb-1">SUCCESS / SAVINGS</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-sm" />
                    <div>
                      <div className="font-medium text-slate-900">Emerald 500</div>
                      <div className="text-slate-500">#10b981</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-500 mb-1">SALE / ATTENTION</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 shadow-sm" />
                    <div>
                      <div className="font-medium text-slate-900">Amber 500</div>
                      <div className="text-slate-500">#f59e0b</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-500 mb-1">ERROR / URGENT</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 shadow-sm" />
                    <div>
                      <div className="font-medium text-slate-900">Rose 500</div>
                      <div className="text-slate-500">#f43f5e</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <div className="font-semibold text-slate-900 mb-1.5">Typography</div>
              <div className="text-slate-600">Inter (System Font Stack)</div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <div className="font-semibold text-slate-900 mb-1.5">Spacing & Layout</div>
              <div className="space-y-1 text-slate-600">
                <div>Grid: 4px base unit</div>
                <div>Tray: 320px • Dashboard: 800px</div>
                <div>Radius: 8px (cards) • 12px (buttons)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto">
          {currentView === 'components' && (
            <>
              <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-xl">
                <h2 className="font-semibold text-slate-900 mb-3">Haul: Shopping Comparison Extension</h2>
                <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                  Save products from any shopping site with one click. Compare everything side-by-side to make better decisions without the tab chaos.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/70 rounded-lg p-3 border border-indigo-200">
                    <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <span>Free Forever</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">$0</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-700">
                      <li>• Unlimited product saves</li>
                      <li>• Side-by-side comparison</li>
                      <li>• Manual categorization</li>
                      <li>• Export & share</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border-2 border-amber-300">
                    <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                      <span>Haul Pro</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded text-[10px] font-bold">
                        <Crown className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-700 mb-2">
                      <li>• AI auto-categorization</li>
                      <li>• Price drop alerts</li>
                      <li>• Smart recommendations</li>
                      <li>• Advanced AI extraction</li>
                    </ul>
                    <p className="text-xs font-bold text-amber-900">$4.99/mo • 7-day trial</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-900 mb-1">Development Strategy</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Use <code className="bg-amber-100 px-1 rounded">VITE_TEST_MODE=true</code> during development to test all Pro features. Set to <code className="bg-amber-100 px-1 rounded">false</code> before deploying to Chrome Web Store to enable paywall.
                  </p>
                </div>
              </div>
              <ComponentsFrame />
            </>
          )}
          {currentView === 'empty' && <EmptyState />}
          {currentView === 'product' && <ProductPageView />}
          {currentView === 'badge' && <MinimizedBadge />}
          {currentView === 'tray' && <SideTrayView />}
          {currentView === 'dashboard' && <ComparisonDashboard />}
          {currentView === 'partial' && <PartialExtraction />}
          {currentView === 'share' && <ShareComparison />}
          {currentView === 'onboarding' && <FirstTimeOnboarding />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'paywall' && <PaywallModal />}
          {currentView === 'subscription' && <SubscriptionSettings />}
        </div>
      </div>
    </div>
  );
}