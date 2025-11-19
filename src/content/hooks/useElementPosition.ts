import { useState, useEffect, useRef } from 'react';
import { Position } from '../types';

/**
 * Custom hook to track the position of a target element
 * Monitors: resize, scroll, DOM mutations, and content changes
 * Uses requestAnimationFrame for performance optimization
 * @param targetElement - The HTML element to track
 * @returns The current position of the element
 */
export function useElementPosition(targetElement: HTMLElement): Position {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      // Cancel any pending update
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Schedule update on next animation frame (throttling)
      rafIdRef.current = requestAnimationFrame(() => {
        const rect = targetElement.getBoundingClientRect();
        setPosition({
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY - 15
        });
        rafIdRef.current = null;
      });
    };

    // Initial position update
    updatePosition();

    // 1. Observe element size changes (handles height changes from content)
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetElement);

    // 2. Observe DOM mutations (handles dynamic content changes)
    const mutationObserver = new MutationObserver(updatePosition);
    mutationObserver.observe(targetElement, {
      childList: true,        // Watch for child node additions/removals
      subtree: true,          // Watch all descendants
      characterData: true,    // Watch for text content changes
      attributes: true,       // Watch for attribute changes (style, class, etc.)
      attributeFilter: ['style', 'class'] // Only watch relevant attributes
    });

    // 3. Listen to window resize events
    window.addEventListener('resize', updatePosition);

    // 4. Listen to scroll events (both window and document)
    window.addEventListener('scroll', updatePosition, true); // Use capture phase
    document.addEventListener('scroll', updatePosition, true);

    // 5. Listen to input events as fallback for contenteditable changes
    targetElement.addEventListener('input', updatePosition);

    // Cleanup
    return () => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('scroll', updatePosition, true);
      targetElement.removeEventListener('input', updatePosition);
    };
  }, [targetElement]);

  return position;
}
