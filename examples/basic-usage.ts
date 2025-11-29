import { QRCodeGenerator } from '../src';

// 基本使用示例
async function basicUsage() {
  try {
    // 生成基本二维码
    const result = await QRCodeGenerator.generateQRCode('https://example.com');
    console.log('Basic QR Code generated:', result.dataURL);

    // 获取Data URL
    const dataURL = await QRCodeGenerator.getQRCodeDataURL('https://example.com');
    console.log('QR Code Data URL:', dataURL);

    // 渲染到Canvas（如果在浏览器环境中）
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      await QRCodeGenerator.renderToCanvas('https://example.com', canvas);
      document.body.appendChild(canvas);
      console.log('QR Code rendered to canvas');
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

basicUsage();
