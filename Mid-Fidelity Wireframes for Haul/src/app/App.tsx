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
    <div className="size-full bg-[#fafaf7] flex">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-[#f2ede4] border-r border-[#ddd8cf] p-6 overflow-y-auto">
        <h1 className="font-semibold text-[#3d3529] mb-2">Haul Wireframes</h1>
        <p className="text-sm text-[#8a7e72] mb-6">Shopping Comparison Extension</p>

        <nav className="space-y-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === view.id
                  ? 'bg-[#7a9e76] text-white shadow-sm'
                  : 'text-[#3d3529] hover:bg-[#f2ede4]'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-[#ddd8cf]">
          <h3 className="text-xs font-semibold text-[#8a7e72] mb-3 uppercase tracking-wide">Design System</h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="font-semibold text-[#3d3529] mb-2">Color Palette</div>
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-medium text-[#8a7e72] mb-1">PRIMARY</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: '#7a9e76' }} />
                    <div>
                      <div className="font-medium text-[#3d3529]">Sage Green</div>
                      <div className="text-[#8a7e72]">#7a9e76</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[#8a7e72] mb-1">SURFACE / BG</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border border-[#ddd8cf] shadow-sm" style={{ backgroundColor: '#f2ede4' }} />
                    <div>
                      <div className="font-medium text-[#3d3529]">Warm Beige</div>
                      <div className="text-[#8a7e72]">#f2ede4</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[#8a7e72] mb-1">PRICE / AMBER</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: '#b07d4a' }} />
                    <div>
                      <div className="font-medium text-[#3d3529]">Warm Amber</div>
                      <div className="text-[#8a7e72]">#b07d4a</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[#8a7e72] mb-1">ERROR / URGENT</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: '#c97b7b' }} />
                    <div>
                      <div className="font-medium text-[#3d3529]">Muted Rose</div>
                      <div className="text-[#8a7e72]">#c97b7b</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#ddd8cf]">
              <div className="font-semibold text-[#3d3529] mb-1.5">Typography</div>
              <div className="text-[#8a7e72]">Inter (System Font Stack)</div>
            </div>
            <div className="pt-3 border-t border-[#ddd8cf]">
              <div className="font-semibold text-[#3d3529] mb-1.5">Spacing & Layout</div>
              <div className="space-y-1 text-[#8a7e72]">
                <div>Grid: 4px base unit</div>
                <div>Tray: 320px • Dashboard: 800px</div>
                <div>Radius: 12-14px (cards) • 20-24px (pills)</div>
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
              <div className="mb-8 p-6 bg-[#f2ede4] border border-[#ddd8cf] rounded-xl">
                <h2 className="font-semibold text-[#3d3529] mb-3">Haul: Shopping Comparison Extension</h2>
                <p className="text-sm text-[#3d3529] mb-4 leading-relaxed">
                  Save products from any shopping site with one click. Compare everything side-by-side to make better decisions without the tab chaos.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#fafaf7] rounded-lg p-3 border border-[#ddd8cf]">
                    <h3 className="text-xs font-bold text-[#3d3529] mb-2 uppercase tracking-wide flex items-center gap-2">
                      <span>Free Forever</span>
                      <span className="text-[10px] bg-[#e8f0e6] text-[#7a9e76] px-2 py-0.5 rounded font-bold">$0</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-[#3d3529]">
                      <li>• Unlimited product saves</li>
                      <li>• Side-by-side comparison</li>
                      <li>• Manual categorization</li>
                      <li>• Export & share</li>
                    </ul>
                  </div>

                  <div className="bg-[#fafaf7] rounded-lg p-3 border-2 border-[#b07d4a]">
                    <h3 className="text-xs font-bold text-[#3d3529] mb-2 uppercase tracking-wide flex items-center gap-2">
                      <span>Haul Pro</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 rounded text-[10px] font-bold">
                        <Crown className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    </h3>
                    <ul className="space-y-1 text-xs text-[#3d3529] mb-2">
                      <li>• AI auto-categorization</li>
                      <li>• Price drop alerts</li>
                      <li>• Smart recommendations</li>
                      <li>• Advanced AI extraction</li>
                    </ul>
                    <p className="text-xs font-bold text-[#b07d4a]">$4.99/mo • 7-day trial</p>
                  </div>
                </div>

                <div className="bg-[#fafaf7] border border-[#ddd8cf] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#3d3529] mb-1">Development Strategy</p>
                  <p className="text-xs text-[#8a7e72] leading-relaxed">
                    Use <code className="bg-[#f2ede4] px-1 rounded">VITE_TEST_MODE=true</code> during development to test all Pro features. Set to <code className="bg-[#f2ede4] px-1 rounded">false</code> before deploying to Chrome Web Store to enable paywall.
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