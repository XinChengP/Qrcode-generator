import QRCode from 'qrcode';
import { ErrorCorrectionLevel, QRCodeOptions, QRCodeResult, ExportOptions } from './types';

export class QRCodeGenerator {
  private static defaultOptions: QRCodeOptions = {
    size: 200,
    errorCorrectionLevel: ErrorCorrectionLevel.MEDIUM,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    margin: 4,
    scale: 4
  };

  /**
   * 生成二维码
   * @param text 要编码的文本或URL
   * @param options 二维码配置选项
   * @returns Promise<QRCodeResult> 包含Data URL和使用的配置选项
   */
  public static async generateQRCode(text: string, options: QRCodeOptions = {}): Promise<QRCodeResult> {
    if (!text || text.trim() === '') {
      throw new Error('Text cannot be empty');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    const size = mergedOptions.size || 200;

    // 创建临时Canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    try {
      // 渲染二维码到Canvas
      await this.renderToCanvas(text, canvas, mergedOptions);
      
      // 转换为DataURL
      const dataURL = canvas.toDataURL('image/png');
      return {
        dataURL,
        options: mergedOptions
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 导出二维码为PNG格式
   * @param text 要编码的文本或URL
   * @param options 二维码配置选项
   * @param exportOptions 导出配置选项
   * @returns Promise<string> 下载链接
   */
  public static async exportAsPNG(text: string, options: QRCodeOptions = {}, exportOptions: ExportOptions = {}): Promise<string> {
    const result = await this.generateQRCode(text, { ...options });
    return this.downloadFile(result.dataURL, exportOptions.fileName || 'qrcode.png');
  }

  /**
   * 导出二维码为SVG格式
   * @param text 要编码的文本或URL
   * @param options 二维码配置选项
   * @param exportOptions 导出配置选项
   * @returns Promise<string> SVG字符串
   */
  public static async exportAsSVG(text: string, options: QRCodeOptions = {}, exportOptions: ExportOptions = {}): Promise<string> {
    if (!text || text.trim() === '') {
      throw new Error('Text cannot be empty');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    const qrcodeOptions: QRCode.QRCodeToStringOptions = {
      type: 'svg',
      width: mergedOptions.size || 200,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel || ErrorCorrectionLevel.MEDIUM,
      color: mergedOptions.color || { dark: '#000000', light: '#ffffff' },
      margin: mergedOptions.margin || 4,
      scale: mergedOptions.scale || 4
    };

    try {
      const svg = await QRCode.toString(text, qrcodeOptions);
      
      if (exportOptions.fileName) {
        this.downloadFile(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, exportOptions.fileName || 'qrcode.svg');
      }
      
      return svg;
    } catch (error) {
      throw new Error(`Failed to generate SVG QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取二维码的Data URL
   * @param text 要编码的文本或URL
   * @param options 二维码配置选项
   * @returns Promise<string> Data URL
   */
  public static async getQRCodeDataURL(text: string, options: QRCodeOptions = {}): Promise<string> {
    const result = await this.generateQRCode(text, options);
    return result.dataURL;
  }

  /**
   * 下载文件
   * @param dataURL Data URL
   * @param fileName 文件名
   * @returns string 下载链接
   */
  private static downloadFile(dataURL: string, fileName: string): string {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return dataURL;
  }

  /**
   * 将二维码渲染到Canvas元素
   * @param text 要编码的文本或URL
   * @param canvas Canvas元素
   * @param options 二维码配置选项
   * @returns Promise<void>
   */
  public static async renderToCanvas(text: string, canvas: HTMLCanvasElement, options: QRCodeOptions = {}): Promise<void> {
    if (!text || text.trim() === '') {
      throw new Error('Text cannot be empty');
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas element');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };

    const qrcodeOptions = {
      width: mergedOptions.size || 200,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel || ErrorCorrectionLevel.MEDIUM,
      color: mergedOptions.color || { dark: '#000000', light: '#ffffff' },
      margin: mergedOptions.margin || 4,
      scale: mergedOptions.scale || 4
    };

    try {
      // 生成原始二维码
      await QRCode.toCanvas(canvas, text, qrcodeOptions);
      
      // 应用样式定制
      this.applyStyleCustomization(canvas, mergedOptions);
      
      // 如果有Logo，添加到二维码中心
      if (mergedOptions.logo && mergedOptions.logo.src) {
        try {
          await this.addLogoToCanvas(canvas, mergedOptions.logo as { src: string; size?: number });
        } catch (logoError) {
          // Logo加载失败时，继续生成没有Logo的二维码
          console.warn('Failed to add logo to QR code:', logoError);
        }
      }
    } catch (error) {
      throw new Error(`Failed to render QR code to canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 应用样式定制
   * @param canvas Canvas元素
   * @param options 二维码配置选项
   */
  private static applyStyleCustomization(canvas: HTMLCanvasElement, options: QRCodeOptions): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    
    // 创建临时Canvas用于处理
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      return;
    }
    
    // 将原始二维码复制到临时Canvas
    tempCtx.drawImage(canvas, 0, 0);
    
    // 清除原始Canvas
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    this.drawBackground(ctx, width, height, options);
    
    // 根据形状选项处理二维码
    if (options.shape === 'rounded' || options.shape === 'circle' || options.cornerRadius) {
      this.drawCustomShape(ctx, tempCanvas, width, height, options);
    } else {
      // 直接绘制原始二维码
      ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  /**
   * 绘制背景
   * @param ctx Canvas上下文
   * @param width 宽度
   * @param height 高度
   * @param options 二维码配置选项
   */
  private static drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, options: QRCodeOptions): void {
    if (options.color?.gradient) {
      // 绘制渐变背景
      const gradient = options.color.gradient.type === 'radial' 
        ? ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
        : ctx.createLinearGradient(0, 0, width, height);
      
      options.color.gradient.colors?.forEach((color, index) => {
        gradient.addColorStop(index / (options.color?.gradient?.colors?.length || 1 - 1), color);
      });
      
      ctx.fillStyle = gradient;
    } else {
      // 绘制纯色背景
      ctx.fillStyle = options.color?.light || '#ffffff';
    }
    
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * 绘制自定义形状的二维码
   * @param ctx Canvas上下文
   * @param tempCanvas 临时Canvas
   * @param width 宽度
   * @param height 高度
   * @param options 二维码配置选项
   */
  private static drawCustomShape(ctx: CanvasRenderingContext2D, tempCanvas: HTMLCanvasElement, width: number, height: number, options: QRCodeOptions): void {
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      return;
    }
    
    // 获取原始二维码的图像数据
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 计算每个模块的大小
    const moduleSize = Math.ceil(width / 40); // 假设最大版本为40
    
    // 设置前景色
    if (options.color?.gradient) {
      // 绘制渐变前景
      const gradient = options.color.gradient.type === 'radial' 
        ? ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
        : ctx.createLinearGradient(0, 0, width, height);
      
      options.color.gradient.colors?.forEach((color, index) => {
        gradient.addColorStop(index / (options.color?.gradient?.colors?.length || 1 - 1), color);
      });
      
      ctx.fillStyle = gradient;
    } else {
      // 绘制纯色前景
      ctx.fillStyle = options.color?.dark || '#000000';
    }
    
    // 遍历每个模块，根据形状绘制
    for (let y = 0; y < height; y += moduleSize) {
      for (let x = 0; x < width; x += moduleSize) {
        // 检查该模块是否为深色
        const isDark = this.isModuleDark(data, x, y, width, moduleSize);
        if (isDark) {
          // 根据形状绘制模块
          const radius = options.cornerRadius || (options.shape === 'circle' ? moduleSize / 2 : moduleSize / 4);
          
          switch (options.shape) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, 0, Math.PI * 2);
              ctx.fill();
              break;
            case 'rounded':
            default:
              ctx.beginPath();
              ctx.roundRect(x, y, moduleSize, moduleSize, radius);
              ctx.fill();
              break;
          }
        }
      }
    }
  }

  /**
   * 检查模块是否为深色
   * @param data 图像数据
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param moduleSize 模块大小
   * @returns 是否为深色
   */
  private static isModuleDark(data: Uint8ClampedArray, x: number, y: number, width: number, moduleSize: number): boolean {
    // 检查模块中心像素
    const centerX = Math.min(x + Math.floor(moduleSize / 2), width - 1);
    const centerY = Math.min(y + Math.floor(moduleSize / 2), width - 1);
    const index = (centerY * width + centerX) * 4;
    
    // 检查RGB值是否接近黑色
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    
    // 如果RGB值都小于128，则认为是深色
    return r < 128 && g < 128 && b < 128;
  }

  /**
   * 向Canvas添加Logo
   * @param canvas Canvas元素
   * @param logo Logo配置
   * @returns Promise<void>
   */
  private static async addLogoToCanvas(canvas: HTMLCanvasElement, logo: { src: string; size?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvasSize = canvas.width;
          const logoSize = logo.size || canvasSize * 0.2;
          const logoX = (canvasSize - logoSize) / 2;
          const logoY = (canvasSize - logoSize) / 2;

          // 绘制白色背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // 绘制Logo
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        reject(new Error('Failed to load logo image'));
      };
      img.src = logo.src;
    });
  }
}
