import { QRCodeGenerator, ErrorCorrectionLevel } from '../src';

// 自定义配置示例
async function customOptions() {
  try {
    // 自定义尺寸和容错率
    const result1 = await QRCodeGenerator.generateQRCode('https://example.com', {
      size: 300,
      errorCorrectionLevel: ErrorCorrectionLevel.HIGH
    });
    console.log('Custom size and error correction level:', result1.dataURL);

    // 自定义颜色
    const result2 = await QRCodeGenerator.generateQRCode('https://example.com', {
      color: {
        dark: '#ff0000',
        light: '#ffffff'
      }
    });
    console.log('Custom colors:', result2.dataURL);

    // 自定义边距
    const result3 = await QRCodeGenerator.generateQRCode('https://example.com', {
      margin: 10
    });
    console.log('Custom margin:', result3.dataURL);

    // 综合自定义
    const result4 = await QRCodeGenerator.generateQRCode('https://example.com', {
      size: 400,
      errorCorrectionLevel: ErrorCorrectionLevel.QUARTILE,
      color: {
        dark: '#0000ff',
        light: '#ffff00'
      },
      margin: 5,
      scale: 5
    });
    console.log('Comprehensive custom options:', result4.dataURL);
  } catch (error) {
    console.error('Error generating QR code with custom options:', error);
  }
}

customOptions();
