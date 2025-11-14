import { useElementPosition, useTextOptimization } from './hooks';
import {
  FloatingToolbar,
  OptimizedTextPreview,
  ErrorMessage,
  ActionButton,
  CloseButton
} from './components';

interface ContentAppProps {
  targetElement: HTMLElement;
}

/**
 * Main content script component that provides text optimization UI
 * Displays a floating toolbar above the target editable element
 */
export default function ContentApp({ targetElement }: ContentAppProps) {
  // Track the position of the target element
  const position = useElementPosition(targetElement);

  // Manage text optimization state and handlers
  const {
    buttonState,
    optimizedText,
    isLoading,
    errorMessage,
    handleOptimize,
    handleReplace,
    handleClose
  } = useTextOptimization(targetElement);

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

  return (
    <FloatingToolbar position={position}>
      {/* Show optimized text preview while optimizing */}
      {buttonState === 'optimize' && optimizedText && (
        <OptimizedTextPreview text={optimizedText} />
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

      {/* Close button (visible when not in idle state) */}
      {buttonState !== 'idle' && <CloseButton onClick={handleClose} />}
    </FloatingToolbar>
  );
}
