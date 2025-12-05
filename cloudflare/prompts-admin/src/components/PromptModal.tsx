import { useState, useEffect, useRef } from 'react';
import { X, Upload, Circle } from 'lucide-react';
import type { Prompt, CreatePromptRequest, UpdatePromptRequest } from '../types';
import { SUPPORTED_SITES, DEFAULT_CATEGORIES } from '../types';
import { createPrompt, updatePrompt, uploadImage } from '../services/api';

// 分类对应的颜色
const CATEGORY_COLORS: Record<string, string> = {
  '开发': '#007aff',
  '写作': '#34c759',
  '翻译': '#ff9500',
  'AI对话': '#af52de',
  '分析': '#ff3b30',
  '创意': '#ffcc00',
  '其他': '#8e8e93',
};

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PromptModal({ prompt, onClose, onSaved }: PromptModalProps) {
  const isEdit = !!prompt;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [category, setCategory] = useState(prompt?.category || '其他');
  const [author, setAuthor] = useState(prompt?.author || '');
  const [sites, setSites] = useState<string[]>(prompt?.sites || ['*']);
  const [imageUrl, setImageUrl] = useState(prompt?.imageUrl || '');
  const [imagePreview, setImagePreview] = useState<string | null>(prompt?.imageUrl || null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 处理站点选择
  const toggleSite = (value: string) => {
    if (value === '*') {
      setSites(['*']);
    } else {
      const newSites = sites.includes('*') ? [] : [...sites];
      if (newSites.includes(value)) {
        const filtered = newSites.filter(s => s !== value);
        setSites(filtered.length === 0 ? ['*'] : filtered);
      } else {
        setSites([...newSites, value]);
      }
    }
  };

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的图片格式');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const removeImage = () => {
    setPendingFile(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('请填写标题和内容');
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = imageUrl;

      if (pendingFile) {
        const result = await uploadImage(pendingFile);
        finalImageUrl = result.imageUrl;
      }

      const data: CreatePromptRequest | UpdatePromptRequest = {
        title: title.trim(),
        content: content.trim(),
        category,
        sites,
        author: author.trim() || 'anonymous',
        imageUrl: finalImageUrl || undefined,
      };

      if (isEdit && prompt) {
        await updatePrompt(prompt.id, data);
      } else {
        await createPrompt(data as CreatePromptRequest);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center quicklook-backdrop bg-black/50"
      onClick={onClose}
    >
      <div
        className="finder-window w-[480px] max-h-[85vh] overflow-hidden animate-quicklook-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="finder-toolbar h-11 flex items-center px-4 relative">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 mr-2 group relative flex items-center justify-center"
          >
            <X size={8} className="text-[#990000] opacity-0 group-hover:opacity-100" strokeWidth={3} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 font-medium text-gray-700 text-sm">
            {isEdit ? '编辑提示词' : '新建提示词'}
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(85vh-44px)] bg-white">
          <div className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* 标题 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-shadow outline-none"
                placeholder="例如：代码审查助手"
                required
              />
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                提示词内容
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-shadow resize-none font-mono outline-none"
                placeholder="请输入提示词内容..."
                required
              />
            </div>

            {/* 图片上传 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                封面图片
              </label>
              <div className="flex gap-3 items-start">
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="预览"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ff5f57] text-white rounded-full text-xs hover:brightness-90 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#007aff] hover:text-[#007aff] transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    {imagePreview ? '重新选择' : '点击上传图片'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    支持 JPEG、PNG、GIF、WebP，最大 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* 分类和作者 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  分类
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none bg-white"
                >
                  {DEFAULT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  作者
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] transition-shadow outline-none"
                  placeholder="可选"
                />
              </div>
            </div>

            {/* 适用站点 */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                适用站点
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_SITES.map(site => (
                  <button
                    key={site.value}
                    type="button"
                    onClick={() => toggleSite(site.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
                      sites.includes(site.value) || (site.value === '*' && sites.includes('*'))
                        ? 'bg-[#007aff] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Circle
                      size={8}
                      fill={sites.includes(site.value) ? 'white' : CATEGORY_COLORS['其他']}
                      stroke="none"
                    />
                    {site.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-md text-sm bg-[#007aff] text-white hover:bg-[#0066d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
