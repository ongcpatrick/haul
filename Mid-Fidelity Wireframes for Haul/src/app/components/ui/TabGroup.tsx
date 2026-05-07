import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

interface TabGroupProps {
  name: string;
  count: number;
  tabs: Array<{ title: string; url: string; favicon?: string }>;
  color?: string;
  collapsed?: boolean;
}

export function TabGroup({ name, count, tabs, color = '#4caf78', collapsed: initialCollapsed = false }: TabGroupProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#666]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#666]" />
          )}
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium text-sm text-[#1a1a1a]">{name}</span>
        </div>
        <span className="text-xs text-[#666] bg-[#f5f5f5] px-2 py-1 rounded">{count}</span>
      </button>

      {!collapsed && (
        <div className="border-t border-[#e5e5e5]">
          {tabs.map((tab, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-[#fafafa] transition-colors group"
            >
              <div className="w-4 h-4 bg-[#f5f5f5] rounded flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1a1a1a] truncate">{tab.title}</p>
                <p className="text-xs text-[#999] truncate">{tab.url}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#f0f0f0] rounded transition-all">
                <X className="w-3.5 h-3.5 text-[#666]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
