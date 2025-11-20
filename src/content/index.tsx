import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import cssText from './index.css?inline';

// 全局变量保存当前状态
let currentRoot: ReactDOM.Root | null = null;
let currentContainer: HTMLElement | null = null;
let currentTargetElement: HTMLElement | null = null;

// 默认允许的域名列表（简化版）
const DEFAULT_ALLOWED_URLS = [
  'openai.com',
  'chatgpt.com',
  'claude.ai',
  'yuanbao.tencent.com',
  'gemini.google.com',
  'chat.deepseek.com',
  'grok.com'
];

/**
 * 检查当前 URL 是否在允许的域名列表中
 * @param url 当前页面 URL
 * @param domains 允许的域名列表
 * @returns 是否匹配
 */
function isUrlAllowed(url: string, domains: string[]): boolean {
  try {
    const currentUrl = new URL(url);
    const hostname = currentUrl.hostname;

    console.log('[Hint Extension] Checking hostname:', hostname);
    console.log('[Hint Extension] Allowed domains:', domains);

    // 检查 hostname 是否包含任何允许的域名
    // 例如: chat.openai.com 包含 openai.com
    for (const domain of domains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        console.log(`[Hint Extension] ✓ Hostname matched domain: ${domain}`);
        return true;
      }
    }

    console.log('[Hint Extension] ✗ Hostname did not match any domain');
    return false;
  } catch (error) {
    console.error('[Hint Extension] Error in URL matching:', error);
    return false;
  }
}

/**
 * 从 chrome.storage 获取允许的 URL 列表
 * @returns 允许的 URL 模式数组
 */
async function getAllowedUrls(): Promise<string[]> {
  try {
    const result = await chrome.storage.sync.get('allowed_urls');
    return result.allowed_urls || DEFAULT_ALLOWED_URLS;
  } catch (error) {
    console.warn('[Hint Extension] Failed to load allowed URLs from storage:', error);
    return DEFAULT_ALLOWED_URLS;
  }
}

// 查找可编辑元素
function findEditableElement(): HTMLElement | null {
  console.log('[Hint Extension] Searching for editable element...');
  const element = (
    (document.querySelector('[contenteditable="true"]') as HTMLElement) ||
    (document.querySelector('textarea') as HTMLElement)
  );
  console.log('[Hint Extension] Found editable element:', element);
  return element;
}

/**
 * 查找合适的定位参考容器
 *
 * 策略：
 * - textarea: 直接使用元素本身（textarea 本身就是固定容器，内容滚动在内部）
 * - contenteditable: 查找有高度约束或 overflow 的父容器
 *
 * 边界处理：
 * - 父容器是 body → 使用元素本身
 * - 没有合适的父容器 → 使用元素本身
 * - 父容器高度小于元素 → 使用父容器（说明父容器是滚动容器）
 */
function findPositioningContainer(element: HTMLElement): HTMLElement {
  console.log('[Hint Extension] Finding positioning container for:', element);

  // Textarea: 直接使用元素本身（内容滚动在内部）
  if (element.tagName.toLowerCase() === 'textarea') {
    console.log('[Hint Extension] Element is textarea, using element itself for positioning');
    return element;
  }

  // Contenteditable: 查找合适的父容器
  let parent = element.parentElement;

  // 边界情况：没有父容器或父容器是 body
  if (!parent || parent === document.body) {
    console.log('[Hint Extension] No suitable parent (or parent is body), using element itself');
    return element;
  }

  // 检查父容器是否是合适的定位参考
  const parentStyles = window.getComputedStyle(parent);

  // 检查父容器是否有高度约束
  const hasFixedHeight = parentStyles.height !== 'auto' && parentStyles.height !== '';
  const hasMaxHeight = parentStyles.maxHeight !== 'none' && parentStyles.maxHeight !== '';

  // 检查父容器是否有 overflow（说明是滚动容器）
  const hasOverflow =
    parentStyles.overflow === 'auto' || parentStyles.overflow === 'scroll' ||
    parentStyles.overflowY === 'auto' || parentStyles.overflowY === 'scroll' ||
    parentStyles.overflowX === 'hidden'; // 有时 overflow-x: hidden 也表示是个容器

  // 检查父容器高度是否小于元素（说明父容器是滚动容��）
  const parentRect = parent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const isParentSmaller = parentRect.height < elementRect.height;

  // 如果父容器符合以下任一条件，使用父容器：
  // 1. 有固定高度或最大高度
  // 2. 有 overflow 设置（滚动容器）
  // 3. 高度小于元素（说明是滚动容器）
  if (hasFixedHeight || hasMaxHeight || hasOverflow || isParentSmaller) {
    console.log('[Hint Extension] Found suitable parent container:', {
      parent,
      hasFixedHeight,
      hasMaxHeight,
      hasOverflow,
      isParentSmaller,
      parentHeight: parentRect.height,
      elementHeight: elementRect.height
    });
    return parent;
  }

  // 继续向上查找（最多查找 3 层）
  let ancestor = parent.parentElement;
  let depth = 0;
  const maxDepth = 3;

  while (ancestor && ancestor !== document.body && depth < maxDepth) {
    const ancestorStyles = window.getComputedStyle(ancestor);
    const ancestorRect = ancestor.getBoundingClientRect();

    const hasFixedHeight = ancestorStyles.height !== 'auto' && ancestorStyles.height !== '';
    const hasMaxHeight = ancestorStyles.maxHeight !== 'none' && ancestorStyles.maxHeight !== '';
    const hasOverflow =
      ancestorStyles.overflow === 'auto' || ancestorStyles.overflow === 'scroll' ||
      ancestorStyles.overflowY === 'auto' || ancestorStyles.overflowY === 'scroll';
    const isAncestorSmaller = ancestorRect.height < elementRect.height;

    if (hasFixedHeight || hasMaxHeight || hasOverflow || isAncestorSmaller) {
      console.log('[Hint Extension] Found suitable ancestor container at depth', depth, ':', {
        ancestor,
        hasFixedHeight,
        hasMaxHeight,
        hasOverflow,
        isAncestorSmaller
      });
      return ancestor;
    }

    ancestor = ancestor.parentElement;
    depth++;
  }

  // 如果找不到合适的父容器，使用元素本身
  console.log('[Hint Extension] No suitable parent container found, using element itself');
  return element;
}

// 清理现有实例
function cleanup() {
  console.log('[Hint Extension] Cleaning up existing instance...');
  if (currentRoot) {
    currentRoot.unmount();
    currentRoot = null;
  }
  if (currentContainer && currentContainer.parentNode) {
    currentContainer.parentNode.removeChild(currentContainer);
  }
  currentContainer = null;
  currentTargetElement = null;
}

// 初始化 Content Script
async function init() {
  console.log('[Hint Extension] Initializing content script...');

  // 检查当前 URL 是否在允许列表中
  const allowedUrls = await getAllowedUrls();
  const currentUrl = window.location.href;

  if (!isUrlAllowed(currentUrl, allowedUrls)) {
    console.log('[Hint Extension] Current URL not in allowed list, skipping initialization:', currentUrl);
    return;
  }

  const targetElement = findEditableElement();

  if (!targetElement) {
    console.log('[Hint Extension] No editable element found, skipping initialization');
    return;
  }

  // 如果已经为这个元素初始化了，跳过
  if (currentTargetElement === targetElement && document.body.contains(currentContainer)) {
    console.log('[Hint Extension] Already initialized for this element');
    return;
  }

  // 清理旧实例
  if (currentContainer || currentRoot) {
    cleanup();
  }

  // 查找合适的定位容器
  const positioningElement = findPositioningContainer(targetElement);
  console.log('[Hint Extension] Using positioning element:', positioningElement);

  console.log('[Hint Extension] Creating UI container...');
  // 创建容器
  const container = document.createElement('div');
  container.id = 'hint-extension-root';
  container.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(container);

  // 创建 Shadow Root
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // 注入样式到 Shadow Root
  const style = document.createElement('style');
  style.textContent = cssText;
  shadowRoot.appendChild(style);

  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  console.log('[Hint Extension] Mounting React application...');
  // 挂载 React 应用
  const root = ReactDOM.createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <ContentApp
        targetElement={targetElement}
        positioningElement={positioningElement}
      />
    </React.StrictMode>
  );

  // 保存状态
  currentRoot = root;
  currentContainer = container;
  currentTargetElement = targetElement;

  console.log('[Hint Extension] Content script initialized successfully!');
}

// 检查当前 targetElement 是否还在 DOM 中
function checkTargetElementValidity() {
  if (currentTargetElement && !document.body.contains(currentTargetElement)) {
    console.log('[Hint Extension] Target element removed from DOM, re-initializing...');
    cleanup();
    init();
  }
}

// 监听 DOM 变化
const observer = new MutationObserver(() => {
  // 情况1: 容器被移除了，尝试重新初始化
  const existingRoot = document.getElementById('hint-extension-root');
  if (!existingRoot && findEditableElement()) {
    console.log('[Hint Extension] Container removed, re-initializing...');
    init();
    return;
  }

  // 情况2: 目标元素不在 DOM 中了，尝试重新初始化
  if (currentContainer && document.body.contains(currentContainer)) {
    checkTargetElementValidity();
  }
});

// 页面加载完成后初始化
console.log('[Hint Extension] Content script loaded, readyState:', document.readyState);

if (document.readyState === 'loading') {
  console.log('[Hint Extension] Document still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[Hint Extension] DOMContentLoaded fired');
    setTimeout(init, 500);
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  console.log('[Hint Extension] Document already loaded, initializing now...');
  setTimeout(init, 500);
  observer.observe(document.body, { childList: true, subtree: true });
}

// 定期检查目标元素是否还有效（作为后备机制）
setInterval(() => {
  if (currentTargetElement && currentContainer) {
    checkTargetElementValidity();
  }
}, 2000);
