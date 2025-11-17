import { ReactNode } from 'react';
import { Position } from '../types';

interface FloatingToolbarProps {
  position: Position;
  children: ReactNode;
}

/**
 * FloatingToolbar - Apple-inspired floating UI component
 * Features:
 * - Frosted glass effect (backdrop blur)
 * - Smooth shadows and larger corner radius
 * - Elegant spacing and transitions
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
        pointerEvents: 'auto'
      }}
      className="animate-fadeIn">
      {/* Apple-style frosted glass card */}
      <div
        className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-2.5"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
        <div className="flex items-center gap-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}
