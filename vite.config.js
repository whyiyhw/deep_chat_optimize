import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import path from 'path';
import { readFileSync, copyFileSync, existsSync, mkdirSync, readdir, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';

// 读取 manifest.json
const manifest = JSON.parse(
  readFileSync(path.resolve(__dirname, 'public/manifest.json'), 'utf-8')
);

// https://vitejs.dev/config/
export default defineConfig({
  // 设置基础路径为相对路径，确保所有资源引用为相对路径
  base: './',
  plugins: [
    react(),
    crx({ manifest }),
    {
      name: 'custom-files-plugin',
      closeBundle: async () => {
        try {
          // 确保图像目录存在
          const imagesDir = path.resolve(__dirname, 'dist/images');
          if (!existsSync(imagesDir)) {
            mkdirSync(imagesDir, { recursive: true });
          }
          
          // 复制content.css文件
          copyFileSync(
            path.resolve(__dirname, 'public/content.css'),
            path.resolve(__dirname, 'dist/content.css')
          );
          console.log('Successfully copied content.css to dist directory');
          
          // 复制图标文件
          copyFileSync(
            path.resolve(__dirname, 'public/images/icon16.png'),
            path.resolve(__dirname, 'dist/images/icon16.png')
          );
          copyFileSync(
            path.resolve(__dirname, 'public/images/icon48.png'),
            path.resolve(__dirname, 'dist/images/icon48.png')
          );
          copyFileSync(
            path.resolve(__dirname, 'public/images/icon128.png'),
            path.resolve(__dirname, 'dist/images/icon128.png')
          );
          console.log('Successfully copied icon files to dist/images directory');
          
          // 创建完整的popup.html文件
          const popupHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deep Chat Optimize</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./assets/popup.js"></script>
</body>
</html>
          `.trim();
          
          // 写入到dist/popup.html
          writeFileSync(
            path.resolve(__dirname, 'dist/popup.html'),
            popupHtml
          );
          console.log('Successfully created popup.html');
          
          // 手动处理options.html文件
          const optionsHtmlContent = readFileSync(
            path.resolve(__dirname, 'src/options/index.html'),
            'utf-8'
          );
          
          // 替换JS引用
          const processedOptionsHtml = optionsHtmlContent
            .replace('<script type="module" src="index.js"></script>', 
                   '<script type="module" src="./options.js"></script>');
          
          // 写入到dist/options.html
          writeFileSync(
            path.resolve(__dirname, 'dist/options.html'),
            processedOptionsHtml
          );
          console.log('Successfully processed options.html');
        } catch (err) {
          console.error('Error in custom-files-plugin:', err);
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.jsx'),
        options: path.resolve(__dirname, 'src/options/index.js'),
        background: path.resolve(__dirname, 'src/background/index.js'),
        content: path.resolve(__dirname, 'src/content/index.jsx')
      },
      output: {
        entryFileNames: chunk => {
          return chunk.name === 'background' || chunk.name === 'content' || chunk.name === 'options'
            ? '[name].js'
            : 'assets/[name].js';
        }
      }
    },
  },
  server: {
    port: 3000,
  },
}); 