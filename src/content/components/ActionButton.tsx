import { ButtonState } from '../types';

interface ActionButtonProps {
  buttonState: ButtonState;
  isLoading: boolean;
  onClick: () => void;
}

/**
 * ActionButton - Apple Liquid Glass design
 * Based on: https://developer.apple.com/design/human-interface-guidelines/materials
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Adaptive blur and saturation
 * - iOS 17+ design language
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
    // Liquid Glass style for idle state
    if (buttonState === 'idle') {
      return `
        backdrop-blur-2xl
        bg-white/25 dark:bg-white/15
        text-blue-600 dark:text-blue-400
        hover:bg-white/35 dark:hover:bg-white/20

        shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
        hover:shadow-[0_12px_48px_rgba(31,38,135,0.2),0_2px_4px_rgba(0,0,0,0.15)]

        ring-1 ring-inset ring-white/40 dark:ring-white/20
        hover:ring-white/50 dark:hover:ring-white/25
      `;
    }

    // Solid style for active states
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
        p-2.5 rounded-full
        transition-all duration-300 ease-out
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-md hover:shadow-lg
        font-medium
        relative
        overflow-hidden
      `}
      style={{
        // Liquid glass material properties
        ...(buttonState === 'idle' && {
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        })
      }}
      title={getButtonTitle()}>
      {/* Glass edge highlight - top/left lighter edge */}
      {buttonState === 'idle' && (
        <>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
              mixBlendMode: 'overlay',
            }}
          />
          {/* Subtle inner glow */}
          <div
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
            }}
          />
        </>
      )}

      {/* Icon content */}
      <div className="relative z-10">
        {getButtonIcon()}
      </div>
    </button>
  );
}
