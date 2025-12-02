import { useState, useEffect } from 'react';
import { siteConfigs, getSitePrompts, detectSiteFromUrl, SitePrompt } from '../../shared/site-prompts';

interface PromptLibraryDropdownProps {
  onSelect: (promptText: string) => void;
  onClose: () => void;
}

/**
 * PromptLibraryDropdown - Displays prompts in a dropdown with site selector
 * Features:
 * - Liquid glass design
 * - Site selector in header
 * - Scrollable prompt list
 * - Click to select and insert prompt
 */
export function PromptLibraryDropdown({ onSelect, onClose }: PromptLibraryDropdownProps) {
  // Auto-detect site based on current URL
  const [selectedSite, setSelectedSite] = useState(() => {
    try {
      return detectSiteFromUrl(window.location.href);
    } catch {
      return 'nanobanana';
    }
  });

  const [prompts, setPrompts] = useState<SitePrompt[]>([]);

  // Update prompts when site changes
  useEffect(() => {
    setPrompts(getSitePrompts(selectedSite));
  }, [selectedSite]);

  const currentSiteConfig = siteConfigs.find(site => site.id === selectedSite);

  return (
    <div
      className="
        absolute bottom-full left-0 mb-2
        min-w-[320px] max-h-[400px]
        backdrop-blur-2xl
        bg-white/85 dark:bg-gray-900/90
        ring-1 ring-inset ring-white/40 dark:ring-white/20
        rounded-2xl
        shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
        overflow-hidden
        z-50
        animate-fadeIn
      "
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

      {/* Header with site selector */}
      <div className="relative flex items-center justify-between border-b border-white/20 dark:border-white/10 p-4 z-10">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{currentSiteConfig?.icon || '🍌'}</span>
          {/* Site Selector */}
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="
              flex-1 px-2 py-1.5
              bg-white/30 dark:bg-white/10
              hover:bg-white/40 dark:hover:bg-white/15
              text-sm font-semibold text-gray-800 dark:text-gray-200
              rounded-lg
              border-none
              ring-1 ring-inset ring-white/30 dark:ring-white/20
              focus:ring-2 focus:ring-blue-500/50
              transition-all duration-200
              cursor-pointer
              appearance-none
              pr-8
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1rem',
            }}
          >
            {siteConfigs.map((site) => (
              <option key={site.id} value={site.id}>
                {site.icon} {site.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onClose}
          className="
            p-1.5 rounded-lg ml-2
            text-gray-600 dark:text-gray-400
            hover:text-gray-900 dark:hover:text-white
            hover:bg-white/30 dark:hover:bg-white/10
            transition-all duration-200
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Prompt List */}
      <div
        className="relative max-h-[320px] overflow-y-auto p-2 space-y-1 scrollbar-glass z-10"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent',
        }}
      >
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            暂无提示词
          </div>
        ) : (
          prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => onSelect(prompt.prompt)}
              className="
                w-full flex items-start gap-3 px-3 py-2.5
                rounded-xl text-left
                transition-all duration-200
                overflow-hidden relative
                hover:bg-white/30 dark:hover:bg-white/10
                text-gray-700 dark:text-gray-200
              "
            >
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{prompt.icon}</span>
                  <span className="text-sm font-semibold truncate">{prompt.name}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {prompt.description}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="relative border-t border-white/20 dark:border-white/10 p-3 z-10">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 点击任意提示词即可插入到输入框
        </p>
      </div>
    </div>
  );
}
