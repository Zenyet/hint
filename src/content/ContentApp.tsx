import { useState, useEffect } from 'react';
import { useElementPosition, useTextOptimization } from './hooks';
import {
  FloatingToolbar,
  TextComparison,
  ErrorMessage,
  ActionButton,
  CloseButton
} from './components';

interface ContentAppProps {
  targetElement: HTMLElement | HTMLTextAreaElement;        // 用于获取/设置文本内容
  positioningElement: HTMLElement;   // 用于定位按钮位置
}

/**
 * Main content script component that provides text optimization UI
 * Displays a floating toolbar above the target editable element
 * Shows before/after comparison during optimization
 *
 * Design: Progressive disclosure - starts minimal, expands when needed
 *
 * Positioning Strategy:
 * - targetElement: The actual contenteditable/textarea for text operations
 * - positioningElement: A stable parent container for button positioning
 *   (avoids position issues when content height changes or scrolls)
 */
export default function ContentApp({ targetElement, positioningElement }: ContentAppProps) {
  // Track the position of the positioning container (stable reference)
  const position = useElementPosition(positioningElement);

  // Track if content is empty (for disabling button)
  const [isEmpty, setIsEmpty] = useState(() => {
    const text = (targetElement.textContent || '').trim();
    return text.length === 0;
  });

  // Manage text optimization state and handlers
  const {
    buttonState,
    originalText,
    optimizedText,
    isLoading,
    errorMessage,
    handleOptimize,
    handleReplace,
    handleClose
  } = useTextOptimization(targetElement);

  // Monitor content changes to update isEmpty state
  useEffect(() => {
    const checkEmpty = () => {
      const text = (
        'value' in targetElement
          ? targetElement.value
          : targetElement.textContent || ''
      ).trim();
      setIsEmpty(text.length === 0);
    };

    // Check on mount
    checkEmpty();

    // Listen to input events (works for both contenteditable and textarea)
    targetElement.addEventListener('input', checkEmpty);

    // Listen to DOM mutations as backup (for contenteditable)
    const observer = new MutationObserver(checkEmpty);
    observer.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      targetElement.removeEventListener('input', checkEmpty);
      observer.disconnect();
    };
  }, [targetElement]);

  // Get the original text to optimize
  const getOriginalText = () => targetElement.textContent || '';

  // Handle action button click
  const handleActionClick = () => {
    if (buttonState === 'idle') {
      handleOptimize(getOriginalText());
    } else {
      handleReplace(targetElement);
    }
  };

  // Idle state: Only show the action button (minimal UI)
  if (buttonState === 'idle') {
    return (
      <div
        style={{
          position: 'fixed',
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: 'translateY(-100%)',
          zIndex: 9999,
          pointerEvents: 'auto',
          // Add subtle shadow for depth
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
        }}
        className="animate-fadeIn">
        <ActionButton
          buttonState={buttonState}
          isLoading={isLoading}
          disabled={isEmpty}
          onClick={handleActionClick}
        />
      </div>
    );
  }

  // Active states: Show full toolbar with content
  return (
    <FloatingToolbar position={position}>
      {/* Show before/after comparison while optimizing or ready to replace */}
      {(buttonState === 'optimize' || buttonState === 'replace') && (
        <TextComparison
          originalText={originalText}
          optimizedText={optimizedText}
          buttonState={buttonState}
        />
      )}

      {/* Show error message if optimization failed */}
      {buttonState === 'error' && errorMessage && (
        <ErrorMessage message={errorMessage} />
      )}

      {/* Action button (optimize or replace) */}
      {buttonState !== 'error' && (
        <ActionButton
          buttonState={buttonState}
          isLoading={isLoading}
          onClick={handleActionClick}
        />
      )}

      {/* Close button (always visible in active states) */}
      <CloseButton onClick={handleClose} />
    </FloatingToolbar>
  );
}
