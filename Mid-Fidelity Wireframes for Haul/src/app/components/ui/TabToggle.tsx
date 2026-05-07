interface TabToggleProps {
  activeTab: 'captures' | 'brief';
  onTabChange?: (tab: 'captures' | 'brief') => void;
}

export function TabToggle({ activeTab, onTabChange }: TabToggleProps) {
  return (
    <div className="inline-flex bg-[#f5f5f5] rounded-lg p-1 gap-1">
      <button
        onClick={() => onTabChange?.('captures')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeTab === 'captures'
            ? 'bg-white text-[#1a1a1a] shadow-sm'
            : 'text-[#666] hover:text-[#1a1a1a] hover:bg-white/50'
        }`}
      >
        Captures
      </button>
      <button
        onClick={() => onTabChange?.('brief')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          activeTab === 'brief'
            ? 'bg-white text-[#1a1a1a] shadow-sm'
            : 'text-[#666] hover:text-[#1a1a1a] hover:bg-white/50'
        }`}
      >
        Brief
      </button>
    </div>
  );
}
