interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="关闭">
      ✕
    </button>
  );
}
