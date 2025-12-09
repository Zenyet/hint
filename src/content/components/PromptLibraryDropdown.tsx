import { useState, useEffect, useCallback, useRef } from 'react';
import { siteConfigs, getSitePrompts, detectSiteFromUrl, SitePrompt } from '../../shared/site-prompts';
import { fetchRemotePrompts, RemotePrompt, convertToTemplateFormat, uploadPrompt, uploadBase64Image } from '../../shared/remotePrompts';
import { getLocalPrompts, saveLocalPrompt, deleteLocalPrompt, convertToSitePrompt, LocalPrompt } from '../../shared/localPrompts';

// Extended SitePrompt with optional imageUrl and isLocal flag
interface ExtendedSitePrompt extends SitePrompt {
  imageUrl?: string;
  isLocal?: boolean;
  localId?: string; // 用于编辑/删除本地提示词
}

interface PromptLibraryDropdownProps {
  onSelect: (promptText: string) => void;
  onClose: () => void;
}

type ViewMode = 'list' | 'add' | 'edit';

/**
 * PromptLibraryDropdown - Displays prompts in a dropdown with site selector
 * Features:
 * - Liquid glass design
 * - Site selector in header
 * - Scrollable prompt list
 * - Click to select and insert prompt
 * - Fetches prompts from remote API with local fallback
 * - Image preview on hover
 * - Local prompt management (add/edit/delete)
 */
export function PromptLibraryDropdown({ onSelect, onClose }: PromptLibraryDropdownProps) {
  // Auto-detect site based on current URL
  const [selectedSite, setSelectedSite] = useState(() => {
    try {
      return detectSiteFromUrl(window.location.href);
    } catch {
      return 'nanobanana';
    }
  });

  const [prompts, setPrompts] = useState<ExtendedSitePrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('above');
  const [hoveredPrompt, setHoveredPrompt] = useState<ExtendedSitePrompt | null>(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 本地提示词管理状态
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPrompt, setEditingPrompt] = useState<LocalPrompt | null>(null);
  const [promptForm, setPromptForm] = useState({ title: '', content: '', imageData: '', uploadToRemote: false });
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 只在组件挂载时计算一次位置
  useEffect(() => {
    const dropdown = mainDropdownRef.current;
    if (!dropdown) return;

    parentRef.current = dropdown.parentElement;
    const parent = parentRef.current;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const dropdownHeight = 400;
    const viewportHeight = window.innerHeight;

    const spaceAbove = parentRect.top;
    const spaceBelow = viewportHeight - parentRect.bottom;

    if (spaceAbove < dropdownHeight && spaceBelow > spaceAbove) {
      setDropdownPosition('below');
    } else {
      setDropdownPosition('above');
    }
  }, []);

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  // Fetch prompts from remote API and local storage
  const loadPrompts = useCallback(async (site: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 获取本地提示词
      const localPromptsData = await getLocalPrompts();
      const localConverted: ExtendedSitePrompt[] = localPromptsData.map(p => ({
        ...convertToSitePrompt(p),
        isLocal: true,
        localId: p.id
      }));

      // 2. 获取远程提示词
      const remoteData = await fetchRemotePrompts(site);

      let remoteConverted: ExtendedSitePrompt[] = [];
      if (remoteData.prompts && remoteData.prompts.length > 0) {
        remoteConverted = remoteData.prompts.map((p: RemotePrompt) => {
          const converted = convertToTemplateFormat(p);
          return {
            id: converted.id,
            name: converted.name,
            icon: converted.icon,
            description: converted.description,
            prompt: converted.prompt,
            imageUrl: converted.imageUrl,
            isLocal: false
          };
        });
      } else {
        // 使用本地站点提示词作为后备
        remoteConverted = getSitePrompts(site).map(p => ({ ...p, isLocal: false }));
      }

      // 3. 合并：本地在前，远程在后
      setPrompts([...localConverted, ...remoteConverted]);
    } catch (err) {
      console.error('[PromptLibrary] Failed to fetch prompts:', err);
      setError('加载提示词失败');

      // 尝试至少加载本地提示词
      try {
        const localPromptsData = await getLocalPrompts();
        const localConverted: ExtendedSitePrompt[] = localPromptsData.map(p => ({
          ...convertToSitePrompt(p),
          isLocal: true,
          localId: p.id
        }));
        const sitePrompts = getSitePrompts(site).map(p => ({ ...p, isLocal: false }));
        setPrompts([...localConverted, ...sitePrompts]);
      } catch {
        setPrompts(getSitePrompts(site));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts(selectedSite);
  }, [selectedSite, loadPrompts]);

  // Handle hover on prompt item
  const handleMouseEnter = (prompt: ExtendedSitePrompt, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!prompt.imageUrl) return;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const dropdownRect = mainDropdownRef.current?.getBoundingClientRect();

    if (dropdownRect) {
      // 计算相对于主 dropdown 的位置
      setPreviewPosition({
        top: buttonRect.top - dropdownRect.top,
        left: 320 + 8 // min-w-[320px] + gap
      });
    }
    setHoveredPrompt(prompt);
  };

  const handleMouseLeave = () => {
    setHoveredPrompt(null);
  };

  // 本地提示词管理
  const handleAddNew = () => {
    setViewMode('add');
    setEditingPrompt(null);
    setPromptForm({ title: '', content: '', imageData: '', uploadToRemote: false });
  };

  const handleEdit = async (localId: string) => {
    const localPrompts = await getLocalPrompts();
    const prompt = localPrompts.find(p => p.id === localId);
    if (prompt) {
      setEditingPrompt(prompt);
      setPromptForm({
        title: prompt.title,
        content: prompt.content,
        imageData: prompt.imageData || '',
        uploadToRemote: false
      });
      setViewMode('edit');
    }
  };

  const handleDelete = async (localId: string) => {
    try {
      await deleteLocalPrompt(localId);
      showNotification('已删除', 'success');
      loadPrompts(selectedSite);
    } catch {
      showNotification('删除失败', 'error');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingPrompt(null);
    setPromptForm({ title: '', content: '', imageData: '', uploadToRemote: false });
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      showNotification('只支持 JPEG, PNG, GIF, WebP', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('图片不能超过 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPromptForm({ ...promptForm, imageData: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPromptForm({ ...promptForm, imageData: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 保存提示词
  const handleSave = async () => {
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
        if (promptForm.imageData) {
          try {
            const imageResult = await uploadBase64Image(promptForm.imageData);
            imageUrl = imageResult.imageUrl;
          } catch (imgError) {
            showNotification(`图片上传失败`, 'error');
            setIsUploading(false);
            return;
          }
        }

        try {
          const remotePrompt = await uploadPrompt({
            title: promptForm.title.trim(),
            content: promptForm.content.trim(),
            imageUrl
          });
          remoteId = remotePrompt.id;
          imageUrl = remotePrompt.imageUrl;
        } catch {
          showNotification('上传到远程失败', 'error');
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
        showNotification(promptForm.uploadToRemote ? '已更新并上传' : '已更新', 'success');
      } else {
        await saveLocalPrompt({
          title: promptForm.title.trim(),
          content: promptForm.content.trim(),
          imageData: promptForm.uploadToRemote ? undefined : promptForm.imageData || undefined,
          imageUrl,
          remoteId
        });
        showNotification(promptForm.uploadToRemote ? '已添加并上传' : '已添加', 'success');
      }

      await loadPrompts(selectedSite);
      handleCancel();
    } catch {
      showNotification('保存失败', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 渲染添加/编辑表单
  const renderForm = () => (
    <div className="relative p-3 space-y-3 z-10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 px-2">
          {viewMode === 'add' ? '添加提示词' : '编辑提示词'}
        </span>
        <button
          onClick={handleCancel}
          className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        type="text"
        value={promptForm.title}
        onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
        placeholder="提示词标题"
        className="
          w-full px-3 py-2
          bg-white/70 dark:bg-white/10
          ring-1 ring-inset ring-gray-200/50 dark:ring-white/20
          rounded-lg
          text-gray-900 dark:text-white text-sm
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500/50
          transition-all duration-200
        "
      />

      <textarea
        value={promptForm.content}
        onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
        placeholder="提示词内容..."
        rows={4}
        className="
          w-full px-3 py-2
          bg-white/70 dark:bg-white/10
          ring-1 ring-inset ring-gray-200/50 dark:ring-white/20
          rounded-lg
          text-gray-900 dark:text-white text-sm
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500/50
          transition-all duration-200
          resize-none
        "
      />

      {/* 图片上传 */}
      <div>
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
              className="w-full h-20 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
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
              bg-white/50 dark:bg-white/5
              hover:bg-white/70 dark:hover:bg-white/10
              ring-1 ring-inset ring-gray-200/50 dark:ring-white/20
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

      {/* 上传到远程选项 */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={promptForm.uploadToRemote}
          onChange={(e) => setPromptForm({ ...promptForm, uploadToRemote: e.target.checked })}
          className="w-4 h-4 rounded text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500/50"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          同时上传到远程（分享给其他用户）
        </span>
      </label>

      {/* 保存按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isUploading}
          className="
            flex-1 px-3 py-2
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
            viewMode === 'edit' ? '更新' : '添加'
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isUploading}
          className="
            px-3 py-2
            bg-gray-200/60 dark:bg-white/10
            hover:bg-gray-300/60 dark:hover:bg-white/20
            disabled:opacity-50
            text-gray-700 dark:text-gray-300 text-sm
            rounded-lg
            transition-all duration-200
          "
        >
          取消
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-[10000]
            px-4 py-2 rounded-lg
            backdrop-blur-xl
            text-sm font-medium
            animate-fadeIn
            ${notification.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
            }
          `}
        >
          {notification.message}
        </div>
      )}

      {/* Main Dropdown */}
      <div
        ref={mainDropdownRef}
        className={`
          absolute left-0
          ${dropdownPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}
          min-w-[320px]
          z-50
          animate-fadeIn
        `}
      >
        {/* Dropdown Content Container */}
        <div
          className="
            max-h-[450px]
            overflow-hidden
            backdrop-blur-2xl
            bg-white/85 dark:bg-gray-900/90
            ring-1 ring-inset ring-white/40 dark:ring-white/20
            rounded-2xl
            shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
          "
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
        {/* Glass edge highlight */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Subtle inner glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-60 overflow-hidden"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.05)',
          }}
        />

        {/* Header with site selector */}
        <div className="relative flex items-center justify-between border-b border-gray-200/50 dark:border-white/10 p-3 z-20 bg-white/30 dark:bg-transparent rounded-t-2xl gap-x-3">
          <div className="flex items-center gap-2 flex-1">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              disabled={viewMode !== 'list'}
              className="
                flex-1 px-2 py-1.5
                bg-white/70 dark:bg-white/10
                hover:bg-white/90 dark:hover:bg-white/15
                disabled:opacity-50
                text-sm font-semibold text-gray-900 dark:text-gray-200
                rounded-lg
                border border-gray-300/50 dark:border-transparent
                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400
                transition-all duration-200
                cursor-pointer
                appearance-none
                pr-8
                shadow-sm
              "
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              {siteConfigs.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {viewMode === 'list' && (
              <button
                onClick={handleAddNew}
                className="
                  p-1.5 rounded-lg
                  text-blue-600 dark:text-blue-400
                  hover:bg-blue-100/50 dark:hover:bg-blue-900/30
                  transition-all duration-200
                "
                title="添加新提示词"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="
                p-1.5 rounded-lg
                text-gray-700 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                hover:bg-gray-200/70 dark:hover:bg-white/10
                transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && viewMode === 'list' && (
          <div className="relative mx-2 mt-2 px-3 py-2 bg-yellow-100/80 dark:bg-yellow-900/30 rounded-lg text-xs text-yellow-700 dark:text-yellow-300 z-10">
            {error}
          </div>
        )}

        {/* Add/Edit Form or Prompt List */}
        {viewMode !== 'list' ? (
          renderForm()
        ) : (
          <div
            className="relative max-h-[360px] overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-glass z-10"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent',
            }}
          >
            {isLoading ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="inline-block animate-spin mr-2">⏳</div>
                加载中...
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                <p>暂无提示词</p>
                <button
                  onClick={handleAddNew}
                  className="mt-2 text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  + 添加一个
                </button>
              </div>
            ) : (
              prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="
                    group relative
                    w-full flex items-start gap-3 px-3 py-2.5
                    text-left
                    transition-all duration-200
                    overflow-hidden
                    hover:bg-gray-100/80 dark:hover:bg-white/10
                    hover:shadow-sm
                    text-gray-800 dark:text-gray-200 rounded-lg
                  "
                >
                  <button
                    onClick={() => onSelect(prompt.prompt)}
                    onMouseEnter={(e) => handleMouseEnter(prompt, e as any)}
                    onMouseLeave={handleMouseLeave}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{prompt.name}</span>
                          {prompt.isLocal && (
                            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded">
                              本地
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {prompt.description}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* 本地提示词操作按钮 */}
                  {prompt.isLocal && prompt.localId && (
                    <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(prompt.localId!)}
                        className="p-1 rounded text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        title="编辑"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.localId!)}
                        className="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                        title="删除"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        </div>

        {/* Image Preview Panel - Absolute position relative to main dropdown */}
        {hoveredPrompt?.imageUrl && viewMode === 'list' && (
          <div
            className="
              absolute
              w-[280px]
              backdrop-blur-2xl
              bg-white
              ring-1 ring-inset ring-gray-200/50 dark:ring-white/20
              shadow-[0_8px_32px_rgba(31,38,135,0.15),0_1px_2px_rgba(0,0,0,0.1)]
              overflow-hidden
              z-[9999]
              pointer-events-none
              animate-fadeIn
            "
            style={{
              top: previewPosition.top,
              left: previewPosition.left,
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            <div className="relative p-2">
              <img
                src={hoveredPrompt.imageUrl}
                alt={hoveredPrompt.name}
                className="w-full h-auto object-cover max-h-[250px]"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
