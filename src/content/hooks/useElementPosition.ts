import { useState, useEffect } from 'react';
import { Position } from '../types';

/**
 * Custom hook to track the position of a target element
 * @param targetElement - The HTML element to track
 * @returns The current position of the element
 */
export function useElementPosition(targetElement: HTMLElement): Position {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY - 15
      });
    };

    // Initial position update
    updatePosition();

    // Observe element size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetElement);

    // Listen to window resize events
    window.addEventListener('resize', updatePosition);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetElement]);

  return position;
}
