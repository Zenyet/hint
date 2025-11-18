interface ErrorMessageProps {
  message: string;
}

/**
 * ErrorMessage - Liquid Glass error message card
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Enhanced blur and vibrancy
 * - Clear visual hierarchy with alert icon
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="
        max-w-md
        px-4 py-3
        backdrop-blur-2xl
        bg-red-50/25 dark:bg-red-900/20
        rounded-xl
        text-sm
        text-red-700 dark:text-red-400
        ring-1 ring-inset ring-red-200/40 dark:ring-red-800/30
        flex items-start gap-2
        animate-slideIn
        relative
        overflow-hidden
      "
      style={{
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
      }}>
      {/* Glass edge highlight gradient */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Inner glow for depth */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-50"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
        }}
      />

      {/* Content */}
      <div className="flex items-start gap-2 relative z-10">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        <span className="leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
