import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentApp from './ContentApp';
import './index.css';

// 查找可编辑元素
function findEditableElement(): HTMLElement | null {
  return (
    (document.querySelector('[contenteditable="true"]') as HTMLElement) ||
    (document.querySelector('textarea') as HTMLElement)
  );
}

// 初始化 Content Script
function init() {
  const targetElement = findEditableElement();
  if (!targetElement) return;

  // 创建容器
  const container = document.createElement('div');
  container.id = 'hint-extension-root';
  container.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(container);

  // 创建 Shadow Root
  const shadowRoot = container.attachShadow({ mode: 'open' });
  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);

  // 挂载 React 应用
  const root = ReactDOM.createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <ContentApp targetElement={targetElement} />
    </React.StrictMode>
  );
}

// 监听 DOM 变化
const observer = new MutationObserver(() => {
  const existingRoot = document.getElementById('hint-extension-root');
  if (!existingRoot && findEditableElement()) {
    init();
  }
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 500);
    observer.observe(document.body, { childList: true, subtree: true });
  });
} else {
  setTimeout(init, 500);
  observer.observe(document.body, { childList: true, subtree: true });
}
