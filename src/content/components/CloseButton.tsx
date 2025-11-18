interface CloseButtonProps {
  onClick: () => void;
}

/**
 * CloseButton - Liquid Glass close button
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Smooth animations and hover states
 * - Consistent size with ActionButton (p-2.5 rounded-xl)
 */
export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        p-2.5 rounded-full
        backdrop-blur-2xl
        bg-red-500/80 dark:bg-red-600/80
        text-white
        hover:bg-red-600/90 dark:hover:bg-red-700/90

        shadow-[0_4px_16px_rgba(239,68,68,0.3),0_1px_2px_rgba(0,0,0,0.1)]
        hover:shadow-[0_6px_24px_rgba(239,68,68,0.4),0_2px_4px_rgba(0,0,0,0.15)]

        ring-1 ring-inset ring-white/30 dark:ring-white/20
        hover:ring-white/40 dark:hover:ring-white/25

        transition-all duration-200 ease-out
        active:scale-95

        relative
        overflow-hidden
      "
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      title="关闭">
      {/* Glass edge highlight gradient */}
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
    </button>
  );
}
