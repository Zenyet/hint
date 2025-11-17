interface OptimizedTextPreviewProps {
  text: string;
}

/**
 * OptimizedTextPreview - Apple-inspired text preview card
 * Features:
 * - Soft background with subtle borders
 * - Smooth scroll behavior
 * - Better typography
 * - Loading state when text is empty
 */
export function OptimizedTextPreview({ text }: OptimizedTextPreviewProps) {
  return (
    <div className="
      max-w-md max-h-32
      overflow-y-auto
      px-4 py-3
      bg-gray-50/80 dark:bg-gray-800/80
      backdrop-blur-sm
      rounded-xl
      text-sm
      text-gray-800 dark:text-gray-200
      border border-gray-200/50 dark:border-gray-700/50
      leading-relaxed
      animate-slideIn
    ">
      {text || (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span>正在优化文本...</span>
        </div>
      )}
    </div>
  );
}
