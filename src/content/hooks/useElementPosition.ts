import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '../types';

/**
 * Custom hook to track the position of a target element
 * Monitors: resize, scroll, DOM mutations, and content changes
 *
 * Performance optimizations:
 * - requestAnimationFrame throttling (max 60fps)
 * - Only updates state when position actually changes
 * - Passive event listeners for scroll/resize
 * - Cached position comparison to avoid unnecessary renders
 * - Reduced MutationObserver scope
 *
 * @param targetElement - The HTML element to track
 * @returns The current position of the element
 */
export function useElementPosition(targetElement: HTMLElement): Position {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
  const rafIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Position>({ left: 0, top: 0 });

  // Memoized update function to avoid recreating on each render
  const updatePosition = useCallback(() => {
    // Cancel any pending update (coalesce multiple triggers into one)
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Schedule update on next animation frame (throttling to ~60fps)
    rafIdRef.current = requestAnimationFrame(() => {
      const rect = targetElement.getBoundingClientRect();
      const newLeft = rect.left + window.scrollX;
      const newTop = rect.top + window.scrollY - 15;

      // Only update state if position actually changed (avoid unnecessary re-renders)
      if (
        newLeft !== lastPositionRef.current.left ||
        newTop !== lastPositionRef.current.top
      ) {
        const newPosition = { left: newLeft, top: newTop };
        lastPositionRef.current = newPosition;
        setPosition(newPosition);
      }

      rafIdRef.current = null;
    });
  }, [targetElement]);

  useEffect(() => {
    // Initial position update
    updatePosition();

    // 1. Observe element size changes (handles height changes from content)
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetElement);

    // 2. Observe DOM mutations (handles dynamic content changes)
    // Optimized: reduced scope, removed subtree for better performance
    const mutationObserver = new MutationObserver(updatePosition);
    mutationObserver.observe(targetElement, {
      childList: true,        // Watch for direct child node changes
      characterData: true,    // Watch for text content changes
      attributes: true,       // Watch for attribute changes
      attributeFilter: ['style', 'class'], // Only relevant attributes
      // Note: subtree removed - ResizeObserver handles descendant size changes
    });

    // 3. Listen to window resize events (passive for better scroll performance)
    window.addEventListener('resize', updatePosition, { passive: true });

    // 4. Listen to scroll events (single listener with capture phase)
    // Using capture phase to catch scroll events from any scrollable ancestor
    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });

    // 5. Listen to input events for contenteditable/textarea changes
    targetElement.addEventListener('input', updatePosition, { passive: true });

    // Cleanup
    return () => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, { capture: true } as EventListenerOptions);
      targetElement.removeEventListener('input', updatePosition);
    };
  }, [targetElement, updatePosition]);

  return position;
}
