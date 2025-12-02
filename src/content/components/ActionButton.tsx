import { ButtonState } from '../types';

interface ActionButtonProps {
  buttonState: ButtonState;
  isLoading: boolean;
  disabled?: boolean;  // 禁用状态（例如：内容为空）
  onClick: () => void;
  extensionMode?: 'optimize' | 'prompt-library';  // 扩展模式
}

/**
 * ActionButton - Apple Liquid Glass design
 * Based on: https://developer.apple.com/design/human-interface-guidelines/materials
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Adaptive blur and saturation
 * - iOS 17+ design language
 * - Disabled state with glass material (when content is empty)
 */
export function ActionButton({ buttonState, isLoading, disabled = false, onClick, extensionMode = 'optimize' }: ActionButtonProps) {
  const getButtonIcon = () => {
    if (isLoading) return (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    );
    if (buttonState === 'replace') return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
    );
    // In prompt-library mode and idle state, show banana icon
    if (extensionMode === 'prompt-library' && buttonState === 'idle') {
      return <span className="text-base leading-none">🍌</span>;
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    );
  };

  const getButtonTitle = () => {
    if (buttonState === 'idle') {
      return extensionMode === 'prompt-library' ? '选择提示词' : '优化文本';
    }
    return '替换文本';
  };

  const getButtonStyles = () => {
    // Disabled state - gray glass material
    if (disabled) {
      return `
        backdrop-blur-2xl
        bg-gray-200/30 dark:bg-gray-700/30
        text-gray-400 dark:text-gray-500

        shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.05)]

        ring-1 ring-inset ring-gray-300/30 dark:ring-gray-600/30
      `;
    }

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

    // Liquid Glass style for replace state (green)
    if (buttonState === 'replace') {
      return `
        backdrop-blur-2xl
        bg-green-500/90 dark:bg-green-600/90
        text-white
        hover:bg-green-600/90 dark:hover:bg-green-700/90

        shadow-[0_8px_32px_rgba(34,197,94,0.25),0_1px_2px_rgba(0,0,0,0.1)]
        hover:shadow-[0_12px_48px_rgba(34,197,94,0.3),0_2px_4px_rgba(0,0,0,0.15)]

        ring-1 ring-inset ring-white/30 dark:ring-white/20
        hover:ring-white/40 dark:hover:ring-white/25
      `;
    }

    // Liquid Glass style for optimize state (blue)
    return `
      backdrop-blur-2xl
      bg-blue-500/90 dark:bg-blue-600/90
      text-white
      hover:bg-blue-600/90 dark:hover:bg-blue-700/90

      shadow-[0_8px_32px_rgba(59,130,246,0.25),0_1px_2px_rgba(0,0,0,0.1)]
      hover:shadow-[0_12px_48px_rgba(59,130,246,0.3),0_2px_4px_rgba(0,0,0,0.15)]

      ring-1 ring-inset ring-white/30 dark:ring-white/20
      hover:ring-white/40 dark:hover:ring-white/25
    `;
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        ${getButtonStyles()}
        rounded-full
        transition-all duration-300 ease-out
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        font-medium
        relative
        overflow-hidden
        flex items-center justify-center
        w-[36px] h-[36px]
      `}
      style={{
        // Liquid glass material properties for all states
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      title={disabled ? '请先输入内容' : getButtonTitle()}>
      {/* Glass edge highlight - top/left lighter edge */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none opacity-60"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
        }}
      />

      {/* Icon content */}
      <div className="relative z-10">
        {getButtonIcon()}
      </div>
    </button>
  );
}
