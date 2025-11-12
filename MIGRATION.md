# Hint 插件迁移文档

## 项目概述

本文档详细记录了将 Hint 浏览器扩展从 WXT 框架迁移到 Plasmo 框架，并集成 TailwindCSS 的完整过程。

## 迁移背景

### 原技术栈
- **框架**: WXT v0.20.0
- **语言**: TypeScript
- **样式**: 原生 CSS
- **构建工具**: WXT 内置构建系统

### 新技术栈
- **框架**: Plasmo v0.90.5
- **UI 库**: React 19.2.0
- **样式**: TailwindCSS v3.4.18
- **语言**: TypeScript 5.8.3
- **构建工具**: Plasmo 内置构建系统

## 迁移目标

1. 保持原有功能完全不变
2. 使用 Plasmo 框架提高开发效率
3. 使用 TailwindCSS 实现现代化的 UI
4. 改进代码结构和可维护性
5. 支持 Chrome MV3 规范

## 详细迁移步骤

### 1. 项目初始化与依赖安装

#### 1.1 安装 Plasmo 框架
```bash
pnpm add -D plasmo @plasmohq/prettier-plugin-sort-imports prettier @types/chrome @types/node typescript
```

#### 1.2 安装 TailwindCSS
```bash
pnpm add -D tailwindcss@^3 postcss autoprefixer
```

#### 1.3 安装 React 依赖
```bash
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom
```

#### 1.4 安装业务依赖
```bash
pnpm add @plasmohq/messaging openai
```

### 2. 配置文件更新

#### 2.1 更新 package.json

**修改前 (WXT)**:
```json
{
  "name": "wxt-starter",
  "scripts": {
    "dev": "wxt",
    "build": "wxt build"
  }
}
```

**修改后 (Plasmo)**:
```json
{
  "name": "hint",
  "displayName": "Hint - AI Prompt Assistant",
  "version": "1.0.1",
  "description": "An AI assistant for writing prompts",
  "scripts": {
    "dev": "plasmo dev",
    "build": "plasmo build",
    "package": "plasmo package"
  },
  "manifest": {
    "host_permissions": ["https://*/*"],
    "permissions": ["storage"]
  }
}
```

#### 2.2 创建 TailwindCSS 配置

**tailwind.config.js**:
```javascript
module.exports = {
  content: [
    "./popup.tsx",
    "./options.tsx",
    "./contents/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'media',
}
```

**postcss.config.js**:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 2.3 更新 TypeScript 配置

**修改前 (WXT)**:
```json
{
  "extends": "./.wxt/tsconfig.json"
}
```

**修改后 (Plasmo)**:
```json
{
  "extends": "plasmo/templates/tsconfig.base",
  "compilerOptions": {
    "paths": {
      "~*": ["./*"]
    },
    "baseUrl": "."
  }
}
```

### 3. 代码迁移

#### 3.1 Background Script 迁移

**原文件位置**: `entrypoints/background.ts`
**新文件位置**: `background.ts`

**主要变化**:
1. 移除 WXT 的 `defineBackground` 包装器
2. 直接使用 Chrome Extension API
3. 保持原有的 BackgroundService 和 StorageService 逻辑不变

**关键代码片段**:
```typescript
// 直接监听 Chrome runtime 事件
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (request) => {
    if (request.type === "OPTIMIZE_TEXT") {
      await backgroundService.optimizeText(request, (response) => {
        port.postMessage(response);
      });
    }
  });
});
```

#### 3.2 Popup 页面迁移

**原文件**: `entrypoints/popup/` (HTML + TypeScript + CSS)
**新文件**: `popup.tsx` (React + TailwindCSS)

**主要变化**:
1. 从原生 HTML/JS 转换为 React 组件
2. 使用 React Hooks 管理状态
3. 使用 TailwindCSS 替代原生 CSS
4. 改进 UI/UX 设计

**迁移对比**:

```typescript
// 原实现 (WXT - 原生 DOM 操作)
class Settings {
  private apiKeyInput: HTMLInputElement;

  constructor() {
    this.apiKeyInput = document.querySelector('.api-key-input');
    this.saveButton.addEventListener('click', () => {
      const apiKey = this.apiKeyInput.value;
      await StorageService.setApiKey(apiKey);
    });
  }
}

// 新实现 (Plasmo - React)
function IndexPopup() {
  const [apiKey, setApiKey] = useState("");

  const saveSettings = async () => {
    await chrome.storage.sync.set({ api_key: apiKey });
    showNotification("设置已保存", "success");
  };

  return (
    <div className="w-[400px] p-6">
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
      <button onClick={saveSettings}>保存</button>
    </div>
  );
}
```

#### 3.3 Content Script 迁移

**原文件**: `entrypoints/content.ts` + `entrypoints/components/Popover.ts`
**新文件**: `contents/index.tsx`

**主要变化**:
1. 将原有的 class-based 组件转换为 React 函数组件
2. 使用 React Hooks 替代原生事件监听
3. 使用 TailwindCSS 替代内联样式
4. 改进响应式定位逻辑

**Plasmo Content Script 配置**:
```typescript
export const config: PlasmoCSConfig = {
  matches: [
    "*://*.openai.com/*",
    "*://*.chatgpt.com/*",
    "*://*.claude.ai/*",
    "*://*.yuanbao.tencent.com/*",
    "*://*.gemini.google.com/*",
    "*://*.chat.deepseek.com/*",
    "*://*.grok.com/*"
  ]
}

// 样式注入
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}
```

**组件架构**:
```
ContentScript (主组件)
├── 监听 DOM 变化
├── 查找可编辑元素
└── Popover (浮动工具栏)
    ├── 优化按钮
    ├── 替换按钮
    ├── 关闭按钮
    └── AIService (AI 服务)
```

### 4. 功能保持

所有原有功能均已保持：

1. **✅ 多 AI 网站支持**
   - OpenAI / ChatGPT
   - Claude AI
   - Google Gemini
   - Tencent Yuanbao
   - DeepSeek Chat
   - Grok

2. **✅ 提示词优化功能**
   - 实时流式响应
   - 文本替换
   - 错误处理
   - 请求中断

3. **✅ 设置管理**
   - API Key 配置
   - 自定义模型 URL
   - 自定义模型名称
   - 自定义提示词

4. **✅ UI/UX 特性**
   - 暗色模式支持
   - 响应式定位
   - 加载状态显示
   - 错误提示

### 5. 目录结构对比

#### 原目录结构 (WXT)
```
hint/
├── entrypoints/
│   ├── background.ts
│   ├── content.ts
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── style.css
│   ├── components/
│   │   ├── Popover.ts
│   │   └── Settings.ts
│   ├── services/
│   │   ├── AIService.ts
│   │   └── StorageService.ts
│   └── utils/
│       └── DOMManager.ts
├── wxt.config.ts
└── package.json
```

#### 新目录结构 (Plasmo)
```
hint/
├── background.ts           # 背景脚本
├── popup.tsx              # 弹出页面 (React)
├── options.tsx            # 选项页面 (可选)
├── contents/              # 内容脚本
│   ├── index.tsx
│   └── content.css
├── assets/                # 静态资源
│   └── icon.png
├── style.css              # 全局样式
├── tailwind.config.js     # TailwindCSS 配置
├── postcss.config.js      # PostCSS 配置
├── tsconfig.json          # TypeScript 配置
└── package.json
```

### 6. 构建与部署

#### 开发环境
```bash
pnpm dev
```

#### 生产构建
```bash
pnpm build
```

构建输出位置: `build/chrome-mv3-prod/`

#### 打包发布
```bash
pnpm package
```

### 7. 遇到的问题与解决方案

#### 问题 1: TailwindCSS v4 PostCSS 兼容性
**错误**: `tailwindcss` 不能直接作为 PostCSS 插件使用

**解决方案**: 降级到 TailwindCSS v3
```bash
pnpm add -D tailwindcss@^3
```

#### 问题 2: TypeScript 配置冲突
**错误**: `extends: "./.wxt/tsconfig.json"` 找不到

**解决方案**: 更新为 Plasmo 的 TypeScript 配置
```json
{
  "extends": "plasmo/templates/tsconfig.base"
}
```

#### 问题 3: CSS 导入路径
**错误**: Content script 中直接导入 CSS 失败

**解决方案**: 使用 Plasmo 的 `data-text:` 导入和 `getStyle` 导出
```typescript
import styleText from "data-text:~/style.css"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}
```

#### 问题 4: 图标文件缺失
**错误**: `No icon found in assets directory`

**解决方案**: 将图标文件复制到 assets 目录
```bash
cp public/icon/128.png assets/icon.png
```

#### 问题 5: Options 页面缺失
**错误**: `ENOENT: no such file or directory, open 'options.tsx'`

**解决方案**: 创建占位符 options.tsx 文件
```typescript
function OptionsIndex() {
  return <div>Please use popup for settings</div>
}
export default OptionsIndex
```

#### 问题 6: Content Script 样式未正确注入
**错误**: 浮动工具栏没有在页面上显示

**原因**: 使用 `data-text:` 导入样式时，TailwindCSS 样式没有被正确编译

**解决方案**:
1. 创建独立的 CSS 文件 `contents/index.css`
2. 使用常规 import 导入: `import "./index.css"`
3. 配置 Shadow DOM 和 Inline Anchor:
```typescript
// 使用 Shadow DOM 隔离样式
export const getShadowHostId = () => "hint-popover-shadow-host"

// 将 UI 注入到 body，使用固定定位
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.body,
  insertPosition: "afterbegin"
})
```

4. 添加自定义容器样式确保正确定位:
```css
#hint-popover-shadow-host {
  position: fixed !important;
  z-index: 2147483647 !important;
  pointer-events: none !important;
}
```

### 8. 性能优化

1. **代码分割**: Plasmo 自动处理代码分割
2. **懒加载**: React 组件按需加载
3. **样式优化**: TailwindCSS 自动清除未使用的样式
4. **构建优化**: Plasmo 内置生产环境优化

### 9. 测试建议

#### 功能测试清单
- [ ] 在所有支持的 AI 网站上测试浮动按钮显示
- [ ] 测试文本优化功能
- [ ] 测试文本替换功能
- [ ] 测试请求中断功能
- [ ] 测试设置保存和加载
- [ ] 测试暗色模式切换
- [ ] 测试错误处理

#### 浏览器兼容性测试
- [ ] Chrome (推荐)
- [ ] Edge
- [ ] Brave
- [ ] 其他 Chromium 浏览器

### 10. 未来改进建议

1. **国际化 (i18n)**: 添加多语言支持
2. **更多 AI 模型**: 支持更多 AI 服务提供商
3. **提示词模板**: 预设常用提示词模板
4. **快捷键**: 添加键盘快捷键支持
5. **统计分析**: 添加使用统计功能
6. **云同步**: 跨设备同步设置

## 总结

本次迁移成功将 Hint 插件从 WXT 框架迁移到 Plasmo 框架，并集成了 TailwindCSS，同时保持了所有原有功能。新的技术栈提供了：

1. 更好的开发体验（React + Hooks）
2. 更现代的 UI（TailwindCSS）
3. 更好的类型安全（TypeScript）
4. 更简洁的代码结构
5. 更好的可维护性

迁移过程中没有丢失任何原有功能，并且为未来的功能扩展奠定了良好的基础。
