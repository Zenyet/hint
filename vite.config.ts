import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  define: {
    'import.meta.env.DEV': JSON.stringify(mode === 'development'),
  },
  plugins: [
    react(),
    {
      name: 'copy-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist')

        // 复制 manifest.json
        if (!existsSync(dist)) {
          mkdirSync(dist, { recursive: true })
        }
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(dist, 'manifest.json')
        )

        // 移动 popup HTML 文件到正确位置
        const srcPopupHtml = resolve(dist, 'src/popup/index.html')
        if (existsSync(srcPopupHtml)) {
          const popupDir = resolve(dist, 'popup')
          if (!existsSync(popupDir)) {
            mkdirSync(popupDir, { recursive: true })
          }

          // 读取 HTML 内容并修正路径
          let htmlContent = readFileSync(srcPopupHtml, 'utf-8')
          // 将 ../../ 替换为 ../ (因为文件从 dist/src/popup 移动到 dist/popup)
          htmlContent = htmlContent
            .replace(/\.\.\/\.\.\//g, '../')

          writeFileSync(resolve(popupDir, 'index.html'), htmlContent)
          console.log('✓ Moved popup/index.html to correct location')
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,  // 不清空输出目录，避免删除其他配置生成的文件
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        format: 'es',
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}))
