import type { Prompt } from '../types';

interface PromptCardProps {
  prompt: Prompt;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
}

export function PromptCard({ prompt, isSelected, onSelect, onDoubleClick }: PromptCardProps) {
  // 生成默认图片的渐变背景
  const getGradientBg = (title: string) => {
    const colors = [
      'from-blue-400 to-indigo-500',
      'from-purple-400 to-pink-500',
      'from-green-400 to-cyan-500',
      'from-orange-400 to-red-500',
      'from-teal-400 to-blue-500',
      'from-rose-400 to-purple-500',
    ];
    const index = title.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`finder-item flex flex-col items-center justify-between p-2 cursor-pointer ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      {/* 图片区域 - 白边相框效果 */}
      <div className='flex-1 flex items-center justify-center'>
        <div className="photo-frame w-[100px] mb-2">
          {prompt.imageUrl ? (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full object-cover"
              draggable={false}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getGradientBg(prompt.title)} flex items-center justify-center`}
            >
              <span className="text-3xl text-white/90 font-semibold">
                {prompt.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 文件名 */}
      <div className="text-center max-w-[110px]">
        <span
          className={`item-name text-xs leading-tight inline-block ${isSelected ? '' : 'text-gray-800'}`}
          style={{ wordBreak: 'break-all' }}
        >
          {prompt.title.length > 20 ? prompt.title.substring(0, 17) + '...' : prompt.title}
        </span>
      </div>
    </div>
  );
}

interface IconGridProps {
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPreview: (prompt: Prompt) => void;
  loading?: boolean;
}

export function IconGrid({ prompts, selectedId, onSelect, onPreview, loading }: IconGridProps) {
  // 点击空白区域取消选中
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#007aff] border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-30">📭</div>
          <p className="text-gray-400">暂无提示词</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto bg-white p-4"
      onClick={handleBackgroundClick}
    >
      <div
        className="flex flex-wrap content-start gap-2"
        onClick={handleBackgroundClick}
      >
        {prompts.map(prompt => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            isSelected={selectedId === prompt.id}
            onSelect={() => onSelect(prompt.id)}
            onDoubleClick={() => onPreview(prompt)}
          />
        ))}
      </div>
    </div>
  );
}
