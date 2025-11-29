import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 如果是demo模式，构建demo页面
  if (mode === 'demo') {
    return {
      base: './', // 使用相对路径，支持GitHub Pages子目录部署
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html')
          },
          output: {
            // 确保资源文件使用相对路径
            assetFileNames: 'assets/[name]-[hash][extname]',
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js'
          }
        },
        sourcemap: true,
        // 确保资源文件被正确复制
        assetsInlineLimit: 0
      },
      server: {
        port: 5173,
        open: true
      }
    };
  }
  
  // 否则构建库
  return {
    base: './', // 配置base路径，支持在子目录部署
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'QRCodeGenerator',
        fileName: (format) => `qrcode-generator.${format}.js`,
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['qrcode'],
        output: {
          globals: {
            qrcode: 'QRCode'
          }
        }
      },
      outDir: 'dist',
      sourcemap: true
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5173,
      open: true
    }
  };
});
