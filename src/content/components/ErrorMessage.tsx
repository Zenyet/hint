interface ErrorMessageProps {
  message: string;
}

/**
 * ErrorMessage - Apple-inspired error message card
 * Features:
 * - Gentle red color scheme
 * - Alert icon
 * - Clear visual hierarchy
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="
      max-w-md
      px-4 py-3
      bg-red-50/90 dark:bg-red-900/20
      backdrop-blur-sm
      rounded-xl
      text-sm
      text-red-700 dark:text-red-400
      border border-red-200/50 dark:border-red-800/50
      flex items-start gap-2
      animate-slideIn
    ">
      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
