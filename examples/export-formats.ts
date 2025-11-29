import { QRCodeGenerator } from '../src';

// 导出格式示例
async function exportFormats() {
  try {
    // 导出为PNG
    const pngUrl = await QRCodeGenerator.exportAsPNG('https://example.com', {
      size: 250,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, {
      fileName: 'custom-qrcode.png'
    });
    console.log('PNG exported:', pngUrl);

    // 导出为SVG
    const svgString = await QRCodeGenerator.exportAsSVG('https://example.com', {
      size: 250,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, {
      fileName: 'custom-qrcode.svg'
    });
    console.log('SVG exported:', svgString.substring(0, 100) + '...');

    // 仅获取SVG字符串（不自动下载）
    const svgOnly = await QRCodeGenerator.exportAsSVG('https://example.com', {
      size: 200
    });
    console.log('SVG string obtained:', svgOnly.substring(0, 100) + '...');
  } catch (error) {
    console.error('Error exporting QR code:', error);
  }
}

exportFormats();
