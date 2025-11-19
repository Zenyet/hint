interface TextComparisonProps {
  originalText: string;
  optimizedText: string;
}

/**
 * TextComparison - Liquid Glass before/after comparison view
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Enhanced blur and vibrancy
 * - Clear visual distinction between original and optimized
 */
export function TextComparison({ originalText, optimizedText }: TextComparisonProps) {
  return (
    <div className="max-w-2xl space-y-2 animate-slideIn">
      {/* Before - Original Text */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500"></div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            优化前
          </span>
        </div>

        {/* Glass container (fixed decorations) */}
        <div
          className="
            backdrop-blur-2xl
            bg-red-50/25 dark:bg-red-900/15
            rounded-xl
            ring-1 ring-inset ring-red-200/40 dark:ring-red-800/30
            relative
            overflow-hidden
          "
          style={{
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
          }}>
          {/* Glass edge highlight gradient - FIXED (doesn't scroll) */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Inner glow for depth - FIXED (doesn't scroll) */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-50"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
            }}
          />

          {/* Scrollable content container */}
          <div
            className="
              max-h-24
              overflow-y-auto
              px-4 py-2.5
              text-sm
              text-gray-700 dark:text-gray-300
              leading-relaxed
              relative z-10
              scrollbar-glass-red
            "
            style={{
              /* Firefox scrollbar */
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(239, 68, 68, 0.3) transparent',
            }}>
            {originalText || <span className="text-gray-400 dark:text-gray-500 italic">无内容</span>}
          </div>
        </div>
      </div>

      {/* Divider with arrow - Liquid Glass style */}
      <div className="flex items-center justify-center py-1">
        <div
          className="
            p-1.5
            backdrop-blur-xl
            bg-white/20 dark:bg-white/10
            rounded-full
            ring-1 ring-inset ring-white/30 dark:ring-white/20
          "
          style={{
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          }}>
          <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>

      {/* After - Optimized Text */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500"></div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            优化后
          </span>
        </div>

        {/* Glass container (fixed decorations) */}
        <div
          className="
            backdrop-blur-2xl
            bg-green-50/25 dark:bg-green-900/15
            rounded-xl
            ring-1 ring-inset ring-green-200/40 dark:ring-green-800/30
            relative
            overflow-hidden
          "
          style={{
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
          }}>
          {/* Glass edge highlight gradient - FIXED (doesn't scroll) */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Inner glow for depth - FIXED (doesn't scroll) */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-50"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
            }}
          />

          {/* Scrollable content container */}
          <div
            className="
              max-h-24
              overflow-y-auto
              px-4 py-2.5
              text-sm
              text-gray-800 dark:text-gray-200
              leading-relaxed
              relative z-10
              scrollbar-glass-green
            "
            style={{
              /* Firefox scrollbar */
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent',
            }}>
            {optimizedText || (
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>正在优化文本...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
