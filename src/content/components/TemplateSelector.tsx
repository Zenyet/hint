import { useState, useRef } from 'react';
import { builtinTemplates, type PromptTemplate } from '../../shared/templates';
import { nanoBananaPrompts, type NanoBananaPrompt } from '../../shared/nanobanana-prompts';

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onSelect: (template: PromptTemplate | NanoBananaPrompt) => void;
  disabled?: boolean;
}

type TemplateMode = 'optimize' | 'preset';

export function TemplateSelector({ selectedTemplateId, onSelect, disabled }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templateMode, setTemplateMode] = useState<TemplateMode>('optimize');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 优化提示词：只使用智能优化模板
  const optimizeTemplate = builtinTemplates.find(t => t.id === 'optimize') || builtinTemplates[0];

  // 获取当前选中的模板
  const getSelectedTemplate = () => {
    if (templateMode === 'optimize') {
      return optimizeTemplate;
    } else {
      return nanoBananaPrompts.find(p => p.id === selectedTemplateId) || nanoBananaPrompts[0];
    }
  };

  const selectedTemplate = getSelectedTemplate();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (template: PromptTemplate | NanoBananaPrompt) => {
    onSelect(template);
    setIsOpen(false);
  };

  const handleModeChange = (mode: TemplateMode) => {
    setTemplateMode(mode);
    // 切换模式时自动选择对应的默认模板
    if (mode === 'optimize') {
      onSelect(optimizeTemplate);
    } else {
      onSelect(nanoBananaPrompts[0]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Liquid Glass Style */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2
          backdrop-blur-2xl
          bg-white/25 dark:bg-white/15
          hover:bg-white/35 dark:hover:bg-white/20
          active:scale-[0.98]
          ring-1 ring-inset ring-white/40 dark:ring-white/20
          hover:ring-white/50 dark:hover:ring-white/25
          rounded-full
          text-gray-700 dark:text-gray-200
          transition-all duration-300 ease-out
          text-sm font-medium
          overflow-hidden
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
          hover:shadow-[0_12px_48px_rgba(31,38,135,0.2),0_2px_4px_rgba(0,0,0,0.15)]
        `}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Glass edge highlight - top/left lighter edge */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-60"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
          }}
        />

        <span className="relative z-10 truncate max-w-[80px]">{selectedTemplate.name}</span>
        <svg
          className={`w-4 h-4 relative z-10 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Liquid Glass Style with better readability */}
      {isOpen && (
        <div
          className={`
            absolute bottom-full left-0 mb-2
            min-w-[320px] max-h-[360px]
            backdrop-blur-2xl
            bg-white/85 dark:bg-gray-900/90
            ring-1 ring-inset ring-white/40 dark:ring-white/20
            rounded-2xl
            shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
            overflow-hidden
            z-50
            animate-fadeIn
          `}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {/* Glass edge highlight */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
            }}
          />

          {/* Mode Selection Tabs */}
          <div className="relative flex border-b border-white/20 dark:border-white/10 p-1.5 z-10">
            <button
              onClick={() => handleModeChange('optimize')}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${templateMode === 'optimize'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-white/10 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/5'
                }
              `}
            >
              ⚡ 优化提示词
            </button>
            <button
              onClick={() => handleModeChange('preset')}
              className={`
                flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${templateMode === 'preset'
                  ? 'text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-white/10 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/5'
                }
              `}
            >
              🍌 预设提示词
            </button>
          </div>

          {/* Template List */}
          <div className="relative max-h-[280px] overflow-y-auto p-2 space-y-1 scrollbar-glass z-10">
            {templateMode === 'optimize' ? (
              // 优化提示词模式：显示说明
              <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <div className="mb-2">⚡</div>
                <p className="font-medium mb-1">智能优化</p>
                <p className="text-xs leading-relaxed">
                  使用 AI 优化您的提示词，<br/>
                  让它更清晰、专业、易于理解
                </p>
              </div>
            ) : (
              // 预设提示词模式：显示 NanoBanana 提示词列表
              nanoBananaPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelect(prompt)}
                  className={`
                    w-full flex items-start gap-3 px-3 py-2.5
                    rounded-xl text-left
                    transition-all duration-200
                    overflow-hidden relative
                    ${selectedTemplateId === prompt.id
                      ? 'bg-blue-500/20 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-white/30 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
                    }
                  `}
                >
                  {/* Glass effect for selected item */}
                  {selectedTemplateId === prompt.id && (
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
                        mixBlendMode: 'overlay',
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{prompt.icon}</span>
                      <span className="text-sm font-semibold truncate">{prompt.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {prompt.description}
                    </div>
                  </div>

                  {selectedTemplateId === prompt.id && (
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
