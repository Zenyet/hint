import { useState, useEffect, useRef } from 'react';

interface ContentAppProps {
  targetElement: HTMLElement;
}

export default function ContentApp({ targetElement }: ContentAppProps) {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [buttonState, setButtonState] = useState<'idle' | 'optimize' | 'replace' | 'error'>('idle');
  const [optimizedText, setOptimizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(targetElement);

    window.addEventListener('resize', updatePosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updatePosition);
      portRef.current?.disconnect();
    };
  }, [targetElement]);

  const updatePosition = () => {
    const rect = targetElement.getBoundingClientRect();
    setPosition({
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY - 15
    });
  };

  const handleOptimize = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setButtonState('optimize');
    setOptimizedText('');
    setErrorMessage('');

    try {
      const originalText = targetElement.textContent || '';

      portRef.current = chrome.runtime.connect();
      let result = '';

      portRef.current.onMessage.addListener((response) => {
        if (response.error) {
          setErrorMessage(response.error);
          setButtonState('error');
          setIsLoading(false);
          return;
        }

        if (response.type === 'chunk') {
          result += response.content;
          setOptimizedText(result);
        } else if (response.type === 'done') {
          setButtonState('replace');
          setIsLoading(false);
        }
      });

      portRef.current.postMessage({
        type: 'OPTIMIZE_TEXT',
        text: originalText
      });
    } catch (error: any) {
      setErrorMessage(error.message);
      setButtonState('error');
      setIsLoading(false);
    }
  };

  const handleReplace = (cancel?: boolean) => {
    if (optimizedText && !cancel) {
      if ('value' in targetElement) {
        (targetElement as HTMLInputElement | HTMLTextAreaElement).value = optimizedText;
      } else {
        targetElement.textContent = optimizedText;
      }
    }

    setButtonState('idle');
    setOptimizedText('');
    setErrorMessage('');
  };

  const handleClose = () => {
    if (buttonState === 'error' || buttonState === 'optimize') {
      portRef.current?.postMessage({ type: 'ABORT_OPTIMIZATION' });
      setButtonState('idle');
      setOptimizedText('');
      setErrorMessage('');
    } else {
      handleReplace(true);
    }
  };

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
          {buttonState === 'optimize' && optimizedText && (
            <div className="max-w-md max-h-32 overflow-y-auto px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
              {optimizedText}
            </div>
          )}

          {buttonState === 'error' && errorMessage && (
            <div className="max-w-md px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {buttonState !== 'error' && (
            <button
              onClick={buttonState === 'idle' ? handleOptimize : () => handleReplace()}
              disabled={isLoading}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title={buttonState === 'idle' ? '优化文本' : '替换文本'}>
              {isLoading ? '⏳' : buttonState === 'replace' ? '✓' : '⚡'}
            </button>
          )}

          {buttonState !== 'idle' && (
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="关闭">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
