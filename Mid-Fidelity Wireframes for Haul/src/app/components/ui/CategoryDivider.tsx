interface CategoryDividerProps {
  category: string;
  count: number;
}

export function CategoryDivider({ category, count }: CategoryDividerProps) {
  return (
    <div className="flex items-center gap-2 px-1 py-2">
      <div className="flex-1 h-px bg-[#ddd8cf]" />
      <span className="text-xs font-bold text-[#8a7e72] uppercase tracking-wide">
        {category} · {count}
      </span>
      <div className="flex-1 h-px bg-[#ddd8cf]" />
    </div>
  );
}
