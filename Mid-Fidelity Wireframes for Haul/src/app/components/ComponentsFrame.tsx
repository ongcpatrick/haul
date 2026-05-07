import { ProductCard } from './ui/ProductCard';
import { SaveButton } from './ui/SaveButton';
import { MiniBadge } from './ui/MiniBadge';
import { SaveToast } from './ui/SaveToast';
import { ErrorBanner } from './ui/ErrorBanner';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { CategoryDivider } from './ui/CategoryDivider';
import { ProBadge, AIBadge } from './ui/ProBadge';

export function ComponentsFrame() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Component Library</h2>
        <p className="text-slate-600">Reusable components for Haul shopping comparison</p>
      </div>

      <div className="grid gap-8">
        {/* Product Card - Full */}
        <ComponentSection title="Product Card (Full)">
          <div className="w-[280px]">
            <ProductCard
              image=""
              name="Air Max 270 React - Men's Running Shoes"
              brand="Nike"
              price="$150"
              originalPrice="$180"
              rating={4.5}
              reviewCount={234}
              category="Shoes"
              badges={[
                { type: 'drop', label: '↓ $30' },
                { type: 'sale', label: '16% OFF' },
              ]}
              onRemove={() => {}}
              onOpen={() => {}}
            />
          </div>
        </ComponentSection>

        {/* Product Card - Compact */}
        <ComponentSection title="Product Card (Compact for Tray)">
          <div className="w-[320px]">
            <ProductCard
              image=""
              name="Air Max 270 React - Men's"
              price="$150"
              originalPrice="$180"
              badges={[{ type: 'drop', label: '↓ $30' }]}
              compact
              onRemove={() => {}}
            />
          </div>
        </ComponentSection>

        {/* Save Button */}
        <ComponentSection title="Save Button (Floating on Product Pages)">
          <div className="w-[400px] h-32 bg-[#fafafa] rounded-lg relative">
            <SaveButton floating />
          </div>
        </ComponentSection>

        <ComponentSection title="Save Button (Saved State)">
          <div className="w-[400px] h-32 bg-[#fafafa] rounded-lg relative">
            <SaveButton floating saved />
          </div>
        </ComponentSection>

        {/* Mini Badge */}
        <ComponentSection title="Minimized Badge (Corner Pill)">
          <div className="w-[400px] h-32 bg-slate-50 rounded-lg relative">
            <MiniBadge count={4} />
          </div>
        </ComponentSection>

        {/* Category Divider */}
        <ComponentSection title="Category Divider (for grouping items)">
          <div className="w-[320px] bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <CategoryDivider category="Shoes" count={3} />
            <div className="mt-2 space-y-2">
              <div className="h-16 bg-slate-100 rounded-lg" />
              <div className="h-16 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </ComponentSection>

        {/* Pro Badge */}
        <ComponentSection title="Pro & AI Badges">
          <div className="w-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">PRO BADGES</p>
              <div className="flex gap-2 items-center">
                <ProBadge variant="compact" />
                <ProBadge variant="full" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">AI BADGE</p>
              <AIBadge />
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Use to indicate AI-powered features that require Pro subscription
              </p>
            </div>
          </div>
        </ComponentSection>

        {/* Save Toast */}
        <ComponentSection title="Save Confirmation Toast">
          <div className="w-[400px] flex justify-center p-4 bg-[#fafafa] rounded-lg">
            <SaveToast productName="Air Max 270 React - Men's Running Shoes" price="$150" />
          </div>
        </ComponentSection>

        {/* Loading Spinner */}
        <ComponentSection title="Loading Spinner">
          <div className="w-[400px] bg-white rounded-lg shadow-sm">
            <LoadingSpinner label="Extracting product details..." />
          </div>
        </ComponentSection>

        {/* Error Banner */}
        <ComponentSection title="Error Banner">
          <div className="w-[400px]">
            <ErrorBanner message="Unable to extract product details. Please add manually." />
          </div>
        </ComponentSection>

        {/* Category Badge */}
        <ComponentSection title="Category & Status Badges">
          <div className="w-[400px] bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">CATEGORY TAGS</p>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                  Shoes
                </span>
                <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                  Clothing
                </span>
                <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                  Electronics
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">STATUS BADGES</p>
              <div className="flex gap-2 flex-wrap">
                <span className="inline-block text-xs font-bold bg-emerald-500 text-white px-2 py-1 rounded-md shadow-sm">
                  ↓ Price Drop
                </span>
                <span className="inline-block text-xs font-bold bg-amber-500 text-white px-2 py-1 rounded-md shadow-sm">
                  SALE
                </span>
                <span className="inline-block text-xs font-bold bg-rose-500 text-white px-2 py-1 rounded-md shadow-sm">
                  Out of Stock
                </span>
              </div>
            </div>
          </div>
        </ComponentSection>
      </div>
    </div>
  );
}

function ComponentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#666] uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}
