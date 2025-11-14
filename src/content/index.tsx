import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import cssText from './index.css?inline';

// 全局变量保存当前状态
let currentRoot: ReactDOM.Root | null = null;
let currentContainer: HTMLElement | null = null;
let currentTargetElement: HTMLElement | null = null;

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
function init() {
  console.log('[Hint Extension] Initializing content script...');
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
      <ContentApp targetElement={targetElement} />
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
