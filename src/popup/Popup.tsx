import { useState, useEffect, useRef } from 'react';
import { getLocalPrompts, saveLocalPrompt, deleteLocalPrompt, LocalPrompt } from '../shared/localPrompts';
import { uploadPrompt, uploadBase64Image } from '../shared/remotePrompts';

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
  const DEFAULT_ALLOWED_URLS = [
    'openai.com',
    'chatgpt.com',
    'claude.ai',
    'yuanbao.tencent.com',
    'gemini.google.com',
    'chat.deepseek.com',
    'grok.com'
  ];
  const [allowedUrls, setAllowedUrls] = useState<string[]>(DEFAULT_ALLOWED_URLS);
  const [newUrl, setNewUrl] = useState('');

  // 扩展功能模式
  const [extensionMode, setExtensionMode] = useState<ExtensionMode>('optimize');

  // 本地提示词管理状态
  const [localPrompts, setLocalPrompts] = useState<LocalPrompt[]>([]);
  const [isPromptsExpanded, setIsPromptsExpanded] = useState(true);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<LocalPrompt | null>(null);
  const [promptForm, setPromptForm] = useState({ title: '', content: '', imageData: '', uploadToRemote: false });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadLocalPrompts();
  }, []);

  const loadLocalPrompts = async () => {
    const prompts = await getLocalPrompts();
    setLocalPrompts(prompts);
  };

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
    if (Array.isArray(result.allowed_urls)) {
      setAllowedUrls(result.allowed_urls);
    } else {
      await chrome.storage.sync.set({ allowed_urls: DEFAULT_ALLOWED_URLS });
    }
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

  const addUrl = async () => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      showNotification('请输入有效的域名', 'error');
      return;
    }
    if (allowedUrls.includes(trimmedUrl)) {
      showNotification('该域名已存在', 'error');
      return;
    }
    const newAllowedUrls = [...allowedUrls, trimmedUrl];
    setAllowedUrls(newAllowedUrls);
    setNewUrl('');
    try {
      await chrome.storage.sync.set({ allowed_urls: newAllowedUrls });
    } catch (error: any) {
      showNotification(`保存失败：${error.message}`, 'error');
      return;
    }
    showNotification('域名已添加', 'success');
  };

  const removeUrl = async (url: string) => {
    const newAllowedUrls = allowedUrls.filter(u => u !== url);
    setAllowedUrls(newAllowedUrls);
    try {
      await chrome.storage.sync.set({ allowed_urls: newAllowedUrls });
    } catch (error: any) {
      showNotification(`保存失败：${error.message}`, 'error');
      return;
    }
    showNotification('域名已移除', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 本地提示词操作
  const handleAddPrompt = () => {
    setIsAddingPrompt(true);
    setEditingPrompt(null);
    setPromptForm({ title: '', content: '', imageData: '', uploadToRemote: false });
  };

  const handleEditPrompt = (prompt: LocalPrompt) => {
    setEditingPrompt(prompt);
    setIsAddingPrompt(false);
    setPromptForm({
      title: prompt.title,
      content: prompt.content,
      imageData: prompt.imageData || '',
      uploadToRemote: false
    });
  };

  const handleCancelPromptForm = () => {
    setIsAddingPrompt(false);
    setEditingPrompt(null);
    setPromptForm({ title: '', content: '', imageData: '', uploadToRemote: false });
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showNotification('只支持 JPEG, PNG, GIF, WebP 格式', 'error');
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      showNotification('图片大小不能超过 5MB', 'error');
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = () => {
      setPromptForm({ ...promptForm, imageData: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = () => {
    setPromptForm({ ...promptForm, imageData: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSavePrompt = async () => {
    if (!promptForm.title.trim() || !promptForm.content.trim()) {
      showNotification('标题和内容不能为空', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl: string | undefined;
      let remoteId: string | undefined;

      // 如果选择上传到远程
      if (promptForm.uploadToRemote) {
        // 先上传图片（如果有）
        if (promptForm.imageData) {
          try {
            const imageResult = await uploadBase64Image(promptForm.imageData);
            imageUrl = imageResult.imageUrl;
          } catch (imgError) {
            showNotification(`图片上传失败：${imgError instanceof Error ? imgError.message : 'Unknown error'}`, 'error');
            setIsUploading(false);
            return;
          }
        }

        // 上传提示词到远程
        try {
          const remotePrompt = await uploadPrompt({
            title: promptForm.title.trim(),
            content: promptForm.content.trim(),
            imageUrl
          });
          remoteId = remotePrompt.id;
          imageUrl = remotePrompt.imageUrl;
        } catch (uploadError) {
          showNotification(`上传失败：${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`, 'error');
          setIsUploading(false);
          return;
        }
      }

      // 保存到本地
      if (editingPrompt) {
        await saveLocalPrompt({
          id: editingPrompt.id,
          title: promptForm.title.trim(),
          content: promptForm.content.trim(),
          imageData: promptForm.uploadToRemote ? undefined : promptForm.imageData || undefined,
          imageUrl: imageUrl || (promptForm.uploadToRemote ? undefined : editingPrompt.imageUrl),
          remoteId: remoteId || editingPrompt.remoteId
        });
        showNotification(promptForm.uploadToRemote ? '提示词已更新并上传' : '提示词已更新', 'success');
      } else {
        await saveLocalPrompt({
          title: promptForm.title.trim(),
          content: promptForm.content.trim(),
          imageData: promptForm.uploadToRemote ? undefined : promptForm.imageData || undefined,
          imageUrl,
          remoteId
        });
        showNotification(promptForm.uploadToRemote ? '提示词已添加并上传' : '提示词已添加', 'success');
      }
      await loadLocalPrompts();
      handleCancelPromptForm();
    } catch (error: unknown) {
      showNotification(`保存失败：${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await deleteLocalPrompt(id);
      await loadLocalPrompts();
      showNotification('提示词已删除', 'success');
    } catch (error: unknown) {
      showNotification(`删除失败：${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
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

        {/* Local Prompts Management - Only show in prompt-library mode */}
        {extensionMode === 'prompt-library' && (
          <div className="space-y-3">
            {/* Header with collapse toggle */}
            <button
              onClick={() => setIsPromptsExpanded(!isPromptsExpanded)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span>我的提示词 ({localPrompts.length})</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isPromptsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isPromptsExpanded && (
              <div
                className="
                  backdrop-blur-xl
                  bg-white/40 dark:bg-gray-800/40
                  ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                  rounded-xl
                  p-3
                  space-y-3
                "
                style={{
                  backdropFilter: 'blur(12px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(120%)',
                }}
              >
                {/* Add/Edit Form */}
                {(isAddingPrompt || editingPrompt) && (
                  <div className="space-y-2 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
                    <input
                      type="text"
                      value={promptForm.title}
                      onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                      placeholder="提示词标题"
                      className="
                        w-full px-3 py-2
                        backdrop-blur-xl
                        bg-white/60 dark:bg-gray-800/60
                        ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                        rounded-lg
                        text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500/50
                        transition-all duration-200
                        text-sm
                      "
                    />
                    <textarea
                      value={promptForm.content}
                      onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                      placeholder="提示词内容..."
                      rows={3}
                      className="
                        w-full px-3 py-2
                        backdrop-blur-xl
                        bg-white/60 dark:bg-gray-800/60
                        ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                        rounded-lg
                        text-gray-900 dark:text-white
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500/50
                        transition-all duration-200
                        text-sm
                        resize-none
                      "
                    />

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {promptForm.imageData ? (
                        <div className="relative">
                          <img
                            src={promptForm.imageData}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="
                              absolute top-1 right-1 p-1
                              bg-red-500/80 hover:bg-red-600
                              text-white rounded-full
                              transition-all duration-200
                            "
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="
                            w-full px-3 py-2
                            backdrop-blur-xl
                            bg-white/60 dark:bg-gray-800/60
                            hover:bg-white/80 dark:hover:bg-gray-700/60
                            ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                            rounded-lg
                            text-gray-500 dark:text-gray-400 text-xs
                            transition-all duration-200
                            flex items-center justify-center gap-2
                          "
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          添加图片（可选）
                        </button>
                      )}
                    </div>

                    {/* Upload to Remote Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promptForm.uploadToRemote}
                        onChange={(e) => setPromptForm({ ...promptForm, uploadToRemote: e.target.checked })}
                        className="
                          w-4 h-4 rounded
                          text-blue-500 dark:text-blue-600
                          border-gray-300 dark:border-gray-600
                          focus:ring-blue-500/50
                        "
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        同时上传到远程（分享给其他用户）
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePrompt}
                        disabled={isUploading}
                        className="
                          flex-1 px-3 py-1.5
                          bg-blue-500 dark:bg-blue-600
                          hover:bg-blue-600 dark:hover:bg-blue-700
                          disabled:opacity-50 disabled:cursor-not-allowed
                          text-white text-sm font-medium
                          rounded-lg
                          transition-all duration-200
                          flex items-center justify-center gap-1
                        "
                      >
                        {isUploading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            上传中...
                          </>
                        ) : (
                          editingPrompt ? '更新' : '添加'
                        )}
                      </button>
                      <button
                        onClick={handleCancelPromptForm}
                        disabled={isUploading}
                        className="
                          px-3 py-1.5
                          bg-gray-200/60 dark:bg-gray-700/60
                          hover:bg-gray-300/60 dark:hover:bg-gray-600/60
                          disabled:opacity-50 disabled:cursor-not-allowed
                          text-gray-700 dark:text-gray-300 text-sm
                          rounded-lg
                          transition-all duration-200
                        "
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                {!isAddingPrompt && !editingPrompt && (
                  <button
                    onClick={handleAddPrompt}
                    className="
                      w-full px-3 py-2
                      backdrop-blur-xl
                      bg-white/60 dark:bg-gray-800/60
                      hover:bg-white/80 dark:hover:bg-gray-700/60
                      ring-1 ring-inset ring-gray-200/50 dark:ring-gray-700/50
                      rounded-lg
                      text-gray-700 dark:text-gray-300 text-sm
                      transition-all duration-200
                      flex items-center justify-center gap-2
                    "
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    添加新提示词
                  </button>
                )}

                {/* Prompts List */}
                <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-glass-green" style={{ scrollbarWidth: 'thin' }}>
                  {localPrompts.length === 0 ? (
                    <div className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
                      暂无本地提示词
                    </div>
                  ) : (
                    localPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="
                          flex items-center justify-between gap-2
                          px-3 py-2
                          backdrop-blur-xl
                          bg-white/60 dark:bg-gray-700/60
                          rounded-lg
                          text-sm
                          group
                        "
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Image indicator */}
                          {(prompt.imageData || prompt.imageUrl) && (
                            <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden">
                              <img
                                src={prompt.imageData || prompt.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                {prompt.title}
                              </span>
                              {prompt.remoteId && (
                                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {prompt.content.substring(0, 40)}...
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditPrompt(prompt)}
                            className="p-1 rounded text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
