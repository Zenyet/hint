import { useState, useEffect } from 'react';

type ExtensionMode = 'optimize' | 'prompt-library';

/**
 * PopupApp - Liquid Glass settings interface
 * Features:
 * - True glass material throughout
 * - Multi-layer depth effects
 * - Enhanced blur and vibrancy
 * - Smooth animations
 * - URL management for content script activation
 * - Extension mode selection
 */
export default function PopupApp() {
  const [apiKey, setApiKey] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // URL 管理相关状态（简化为域名列表）
  const [allowedUrls, setAllowedUrls] = useState<string[]>([
    'openai.com',
    'chatgpt.com',
    'claude.ai',
    'yuanbao.tencent.com',
    'gemini.google.com',
    'chat.deepseek.com',
    'grok.com'
  ]);
  const [newUrl, setNewUrl] = useState('');

  // 扩展功能模式
  const [extensionMode, setExtensionMode] = useState<ExtensionMode>('optimize');

  // 处理扩展模式切换（实时保存）
  const handleExtensionModeChange = async (mode: ExtensionMode) => {
    setExtensionMode(mode);
    try {
      await chrome.storage.sync.set({ extension_mode: mode });
    } catch (error: any) {
      showNotification(`切换失败：${error.message}`, 'error');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await chrome.storage.sync.get([
      'api_key',
      'model_base_url',
      'model_name',
      'custom_prompt',
      'allowed_urls',
      'extension_mode'
    ]);
    if (result.api_key) setApiKey(result.api_key);
    if (result.model_base_url) setModelUrl(result.model_base_url);
    if (result.model_name) setModelName(result.model_name);
    if (result.custom_prompt) setCustomPrompt(result.custom_prompt);
    if (result.allowed_urls) setAllowedUrls(result.allowed_urls);
    if (result.extension_mode) setExtensionMode(result.extension_mode);
  };

  const saveSettings = async () => {
    // 提示词库模式不需要验证 API Key
    if (extensionMode === 'optimize' && !apiKey.trim()) {
      showNotification('请输入有效的 API Key', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({
        api_key: apiKey.trim(),
        model_base_url: modelUrl.trim(),
        model_name: modelName.trim(),
        custom_prompt: customPrompt,
        allowed_urls: allowedUrls,
        extension_mode: extensionMode
      });
      showNotification('设置已保存', 'success');
    } catch (error: any) {
      showNotification(`保存失败：${error.message}`, 'error');
    }
  };

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      showNotification('请输入有效的域名', 'error');
      return;
    }
    if (allowedUrls.includes(trimmedUrl)) {
      showNotification('该域名已存在', 'error');
      return;
    }
    setAllowedUrls([...allowedUrls, trimmedUrl]);
    setNewUrl('');
    showNotification('域名已添加', 'success');
  };

  const removeUrl = (url: string) => {
    setAllowedUrls(allowedUrls.filter(u => u !== url));
    showNotification('域名已移除', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-[420px] max-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 scrollbar-hide overflow-auto">
      {/* Notification - centered toast */}
      {notification && (
        <div
          className={`
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            min-w-[280px] max-w-[360px]
            p-4 rounded-xl
            backdrop-blur-2xl
            overflow-hidden
            animate-fadeIn
            ${notification.type === 'success'
              ? 'bg-green-50/25 dark:bg-green-900/15 text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-200/40 dark:ring-green-800/30'
              : 'bg-red-50/25 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-200/40 dark:ring-red-800/30'
            }
          `}
          style={{
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
          }}>
          {/* Glass edge highlight */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-50"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.05)',
            }}
          />

          {/* Content */}
          <div className="flex items-center gap-2 relative z-10">
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

      <div className="p-6 space-y-5">
        {/* Extension Mode Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            模式
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleExtensionModeChange('optimize')}
              className={`
                flex-1 px-4 py-3 rounded-xl
                backdrop-blur-xl
                ring-1 ring-inset
                transition-all duration-200
                text-sm font-medium
                ${extensionMode === 'optimize'
                  ? 'bg-blue-500 dark:bg-blue-600 text-white ring-blue-500 dark:ring-blue-600 shadow-lg shadow-blue-500/25'
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 ring-gray-200/50 dark:ring-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
              `}
              style={{
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">⚡</span>
                <span>优化提示词</span>
              </div>
            </button>
            <button
              onClick={() => handleExtensionModeChange('prompt-library')}
              className={`
                flex-1 px-4 py-3 rounded-xl
                backdrop-blur-xl
                ring-1 ring-inset
                transition-all duration-200
                text-sm font-medium
                ${extensionMode === 'prompt-library'
                  ? 'bg-blue-500 dark:bg-blue-600 text-white ring-blue-500 dark:ring-blue-600 shadow-lg shadow-blue-500/25'
                  : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 ring-gray-200/50 dark:ring-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
              `}
              style={{
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg">🍌</span>
                <span>提示词库</span>
              </div>
            </button>
          </div>
        </div>

        {/* API Key Input - Only show in optimize mode */}
        {extensionMode === 'optimize' && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="
                    w-full px-4 py-3 pr-11
                    backdrop-blur-xl
                    bg-white/60 dark:bg-gray-800/60
                    ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                    rounded-xl
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-600/50
                    transition-all duration-200
                    text-sm
                  "
                  style={{
                    backdropFilter: 'blur(12px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    right-2.5 top-1/2 -translate-y-1/2
                    p-1.5 rounded-md
                    backdrop-blur-xl
                    bg-white/50 dark:bg-white/15
                    text-gray-600 dark:text-gray-400
                    hover:bg-white/70 dark:hover:bg-white/25
                    hover:text-gray-800 dark:hover:text-gray-200
                    ring-1 ring-inset ring-gray-300/40 dark:ring-gray-600/40
                    transition-all duration-200
                    absolute overflow-hidden
                    z-10
                  "
                  style={{
                    backdropFilter: 'blur(12px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                  }}>
                  <div
                    className="absolute inset-0 rounded-md pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
                      mixBlendMode: 'overlay',
                    }}
                  />
                  <div className="relative z-10">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    )}
                  </div>
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
                  backdrop-blur-xl
                  bg-white/60 dark:bg-gray-800/60
                  ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                  rounded-xl
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-600/50
                  transition-all duration-200
                  text-sm
                "
                style={{
                  backdropFilter: 'blur(12px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                }}
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
                  backdrop-blur-xl
                  bg-white/60 dark:bg-gray-800/60
                  ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                  rounded-xl
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-600/50
                  transition-all duration-200
                  text-sm
                "
                style={{
                  backdropFilter: 'blur(12px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                }}
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
                  backdrop-blur-xl
                  bg-white/60 dark:bg-gray-800/60
                  ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                  rounded-xl
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-600/50
                  transition-all duration-200
                  resize-none
                  text-sm
                  leading-relaxed
                "
                style={{
                  backdropFilter: 'blur(12px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                }}
              />
            </div>
          </>
        )}

        {/* URL Management Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            允许的网站域名
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              自动匹配根域名和子域名
            </span>
          </label>

          {/* Add URL Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addUrl()}
              placeholder="例如: example.com"
              className="
                flex-1 px-4 py-2.5
                backdrop-blur-xl
                bg-white/60 dark:bg-gray-800/60
                ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                rounded-lg
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-600/50
                transition-all duration-200
                text-sm
              "
              style={{
                backdropFilter: 'blur(12px) saturate(120%)',
                WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              }}
            />
            <button
              onClick={addUrl}
              className="
                px-4 py-2.5
                bg-blue-500 dark:bg-blue-600
                hover:bg-blue-600 dark:hover:bg-blue-700
                active:scale-[0.98]
                text-white font-medium
                rounded-lg
                transition-all duration-200
                text-sm
                shadow-lg shadow-blue-500/20 dark:shadow-blue-600/20
              ">
              添加
            </button>
          </div>

          {/* URL List */}
          <div
            className="
              max-h-40 overflow-y-auto
              backdrop-blur-xl
              bg-white/40 dark:bg-gray-800/40
              ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
              rounded-xl
              p-2
              space-y-1.5
              scrollbar-glass-green
            "
            style={{
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              /* Firefox scrollbar */
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent',
            }}>
            {allowedUrls.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                暂无允许的网站
              </div>
            ) : (
              allowedUrls.map((url, index) => (
                <div
                  key={index}
                  className="
                    flex items-center justify-between gap-2
                    px-3 py-2
                    backdrop-blur-xl
                    bg-white/60 dark:bg-gray-700/60
                    rounded-lg
                    text-sm
                    group
                  "
                  style={{
                    backdropFilter: 'blur(8px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(120%)',
                  }}>
                  <span className="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">
                    {url}
                  </span>
                  <button
                    onClick={() => removeUrl(url)}
                    className="
                      opacity-0 group-hover:opacity-100
                      p-1 rounded
                      text-red-500 dark:text-red-400
                      hover:bg-red-100 dark:hover:bg-red-900/30
                      transition-all duration-200
                    ">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save Button - Only show in optimize mode */}
        {extensionMode === 'optimize' && (
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
        )}
      </div>
    </div>
  );
}
