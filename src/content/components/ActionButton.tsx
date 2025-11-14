import { ButtonState } from '../types';

interface ActionButtonProps {
  buttonState: ButtonState;
  isLoading: boolean;
  onClick: () => void;
}

export function ActionButton({ buttonState, isLoading, onClick }: ActionButtonProps) {
  const getButtonIcon = () => {
    if (isLoading) return '⏳';
    if (buttonState === 'replace') return '✓';
    return '⚡';
  };

  const getButtonTitle = () => {
    return buttonState === 'idle' ? '优化文本' : '替换文本';
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      title={getButtonTitle()}>
      {getButtonIcon()}
    </button>
  );
}
