import { ReactNode } from 'react';
import { Position } from '../types';

interface FloatingToolbarProps {
  position: Position;
  children: ReactNode;
}

/**
 * FloatingToolbar - Liquid Glass container
 * Features:
 * - True glass material with edge highlights
 * - Multi-layer depth effect
 * - Enhanced blur and vibrancy
 * - Adaptive shadows
 */
export function FloatingToolbar({ position, children }: FloatingToolbarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateY(-100%)',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      className="animate-fadeIn">
      {/* Liquid Glass card with edge highlights */}
      <div
        className="
          backdrop-blur-2xl
          bg-white/25 dark:bg-gray-900/80
          rounded-2xl
          p-2.5
          relative
          overflow-hidden

          ring-1 ring-inset ring-white/40 dark:ring-white/20

          shadow-[0_8px_32px_rgba(31,38,135,0.15),0_2px_8px_rgba(0,0,0,0.1)]
        "
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}>
        {/* Glass edge highlight gradient */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Inner glow for depth */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.05)',
          }}
        />

        {/* Content */}
        <div className="flex items-center gap-2.5 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
