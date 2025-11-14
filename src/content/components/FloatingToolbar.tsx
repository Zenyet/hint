import { ReactNode } from 'react';
import { Position } from '../types';

interface FloatingToolbarProps {
  position: Position;
  children: ReactNode;
}

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
      }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}
