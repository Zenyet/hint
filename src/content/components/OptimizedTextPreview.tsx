interface OptimizedTextPreviewProps {
  text: string;
}

export function OptimizedTextPreview({ text }: OptimizedTextPreviewProps) {
  return (
    <div className="max-w-md max-h-32 overflow-y-auto px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-sm text-gray-700 dark:text-gray-300">
      {text}
    </div>
  );
}
