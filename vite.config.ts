import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // 如果是demo模式，构建demo页面
  if (mode === 'demo') {
    return {
      base: './',
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            main: resolve(__dirname, 'index.html')
          }
        },
        sourcemap: true
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
