import { useEffect, useCallback } from 'react';
import { X, Pencil, Trash2, Circle } from 'lucide-react';
import type { Prompt } from '../types';

// 分类对应的颜色
const CATEGORY_COLORS: Record<string, string> = {
  '开发': '#007aff',
  '写作': '#34c759',
  '翻译': '#ff9500',
  'AI对话': '#af52de',
  '分析': '#ff3b30',
  '创意': '#ffcc00',
  '其他': '#8e8e93',
};

interface QuickLookProps {
  prompt: Prompt | null;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
}

export function QuickLook({ prompt, onClose, onEdit, onDelete }: QuickLookProps) {
  // 监听空格和 ESC 键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (prompt) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [prompt, handleKeyDown]);

  if (!prompt) return null;

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center quicklook-backdrop bg-black/50"
      onClick={onClose}
    >
      <div
        className="finder-window w-[600px] max-h-[80vh] overflow-hidden animate-quicklook-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 - macOS 风格 */}
        <div className="finder-toolbar h-11 flex items-center px-4 relative">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 mr-2 group relative flex items-center justify-center"
          >
            <X size={8} className="text-[#990000] opacity-0 group-hover:opacity-100" strokeWidth={3} />
          </button>

          {/* 标题 */}
          <div className="absolute left-1/2 -translate-x-1/2 font-medium text-gray-700 text-sm">
            {prompt.title}
          </div>

          {/* 操作按钮 */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onEdit(prompt)}
              className="p-1.5 rounded hover:bg-black/5 text-gray-500 hover:text-[#007aff] transition-colors"
              title="编辑"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(prompt)}
              className="p-1.5 rounded hover:bg-black/5 text-gray-500 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[calc(80vh-44px)] bg-white">
          {/* 图片预览 */}
          {prompt.imageUrl && (
            <div className="bg-[#1d1d1f] flex items-center justify-center p-6">
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="max-h-48 object-contain rounded shadow-lg"
              />
            </div>
          )}

          {/* 详细信息 */}
          <div className="p-5 space-y-4">
            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
                <Circle
                  size={10}
                  fill={CATEGORY_COLORS[prompt.category] || '#8e8e93'}
                  stroke="none"
                />
                {prompt.category}
              </span>
              {prompt.sites.map(site => (
                <span
                  key={site}
                  className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {site === '*' ? '全部站点' : site}
                </span>
              ))}
            </div>

            {/* 内容 */}
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                提示词内容
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto border border-gray-100">
                {prompt.content}
              </div>
            </div>

            {/* 底部信息 */}
            <div className="flex justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
              <span>作者: {prompt.author || '匿名'}</span>
              <span>创建于 {formatDate(prompt.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
