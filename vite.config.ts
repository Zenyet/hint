import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
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

        // 为 content script 创建内联样式的 CSS
        const popupCss = resolve(dist, 'assets/popup-CxoiZ0fM.css')
        if (existsSync(popupCss)) {
          const cssContent = readFileSync(popupCss, 'utf-8')
          const contentDir = resolve(dist, 'content')
          if (!existsSync(contentDir)) {
            mkdirSync(contentDir, { recursive: true })
          }
          writeFileSync(resolve(contentDir, 'index.css'), cssContent)
          console.log('✓ Created content/index.css from popup CSS')
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.tsx'),
      },
      output: {
        entryFileNames: '[name]/index.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
