import { useState, useRef, useCallback, useEffect } from 'react';
import { ButtonState, OptimizationResponse } from '../types';

interface UseTextOptimizationResult {
  buttonState: ButtonState;
  originalText: string;
  optimizedText: string;
  isLoading: boolean;
  errorMessage: string;
  handleOptimize: (originalText: string) => void;
  handleReplace: (targetElement: HTMLElement, cancel?: boolean) => void;
  handleClose: () => void;
}

/**
 * Custom hook to manage text optimization logic
 * @param targetElement - The HTML element containing the text to optimize
 * @returns Object containing state and handlers for text optimization
 */
export function useTextOptimization(targetElement: HTMLElement): UseTextOptimizationResult {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [originalText, setOriginalText] = useState('');
  const [optimizedText, setOptimizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      portRef.current?.disconnect();
    };
  }, []);

  const handleOptimize = useCallback((text: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setButtonState('optimize');
    setOriginalText(text);
    setOptimizedText('');
    setErrorMessage('');

    try {
      portRef.current = chrome.runtime.connect();
      let result = '';

      portRef.current.onMessage.addListener((response: OptimizationResponse) => {
        if (response.error) {
          setErrorMessage(response.error);
          setButtonState('error');
          setIsLoading(false);
          return;
        }

        if (response.type === 'chunk' && response.content) {
          result += response.content;
          setOptimizedText(result);
        } else if (response.type === 'done') {
          setButtonState('replace');
          setIsLoading(false);
        }
      });

      portRef.current.postMessage({
        type: 'OPTIMIZE_TEXT',
        text: text
      });
    } catch (error: any) {
      setErrorMessage(error.message);
      setButtonState('error');
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleReplace = useCallback((targetElement: HTMLElement, cancel = false) => {
    if (optimizedText && !cancel) {
      if ('value' in targetElement) {
        (targetElement as HTMLInputElement | HTMLTextAreaElement).value = optimizedText;
      } else {
        targetElement.textContent = optimizedText;
      }
    }

    setButtonState('idle');
    setOriginalText('');
    setOptimizedText('');
    setErrorMessage('');
  }, [optimizedText]);

  const handleClose = useCallback(() => {
    if (buttonState === 'error') {
      // 错误状态：清空所有内容
      portRef.current?.postMessage({ type: 'ABORT_OPTIMIZATION' });
      setButtonState('idle');
      setOriginalText('');
      setOptimizedText('');
      setErrorMessage('');
    } else if (buttonState === 'optimize') {
      // 优化中状态：中断请求但保留已生成的文本
      portRef.current?.postMessage({ type: 'ABORT_OPTIMIZATION' });
      setIsLoading(false);
      // 如果有生成的文本，切换到 replace 状态让用户可以选择是否替换
      if (optimizedText.trim()) {
        setButtonState('replace');
      } else {
        // 如果没有生成任何文本，返回 idle 状态
        setButtonState('idle');
        setOriginalText('');
        setOptimizedText('');
      }
    } else {
      // replace 状态：取消替换
      handleReplace(targetElement, true);
    }
  }, [buttonState, targetElement, handleReplace, optimizedText]);

  return {
    buttonState,
    originalText,
    optimizedText,
    isLoading,
    errorMessage,
    handleOptimize,
    handleReplace,
    handleClose
  };
}
