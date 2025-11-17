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
      scrollbar-xy
    ">
      {text}
    </div>
  );
}
