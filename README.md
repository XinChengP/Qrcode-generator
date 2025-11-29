# TypeScript二维码生成器组件

一个功能丰富的TypeScript二维码生成器组件，支持多种配置选项和导出格式。

## 功能特性

- ✅ 支持文本/URL转换为二维码
- ✅ 尺寸自定义
- ✅ 容错率设置（L、M、Q、H）
- ✅ 颜色配置（前景色和背景色）
- ✅ 支持PNG和SVG格式导出
- ✅ 边距调整
- ✅ 浏览器兼容
- ✅ TypeScript类型支持

## 安装

```bash
npm install qrcode-generator-component
```

## 基本使用

### 生成二维码

```typescript
import { QRCodeGenerator } from 'qrcode-generator-component';

async function generateQRCode() {
  try {
    const result = await QRCodeGenerator.generateQRCode('https://example.com');
    console.log('QR Code Data URL:', result.dataURL);
    // 可以将result.dataURL设置为img标签的src属性
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

generateQRCode();
```

### 渲染到Canvas

```typescript
import { QRCodeGenerator } from 'qrcode-generator-component';

async function renderToCanvas() {
  try {
    const canvas = document.getElementById('qrcode-canvas') as HTMLCanvasElement;
    await QRCodeGenerator.renderToCanvas('https://example.com', canvas);
  } catch (error) {
    console.error('Error rendering QR code to canvas:', error);
  }
}

renderToCanvas();
```

### 导出为PNG

```typescript
import { QRCodeGenerator } from 'qrcode-generator-component';

async function exportAsPNG() {
  try {
    await QRCodeGenerator.exportAsPNG('https://example.com', {}, {
      fileName: 'my-qrcode.png'
    });
  } catch (error) {
    console.error('Error exporting QR code as PNG:', error);
  }
}

exportAsPNG();
```

### 导出为SVG

```typescript
import { QRCodeGenerator } from 'qrcode-generator-component';

async function exportAsSVG() {
  try {
    await QRCodeGenerator.exportAsSVG('https://example.com', {}, {
      fileName: 'my-qrcode.svg'
    });
  } catch (error) {
    console.error('Error exporting QR code as SVG:', error);
  }
}

exportAsSVG();
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | `200` | 二维码的宽度和高度（像素） |
| `errorCorrectionLevel` | `ErrorCorrectionLevel` | `ErrorCorrectionLevel.MEDIUM` | 容错率 |
| `color.dark` | `string` | `'#000000'` | 二维码前景色 |
| `color.light` | `string` | `'#ffffff'` | 二维码背景色 |
| `margin` | `number` | `4` | 二维码四周的边距 |
| `scale` | `number` | `4` | 二维码的缩放比例 |

### 容错率级别

| 级别 | 枚举值 | 容错率 |
|------|--------|--------|
| 低 | `ErrorCorrectionLevel.LOW` | 7% |
| 中 | `ErrorCorrectionLevel.MEDIUM` | 15% |
| 四分之一 | `ErrorCorrectionLevel.QUARTILE` | 25% |
| 高 | `ErrorCorrectionLevel.HIGH` | 30% |

## API 方法

### `generateQRCode(text: string, options?: QRCodeOptions): Promise<QRCodeResult>`

生成二维码，返回包含Data URL和配置选项的对象。

**参数：**
- `text`: 要编码的文本或URL
- `options`: 二维码配置选项

**返回值：**
- `Promise<QRCodeResult>`: 包含Data URL和使用的配置选项

### `getQRCodeDataURL(text: string, options?: QRCodeOptions): Promise<string>`

获取二维码的Data URL。

**参数：**
- `text`: 要编码的文本或URL
- `options`: 二维码配置选项

**返回值：**
- `Promise<string>`: 二维码的Data URL

### `renderToCanvas(text: string, canvas: HTMLCanvasElement, options?: QRCodeOptions): Promise<void>`

将二维码渲染到Canvas元素。

**参数：**
- `text`: 要编码的文本或URL
- `canvas`: Canvas元素
- `options`: 二维码配置选项

### `exportAsPNG(text: string, options?: QRCodeOptions, exportOptions?: ExportOptions): Promise<string>`

导出二维码为PNG格式。

**参数：**
- `text`: 要编码的文本或URL
- `options`: 二维码配置选项
- `exportOptions`: 导出配置选项
  - `fileName`: 导出的文件名，默认为 `qrcode.png`

**返回值：**
- `Promise<string>`: 下载链接

### `exportAsSVG(text: string, options?: QRCodeOptions, exportOptions?: ExportOptions): Promise<string>`

导出二维码为SVG格式。

**参数：**
- `text`: 要编码的文本或URL
- `options`: 二维码配置选项
- `exportOptions`: 导出配置选项
  - `fileName`: 导出的文件名，不提供则仅返回SVG字符串

**返回值：**
- `Promise<string>`: SVG字符串

## 高级使用

### 自定义配置

```typescript
import { QRCodeGenerator, ErrorCorrectionLevel } from 'qrcode-generator-component';

async function customQRCode() {
  try {
    const result = await QRCodeGenerator.generateQRCode('https://example.com', {
      size: 300,
      errorCorrectionLevel: ErrorCorrectionLevel.HIGH,
      color: {
        dark: '#ff0000',
        light: '#ffff00'
      },
      margin: 10,
      scale: 5
    });
    console.log('Custom QR Code:', result.dataURL);
  } catch (error) {
    console.error('Error generating custom QR code:', error);
  }
}

customQRCode();
```

### 获取SVG字符串

```typescript
import { QRCodeGenerator } from 'qrcode-generator-component';

async function getSVGString() {
  try {
    const svgString = await QRCodeGenerator.exportAsSVG('https://example.com');
    console.log('SVG String:', svgString);
    // 可以将svgString直接插入到DOM中
  } catch (error) {
    console.error('Error getting SVG string:', error);
  }
}

getSVGString();
```

## 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | ✅ 60+ |
| Firefox | ✅ 55+ |
| Safari | ✅ 12+ |
| Edge | ✅ 79+ |

## 构建

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run typecheck

# 预览构建结果
npm run preview
```

## 示例

查看 `examples/` 目录下的示例代码：

- `basic-usage.ts`: 基本使用示例
- `custom-options.ts`: 自定义配置示例
- `export-formats.ts`: 导出格式示例

## 许可证

MIT License
