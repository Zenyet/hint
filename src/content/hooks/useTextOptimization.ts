import { useState, useRef, useCallback, useEffect } from 'react';
import { ButtonState, OptimizationResponse } from '../types';
import { nanoBananaPrompts } from '../../shared/nanobanana-prompts';

// 默认模板ID
const DEFAULT_TEMPLATE_ID = 'creative_ad';

interface UseTextOptimizationResult {
  buttonState: ButtonState;
  originalText: string;
  optimizedText: string;
  isLoading: boolean;
  errorMessage: string;
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
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
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Load saved template preference
  useEffect(() => {
    chrome.storage.sync.get(['selected_template_id']).then(result => {
      if (result.selected_template_id) {
        setSelectedTemplateId(result.selected_template_id);
      }
    });
  }, []);

  // Save template preference when changed
  const handleSetSelectedTemplateId = useCallback((id: string) => {
    setSelectedTemplateId(id);
    chrome.storage.sync.set({ selected_template_id: id });
  }, []);

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

    // Get the selected template's prompt from nanobanana prompts
    const template = nanoBananaPrompts.find((t) => t.id === selectedTemplateId);
    const systemPrompt = template?.prompt;

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
        text: text,
        templateId: selectedTemplateId,
        systemPrompt: systemPrompt
      });
    } catch (error: any) {
      setErrorMessage(error.message);
      setButtonState('error');
      setIsLoading(false);
    }
  }, [isLoading, selectedTemplateId]);

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
    selectedTemplateId,
    setSelectedTemplateId: handleSetSelectedTemplateId,
    handleOptimize,
    handleReplace,
    handleClose
  };
}
