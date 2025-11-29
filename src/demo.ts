import { QRCodeGenerator } from './QrCodeGenerator';
import { ErrorCorrectionLevel } from './types';

// 初始化演示
function initDemo() {
  // DOM元素
  const textInput = document.getElementById('text-input') as HTMLInputElement;
  const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const qrcodePng = document.getElementById('qrcode-png') as HTMLImageElement;
  const qrcodeSvg = document.getElementById('qrcode-svg') as HTMLDivElement;
  const qrcodeCanvas = document.getElementById('qrcode-canvas') as HTMLCanvasElement;
  const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
  const exportFormat = document.getElementById('export-format') as HTMLSelectElement;
  
  // 数据类型相关元素
  const dataTypeTabs = document.querySelectorAll('.data-type-tab') as NodeListOf<HTMLButtonElement>;
  const textInputSection = document.getElementById('text-input-section') as HTMLDivElement;
  const contactInputSection = document.getElementById('contact-input-section') as HTMLDivElement;
  const wifiInputSection = document.getElementById('wifi-input-section') as HTMLDivElement;
  const emailInputSection = document.getElementById('email-input-section') as HTMLDivElement;
  const smsInputSection = document.getElementById('sms-input-section') as HTMLDivElement;
  const phoneInputSection = document.getElementById('phone-input-section') as HTMLDivElement;
  const locationInputSection = document.getElementById('location-input-section') as HTMLDivElement;
  
  // 联系方式表单元素
  const contactName = document.getElementById('contact-name') as HTMLInputElement;
  const contactPhone = document.getElementById('contact-phone') as HTMLInputElement;
  const contactEmail = document.getElementById('contact-email') as HTMLInputElement;
  const contactCompany = document.getElementById('contact-company') as HTMLInputElement;
  
  // WiFi表单元素
  const wifiSsid = document.getElementById('wifi-ssid') as HTMLInputElement;
  const wifiPassword = document.getElementById('wifi-password') as HTMLInputElement;
  const wifiType = document.getElementById('wifi-type') as HTMLSelectElement;
  
  // 电子邮件表单元素
  const emailAddress = document.getElementById('email-address') as HTMLInputElement;
  const emailSubject = document.getElementById('email-subject') as HTMLInputElement;
  const emailBody = document.getElementById('email-body') as HTMLTextAreaElement;
  
  // 短信表单元素
  const smsPhone = document.getElementById('sms-phone') as HTMLInputElement;
  const smsMessage = document.getElementById('sms-message') as HTMLTextAreaElement;
  
  // 电话号码表单元素
  const phoneNumber = document.getElementById('phone-number') as HTMLInputElement;
  
  // 地理位置表单元素
  const locationLatitude = document.getElementById('location-latitude') as HTMLInputElement;
  const locationLongitude = document.getElementById('location-longitude') as HTMLInputElement;
  
  // 控制面板元素
  const sizeSlider = document.getElementById('size-slider') as HTMLInputElement;
  const sizeValue = document.getElementById('size-value') as HTMLSpanElement;
  const marginSlider = document.getElementById('margin-slider') as HTMLInputElement;
  const marginValue = document.getElementById('margin-value') as HTMLSpanElement;
  const darkColor = document.getElementById('dark-color') as HTMLInputElement;
  const lightColor = document.getElementById('light-color') as HTMLInputElement;
  const errorCorrection = document.getElementById('error-correction') as HTMLSelectElement;
  const shapeSelect = document.getElementById('shape-select') as HTMLSelectElement;
  const cornerRadiusSlider = document.getElementById('corner-radius-slider') as HTMLInputElement;
  const cornerRadiusValue = document.getElementById('corner-radius-value') as HTMLSpanElement;
  const gradientType = document.getElementById('gradient-type') as HTMLSelectElement;
  const gradientColors = document.getElementById('gradient-colors') as HTMLDivElement;
  const gradientColorList = document.getElementById('gradient-color-list') as HTMLDivElement;
  const addGradientColorBtn = document.getElementById('add-gradient-color') as HTMLButtonElement;
  const removeGradientColorBtn = document.getElementById('remove-gradient-color') as HTMLButtonElement;
  
  // Logo上传元素
  const logoUpload = document.getElementById('logo-upload') as HTMLInputElement;
  const logoPreview = document.getElementById('logo-preview') as HTMLImageElement;
  const removeLogoBtn = document.getElementById('remove-logo') as HTMLButtonElement;
  
  // 历史记录元素
  const clearHistoryBtn = document.getElementById('clear-history-btn') as HTMLButtonElement;
  const historyList = document.getElementById('history-list') as HTMLDivElement;
  
  // 选项卡元素
  const tabBtns = document.querySelectorAll('.tab-btn') as NodeListOf<HTMLButtonElement>;
  
  // 当前激活的选项卡
  let activeTab = 'png';
  
  // 当前数据类型
  let currentDataType = 'text';
  
  // 保存当前配置
  let currentConfig: any = {
    size: 200,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: ErrorCorrectionLevel.MEDIUM
  };
  
  // 历史记录数据结构
  interface HistoryItem {
    id: string;
    data: string;
    dataType: string;
    dataURL: string;
    config: any;
    timestamp: number;
  }
  
  // 显示加载状态
  function showLoading() {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
      生成中...
    `;
  }
  
  // 保存历史记录
  function saveHistoryItem(data: string, dataType: string, dataURL: string, config: any) {
    const historyItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      data,
      dataType,
      dataURL,
      config,
      timestamp: Date.now()
    };
    
    // 从localStorage加载现有历史记录
    const history = loadHistory();
    
    // 添加新记录到开头
    history.unshift(historyItem);
    
    // 限制历史记录数量为50条
    if (history.length > 50) {
      history.pop();
    }
    
    // 保存到localStorage
    localStorage.setItem('qrcode-history', JSON.stringify(history));
    
    // 更新显示
    displayHistory();
  }
  
  // 加载历史记录
  function loadHistory(): HistoryItem[] {
    const historyJson = localStorage.getItem('qrcode-history');
    return historyJson ? JSON.parse(historyJson) : [];
  }
  
  // 显示历史记录
  function displayHistory() {
    const history = loadHistory();
    
    if (history.length === 0) {
      historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">暂无历史记录</p>';
      return;
    }
    
    historyList.innerHTML = history.map(item => `
      <div class="history-item">
        <img src="${item.dataURL}" alt="二维码历史记录">
        <div class="history-item-info">${item.data.substring(0, 20)}${item.data.length > 20 ? '...' : ''}</div>
        <div class="history-item-date">${new Date(item.timestamp).toLocaleString()}</div>
        <div class="history-item-actions">
          <button class="btn-view" onclick="viewHistoryItem('${item.id}')">查看</button>
          <button class="btn-delete" onclick="deleteHistoryItem('${item.id}')">删除</button>
        </div>
      </div>
    `).join('');
  }
  
  // 清除所有历史记录
  function clearHistory() {
    if (confirm('确定要清除所有历史记录吗？')) {
      localStorage.removeItem('qrcode-history');
      displayHistory();
    }
  }
  
  // 删除单个历史记录项
  function deleteHistoryItem(id: string) {
    const history = loadHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem('qrcode-history', JSON.stringify(updatedHistory));
    displayHistory();
  }
  
  // 查看历史记录项
  function viewHistoryItem(id: string) {
    const history = loadHistory();
    const item = history.find(item => item.id === id);
    if (item) {
      // 恢复配置
      currentConfig = item.config;
      currentDataType = item.dataType;
      
      // 更新UI控件
      sizeSlider.value = item.config.size.toString();
      sizeValue.textContent = item.config.size.toString();
      marginSlider.value = item.config.margin.toString();
      marginValue.textContent = item.config.margin.toString();
      darkColor.value = item.config.color.dark;
      lightColor.value = item.config.color.light;
      errorCorrection.value = item.config.errorCorrectionLevel;
      shapeSelect.value = item.config.shape || 'square';
      cornerRadiusSlider.value = item.config.cornerRadius?.toString() || '4';
      cornerRadiusValue.textContent = item.config.cornerRadius?.toString() || '4';
      
      // 更新渐变设置
      if (item.config.color.gradient) {
        gradientType.value = item.config.color.gradient.type;
        gradientColors.style.display = 'block';
        
        // 更新渐变颜色列表
        const gradientColorInputs = document.querySelectorAll('.gradient-color-input') as NodeListOf<HTMLInputElement>;
        gradientColorInputs.forEach((input, index) => {
          if (item.config.color.gradient.colors[index]) {
            input.value = item.config.color.gradient.colors[index];
          }
        });
      } else {
        gradientType.value = 'none';
        gradientColors.style.display = 'none';
      }
      
      // 更新数据类型选项卡
      switchDataType(item.dataType);
      
      // 更新数据输入
      switch (item.dataType) {
        case 'text':
          textInput.value = item.data;
          break;
        case 'contact':
          // 解析vCard数据
          break;
        case 'wifi':
          // 解析WiFi数据
          break;
        case 'email':
          // 解析电子邮件数据
          break;
        case 'sms':
          // 解析短信数据
          break;
        case 'phone':
          // 解析电话号码数据
          break;
        case 'location':
          // 解析地理位置数据
          break;
      }
      
      // 重新生成二维码
      generateQRCode();
    }
  }
  
  // 将函数绑定到全局对象，以便在HTML中调用
  (window as any).viewHistoryItem = viewHistoryItem;
  (window as any).deleteHistoryItem = deleteHistoryItem;
  
  // 隐藏加载状态
  function hideLoading() {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="M21 15l-5-5L5 21"></path>
      </svg>
      生成二维码
    `;
  }
  
  // 更新选项卡显示
  function updateTabDisplay() {
    // 隐藏所有二维码元素
    qrcodePng.style.display = 'none';
    qrcodeSvg.style.display = 'none';
    qrcodeCanvas.style.display = 'none';
    
    // 显示当前选项卡的二维码
    switch (activeTab) {
      case 'png':
        qrcodePng.style.display = 'block';
        break;
      case 'svg':
        qrcodeSvg.style.display = 'block';
        break;
      case 'canvas':
        qrcodeCanvas.style.display = 'block';
        break;
    }
  }
  
  // 获取当前输入的数据
  function getCurrentData(): string {
    switch (currentDataType) {
      case 'text':
        return textInput.value.trim();
      
      case 'contact':
        // 生成vCard格式
        let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (contactName.value.trim()) {
          vCard += `FN:${contactName.value.trim()}\n`;
        }
        if (contactPhone.value.trim()) {
          vCard += `TEL:${contactPhone.value.trim()}\n`;
        }
        if (contactEmail.value.trim()) {
          vCard += `EMAIL:${contactEmail.value.trim()}\n`;
        }
        if (contactCompany.value.trim()) {
          vCard += `ORG:${contactCompany.value.trim()}\n`;
        }
        vCard += 'END:VCARD';
        return vCard;
      
      case 'wifi':
        // 生成WiFi格式
        let wifiData = `WIFI:T:${wifiType.value};S:${wifiSsid.value.trim()};`;
        if (wifiPassword.value.trim()) {
          wifiData += `P:${wifiPassword.value.trim()};`;
        }
        wifiData += ';';
        return wifiData;
      
      case 'email':
        // 生成电子邮件格式
        let emailData = `mailto:${emailAddress.value.trim()}`;
        let params = [];
        if (emailSubject.value.trim()) {
          params.push(`subject=${encodeURIComponent(emailSubject.value.trim())}`);
        }
        if (emailBody.value.trim()) {
          params.push(`body=${encodeURIComponent(emailBody.value.trim())}`);
        }
        if (params.length > 0) {
          emailData += `?${params.join('&')}`;
        }
        return emailData;
      
      case 'sms':
        // 生成短信格式
        let smsData = `sms:${smsPhone.value.trim()}`;
        if (smsMessage.value.trim()) {
          smsData += `?body=${encodeURIComponent(smsMessage.value.trim())}`;
        }
        return smsData;
      
      case 'phone':
        // 生成电话号码格式
        return `tel:${phoneNumber.value.trim()}`;
      
      case 'location':
        // 生成地理位置格式
        return `geo:${locationLatitude.value.trim()},${locationLongitude.value.trim()}`;
      
      default:
        return textInput.value.trim();
    }
  }
  
  // 生成二维码
  async function generateQRCode() {
    const data = getCurrentData();
    if (!data) {
      alert('请输入数据');
      return;
    }
    
    showLoading();
    
    try {
      // 获取渐变颜色
      const gradientColorInputs = document.querySelectorAll('.gradient-color-input') as NodeListOf<HTMLInputElement>;
      const gradientColorValues = Array.from(gradientColorInputs).map(input => input.value);
      
      // 更新当前配置
      currentConfig = {
        size: parseInt(sizeSlider.value),
        margin: parseInt(marginSlider.value),
        color: {
          dark: darkColor.value,
          light: lightColor.value,
          gradient: gradientType.value !== 'none' ? {
            type: gradientType.value as 'linear' | 'radial',
            colors: gradientColorValues
          } : undefined
        },
        errorCorrectionLevel: errorCorrection.value as ErrorCorrectionLevel,
        logo: logoPreview.src ? {
          src: logoPreview.src,
          size: parseInt(sizeSlider.value) * 0.2
        } : undefined,
        shape: shapeSelect.value as any,
        cornerRadius: parseInt(cornerRadiusSlider.value)
      };
      
      // 生成PNG
      const pngResult = await QRCodeGenerator.generateQRCode(data, currentConfig);
      qrcodePng.src = pngResult.dataURL;
      
      // 生成SVG
      const svgString = await QRCodeGenerator.exportAsSVG(data, currentConfig);
      qrcodeSvg.innerHTML = svgString;
      
      // 渲染到Canvas
      await QRCodeGenerator.renderToCanvas(data, qrcodeCanvas, currentConfig);
      
      // 更新选项卡显示
      updateTabDisplay();
      
      // 保存到历史记录
      saveHistoryItem(data, currentDataType, pngResult.dataURL, currentConfig);
    } catch (error) {
      console.error('生成二维码失败:', error);
      alert('生成二维码失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      hideLoading();
    }
  }
  
  // 导出二维码
  async function exportQRCode() {
    const data = getCurrentData();
    if (!data) {
      alert('请输入数据');
      return;
    }
    
    try {
      const format = exportFormat.value;
      
      switch (format) {
        case 'png':
          await QRCodeGenerator.exportAsPNG(data, currentConfig, {
            fileName: 'qrcode.png'
          });
          break;
        case 'jpg':
          // 由于qrcode库不直接支持JPG，我们需要从Canvas转换
          await QRCodeGenerator.renderToCanvas(data, qrcodeCanvas, currentConfig);
          const jpgDataURL = qrcodeCanvas.toDataURL('image/jpeg', 0.9);
          downloadFile(jpgDataURL, 'qrcode.jpg');
          break;
        case 'svg':
          await QRCodeGenerator.exportAsSVG(data, currentConfig, {
            fileName: 'qrcode.svg'
          });
          break;
        default:
          await QRCodeGenerator.exportAsPNG(data, currentConfig, {
            fileName: 'qrcode.png'
          });
      }
    } catch (error) {
      console.error('导出二维码失败:', error);
      alert('导出二维码失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  }
  
  // 下载文件
  function downloadFile(dataURL: string, fileName: string) {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // 清除输入和二维码
  function clear() {
    // 清除文本输入
    textInput.value = '';
    
    // 清除联系方式
    contactName.value = '';
    contactPhone.value = '';
    contactEmail.value = '';
    contactCompany.value = '';
    
    // 清除WiFi信息
    wifiSsid.value = '';
    wifiPassword.value = '';
    wifiType.value = 'WPA';
    
    // 清除电子邮件信息
    emailAddress.value = '';
    emailSubject.value = '';
    emailBody.value = '';
    
    // 清除短信信息
    smsPhone.value = '';
    smsMessage.value = '';
    
    // 清除电话号码信息
    phoneNumber.value = '';
    
    // 清除地理位置信息
    locationLatitude.value = '';
    locationLongitude.value = '';
    
    // 清除二维码
    qrcodePng.src = '';
    qrcodeSvg.innerHTML = '';
    qrcodeCanvas.getContext('2d')?.clearRect(0, 0, qrcodeCanvas.width, qrcodeCanvas.height);
    
    // 清除Logo
    removeLogo();
  }
  
  // 切换数据类型
  function switchDataType(type: string) {
    currentDataType = type;
    
    // 更新选项卡状态
    dataTypeTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.type === type) {
        tab.classList.add('active');
      }
    });
    
    // 显示对应的输入区域
    textInputSection.style.display = type === 'text' ? 'block' : 'none';
    contactInputSection.style.display = type === 'contact' ? 'block' : 'none';
    wifiInputSection.style.display = type === 'wifi' ? 'block' : 'none';
    emailInputSection.style.display = type === 'email' ? 'block' : 'none';
    smsInputSection.style.display = type === 'sms' ? 'block' : 'none';
    phoneInputSection.style.display = type === 'phone' ? 'block' : 'none';
    locationInputSection.style.display = type === 'location' ? 'block' : 'none';
    
    // 重新生成二维码
    generateQRCode();
  }
  
  // Logo上传处理
  function handleLogoUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        logoPreview.src = result;
        logoPreview.style.display = 'block';
        removeLogoBtn.style.display = 'inline-block';
        // TODO: 实现添加Logo到二维码的功能
      };
      reader.readAsDataURL(file);
    }
  }
  
  // 移除Logo
  function removeLogo() {
    logoPreview.src = '';
    logoPreview.style.display = 'none';
    removeLogoBtn.style.display = 'none';
    logoUpload.value = '';
    // TODO: 实现移除二维码中Logo的功能
  }
  
  // 选项卡切换
  function handleTabChange(tab: string) {
    activeTab = tab;
    
    // 更新选项卡按钮状态
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      }
    });
    
    // 更新显示
    updateTabDisplay();
  }
  
  // 初始化事件监听
  function initEventListeners() {
    // 生成按钮
    generateBtn.addEventListener('click', generateQRCode);
    
    // 清除按钮
    clearBtn.addEventListener('click', clear);
    
    // 导出按钮
    exportBtn.addEventListener('click', exportQRCode);
    
    // 选项卡切换
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        handleTabChange(btn.dataset.tab || 'png');
      });
    });
    
    // 尺寸滑块
    sizeSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      sizeValue.textContent = value;
    });
    
    // 边距滑块
    marginSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      marginValue.textContent = value;
    });
    
    // 数据类型切换
    dataTypeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchDataType(tab.dataset.type || 'text');
      });
    });
    
    // Logo上传
    logoUpload.addEventListener('change', handleLogoUpload);
    removeLogoBtn.addEventListener('click', removeLogo);
    
    // 实时生成（输入变化时延迟生成）
    let debounceTimer: ReturnType<typeof setTimeout>;
    function debounceGenerate() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(generateQRCode, 500);
    }
    
    // 文本输入变化
    textInput.addEventListener('input', debounceGenerate);
    
    // 联系方式输入变化
    contactName.addEventListener('input', debounceGenerate);
    contactPhone.addEventListener('input', debounceGenerate);
    contactEmail.addEventListener('input', debounceGenerate);
    contactCompany.addEventListener('input', debounceGenerate);
    
    // WiFi输入变化
    wifiSsid.addEventListener('input', debounceGenerate);
    wifiPassword.addEventListener('input', debounceGenerate);
    wifiType.addEventListener('change', debounceGenerate);
    
    // 电子邮件输入变化
    emailAddress.addEventListener('input', debounceGenerate);
    emailSubject.addEventListener('input', debounceGenerate);
    emailBody.addEventListener('input', debounceGenerate);
    
    // 短信输入变化
    smsPhone.addEventListener('input', debounceGenerate);
    smsMessage.addEventListener('input', debounceGenerate);
    
    // 电话号码输入变化
    phoneNumber.addEventListener('input', debounceGenerate);
    
    // 地理位置输入变化
    locationLatitude.addEventListener('input', debounceGenerate);
    locationLongitude.addEventListener('input', debounceGenerate);
    
    // 尺寸变化
    sizeSlider.addEventListener('change', debounceGenerate);
    
    // 边距变化
    marginSlider.addEventListener('change', debounceGenerate);
    
    // 颜色变化
    darkColor.addEventListener('change', debounceGenerate);
    lightColor.addEventListener('change', debounceGenerate);
    
    // 错误纠正级别变化
    errorCorrection.addEventListener('change', debounceGenerate);
    
    // 形状变化
    shapeSelect.addEventListener('change', debounceGenerate);
    
    // 圆角半径变化
    cornerRadiusSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      cornerRadiusValue.textContent = value;
    });
    cornerRadiusSlider.addEventListener('change', debounceGenerate);
    
    // 渐变类型变化
    gradientType.addEventListener('change', (e) => {
      if ((e.target as HTMLSelectElement).value === 'none') {
        gradientColors.style.display = 'none';
      } else {
        gradientColors.style.display = 'block';
      }
      debounceGenerate();
    });
    
    // 渐变颜色变化
    gradientColorList.addEventListener('input', (e) => {
      if ((e.target as HTMLElement).classList.contains('gradient-color-input')) {
        debounceGenerate();
      }
    });
    
    // 添加渐变颜色
    addGradientColorBtn.addEventListener('click', () => {
      const colorCount = gradientColorList.children.length;
      const newColorPicker = document.createElement('div');
      newColorPicker.className = 'color-picker';
      newColorPicker.innerHTML = `
        <span>颜色 ${colorCount + 1}:</span>
        <input 
          type="color" 
          class="gradient-color-input" 
          value="#${Math.floor(Math.random()*16777215).toString(16)}"
        >
      `;
      gradientColorList.appendChild(newColorPicker);
      debounceGenerate();
    });
    
    // 移除渐变颜色
    removeGradientColorBtn.addEventListener('click', () => {
      if (gradientColorList.children.length > 2) {
        gradientColorList.removeChild(gradientColorList.lastElementChild as Node);
        debounceGenerate();
      }
    });
    
    // 回车键生成
    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateQRCode();
      }
    });
    
    // 其他输入框的回车键生成
    emailAddress.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateQRCode();
      }
    });
    
    smsPhone.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateQRCode();
      }
    });
    
    phoneNumber.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateQRCode();
      }
    });
    
    // 清除历史记录按钮
    clearHistoryBtn.addEventListener('click', clearHistory);
  }
  
  // 初始化
  function init() {
    initEventListeners();
    displayHistory(); // 显示历史记录
    generateQRCode(); // 初始生成
  }
  
  init();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initDemo);
