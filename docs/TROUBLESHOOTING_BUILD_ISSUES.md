# Chrome 扩展构建问题排查与解决方案

本文档详细记录了在将 Chrome 扩展从 Plasmo 框架迁移到原生 Vite 构建过程中遇到的关键问题及解决方案。

## 目录

- [问题背景](#问题背景)
- [问题1: ES Module Import 语法错误](#问题1-es-module-import-语法错误)
- [问题2: process is not defined 错误](#问题2-process-is-not-defined-错误)
- [最终解决方案](#最终解决方案)
- [构建配置详解](#构建配置详解)

---

## 问题背景

在使用 Vite 构建原生 Chrome 扩展（Manifest V3）时，遇到了两个主要的运行时错误：

1. **ES Module Import 错误**: `Uncaught SyntaxError: Cannot use import statement outside a module`
2. **process 未定义错误**: `Uncaught ReferenceError: process is not defined`

这些问题阻止了扩展的正常加载和运行。

---

## 问题1: ES Module Import 语法错误

### 错误现象

```
Uncaught SyntaxError: Cannot use import statement outside a module
    at content/index.js:1:1
```

查看构建输出的 `dist/content/index.js` 第一行：
```javascript
import {r as n, j as a, R as E, a as C} from "../chunks/client-BsoQGpRC.js";
```

### 根本原因

**Vite 默认构建行为**:
- Vite 默认使用 **ES module** 格式输出
- 为了优化加载性能，Vite 会进行 **code splitting**（代码分割）
- 生成的代码包含多个 chunk 文件和 `import` 语句来加载这些 chunks

**Chrome 扩展限制**:
1. **Content Scripts** 和 **Service Workers** 默认**不支持 ES modules**
2. 即使在 manifest.json 中添加 `"type": "module"`，外部模块的动态加载在某些情况下仍然有兼容性问题
3. Chrome 期望 content scripts 是 **IIFE**（立即调用函数表达式）格式，不依赖外部模块加载

### 初次尝试的失败方案

#### 尝试1: 添加 `type: "module"` 到 manifest.json

```json
{
  "content_scripts": [{
    "js": ["content/index.js"],
    "type": "module"  // ✗ 添加此字段
  }],
  "background": {
    "service_worker": "background/index.js",
    "type": "module"  // ✗ 添加此字段
  }
}
```

**结果**: Service Worker 可以正常工作，但 content script 仍然报错，因为外部 chunk 加载失败。

#### 尝试2: 添加 `web_accessible_resources`

```json
{
  "web_accessible_resources": [{
    "resources": ["assets/*.js", "chunks/*.js"],
    "matches": ["<all_urls>"]
  }]
}
```

**结果**: 仍然失败。即使 chunk 文件可访问，ES module 的导入机制在 content script 环境中依然不稳定。

### 正确解决方案

**核心思路**: 将所有代码打包成单个 IIFE 格式文件，不使用外部模块导入。

#### 1. 创建独立的构建配置

创建 `vite.content.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,  // 不清空输出目录
    lib: {
      entry: resolve(__dirname, 'src/content/index.tsx'),
      name: 'ContentScript',
      fileName: () => 'content/index.js',
      formats: ['iife']  // ✓ 使用 IIFE 格式
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,  // ✓ 内联所有动态导入
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

创建 `vite.background.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'BackgroundScript',
      fileName: () => 'background/index.js',
      formats: ['iife']  // ✓ 使用 IIFE 格式
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,  // ✓ 内联所有动态导入
      }
    }
  }
})
```

#### 2. 修改主 vite.config.ts

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        // ✓ 移除 background 和 content 的入口
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',  // popup 可以继续使用 ES module
      }
    }
  }
})
```

#### 3. 更新 package.json 构建脚本

```json
{
  "scripts": {
    "build": "tsc && vite build && vite build --config vite.background.config.ts && vite build --config vite.content.config.ts"
  }
}
```

**构建顺序很重要**:
1. `vite build` - 构建 popup（创建 dist 目录，复制 manifest.json）
2. `vite build --config vite.background.config.ts` - 构建 background script（添加到 dist）
3. `vite build --config vite.content.config.ts` - 构建 content script（添加到 dist）

#### 4. 从 manifest.json 移除 `type: "module"`

```json
{
  "content_scripts": [{
    "js": ["content/index.js"]
    // ✓ 不需要 "type": "module"
  }],
  "background": {
    "service_worker": "background/index.js"
    // ✓ 不需要 "type": "module"
  }
}
```

### 验证结果

构建后的 `dist/content/index.js` 第一行变为：

```javascript
(function(){"use strict";function Eb(Z){return Z&&Z.__esModule...
```

✓ 不再有 `import` 语句
✓ 所有代码都在一个 IIFE 中
✓ 文件大小约 599KB（包含所有依赖）

---

## 问题2: process is not defined 错误

### 错误现象

在解决了 ES module 问题后，出现新的错误：

```
Uncaught ReferenceError: process is not defined
    at eE (index.js:18:1736)
```

### 根本原因

**npm 包的 Node.js 依赖**:
- OpenAI SDK 和许多其他 npm 包是为 Node.js 环境设计的
- 这些包在代码中使用了 Node.js 的全局对象，例如：
  - `process.env` - 环境变量
  - `process.version` - Node 版本
  - `process.platform` - 操作系统平台
  - `process.arch` - CPU 架构

**浏览器环境限制**:
- 浏览器环境（包括 Chrome 扩展）**没有** `process` 全局对象
- 当打包的代码尝试访问 `process.env` 时，会抛出 `ReferenceError`

### 初次尝试的失败方案

#### 尝试1: 使用 Vite 的 `define` 配置

```typescript
export default defineConfig({
  define: {
    'process.env': JSON.stringify({}),
    'process.version': JSON.stringify('v16.0.0'),
    // ...
  }
})
```

**结果**: ✗ 失败。在 `lib` 模式下，`define` 配置对某些深层嵌套的 `process` 引用不起作用。

### 正确解决方案

**核心思路**: 在代码执行前，通过 Rollup 的 `banner` 选项注入 process polyfill。

#### 为所有三个脚本添加 polyfill

**vite.background.config.ts**:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        banner: `
(function() {
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = {
      env: {},
      version: 'v16.0.0',
      platform: 'browser',
      arch: 'x64'
    };
  }
})();
        `.trim(),
      }
    }
  }
})
```

**vite.content.config.ts**:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        banner: `
(function() {
  if (typeof globalThis.process === 'undefined') {
    globalThis.process = {
      env: {},
      version: 'v16.0.0',
      platform: 'browser',
      arch: 'x64'
    };
  }
})();
        `.trim(),
      }
    }
  }
})
```

**vite.config.ts** (popup):

也需要添加相同的 banner 配置（如果 popup 中使用了依赖 process 的库）。

### 验证结果

构建后的文件第一行：

```javascript
(function(){typeof globalThis.process>"u"&&(globalThis.process={env:{},version:"v16.0.0",platform:"browser",arch:"x64"})})();(function(){"use strict";...
```

✓ polyfill 在所有代码之前执行
✓ 检查 `globalThis.process` 是否存在，避免重复定义
✓ 提供基本的 process 对象属性

---

## 最终解决方案

### 项目结构

```
hint/
├── src/
│   ├── background/
│   │   └── index.ts
│   ├── content/
│   │   └── index.tsx
│   └── popup/
│       └── index.html
├── public/
│   └── manifest.json
├── vite.config.ts              # 构建 popup
├── vite.background.config.ts   # 构建 background script
├── vite.content.config.ts      # 构建 content script
└── package.json
```

### 构建流程

```bash
pnpm build
```

执行顺序：
1. `tsc` - TypeScript 类型检查
2. `vite build` - 构建 popup (ES modules + code splitting)
3. `vite build --config vite.background.config.ts` - 构建 background (IIFE + process polyfill)
4. `vite build --config vite.content.config.ts` - 构建 content (IIFE + process polyfill)

### 构建输出

```
dist/
├── manifest.json
├── popup/
│   └── index.html
│   └── index.js          (197 KB, ES modules)
├── background/
│   └── index.js          (102 KB, IIFE + polyfill)
├── content/
│   └── index.js          (599 KB, IIFE + polyfill)
├── assets/
│   └── *.png
│   └── *.css
└── chunks/               (popup 的代码分割文件)
    └── *.js
```

---

## 构建配置详解

### 关键配置选项说明

#### 1. `formats: ['iife']`

- **作用**: 指定输出格式为 IIFE（立即调用函数表达式）
- **为什么需要**: Chrome content scripts 需要传统的脚本格式，不能使用 ES modules
- **输出示例**:
  ```javascript
  (function() {
    "use strict";
    // 所有代码在这里
  })();
  ```

#### 2. `inlineDynamicImports: true`

- **作用**: 将所有动态导入的模块内联到单个文件中
- **为什么需要**: 避免生成外部 chunk 文件，确保所有代码在一个文件中
- **注意**: 这会增加文件大小，但对于 Chrome 扩展是必需的

#### 3. `emptyOutDir: false`

- **作用**: 构建时不清空输出目录
- **为什么需要**: 因为我们有三个独立的构建步骤，后面的构建不应该删除前面构建的文件

#### 4. `banner` 配置

- **作用**: 在输出文件顶部添加代码
- **为什么需要**: 在任何其他代码执行前注入 process polyfill
- **执行时机**: 文件加载后立即执行，早于主代码

#### 5. `lib` 模式 vs 普通模式

- **Popup**: 使用普通模式（通过 HTML 入口），支持代码分割
- **Background & Content**: 使用 `lib` 模式（JS 入口），生成库文件

---

## 常见问题

### Q1: 为什么不能对所有脚本使用 ES modules?

**A**: Chrome 扩展的 content scripts 在注入到网页时，运行在一个受限的环境中。虽然 Chrome 在某些情况下支持 ES modules，但：
- 外部模块加载不稳定
- 跨域限制可能导致 chunk 加载失败
- IIFE 格式更兼容，更可靠

### Q2: 为什么文件这么大？

**A**:
- Content script: 599 KB（包含 React、React DOM 和所有 UI 依赖）
- Background script: 102 KB（包含 OpenAI SDK 和所有网络请求依赖）

这是因为 `inlineDynamicImports: true` 将所有依赖打包到单个文件中。可以通过以下方式优化：
- 使用 tree-shaking 移除未使用的代码
- 考虑将共享依赖提取到 web_accessible_resources
- 使用更小的替代库

### Q3: process polyfill 需要提供哪些属性？

**A**: 最基本的属性：
```javascript
{
  env: {},              // 环境变量对象（通常为空）
  version: 'v16.0.0',   // Node 版本字符串
  platform: 'browser',  // 平台标识
  arch: 'x64'          // CPU 架构
}
```

大多数情况下这已经足够。如果遇到其他 `process` 属性的错误，可以根据需要添加。

### Q4: 如何调试构建问题？

**步骤**:
1. 检查构建输出的文件第一行
   ```bash
   head -n 1 dist/content/index.js
   ```
2. 搜索问题关键字
   ```bash
   grep "import " dist/content/index.js
   grep "process\." dist/content/index.js
   ```
3. 检查文件大小和修改时间
   ```bash
   ls -lh dist/content/index.js
   ```
4. 清除浏览器缓存：完全卸载扩展后重新安装

---

## 总结

### 关键要点

1. **Chrome 扩展的脚本需要 IIFE 格式**，不能依赖 ES module 的外部导入
2. **npm 包可能依赖 Node.js 环境**，需要提供 polyfills（如 process）
3. **分离构建配置**，对不同类型的脚本使用不同的打包策略
4. **Banner 注入**是提供全局 polyfill 的最可靠方式

### 最佳实践

1. ✓ 使用独立的 Vite 配置文件
2. ✓ Content/Background 使用 IIFE + inlineDynamicImports
3. ✓ Popup 可以使用 ES modules（通过 HTML 加载）
4. ✓ 在代码顶部注入必要的 polyfills
5. ✓ 构建后验证输出文件格式
6. ✓ 完全卸载后重新加载扩展进行测试

### 参考资源

- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Rollup Output Options](https://rollupjs.org/configuration-options/#output-banner-output-footer)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
