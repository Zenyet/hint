import { defineConfig } from 'vite'
import { resolve } from 'path'

// 单独为 background script 构建的配置
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.DEV': JSON.stringify(mode === 'development'),
  },
    build: {
    outDir: 'dist',
    emptyOutDir: false,  // 不清空输出目录
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'BackgroundScript',
      fileName: () => 'background/index.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true,
        // 将所有依赖都打包进去
        inlineDynamicImports: true,
        // 在代码顶部添加 process polyfill
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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}))
