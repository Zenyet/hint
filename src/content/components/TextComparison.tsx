interface TextComparisonProps {
  originalText: string;
  optimizedText: string;
}

/**
 * TextComparison - Apple-inspired before/after comparison view
 * Features:
 * - Side-by-side or stacked layout
 * - Clear visual distinction between original and optimized
 * - Consistent with Apple design principles
 * - Smooth scrolling for long texts
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
        <div className="
          max-h-24
          overflow-y-auto
          px-4 py-2.5
          bg-gray-100/80 dark:bg-gray-800/60
          backdrop-blur-sm
          rounded-xl
          text-sm
          text-gray-600 dark:text-gray-400
          border border-gray-200/50 dark:border-gray-700/50
          leading-relaxed
        ">
          {originalText || <span className="text-gray-400 dark:text-gray-500 italic">无内容</span>}
        </div>
      </div>

      {/* Divider with arrow */}
      <div className="flex items-center justify-center py-1">
        <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>

      {/* After - Optimized Text */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 dark:bg-green-500"></div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            优化后
          </span>
        </div>
        <div className="
          max-h-24
          overflow-y-auto
          px-4 py-2.5
          bg-blue-50/80 dark:bg-blue-900/20
          backdrop-blur-sm
          rounded-xl
          text-sm
          text-gray-800 dark:text-gray-200
          border border-blue-200/50 dark:border-blue-800/50
          leading-relaxed
        ">
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
  );
}
