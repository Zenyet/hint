# Hint - AI Prompt Assistant

<div align="center">

![Hint Logo](./assets/icon.png)

**一个智能的 AI 提示词优化助手**

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/yourusername/hint)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Plasmo](https://img.shields.io/badge/Plasmo-v0.90.5-blueviolet.svg)](https://www.plasmo.com/)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-38bdf8.svg)](https://tailwindcss.com/)

</div>

## 📖 简介

Hint 是一款强大的浏览器扩展，专为优化您与 AI 对话的提示词而设计。它能够智能地改进您的输入，使其更加清晰、准确和有效，从而获得更好的 AI 响应结果。

### ✨ 核心特性

- 🎯 **智能优化**: 实时优化您的提示词，提高 AI 响应质量
- 🌐 **多平台支持**: 兼容多个主流 AI 聊天平台
- 🎨 **现代 UI**: 基于 TailwindCSS 的优雅界面设计
- 🌙 **暗色模式**: 自动适配系统主题
- ⚡ **流式响应**: 实时显示优化结果
- 🔧 **高度可配置**: 支持自定义模型、API 和提示词
- 🚀 **高性能**: 基于 Plasmo 框架，快速且可靠

### 🎯 支持的平台

- ✅ **OpenAI** (ChatGPT, GPT-4, etc.)
- ✅ **Claude AI** (Anthropic)
- ✅ **Google Gemini**
- ✅ **Tencent Yuanbao** (腾讯元宝)
- ✅ **DeepSeek Chat**
- ✅ **xAI Grok**

## 🚀 快速开始

### 安装

#### 从 Chrome Web Store 安装（推荐）
*待发布*

#### 手动安装（开发版）

1. 克隆仓库
```bash
git clone https://github.com/yourusername/hint.git
cd hint
```

2. 安装依赖
```bash
pnpm install
```

3. 构建扩展
```bash
pnpm build
```

4. 加载到浏览器
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `build/chrome-mv3-prod` 目录

### 配置

1. 点击扩展图标打开设置页面
2. 输入您的 API Key（必需）
3. （可选）配置自定义模型接口地址
4. （可选）配置模型名称
5. （可选）自定义提示词模板
6. 点击"保存"

### 使用

1. 访问任意支持的 AI 聊天平台
2. 在输入框中输入您的问题或提示
3. 点击浮动的闪电图标 ⚡
4. 等待 AI 优化您的提示词
5. 点击勾选图标 ✓ 替换原文本，或点击 ✕ 取消

## 🛠️ 技术栈

### 核心技术

- **框架**: [Plasmo](https://www.plasmo.com/) - 现代化的浏览器扩展开发框架
- **UI 库**: [React](https://react.dev/) - 用于构建用户界面的 JavaScript 库
- **样式**: [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **语言**: [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- **AI SDK**: [OpenAI SDK](https://github.com/openai/openai-node) - OpenAI API 客户端

### 项目结构

```
hint/
├── background.ts          # 后台服务脚本
├── popup.tsx             # 弹出设置页面
├── options.tsx           # 选项页面
├── contents/             # 内容脚本
│   ├── index.tsx        # 主要内容脚本
│   └── content.css      # 内容脚本样式
├── assets/              # 静态资源
│   └── icon.png         # 扩展图标
├── style.css            # 全局样式
├── tailwind.config.js   # TailwindCSS 配置
├── postcss.config.js    # PostCSS 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目配置
```

## 💡 开发指南

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 开发模式

启动开发服务器（支持热重载）：

```bash
pnpm dev
```

### 构建

构建生产版本：

```bash
pnpm build
```

### 打包

生成可发布的 ZIP 文件：

```bash
pnpm package
```

### 代码规范

项目使用以下工具确保代码质量：

- **TypeScript**: 类型检查
- **Prettier**: 代码格式化
- **ESLint**: 代码规范检查

## 📚 API 配置

### 默认配置

- **默认 API**: DeepSeek API (`https://api.deepseek.com`)
- **默认模型**: `deepseek-chat`

### 自定义配置

您可以配置任何兼容 OpenAI API 格式的服务：

#### OpenAI
```
API 地址: https://api.openai.com/v1
模型名称: gpt-4 / gpt-3.5-turbo
```

#### Azure OpenAI
```
API 地址: https://YOUR_RESOURCE.openai.azure.com
模型名称: YOUR_DEPLOYMENT_NAME
```

#### 其他兼容服务
任何支持 OpenAI API 格式的服务都可以使用。

## 🎨 界面预览

### 浮动工具栏
当您在支持的网站上聚焦可编辑区域时，会出现一个优雅的浮动工具栏：

- ⚡ **优化按钮**: 点击开始优化提示词
- ⏳ **加载状态**: 显示优化进度
- ✓ **替换按钮**: 应用优化后的文本
- ✕ **取消按钮**: 取消当前操作

### 设置面板
清晰直观的设置界面：

- 🔑 **API Key 管理**: 安全地存储您的 API 密钥
- 🌐 **模型配置**: 自定义 API 端点和模型
- 📝 **提示词模板**: 定制优化逻辑

## 🔒 隐私与安全

- ✅ 所有设置数据仅存储在本地浏览器中
- ✅ API Key 使用 Chrome Storage Sync API 安全存储
- ✅ 不收集任何用户数据
- ✅ 所有网络请求仅发送到您配置的 API 端点
- ✅ 开源代码，完全透明

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请：

1. 查看 [常见问题](./FAQ.md)（如果有）
2. 搜索 [现有 Issues](https://github.com/yourusername/hint/issues)
3. 创建 [新 Issue](https://github.com/yourusername/hint/issues/new)

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)（如果有）。

### 贡献步骤

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🙏 致谢

- [Plasmo](https://www.plasmo.com/) - 出色的浏览器扩展框架
- [OpenAI](https://openai.com/) - 提供强大的 AI 能力
- [TailwindCSS](https://tailwindcss.com/) - 优雅的 CSS 框架
- [React](https://react.dev/) - 强大的 UI 库

## 📊 项目状态

- ✅ **功能完整**: 所有核心功能已实现
- ✅ **稳定性**: 已通过基本测试
- 🚧 **持续改进**: 不断添加新特性和优化

## 🗺️ 路线图

### v1.1.0（计划中）
- [ ] 国际化支持（i18n）
- [ ] 更多 AI 平台支持
- [ ] 提示词模板库
- [ ] 快捷键支持

### v1.2.0（计划中）
- [ ] 使用统计
- [ ] 云同步设置
- [ ] 团队协作功能
- [ ] 提示词历史记录

## 📞 联系方式

- **作者**: royzeng
- **邮箱**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

<div align="center">

**如果这个项目对您有帮助，请给它一个 ⭐️！**

Made with ❤️ by [royzeng](https://github.com/yourusername)

</div>
