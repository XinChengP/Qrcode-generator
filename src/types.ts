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
  CIRCLE = 'circle'
}

export interface QRCodeOptions {
  size?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  color?: {
    dark?: string;
    light?: string;
    gradient?: {
      type?: 'linear' | 'radial';
      colors?: string[];
    };
  };
  margin?: number;
  scale?: number;
  logo?: {
    src?: string;
    size?: number;
  };
  shape?: QRCodeShape;
  cornerRadius?: number;
}

export interface QRCodeResult {
  dataURL: string;
  options: QRCodeOptions;
}

export interface ExportOptions {
  fileName?: string;
}
