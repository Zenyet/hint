# Hint - AI Prompt Assistant (Native Implementation)

<div align="center">

**原生浏览器扩展开发 | React + Vite + TailwindCSS**

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/yourusername/hint)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-38bdf8.svg)](https://tailwindcss.com/)

</div>

## 📖 简介

这是 Hint 扩展的**原生实现版本**，不使用任何浏览器扩展框架（如 WXT/Plasmo），而是直接使用：
- ✅ **Vite** - 现代化的构建工具
- ✅ **React 19** - 用户界面
- ✅ **TailwindCSS** - 现代化样式
- ✅ **TypeScript** - 类型安全

### 为什么选择原生开发？

1. **完全控制** - 100% 掌握构建流程和打包过程
2. **更小体积** - 没有框架运行时，打包体积更小
3. **更清晰** - 代码结构一目了然，易于理解和维护
4. **学习价值** - 深入理解浏览器扩展开发原理
5. **高性能** - Vite 的 ESBuild 提供极速构建

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

构建输出在 `dist/` 目录。

### 加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist/` 目录

## 📁 项目结构

```
hint-native/
├── src/
│   ├── background/
│   │   └── index.ts          # Service Worker (后台脚本)
│   ├── popup/
│   │   ├── index.html        # Popup HTML
│   │   ├── index.tsx         # React 入口
│   │   ├── index.css         # TailwindCSS
│   │   └── Popup.tsx         # Popup 组件
│   └── content/
│       ├── index.tsx         # Content Script 入口
│       ├── index.css         # TailwindCSS
│       └── ContentApp.tsx    # 浮动工具栏组件
├── public/
│   ├── manifest.json         # 扩展清单
│   └── assets/               # 图标资源
├── vite.config.ts            # Vite 配置
├── tailwind.config.mjs       # TailwindCSS 配置
├── postcss.config.mjs        # PostCSS 配置
└── tsconfig.json             # TypeScript 配置
```

## ✨ 核心特性

### 1. Background Script (Service Worker)

- ✅ **StorageService** - Chrome Storage API 封装
- ✅ **BackgroundService** - AI 服务管理
- ✅ **OpenAI 集成** - 流式 API 调用
- ✅ **消息通信** - chrome.runtime.onConnect

**文件**: `src/background/index.ts`

### 2. Popup (设置页面)

- ✅ **React Hooks** - 现代化状态管理
- ✅ **TailwindCSS** - 响应式设计
- ✅ **表单管理** - API Key、模型配置
- ✅ **通知系统** - 成功/错误提示
- ✅ **暗色模式** - 自动适配系统主题

**文件**: `src/popup/Popup.tsx`

### 3. Content Script (内容脚本)

- ✅ **Shadow DOM** - 样式隔离
- ✅ **React 组件** - 浮动工具栏
- ✅ **MutationObserver** - 监听 DOM 变化
- ✅ **流式响应** - 实时显示优化结果
- ✅ **文本替换** - 一键应用优化
- ✅ **错误处理** - 完善的异常处理

**文件**: `src/content/ContentApp.tsx`

## 🎯 支持的平台

- ✅ OpenAI (ChatGPT, GPT-4)
- ✅ Claude AI (Anthropic)
- ✅ Google Gemini
- ✅ Tencent Yuanbao (腾讯元宝)
- ✅ DeepSeek Chat
- ✅ xAI Grok

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vite | 7.2.2 | 构建工具 |
| React | 19.2.0 | UI 框架 |
| TailwindCSS | 3.4.18 | 样式框架 |
| TypeScript | 5.9.3 | 类型系统 |
| OpenAI SDK | 4.104.0 | AI API |

## 📊 构建对比

与框架版本的对比：

| 指标 | WXT | Plasmo | Native (本版本) |
|------|-----|--------|----------------|
| **构建工具** | Vite + WXT | Parcel + Plasmo | Vite |
| **构建速度** | ~1.0s | ~1.2s | **~0.8s** ⚡ |
| **打包体积** | ~200KB | ~220KB | **~300KB** |
| **依赖数量** | ~500 | ~700 | **~200** 📦 |
| **灵活性** | ⭐⭐⭐⭐ | ⭐⭐⭐ | **⭐⭐⭐⭐⭐** |
| **学习曲线** | ⭐⭐⭐ | ⭐⭐ | **⭐⭐⭐⭐** |
| **完全控制** | ⭐⭐⭐ | ⭐⭐ | **⭐⭐⭐⭐⭐** |

## 🔧 配置说明

### Vite 配置 (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        background: 'src/background/index.ts',
        content: 'src/content/index.tsx',
      }
    }
  }
})
```

### Manifest V3 (`public/manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "Hint - AI Prompt Assistant",
  "version": "1.0.1",
  "background": {
    "service_worker": "background/index.js",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["*://*.openai.com/*", ...],
    "js": ["content/index.js"]
  }]
}
```

## 📝 开发指南

### 添加新的 AI 网站支持

编辑 `public/manifest.json`:

```json
{
  "content_scripts": [{
    "matches": [
      "*://*.新网站.com/*"
    ]
  }]
}
```

### 修改 Popup 样式

编辑 `src/popup/Popup.tsx`，使用 TailwindCSS 类名。

### 自定义构建流程

编辑 `vite.config.ts`，添加插件或修改配置。

## 🐛 已知问题

1. ⚠️ Content Script 的 CSS 需要手动注入（待优化）
2. ⚠️ 开发模式热重载需要手动刷新扩展

## 🔮 路线图

- [ ] 修复 Content Script CSS 自动注入
- [ ] 添加开发模式热重载
- [ ] 优化打包体积
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 支持 Firefox

## 📚 文档

- [实施历史](./NATIVE_IMPLEMENTATION_HISTORY.md) - 详细的实施过程记录
- [迁移文档](./MIGRATION.md) - 从 WXT/Plasmo 迁移的对比
- [测试指南](./TESTING.md) - 测试方法和清单

## 🤝 贡献

欢迎贡献！请查看贡献指南。

## 📄 许可证

MIT License

## 👨‍💻 作者

- **royzeng**

## 🌟 致谢

- [Vite](https://vitejs.dev/) - 极速的构建工具
- [React](https://react.dev/) - 优秀的 UI 库
- [TailwindCSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [OpenAI](https://openai.com/) - 强大的 AI 能力

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐️！**

Made with ❤️ by royzeng

</div>
