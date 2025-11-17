import { ButtonState } from '../types';

interface ActionButtonProps {
  buttonState: ButtonState;
  isLoading: boolean;
  onClick: () => void;
}

/**
 * ActionButton - Apple-inspired primary action button
 * Features:
 * - SF Symbols-style icons
 * - Smooth press animation
 * - Elegant hover effects
 * - Clear visual feedback
 */
export function ActionButton({ buttonState, isLoading, onClick }: ActionButtonProps) {
  const getButtonIcon = () => {
    if (isLoading) return (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    );
    if (buttonState === 'replace') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
      </svg>
    );
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    );
  };

  const getButtonTitle = () => {
    return buttonState === 'idle' ? '优化文本' : '替换文本';
  };

  const getButtonStyles = () => {
    if (buttonState === 'replace') {
      return 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-700';
    }
    return 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700';
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${getButtonStyles()}
        p-2.5 rounded-xl
        transition-all duration-200 ease-out
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
        font-medium
      `}
      title={getButtonTitle()}>
      {getButtonIcon()}
    </button>
  );
}
