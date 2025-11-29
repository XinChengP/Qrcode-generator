import QRCode from 'qrcode';
import { ErrorCorrectionLevel, QRCodeOptions, QRCodeResult, ExportOptions } from './types';

export class QRCodeGenerator {
  // 智能优化二维码颜色配置
  private static optimizeColorsForQRCode(options: QRCodeOptions): QRCodeOptions {
    // 如果用户关闭了智能优化，直接返回原配置
    if (options.smartGradient === false) {
      return options;
    }
    
    const optimized = { ...options };
    
    // 优化深色模块颜色
    if (optimized.color?.dark) {
      const darkLuminance = this.getLuminance(optimized.color.dark);
      const whiteLuminance = this.getLuminance('#ffffff');
      const contrastRatio = this.getContrastRatio(darkLuminance, whiteLuminance);
      
      // 如果对比度不足，调整深色颜色
      if (contrastRatio < 4.5) {
        optimized.color.dark = this.adjustColorForContrast(
          optimized.color.dark, 
          whiteLuminance, 
          4.5, 
          true
        );
      }
    }

    // 优化浅色模块颜色
    if (optimized.color?.light) {
      const lightLuminance = this.getLuminance(optimized.color.light);
      const whiteLuminance = this.getLuminance('#ffffff');
      const contrastRatio = this.getContrastRatio(lightLuminance, whiteLuminance);
      
      // 浅色模块与背景对比度应该较低（但不能完全相同）
      if (contrastRatio > 1.2) {
        optimized.color.light = this.adjustColorForContrast(
          optimized.color.light, 
          whiteLuminance, 
          1.1, 
          false
        );
      }
    }

    // 删除渐变颜色优化逻辑

    return optimized;
  }



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

    // 清理缓存，确保每次生成都是最新的
    this.moduleDarkCache.clear();

    // 智能优化颜色配置以提高二维码清晰度
    const optimizedOptions = this.optimizeColorsForQRCode({ ...this.defaultOptions, ...options });
    const mergedOptions = optimizedOptions;
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
    
    // 根据复杂度应用不同的视觉效果
    this.applyComplexityEffects(ctx, tempCanvas, options);
    
    // 根据形状选项处理二维码
    if (options.shape === 'rounded' || options.shape === 'circle' || options.cornerRadius) {
      this.processAndDrawCustomShapes(ctx, tempCanvas, width, height, options);
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
   * 应用复杂度效果
   * @param ctx Canvas上下文
   * @param tempCanvas 临时Canvas
   * @param options 二维码配置选项
   */
  private static applyComplexityEffects(ctx: CanvasRenderingContext2D, tempCanvas: HTMLCanvasElement, options: QRCodeOptions): void {
    const complexity = options.complexity || 5;
    const width = tempCanvas.width;
    const height = tempCanvas.height;
    
    // 根据复杂度应用不同的视觉效果
    if (complexity <= 2) {
      // 极简模式 - 减少细节，简化二维码
      ctx.imageSmoothingEnabled = false;
      ctx.filter = 'contrast(120%) brightness(110%)';
    } else if (complexity <= 4) {
      // 简单模式 - 轻微增强
      ctx.imageSmoothingEnabled = true;
      ctx.filter = 'contrast(110%) brightness(105%)';
    } else if (complexity <= 6) {
      // 标准模式 - 默认效果
      ctx.imageSmoothingEnabled = true;
      ctx.filter = 'none';
    } else if (complexity <= 8) {
      // 复杂模式 - 增强细节
      ctx.imageSmoothingEnabled = true;
      ctx.filter = 'contrast(105%) brightness(102%) sharpen(0.5)';
    } else {
      // 极致模式 - 最丰富的视觉效果
      ctx.imageSmoothingEnabled = true;
      ctx.filter = 'contrast(102%) brightness(101%) sharpen(1)';
      
      // 添加微妙的阴影效果
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = width;
      shadowCanvas.height = height;
      const shadowCtx = shadowCanvas.getContext('2d');
      if (shadowCtx) {
        shadowCtx.filter = 'blur(1px)';
        shadowCtx.globalAlpha = 0.3;
        shadowCtx.drawImage(tempCanvas, 2, 2);
        ctx.globalAlpha = 0.1;
        ctx.drawImage(shadowCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }
    }
  }

  /**
   * 绘制自定义形状的二维码
   * @param ctx Canvas上下文
   * @param tempCanvas 临时Canvas
   * @param width 宽度
   * @param height 高度
   * @param options 二维码配置选项
   */


  // 计算颜色的亮度值
  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    // 使用WCAG的相对亮度公式
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // 计算两个颜色之间的对比度比率
  private static getContrastRatio(luminance1: number, luminance2: number): number {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // 十六进制颜色转RGB
  private static hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // RGB转十六进制颜色
  private static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // 调整颜色以获得指定对比度
  private static adjustColorForContrast(color: string, bgLuminance: number, targetRatio: number, makeDarker: boolean): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return makeDarker ? '#000000' : '#ffffff';

    let r = rgb.r, g = rgb.g, b = rgb.b;
    const factor = makeDarker ? 0.9 : 1.1; // 调整因子

    for (let i = 0; i < 20; i++) { // 最多迭代20次
      const currentLuminance = this.getLuminance(this.rgbToHex(Math.round(r), Math.round(g), Math.round(b)));
      const currentRatio = this.getContrastRatio(currentLuminance, bgLuminance);
      
      if (currentRatio >= targetRatio) {
        break;
      }

      if (makeDarker) {
        r *= factor; g *= factor; b *= factor;
        r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
      } else {
        r = Math.min(255, r / factor); g = Math.min(255, g / factor); b = Math.min(255, b / factor);
      }
    }

    return this.rgbToHex(Math.round(r), Math.round(g), Math.round(b));
  }

  // 加深颜色
  private static darkenColor(color: string, amount: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    return this.rgbToHex(
      Math.round(rgb.r * (1 - amount)),
      Math.round(rgb.g * (1 - amount)),
      Math.round(rgb.b * (1 - amount))
    );
  }

  /**
   * 处理二维码图像数据并绘制自定义形状模块 - 优化版本
   * @param ctx Canvas上下文
   * @param tempCanvas 临时Canvas元素
   * @param width 宽度
   * @param height 高度
   * @param options 配置选项
   */
  private static processAndDrawCustomShapes(ctx: CanvasRenderingContext2D, tempCanvas: HTMLCanvasElement, width: number, height: number, options: QRCodeOptions): void {
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      return;
    }
    
    // 获取原始二维码的图像数据
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 计算每个模块的大小 - 使用更精确的计算方法
    const moduleSize = Math.max(1, Math.ceil(width / 40)); // 确保最小为1px
    const actualModuleSize = Math.min(moduleSize, Math.ceil(height / 40));
    
    // 模块大小和间距
    const moduleScale = options.moduleSize || 100; // 百分比
    const moduleSpacing = options.moduleSpacing || 0;
    const scaledSize = actualModuleSize * (moduleScale / 100);
    const spacingOffset = (actualModuleSize - scaledSize) / 2 + moduleSpacing / 2;
    
    // 预计算和缓存常用值
    const shape = options.shape || 'square';
    const color = options.color?.dark || '#000000';
    const cornerRadius = options.cornerRadius;
    const gradient = options.color?.gradient ? { colors: options.color.gradient.colors || [] } : undefined;
    const randomness = options.randomness;
    
    // 批量处理：先收集所有深色模块的位置
    const darkModules: Array<{x: number, y: number, index: number}> = [];
    let moduleIndex = 0;
    
    for (let y = 0; y < height; y += actualModuleSize) {
      for (let x = 0; x < width; x += actualModuleSize) {
        // 检查该模块是否为深色
        const isDark = this.isModuleDark(data, x, y, width, height, actualModuleSize);
        if (isDark) {
          darkModules.push({x, y, index: moduleIndex++});
        }
      }
    }
    
    // 检查是否启用动画
    if (options.animation?.enabled) {
      // 动画模式：逐个模块绘制，应用动画效果
      this.drawWithAnimation(ctx, darkModules, shape, scaledSize, spacingOffset, color, cornerRadius, gradient, randomness, options.animation);
    } else {
      // 静态模式：批量绘制相同形状 - 减少状态切换
      if (darkModules.length > 0) {
        // 预设置颜色和渐变
        if (gradient && gradient.colors.length > 0) {
          // 对于渐变，需要为每个模块单独处理
          darkModules.forEach(module => {
            const finalX = module.x + spacingOffset;
            const finalY = module.y + spacingOffset;
            this.drawCustomShapeOptimized(ctx, shape, finalX, finalY, scaledSize, color, cornerRadius, gradient, randomness);
          });
        } else {
          // 对于纯色，可以批量处理
          ctx.save();
          ctx.fillStyle = color;
          
          // 根据形状类型进行批量绘制
          this.batchDrawShapes(ctx, shape, darkModules, spacingOffset, scaledSize, cornerRadius);
          
          ctx.restore();
        }
      }
    }
  }

  /**
   * 绘制自定义形状模块
   * @param ctx Canvas上下文
   * @param shape 形状
   * @param x X坐标
   * @param y Y坐标
   * @param size 大小
   * @param color 颜色
   * @param cornerRadius 圆角半径
   * @param gradient 渐变配置
   * @param randomness 随机性
   */
  private static drawCustomShape(
    ctx: CanvasRenderingContext2D,
    shape: string,
    x: number,
    y: number,
    size: number,
    color: string,
    cornerRadius?: number,
    gradient?: { colors: string[]; direction?: number },
    randomness?: number
  ): void {
    // 保存当前状态
    ctx.save();
    
    // 应用随机变换
    if (randomness && randomness > 0) {
      const randomOffset = (Math.random() - 0.5) * randomness;
      const randomRotation = (Math.random() - 0.5) * randomness * 0.1;
      ctx.translate(x + size / 2 + randomOffset, y + size / 2 + randomOffset);
      ctx.rotate(randomRotation);
      ctx.translate(-size / 2, -size / 2);
    } else {
      ctx.translate(x, y);
    }
    
    // 设置颜色
    if (gradient && gradient.colors.length > 0) {
      const gradientObj = ctx.createLinearGradient(0, 0, size, size);
      gradient.colors.forEach((color, i) => {
        gradientObj.addColorStop(i / (gradient.colors.length - 1), color);
      });
      ctx.fillStyle = gradientObj;
    } else {
      ctx.fillStyle = color;
    }
    
    // 根据形状绘制
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'rounded':
        const radius = cornerRadius || size * 0.2;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.fill();
        break;
        
      case 'star':
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = size * 0.4;
        const innerRadius = size * 0.2;
        this.drawStar(ctx, centerX, centerY, outerRadius, innerRadius, 5);
        ctx.fill();
        break;
        
      case 'hexagon':
        const hexCenterX = size / 2;
        const hexCenterY = size / 2;
        const hexRadius = size * 0.4;
        this.drawHexagon(ctx, hexCenterX, hexCenterY, hexRadius);
        ctx.fill();
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size, size / 2);
        ctx.lineTo(size / 2, size);
        ctx.lineTo(0, size / 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        break;
        
      default: // square
        ctx.fillRect(0, 0, size, size);
        break;
    }
    
    // 恢复状态
    ctx.restore();
  }


  /**
   * 批量绘制形状 - 优化性能，减少Canvas状态切换
   * @param ctx Canvas上下文
   * @param shape 形状类型
   * @param modules 模块位置数组
   * @param spacingOffset 间距偏移
   * @param size 大小
   * @param cornerRadius 圆角半径
   */
  private static batchDrawShapes(
    ctx: CanvasRenderingContext2D,
    shape: string,
    modules: Array<{x: number, y: number}>,
    spacingOffset: number,
    size: number,
    cornerRadius?: number
  ): void {
    switch (shape) {
      case 'square':
        // 方形可以批量绘制，只需一次beginPath
        ctx.beginPath();
        modules.forEach(module => {
          const x = module.x + spacingOffset;
          const y = module.y + spacingOffset;
          ctx.rect(x, y, size, size);
        });
        ctx.fill();
        break;
        
      case 'circle':
        // 圆形也可以批量绘制
        ctx.beginPath();
        modules.forEach(module => {
          const x = module.x + spacingOffset + size / 2;
          const y = module.y + spacingOffset + size / 2;
          ctx.moveTo(x + size / 2, y);
          ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        });
        ctx.fill();
        break;
        
      default:
        // 其他形状需要单独处理
        modules.forEach(module => {
          const finalX = module.x + spacingOffset;
          const finalY = module.y + spacingOffset;
          this.drawCustomShape(ctx, shape, finalX, finalY, size, ctx.fillStyle as string, cornerRadius);
        });
        break;
    }
  }

  /**
   * 优化的自定义形状绘制 - 减少状态切换
   * @param ctx Canvas上下文
   * @param shape 形状
   * @param x X坐标
   * @param y Y坐标
   * @param size 大小
   * @param color 颜色
   * @param cornerRadius 圆角半径
   * @param gradient 渐变配置
   * @param randomness 随机性
   */
  private static drawCustomShapeOptimized(
    ctx: CanvasRenderingContext2D,
    shape: string,
    x: number,
    y: number,
    size: number,
    _color: string,
    cornerRadius?: number,
    gradient?: { colors: string[]; direction?: number },
    randomness?: number
  ): void {
    // 保存当前状态
    ctx.save();
    
    // 应用随机变换
    if (randomness && randomness > 0) {
      const randomOffset = (Math.random() - 0.5) * randomness;
      const randomRotation = (Math.random() - 0.5) * randomness * 0.1;
      ctx.translate(x + size / 2 + randomOffset, y + size / 2 + randomOffset);
      ctx.rotate(randomRotation);
      ctx.translate(-size / 2, -size / 2);
    } else {
      ctx.translate(x, y);
    }
    
    // 设置渐变
    if (gradient && gradient.colors.length > 0) {
      const gradientObj = ctx.createLinearGradient(0, 0, size, size);
      gradient.colors.forEach((color, i) => {
        gradientObj.addColorStop(i / (gradient.colors.length - 1), color);
      });
      ctx.fillStyle = gradientObj;
    }
    
    // 根据形状绘制
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'rounded':
        const radius = cornerRadius || size * 0.2;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.fill();
        break;
        
      case 'star':
        const centerX = size / 2;
        const centerY = size / 2;
        const outerRadius = size * 0.4;
        const innerRadius = size * 0.2;
        this.drawStar(ctx, centerX, centerY, outerRadius, innerRadius, 5);
        ctx.fill();
        break;
        
      case 'hexagon':
        const hexCenterX = size / 2;
        const hexCenterY = size / 2;
        const hexRadius = size * 0.4;
        this.drawHexagon(ctx, hexCenterX, hexCenterY, hexRadius);
        ctx.fill();
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size, size / 2);
        ctx.lineTo(size / 2, size);
        ctx.lineTo(0, size / 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size, size);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        break;
        
      default: // square
        ctx.fillRect(0, 0, size, size);
        break;
    }
    
    // 恢复状态
    ctx.restore();
  }

  /**
   * 模块深色检测缓存 - 提高性能
   */
  private static moduleDarkCache = new Map<string, boolean>();

  /**
   * 检查模块是否为深色 - 优化版本，添加缓存机制
   * @param data 图像数据
   * @param x X坐标
   * @param y Y坐标
   * @param width 宽度
   * @param moduleSize 模块大小
   * @returns 是否为深色
   */
  private static isModuleDark(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, moduleSize: number): boolean {
    // 使用缓存键避免重复计算
    const cacheKey = `${x}-${y}-${moduleSize}`;
    if (this.moduleDarkCache.has(cacheKey)) {
      return this.moduleDarkCache.get(cacheKey)!;
    }
    
    // 简化的单点采样 - 提高性能，对于大多数情况足够准确
    const centerX = Math.min(x + Math.floor(moduleSize * 0.5), width - 1);
    const centerY = Math.min(y + Math.floor(moduleSize * 0.5), height - 1);
    const index = (centerY * width + centerX) * 4;
    
    // 检查中心点的RGB值
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    
    // 计算亮度（使用标准的亮度公式）
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    const isDark = brightness < 128;
    
    // 缓存结果
    this.moduleDarkCache.set(cacheKey, isDark);
    return isDark;
  }

  /**
   * 绘制星形
   * @param ctx Canvas上下文
   * @param cx 中心X坐标
   * @param cy 中心Y坐标
   * @param outerRadius 外半径
   * @param innerRadius 内半径
   * @param points 点数
   */
  private static drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number): void {
    const angle = Math.PI / points;
    ctx.beginPath();
    
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(i * angle - Math.PI / 2) * radius;
      const y = cy + Math.sin(i * angle - Math.PI / 2) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
  }

  /**
   * 绘制六边形
   * @param ctx Canvas上下文
   * @param cx 中心X坐标
   * @param cy 中心Y坐标
   * @param radius 半径
   */
  private static drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    const angle = Math.PI / 3;
    ctx.beginPath();
    
    for (let i = 0; i < 6; i++) {
      const x = cx + Math.cos(i * angle - Math.PI / 2) * radius;
      const y = cy + Math.sin(i * angle - Math.PI / 2) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
  }

  /**
   * 使用动画效果绘制模块
   * @param ctx Canvas上下文
   * @param modules 模块位置数组
   * @param shape 形状类型
   * @param size 模块大小
   * @param spacingOffset 间距偏移
   * @param color 颜色
   * @param cornerRadius 圆角半径
   * @param gradient 渐变配置
   * @param randomness 随机性
   * @param animation 动画配置
   */
  private static drawWithAnimation(
    ctx: CanvasRenderingContext2D,
    modules: Array<{x: number, y: number, index: number}>,
    shape: string,
    size: number,
    spacingOffset: number,
    color: string,
    cornerRadius?: number,
    gradient?: { colors: string[]; direction?: number },
    randomness?: number,
    animation?: { enabled?: boolean; type?: string; duration?: number; delay?: number; stagger?: number; direction?: string }
  ): void {
    const animConfig = animation || {};
    const animType = animConfig.type || 'fade';
    const duration = animConfig.duration || 1000;
    const delay = animConfig.delay || 0;
    const stagger = animConfig.stagger || 50;
    const direction = animConfig.direction || 'forward';
    
    // 根据方向排序模块
    let sortedModules = [...modules];
    if (direction === 'reverse') {
      sortedModules.reverse();
    } else if (direction === 'alternate') {
      // 交替方向：奇数行正向，偶数行反向
      const rows = new Map<number, typeof modules>();
      modules.forEach(module => {
        const row = Math.floor(module.y / size);
        if (!rows.has(row)) {
          rows.set(row, []);
        }
        rows.get(row)!.push(module);
      });
      
      sortedModules = [];
      Array.from(rows.entries())
        .sort(([a], [b]) => a - b)
        .forEach(([row, rowModules]) => {
          if (row % 2 === 0) {
            sortedModules.push(...rowModules);
          } else {
            sortedModules.push(...rowModules.reverse());
          }
        });
    }
    
    // 逐个绘制模块，应用动画效果
    sortedModules.forEach((module, index) => {
      const finalX = module.x + spacingOffset;
      const finalY = module.y + spacingOffset;
      
      // 保存当前状态
      ctx.save();
      
      // 应用动画变换
      const progress = Math.min(1, Math.max(0, (Date.now() - delay - index * stagger) / duration));
      const easedProgress = this.easeInOutCubic(progress);
      
      switch (animType) {
        case 'fade':
          ctx.globalAlpha = easedProgress;
          break;
          
        case 'scale':
          const scale = easedProgress;
          ctx.translate(finalX + size / 2, finalY + size / 2);
          ctx.scale(scale, scale);
          ctx.translate(-size / 2, -size / 2);
          break;
          
        case 'rotate':
          const rotation = easedProgress * Math.PI * 2;
          ctx.translate(finalX + size / 2, finalY + size / 2);
          ctx.rotate(rotation);
          ctx.translate(-size / 2, -size / 2);
          break;
          
        case 'bounce':
          const bounceScale = easedProgress < 0.5 
            ? easedProgress * 2 
            : 2 - easedProgress * 2;
          ctx.translate(finalX + size / 2, finalY + size / 2);
          ctx.scale(bounceScale, bounceScale);
          ctx.translate(-size / 2, -size / 2);
          break;
          
        case 'pulse':
          const pulseScale = 0.5 + easedProgress * 0.5;
          ctx.translate(finalX + size / 2, finalY + size / 2);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-size / 2, -size / 2);
          break;
      }
      
      // 绘制形状
      if (gradient && gradient.colors.length > 0) {
        this.drawCustomShapeOptimized(ctx, shape, 0, 0, size, color, cornerRadius, gradient, randomness);
      } else {
        this.drawCustomShape(ctx, shape, 0, 0, size, color, cornerRadius, undefined, randomness);
      }
      
      // 恢复状态
      ctx.restore();
    });
  }

  /**
   * 缓动函数 - 三次缓入缓出
   * @param t 时间参数 (0-1)
   * @returns 缓动后的值
   */
  private static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
