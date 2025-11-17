import { useState, useEffect } from 'react';

/**
 * PopupApp - Apple-inspired settings interface
 * Features:
 * - Clean, spacious layout
 * - Frosted glass effects
 * - Smooth animations
 * - Better form controls
 */
export default function PopupApp() {
  const [apiKey, setApiKey] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await chrome.storage.sync.get(['api_key', 'model_base_url', 'model_name', 'custom_prompt']);
    if (result.api_key) setApiKey(result.api_key);
    if (result.model_base_url) setModelUrl(result.model_base_url);
    if (result.model_name) setModelName(result.model_name);
    if (result.custom_prompt) setCustomPrompt(result.custom_prompt);
  };

  const saveSettings = async () => {
    if (!apiKey.trim()) {
      showNotification('请输入有效的 API Key', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        api_key: apiKey.trim(),
        model_base_url: modelUrl.trim(),
        model_name: modelName.trim(),
        custom_prompt: customPrompt
      });
      showNotification('设置已保存', 'success');
    } catch (error: any) {
      showNotification(`保存失败：${error.message}`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-[420px] min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scrollbar-hide">
      <div className="p-6 space-y-5 scrollbar-hide">
        {/* API Key Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="
                w-full px-4 py-3 pr-12
                bg-white dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                rounded-xl
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
                focus:border-transparent
                transition-all duration-200
                text-sm
              "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                p-2 rounded-lg
                text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-all duration-200
              ">
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Model URL Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            模型接口地址
          </label>
          <input
            type="text"
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            placeholder="默认使用 deepseek API"
            className="
              w-full px-4 py-3
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
              focus:border-transparent
              transition-all duration-200
              text-sm
            "
          />
        </div>

        {/* Model Name Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            模型名称
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="默认使用 deepseek-chat"
            className="
              w-full px-4 py-3
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
              focus:border-transparent
              transition-all duration-200
              text-sm
            "
          />
        </div>

        {/* Custom Prompt Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            自定义提示词
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="留空使用默认提示词"
            rows={4}
            className="
              w-full px-4 py-3
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
              focus:border-transparent
              transition-all duration-200
              resize-none
              text-sm
              leading-relaxed
            "
          />
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          className="
            w-full py-3.5 px-4
            bg-blue-500 dark:bg-blue-600
            hover:bg-blue-600 dark:hover:bg-blue-700
            active:scale-[0.98]
            text-white font-medium
            rounded-xl
            transition-all duration-200
            shadow-lg shadow-blue-500/25 dark:shadow-blue-600/25
            hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-600/30
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ">
          保存设置
        </button>

        {/* Notification */}
        {notification && (
          <div
            className={`
              p-4 rounded-xl
              backdrop-blur-sm
              border
              animate-slideIn
              ${notification.type === 'success'
                ? 'bg-green-50/90 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/50'
                : 'bg-red-50/90 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/50'
              }
            `}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
