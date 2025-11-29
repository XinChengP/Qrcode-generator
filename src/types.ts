export enum ErrorCorrectionLevel {
  LOW = 'L',
  MEDIUM = 'M',
  QUARTILE = 'Q',
  HIGH = 'H'
}

export enum QRCodeFormat {
  PNG = 'png',
  SVG = 'svg'
}

export enum QRCodeShape {
  SQUARE = 'square',
  ROUNDED = 'rounded',
  CIRCLE = 'circle',
  DOT = 'dot',
  STAR = 'star',
  HEXAGON = 'hexagon',
  DIAMOND = 'diamond',
  TRIANGLE = 'triangle'
}

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  color?: {
    dark?: string;
    light?: string;
  };
  margin?: number;
  scale?: number;
  logo?: {
    src?: string;
    size?: number;
  };
  shape?: QRCodeShape;
  cornerRadius?: number;
  complexity?: number; // 复杂度级别 (1-10)
  moduleSize?: number; // 模块大小百分比 (50-150)
  moduleSpacing?: number; // 模块间距 (0-10)
  randomness?: number; // 随机变化程度 (0-100)
  animation?: {
    enabled?: boolean;
    type?: 'fade' | 'scale' | 'rotate' | 'bounce' | 'pulse';
    duration?: number; // 动画持续时间(ms)
    delay?: number; // 延迟时间(ms)
    stagger?: number; // 模块间延迟(ms)
    direction?: 'forward' | 'reverse' | 'alternate';
  };
}

export interface QRCodeResult {
  dataURL: string;
  options: QRCodeOptions;
}

export interface ExportOptions {
  fileName?: string;
}
