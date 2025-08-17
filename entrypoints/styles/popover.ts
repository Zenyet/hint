const sytle = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.text-popover {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
}

.popover-content {
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', Arial, sans-serif;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.replace-button {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background-color: rgba(0, 122, 255, 0.1);
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: rgb(0, 122, 255);
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.replace-button:hover {
  background-color: rgba(0, 122, 255, 0.15);
}

.replace-button:active {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.button-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.button-text {
  flex-grow: 1;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  color: rgb(0, 122, 255);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.replace-button:disabled {
  cursor: wait;
  opacity: 0.5;
}

.optimized-wrapper {
  padding: 4px 8px;
  background-color: rgba(142, 142, 147, 0.08);
  border-radius: 12px;
  font-size: 13px;
  color: rgb(29, 29, 31);
}

.optimized-wrapper .optimized-text {
  margin: 0;
  height: 100%;
  overflow-y: auto;
  max-width: 300px;
  max-height: 150px;
  line-height: 1.4;
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
}

/* Dark mode styles */
.dark-mode .optimized-wrapper {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgb(255, 255, 255);
}

.dark-mode .popover-content {
  background-color: rgba(28, 28, 30, 0.72);
  border-color: rgba(255, 255, 255, 0.12);
}

.dark-mode .replace-button {
  background-color: rgba(10, 132, 255, 0.15);
  color: rgb(10, 132, 255);
}

.dark-mode .replace-button:hover {
  background-color: rgba(10, 132, 255, 0.25);
}

.dark-mode .replace-button:active {
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.3);
}

.close-button {
  background-color: rgba(255, 59, 48, 0.1);
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgb(255, 59, 48); /* Apple 系统红色 */
}

.close-button:hover {
  background-color: rgba(255, 59, 48, 0.15); /* 红色半透明背景 */
  color: rgb(215, 0, 21); /* 深红色，hover 状态 */
}

.close-button:active {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.3); /* 红色焦点环 */
}

.dark-mode .close-button {
  color: rgb(255, 69, 58); /* 暗色模式下的系统红色 */
}

.dark-mode .close-button:hover {
  background-color: rgba(255, 69, 58, 0.15);
  color: rgb(255, 105, 97); /* 暗色模式下的高亮红色 */
}

.dark-mode .close-button:active {
  box-shadow: 0 0 0 3px rgba(255, 69, 58, 0.3);
}

.none {
  display: none;
}
`;

export default sytle;