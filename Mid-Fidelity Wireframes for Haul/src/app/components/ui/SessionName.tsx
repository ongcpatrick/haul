import { Pencil } from 'lucide-react';

interface SessionNameProps {
  name: string;
  onEdit?: () => void;
}

export function SessionName({ name, onEdit }: SessionNameProps) {
  return (
    <button
      onClick={onEdit}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors group"
    >
      <span className="text-sm font-medium text-[#1a1a1a]">{name}</span>
      <Pencil className="w-3.5 h-3.5 text-[#666] group-hover:text-[#1a1a1a]" />
    </button>
  );
}
