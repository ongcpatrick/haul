import { X, Download, Share2, SlidersHorizontal, Star } from 'lucide-react';

export function ComparisonDashboard() {
  const products = [
    {
      name: 'Air Max 270 React',
      brand: 'Nike',
      price: '$150',
      originalPrice: '$180',
      rating: 4.5,
      reviews: 234,
      sizes: '8-12',
      badge: '↓ $30',
      badgeType: 'drop' as const,
    },
    {
      name: 'Classic Leather Sneakers',
      brand: 'ASOS',
      price: '$89',
      originalPrice: '$112',
      rating: 4.0,
      reviews: 89,
      sizes: '7-11',
      badge: '20% OFF',
      badgeType: 'sale' as const,
    },
    {
      name: 'Running Shoes Sport',
      brand: 'Adidas',
      price: '$120',
      rating: 4.8,
      reviews: 567,
      sizes: '7-13',
    },
    {
      name: 'High-Top Canvas',
      brand: 'Converse',
      price: '$65',
      rating: 4.2,
      reviews: 123,
      sizes: '6-12',
      badge: 'Low Stock',
      badgeType: 'stock' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Screen 5: Comparison Dashboard</h2>
        <p className="text-slate-600">Full popup view with category filters and side-by-side comparison grid</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border border-[#e5e5e5] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Compare Products</h3>
              <p className="text-sm text-slate-600">4 items · 2 categories</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-slate-200">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-colors flex items-center gap-2 border border-transparent hover:border-slate-200">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 rounded-lg border-2 border-slate-300 shadow-sm">
              All (4)
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              Shoes (3)
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              Electronics (1)
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg transition-colors border border-emerald-200 hover:bg-emerald-100 inline-flex items-center gap-1.5">
              <span>Price Drops (2)</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded text-[9px] font-bold">
                PRO
              </span>
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="text-left pb-4 pr-4 text-sm font-semibold text-[#666] w-32">Product</th>
                {products.map((product, i) => (
                  <th key={i} className="pb-4 px-4">
                    <div className="w-48 relative group">
                      <div className="aspect-square bg-gradient-to-br from-[#f5f5f5] to-[#e5e5e5] rounded-lg mb-3 relative">
                        {product.badge && (
                          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm ${
                            product.badgeType === 'drop' ? 'bg-emerald-500 text-white' :
                            product.badgeType === 'sale' ? 'bg-amber-500 text-white' :
                            'bg-rose-500 text-white'
                          }`}>
                            {product.badge}
                          </span>
                        )}
                        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-sm border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-all opacity-0 group-hover:opacity-100 z-20">
                          <X className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Name</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4">
                    <p className="text-sm font-medium text-[#1a1a1a] mb-1">{product.name}</p>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Brand</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4 text-sm text-[#666]">{product.brand}</td>
                ))}
              </tr>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Price</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#1a1a1a]">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#999] line-through">{product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Rating</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${
                              j < Math.floor(product.rating)
                                ? 'fill-[#f59e0b] text-[#f59e0b]'
                                : 'text-[#e5e5e5]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#666]">({product.reviews})</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Sizes</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4 text-sm text-[#666]">{product.sizes}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 text-sm font-medium text-[#666]">Link</td>
                {products.map((product, i) => (
                  <td key={i} className="py-3 px-4">
                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors w-full shadow-sm">
                      Go to Site
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Annotation */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-2">Dashboard Features</h4>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li>• Products displayed as columns, specs as rows</li>
          <li>• <strong>Filter tabs by category</strong> - Shoes, Electronics, etc.</li>
          <li>• Special "Price Drops" filter shows only discounted items</li>
          <li>• Remove individual items with X button on hover</li>
          <li>• Share comparison via link or export as PDF</li>
          <li>• "Go to Site" button opens product page in new tab</li>
        </ul>
      </div>
    </div>
  );
}
