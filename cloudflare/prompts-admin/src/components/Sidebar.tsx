import {
  Clock,
  Users,
  MonitorSmartphone,
  FileText,
  Download,
  Circle,
  FolderOpen,
  Plus,
} from 'lucide-react';
import type { FilterState } from '../types';
import { SUPPORTED_SITES } from '../types';

interface SidebarProps {
  categories: string[];
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  promptCount: number;
  onNewPrompt: () => void;
}

// 分类对应的颜色
const CATEGORY_COLORS: Record<string, string> = {
  '开发': '#007aff', // 蓝色
  '写作': '#34c759', // 绿色
  '翻译': '#ff9500', // 橙色
  'AI对话': '#af52de', // 紫色
  '分析': '#ff3b30', // 红色
  '创意': '#ffcc00', // 黄色
  '其他': '#8e8e93', // 灰色
};

export function Sidebar({
  categories,
  filter,
  onFilterChange,
  onNewPrompt,
}: SidebarProps) {
  return (
    <div className="h-full w-[200px] flex flex-col bg-[#edd5d3]">
      {/* 滚动区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 个人收藏 */}
        <div className="sidebar-section-title">个人收藏</div>
        <div
          className={`sidebar-item ${!filter.category && !filter.site ? 'active' : ''}`}
          onClick={() => onFilterChange({ category: null, site: null })}
        >
          <Clock className="icon text-[#007aff]" size={18} />
          <span>全部提示词</span>
        </div>
        <div
          className="sidebar-item"
          onClick={onNewPrompt}
        >
          <Plus className="icon text-[#34c759]" size={18} />
          <span>新建提示词</span>
        </div>

        {/* 位置（站点） */}
        <div className="sidebar-section-title">位置</div>
        {SUPPORTED_SITES.map(site => {
          const IconComponent = site.value === '*' ? MonitorSmartphone :
            site.value === 'claude.ai' ? Users :
            site.value === 'chatgpt.com' ? FileText :
            site.value === 'gemini.google.com' ? Download :
            FolderOpen;
          return (
            <div
              key={site.value}
              className={`sidebar-item ${filter.site === site.value ? 'active' : ''}`}
              onClick={() => onFilterChange({ ...filter, site: filter.site === site.value ? null : site.value })}
            >
              <IconComponent className="icon text-[#007aff]" size={18} />
              <span>{site.label}</span>
            </div>
          );
        })}

        {/* 标签（分类） */}
        <div className="sidebar-section-title">标签</div>
        {categories.map(category => (
          <div
            key={category}
            className={`sidebar-item ${filter.category === category ? 'active' : ''}`}
            onClick={() => onFilterChange({ ...filter, category: filter.category === category ? null : category })}
          >
            <Circle
              className="tag-dot"
              size={12}
              fill={CATEGORY_COLORS[category] || '#8e8e93'}
              stroke="none"
            />
            <span>{category}</span>
          </div>
        ))}
        <div
          className={`sidebar-item`}
          onClick={() => onFilterChange({ category: null, site: null })}
        >
          <Circle
            className="tag-dot"
            size={12}
            fill="transparent"
            stroke="#8e8e93"
            strokeWidth={2}
          />
          <span>所有标签...</span>
        </div>
      </div>
    </div>
  );
}
