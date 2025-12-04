import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '../types';

// 配置常量
const MAX_PARENT_DEPTH = 5; // 祖先观察深度
const SCROLL_DEBOUNCE_MS = 16; // 滚动防抖时间 (~60fps)

/**
 * Custom hook to track the position of a target element
 *
 * Performance optimizations:
 * - requestAnimationFrame throttling (max 60fps)
 * - Only updates state when position actually changes
 * - Passive event listeners for scroll/resize
 * - Limited ancestor observation depth
 * - Debounced scroll handling
 * - Low-frequency polling as fallback for edge cases
 *
 * @param targetElement - The HTML element to track
 * @returns The current position of the element
 */
export function useElementPosition(targetElement: HTMLElement): Position {
  const [position, setPosition] = useState<Position>({ left: 0, top: 0 });
  const rafIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Position>({ left: 0, top: 0 });
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 核心位置计算（同步执行，用于 RAF 回调内部）
  const calculateAndUpdatePosition = useCallback(() => {
    const rect = targetElement.getBoundingClientRect();
    const newLeft = rect.left + window.scrollX;
    const newTop = rect.top + window.scrollY - 15;

    // Only update state if position actually changed
    if (
      newLeft !== lastPositionRef.current.left ||
      newTop !== lastPositionRef.current.top
    ) {
      const newPosition = { left: newLeft, top: newTop };
      lastPositionRef.current = newPosition;
      setPosition(newPosition);
    }
  }, [targetElement]);

  // RAF 节流的位置更新
  const updatePosition = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      calculateAndUpdatePosition();
      rafIdRef.current = null;
    });
  }, [calculateAndUpdatePosition]);

  // 滚动事件专用处理（带防抖）
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      return; // 防抖期间忽略
    }

    updatePosition();

    scrollTimeoutRef.current = setTimeout(() => {
      scrollTimeoutRef.current = null;
      updatePosition(); // 防抖结束后再更新一次确保最终位置正确
    }, SCROLL_DEBOUNCE_MS);
  }, [updatePosition]);

  useEffect(() => {
    // Initial position update
    updatePosition();

    // 1. 收集需要观察的祖先元素（增加深度）
    const ancestors: HTMLElement[] = [];
    let parent = targetElement.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < MAX_PARENT_DEPTH) {
      ancestors.push(parent);
      parent = parent.parentElement;
      depth++;
    }

    // 2. ResizeObserver: 观察目标元素和有限的祖先
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetElement);
    ancestors.forEach(el => resizeObserver.observe(el));

    // 3. MutationObserver: 观察目标元素自身和祖先链
    const mutationObserver = new MutationObserver(updatePosition);
    // 观察目标元素自身的子元素变化
    mutationObserver.observe(targetElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    // 观察祖先元素
    ancestors.forEach(el => {
      mutationObserver.observe(el, {
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'open'],
      });
    });

    // 4. 轻量级 body 监听（只监听直接子元素变化）
    const bodyObserver = new MutationObserver(updatePosition);
    bodyObserver.observe(document.body, {
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // 5. Window resize
    window.addEventListener('resize', updatePosition, { passive: true });

    // 6. Scroll events（使用防抖处理）
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // 7. Input events
    targetElement.addEventListener('input', updatePosition, { passive: true });

    // 8. 动画事件
    const handleAnimationEvent = () => updatePosition();
    targetElement.addEventListener('transitionend', handleAnimationEvent);
    targetElement.addEventListener('animationend', handleAnimationEvent);
    ancestors.forEach(el => {
      el.addEventListener('transitionend', handleAnimationEvent);
      el.addEventListener('animationend', handleAnimationEvent);
    });


    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }

      resizeObserver.disconnect();
      mutationObserver.disconnect();
      bodyObserver.disconnect();

      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', handleScroll, { capture: true } as EventListenerOptions);

      targetElement.removeEventListener('input', updatePosition);
      targetElement.removeEventListener('transitionend', handleAnimationEvent);
      targetElement.removeEventListener('animationend', handleAnimationEvent);

      ancestors.forEach(el => {
        el.removeEventListener('transitionend', handleAnimationEvent);
        el.removeEventListener('animationend', handleAnimationEvent);
      });
    };
  }, [targetElement, updatePosition, handleScroll, calculateAndUpdatePosition]);

  return position;
}
