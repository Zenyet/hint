import { useState, useEffect, useCallback, useRef } from 'react';
import { siteConfigs, getSitePrompts, detectSiteFromUrl, SitePrompt } from '../../shared/site-prompts';
import { fetchRemotePrompts, RemotePrompt, convertToTemplateFormat } from '../../shared/remotePrompts';

// Extended SitePrompt with optional imageUrl
interface ExtendedSitePrompt extends SitePrompt {
  imageUrl?: string;
}

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
 * - Fetches prompts from remote API with local fallback
 * - Image preview on hover
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

  const [prompts, setPrompts] = useState<ExtendedSitePrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('above');
  const [hoveredPrompt, setHoveredPrompt] = useState<ExtendedSitePrompt | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);

  // 只在组件挂载时计算一次位置
  useEffect(() => {
    const dropdown = mainDropdownRef.current;
    if (!dropdown) return;

    parentRef.current = dropdown.parentElement;
    const parent = parentRef.current;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const dropdownHeight = 400;
    const viewportHeight = window.innerHeight;

    const spaceAbove = parentRect.top;
    const spaceBelow = viewportHeight - parentRect.bottom;

    if (spaceAbove < dropdownHeight && spaceBelow > spaceAbove) {
      setDropdownPosition('below');
    } else {
      setDropdownPosition('above');
    }
  }, []);

  // Fetch prompts from remote API, fallback to local
  const loadPrompts = useCallback(async (site: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const remoteData = await fetchRemotePrompts(site);

      if (remoteData.prompts && remoteData.prompts.length > 0) {
        const remotePrompts: ExtendedSitePrompt[] = remoteData.prompts.map((p: RemotePrompt) => {
          const converted = convertToTemplateFormat(p);
          return {
            id: converted.id,
            name: converted.name,
            icon: converted.icon,
            description: converted.description,
            prompt: converted.prompt,
            imageUrl: converted.imageUrl
          };
        });
        setPrompts(remotePrompts);
      } else {
        setPrompts(getSitePrompts(site));
      }
    } catch (err) {
      console.error('[PromptLibrary] Failed to fetch remote prompts:', err);
      setError('加载远程提示词失败，使用本地数据');
      setPrompts(getSitePrompts(site));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts(selectedSite);
  }, [selectedSite, loadPrompts]);

  // Handle hover on prompt item
  const handleMouseEnter = (prompt: ExtendedSitePrompt, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!prompt.imageUrl) return;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const dropdownRect = mainDropdownRef.current?.getBoundingClientRect();

    if (dropdownRect) {
      // 计算相对于主 dropdown 的位置
      setPreviewPosition({
        top: buttonRect.top - dropdownRect.top,
        left: 320 + 8 // min-w-[320px] + gap
      });
    }
    setHoveredPrompt(prompt);
  };

  const handleMouseLeave = () => {
    setHoveredPrompt(null);
  };

  return (
    <>
      {/* Main Dropdown */}
      <div
        ref={mainDropdownRef}
        className={`
          absolute left-0
          ${dropdownPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}
          min-w-[320px]
          z-50
          animate-fadeIn
        `}
      >
        {/* Dropdown Content Container */}
        <div
          className="
            max-h-[400px]
            overflow-hidden
            backdrop-blur-2xl
            bg-white/85 dark:bg-gray-900/90
            ring-1 ring-inset ring-white/40 dark:ring-white/20
            rounded-2xl
            shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
          "
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
        {/* Glass edge highlight */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-60 overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
          }}
        />

        {/* Header with site selector */}
        <div className="relative flex items-center justify-between border-b border-gray-200/50 dark:border-white/10 p-4 z-20 bg-white/30 dark:bg-transparent rounded-t-2xl">
          <div className="flex items-center gap-2 flex-1">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="
                flex-1 px-2 py-1.5
                bg-white/70 dark:bg-white/10
                hover:bg-white/90 dark:hover:bg-white/15
                text-sm font-semibold text-gray-900 dark:text-gray-200
                rounded-lg
                border border-gray-300/50 dark:border-transparent
                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400
                transition-all duration-200
                cursor-pointer
                appearance-none
                pr-8
                shadow-sm
              "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              {siteConfigs.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onClose}
            className="
              p-1.5 rounded-lg ml-2
              text-gray-700 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              hover:bg-gray-200/70 dark:hover:bg-white/10
              transition-all duration-200
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative mx-2 mt-2 px-3 py-2 bg-yellow-100/80 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-300 z-10">
            {error}
          </div>
        )}

        {/* Prompt List */}
        <div
          className="relative max-h-[320px] overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-glass z-10"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent',
          }}
        >
          {isLoading ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin mr-2">⏳</div>
              加载中...
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              暂无提示词
            </div>
          ) : (
            prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => onSelect(prompt.prompt)}
                onMouseEnter={(e) => handleMouseEnter(prompt, e)}
                onMouseLeave={handleMouseLeave}
                className="
                  w-full flex items-start gap-3 px-3 py-2.5
                  text-left
                  transition-all duration-200
                  overflow-hidden relative
                  hover:bg-gray-100/80 dark:hover:bg-white/10
                  hover:shadow-sm
                  text-gray-800 dark:text-gray-200
                "
              >
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{prompt.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {prompt.description}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        </div>

        {/* Image Preview Panel - Absolute position relative to main dropdown */}
        {hoveredPrompt?.imageUrl && (
          <div
            className="
              absolute
              w-[280px]
              backdrop-blur-2xl
              bg-white/90 dark:bg-gray-900/90
              ring-1 ring-inset ring-gray-200/50 dark:ring-white/20
              shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
              overflow-hidden
              z-[9999]
              pointer-events-none
              animate-fadeIn
            "
            style={{
              top: previewPosition.top,
              left: previewPosition.left,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            <div className="relative p-2">
              <img
                src={hoveredPrompt.imageUrl}
                alt={hoveredPrompt.name}
                className="w-full h-auto object-cover max-h-[250px]"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
