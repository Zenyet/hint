import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import cssText from './index.css?inline';

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

// 初始化 Content Script
function init() {
  console.log('[Hint Extension] Initializing content script...');
  const targetElement = findEditableElement();
  if (!targetElement) {
    console.log('[Hint Extension] No editable element found, skipping initialization');
    return;
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
  console.log('[Hint Extension] Content script initialized successfully!');
}

// 监听 DOM 变化
const observer = new MutationObserver(() => {
  const existingRoot = document.getElementById('hint-extension-root');
  if (!existingRoot && findEditableElement()) {
    init();
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
