interface CloseButtonProps {
  onClick: () => void;
}

/**
 * CloseButton - Apple-inspired close button
 * Features:
 * - Clean X icon design
 * - Subtle hover effect
 * - Smooth animations
 * - Consistent size with ActionButton
 */
export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        p-2.5 rounded-xl
        text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-800
        hover:text-gray-700 dark:hover:text-gray-200
        transition-all duration-200 ease-out
        active:scale-95
      "
      title="关闭">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  );
}
