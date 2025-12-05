import {
  Search,
} from 'lucide-react';

interface ToolbarProps {
  title: string;
  onRefresh: () => void;
}

export function Toolbar({ title }: ToolbarProps) {
  return (
    <div className="finder-toolbar h-12 flex items-center px-3 gap-3">
      {/* 标题 */}
      <div className="font-medium text-gray-800 text-sm">
        {title}
      </div>

      {/* 中间空白 */}
      <div className="flex-1" />
      {/* 搜索 */}
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索"
          className="w-40 h-7 pl-7 pr-3 rounded-md bg-black/5 border-none text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007aff]/30"
        />
      </div>
    </div>
  );
}
