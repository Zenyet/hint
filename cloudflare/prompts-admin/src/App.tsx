import { useState, useEffect, useCallback } from 'react';
import { Sidebar, IconGrid, QuickLook, PromptModal, Toolbar } from './components';
import { usePrompts } from './hooks/usePrompts';
import { deletePrompt } from './services/api';
import type { Prompt } from './types';

function App() {
  const {
    prompts,
    allPrompts,
    categories,
    loading,
    error,
    filter,
    setFilter,
    refresh,
  } = usePrompts();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quickLookPrompt, setQuickLookPrompt] = useState<Prompt | null>(null);
  const [modalPrompt, setModalPrompt] = useState<Prompt | null | 'new'>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 获取当前选中的 prompt
  const selectedPrompt = prompts.find(p => p.id === selectedId) || null;

  // 空格键预览
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' && selectedPrompt && !quickLookPrompt && modalPrompt === null) {
      e.preventDefault();
      setQuickLookPrompt(selectedPrompt);
    }
  }, [selectedPrompt, quickLookPrompt, modalPrompt]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Toast 通知
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 删除提示词
  const handleDelete = async (prompt: Prompt) => {
    if (!confirm(`确定要删除「${prompt.title}」吗？`)) return;

    try {
      await deletePrompt(prompt.id);
      showToast('删除成功', 'success');
      setQuickLookPrompt(null);
      setSelectedId(null);
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除失败', 'error');
    }
  };

  // 编辑提示词
  const handleEdit = (prompt: Prompt) => {
    setQuickLookPrompt(null);
    setModalPrompt(prompt);
  };

  // 获取标题
  const getTitle = () => {
    if (filter.category) return filter.category;
    if (filter.site) return filter.site === '*' ? '全部站点' : filter.site;
    return '全部提示词';
  };

  return (
    <div className="h-screen flex items-center justify-center p-8">
      <div className="finder-window w-full max-w-5xl h-full flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar
          categories={categories}
          filter={filter}
          onFilterChange={setFilter}
          promptCount={allPrompts.length}
          onNewPrompt={() => setModalPrompt('new')}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col">
          {/* 工具栏 */}
          <Toolbar title={getTitle()} onRefresh={refresh} />

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 text-sm border-b border-red-100">
              {error}
            </div>
          )}

          {/* 图标网格 */}
          <IconGrid
            prompts={prompts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPreview={setQuickLookPrompt}
            loading={loading}
          />

          {/* 状态栏 */}
          <div className="h-6 flex items-center justify-center text-xs text-gray-400 border-t border-black/5 bg-gray-50">
            {prompts.length} 个项目 · 选中后按空格 / 双击预览
          </div>
        </div>
      </div>

      {/* Quick Look 预览 */}
      <QuickLook
        prompt={quickLookPrompt}
        onClose={() => setQuickLookPrompt(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 新建/编辑模态框 */}
      {modalPrompt !== null && (
        <PromptModal
          prompt={modalPrompt === 'new' ? null : modalPrompt}
          onClose={() => setModalPrompt(null)}
          onSaved={() => {
            showToast(modalPrompt === 'new' ? '创建成功' : '更新成功', 'success');
            refresh();
          }}
        />
      )}

      {/* Toast 通知 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm transition-all ${
            toast.type === 'success'
              ? 'bg-[#28c840] text-white'
              : 'bg-[#ff5f57] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
