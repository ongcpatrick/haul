import { HelpCircle, Bell, Trash2 } from 'lucide-react';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';

export function SettingsView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#3d3529] mb-2">Screen 9: Settings</h2>
        <p className="text-[#8a7e72]">Configure preferences and manage data</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-[#e5e5e5]">
        <div className="px-6 py-4 border-b border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Settings</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Settings */}
          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">AI & Extraction</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Claude API Key (Optional)
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-[#7a9e76] focus:border-transparent"
                />
                <p className="mt-2 text-xs text-[#666] leading-relaxed">
                  For sites without structured data. Uses schema.org by default. Key stored locally only.
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#7a9e76]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Auto-detect product pages</p>
                  <p className="text-xs text-[#666]">Show save button when on shopping sites</p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#7a9e76]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Extract product details automatically</p>
                  <p className="text-xs text-[#666]">Pulls price, name, rating without manual entry</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-[#e5e5e5] pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-[#666]" />
              <h4 className="text-sm font-semibold text-[#1a1a1a]">Notifications</h4>
            </div>
            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#7a9e76]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Price drop alerts</p>
                  <p className="text-xs text-[#666]">Notify when saved items go on sale</p>
                </div>
              </label>

              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#e5e5e5] text-[#7a9e76]" />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Back in stock alerts</p>
                  <p className="text-xs text-[#666]">Notify when out-of-stock items return</p>
                </div>
              </label>
            </div>
          </div>

          {/* Default View */}
          <div className="border-t border-[#e5e5e5] pt-6">
            <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">Default View</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input type="radio" name="view" defaultChecked className="w-4 h-4 text-[#7a9e76]" />
                <span className="text-sm text-[#666]">Minimized badge</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="view" className="w-4 h-4 text-[#7a9e76]" />
                <span className="text-sm text-[#666]">Side tray</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="radio" name="view" className="w-4 h-4 text-[#7a9e76]" />
                <span className="text-sm text-[#666]">Full dashboard</span>
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div className="border-t border-[#e5e5e5] pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-[#666]" />
              <h4 className="text-sm font-semibold text-[#1a1a1a]">Data Management</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Storage Used</p>
                  <p className="text-xs text-[#666]">42 products saved • 2.3 MB</p>
                </div>
                <button className="text-sm text-[#7a9e76] hover:text-[#6a8c66] font-medium">
                  Clear All
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Export Data</p>
                  <p className="text-xs text-[#666]">Download as JSON or CSV</p>
                </div>
                <button className="text-sm text-[#7a9e76] hover:text-[#6a8c66] font-medium">
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="border-t border-[#e5e5e5] pt-6">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-[#666]" />
              <h4 className="text-sm font-semibold text-[#1a1a1a]">Help & Support</h4>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-sm">
                View Tutorial Again
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-sm">
                Report a Bug
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#e5e5e5] pt-6">
            <div className="flex gap-3">
              <SecondaryButton>Reset to Defaults</SecondaryButton>
              <PrimaryButton>Save Settings</PrimaryButton>
            </div>
            <p className="text-xs text-[#999] mt-4 text-center">
              Haul v1.0.0 • Made for Project II
            </p>
          </div>
        </div>
      </div>

      {/* Annotation */}
      <div className="max-w-2xl mx-auto bg-[#e8f0e6] border-2 border-[#7a9e76] rounded-xl p-4">
        <h4 className="text-sm font-bold text-[#3d3529] mb-2">Settings Organization</h4>
        <ul className="space-y-1.5 text-sm text-[#3d3529]">
          <li>• AI settings: optional API key for non-schema sites</li>
          <li>• Notifications: price drops, stock alerts</li>
          <li>• Default view: badge, tray, or dashboard</li>
          <li>• Data management: clear, export functionality</li>
          <li>• Help: tutorial replay, bug reports, support</li>
        </ul>
      </div>
    </div>
  );
}
