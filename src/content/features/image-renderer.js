/**
 * 图片渲染模块 - 将聊天渲染为图片
 */

import { showLoadingIndicator, hideLoadingIndicator, showNotification } from './export-ui.js';
import { applyTheme, getThemeBackgroundColor } from './themes.js';

/**
 * 创建图片预览模态框
 * @param {Array|String} htmlData - 渲染的HTML内容(单个字符串或HTML页面数组)
 * @param {String} service - 聊天服务名称
 */
export function createImagePreviewModal(htmlData, service) {
  // 移除已存在的模态框
  const existingModal = document.getElementById('dco-image-preview-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }
  
  // 判断是单页面还是多页面
  const htmlPages = Array.isArray(htmlData) ? htmlData : [htmlData];
  
  // 检测是否为移动设备
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  
  // 显示加载指示器
  const loadingIndicator = showLoadingIndicator('正在准备图片预览...');
  
  // 导入 html2canvas 库
  import('html2canvas').then(html2canvasModule => {
    const html2canvas = html2canvasModule.default;
    
    // 隐藏加载指示器
    hideLoadingIndicator(loadingIndicator);
    
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.id = 'dco-image-preview-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'flex-start';
    modal.style.padding = isMobile ? '10px' : '20px';
    modal.style.boxSizing = 'border-box';
    modal.style.backdropFilter = 'blur(8px)';
    modal.style.overflow = 'hidden';
    modal.style.overscrollBehavior = 'contain'; // 防止移动端下拉刷新
    
    // 创建顶部工具栏
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.justifyContent = 'space-between';
    toolbar.style.alignItems = 'center';
    toolbar.style.width = '100%';
    toolbar.style.maxWidth = '800px';
    toolbar.style.marginBottom = isMobile ? '8px' : '16px';
    toolbar.style.padding = isMobile ? '8px 10px' : '12px 16px';
    toolbar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    toolbar.style.borderRadius = '8px';
    toolbar.style.backdropFilter = 'blur(10px)';
    toolbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    toolbar.style.flexWrap = isMobile ? 'wrap' : 'nowrap'; // 移动端允许换行
    
    // 创建标题
    const title = document.createElement('h2');
    title.textContent = htmlPages.length > 1 ? 
      `聊天记录图片预览 (${htmlPages.length}张)` : 
      '聊天记录图片预览';
    title.style.color = 'white';
    title.style.margin = '0';
    title.style.fontSize = isMobile ? '16px' : '20px';
    title.style.fontWeight = '600';
    title.style.flexGrow = isMobile ? '1' : '0'; // 移动端标题占据更多空间
    
    // 添加标题到工具栏
    toolbar.appendChild(title);
    
    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.width = '100%';
    contentContainer.style.maxWidth = '800px';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.justifyContent = 'center';
    contentContainer.style.flex = '1';
    contentContainer.style.overflow = 'auto'; // 允许内容滚动
    contentContainer.style.padding = '0'; // 确保没有内边距影响尺寸
    contentContainer.style.position = 'relative'; // 建立新的定位上下文
    
    // 创建iframe容器（用于定位和添加滚动效果）
    const iframeContainer = document.createElement('div');
    iframeContainer.style.width = '750px';
    iframeContainer.style.maxWidth = '100%';
    iframeContainer.style.position = 'relative';
    iframeContainer.style.margin = '16px auto';
    iframeContainer.style.height = '80vh'; // 设置固定高度比例
    iframeContainer.style.overflow = 'auto'; // 添加滚动条
    iframeContainer.style.borderRadius = '8px';
    iframeContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    iframeContainer.style.backgroundColor = 'white';
    
    // 创建iframe用于预览（设置初始样式）
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%'; // 适应容器宽度
    iframe.style.minHeight = '100%'; // 至少填满容器高度
    iframe.style.backgroundColor = 'white';
    iframe.style.borderRadius = '0'; // 去掉圆角，由容器提供
    iframe.style.boxShadow = 'none'; // 移除阴影，由容器提供
    iframe.style.display = 'block';
    iframe.style.overflow = 'visible'; // 确保内容可见
    iframe.style.transition = 'opacity 0.3s ease';
    iframe.style.margin = '0'; // 确保没有外边距影响尺寸
    iframe.style.padding = '0'; // 确保没有内边距影响尺寸
    iframe.style.border = 'none'; // 移除边框
    
    // 创建分页指示器（当有多个页面时）
    let pageIndicator = null;
    let currentPageIndex = 0;
    
    if (htmlPages.length > 1) {
      pageIndicator = document.createElement('div');
      pageIndicator.style.color = 'white';
      pageIndicator.style.display = 'flex';
      pageIndicator.style.alignItems = 'center';
      pageIndicator.style.gap = '8px';
      pageIndicator.style.margin = isMobile ? '8px 0' : '0 12px';
      pageIndicator.style.fontSize = isMobile ? '14px' : '16px';
      
      // 上一页按钮
      const prevButton = document.createElement('button');
      prevButton.textContent = '←';
      prevButton.style.cursor = 'pointer';
      prevButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      prevButton.style.border = 'none';
      prevButton.style.borderRadius = '4px';
      prevButton.style.color = 'white';
      prevButton.style.padding = '4px 8px';
      prevButton.style.fontSize = isMobile ? '14px' : '16px';
      prevButton.style.display = 'inline-flex';
      prevButton.style.alignItems = 'center';
      prevButton.style.justifyContent = 'center';
      
      // 页面指示文本
      const pageText = document.createElement('span');
      pageText.textContent = `1 / ${htmlPages.length}`;
      
      // 下一页按钮
      const nextButton = document.createElement('button');
      nextButton.textContent = '→';
      nextButton.style.cursor = 'pointer';
      nextButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      nextButton.style.border = 'none';
      nextButton.style.borderRadius = '4px';
      nextButton.style.color = 'white';
      nextButton.style.padding = '4px 8px';
      nextButton.style.fontSize = isMobile ? '14px' : '16px';
      nextButton.style.display = 'inline-flex';
      nextButton.style.alignItems = 'center';
      nextButton.style.justifyContent = 'center';
      
      // 添加到页面指示器
      pageIndicator.appendChild(prevButton);
      pageIndicator.appendChild(pageText);
      pageIndicator.appendChild(nextButton);
      
      // 页面切换函数
      const changePage = (delta) => {
        // 计算新页面索引，处理循环边界
        let newPageIndex = currentPageIndex + delta;
        if (newPageIndex < 0) newPageIndex = htmlPages.length - 1;
        if (newPageIndex >= htmlPages.length) newPageIndex = 0;
        
        // 更新当前页面索引并渲染
        currentPageIndex = newPageIndex;
        
        // 更新页码显示
        if (pageIndicator) {
          const pageText = pageIndicator.querySelector('span');
          if (pageText) pageText.textContent = `${currentPageIndex + 1} / ${htmlPages.length}`;
        }
        
        // 清除当前视图
        iframe.style.opacity = '0.3'; // 淡出效果
        
        // 滚动回顶部
        if (iframeContainer) {
          iframeContainer.scrollTop = 0;
        }
        
        // 渲染新页面
        setTimeout(() => {
          renderCurrentPage();
          setTimeout(() => {
            iframe.style.opacity = '1'; // 淡入效果
          }, 50);
        }, 100);
      };
      
      // 绑定事件
      prevButton.addEventListener('click', () => changePage(-1));
      nextButton.addEventListener('click', () => changePage(1));
      
      // 将分页控件添加到工具栏
      toolbar.appendChild(pageIndicator);
    }
    
    // 添加iframe到容器
    iframeContainer.appendChild(iframe);
    
    // 添加iframe容器到内容容器
    contentContainer.appendChild(iframeContainer);
    
    // 创建状态消息
    const statusMessage = document.createElement('div');
    statusMessage.style.color = 'white';
    statusMessage.style.fontSize = '14px';
    statusMessage.style.margin = '8px 0'; 
    statusMessage.style.textAlign = 'center';
    statusMessage.style.width = '100%';
    statusMessage.style.maxWidth = '750px';
    
    // 添加状态消息到内容容器
    contentContainer.appendChild(statusMessage);
    
    // 创建操作按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '12px';
    buttonContainer.style.marginTop = '16px';
    buttonContainer.style.marginBottom = '20px';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.width = '100%';
    buttonContainer.style.maxWidth = '750px';
    
    // 创建下载按钮
    const downloadButton = document.createElement('button');
    downloadButton.textContent = htmlPages.length > 1 ? '下载当前页' : '下载图片';
    downloadButton.style.backgroundColor = '#4CAF50';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '4px';
    downloadButton.style.padding = '10px 16px';
    downloadButton.style.fontSize = '14px';
    downloadButton.style.fontWeight = '500';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.display = 'flex';
    downloadButton.style.alignItems = 'center';
    downloadButton.style.justifyContent = 'center';
    downloadButton.style.gap = '6px';
    
    // 创建下载所有页面按钮（当有多个页面时）
    const downloadAllButton = document.createElement('button');
    if (htmlPages.length > 1) {
      downloadAllButton.textContent = '下载全部页面';
      downloadAllButton.style.backgroundColor = '#FF9800';
      downloadAllButton.style.color = 'white';
      downloadAllButton.style.border = 'none';
      downloadAllButton.style.borderRadius = '4px';
      downloadAllButton.style.padding = '10px 16px';
      downloadAllButton.style.fontSize = '14px';
      downloadAllButton.style.fontWeight = '500';
      downloadAllButton.style.cursor = 'pointer';
      downloadAllButton.style.display = 'flex';
      downloadAllButton.style.alignItems = 'center';
      downloadAllButton.style.justifyContent = 'center';
      downloadAllButton.style.gap = '6px';
    }
    
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = htmlPages.length > 1 ? '复制当前页' : '复制到剪贴板';
    copyButton.style.backgroundColor = '#2196F3';
    copyButton.style.color = 'white';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '4px';
    copyButton.style.padding = '10px 16px';
    copyButton.style.fontSize = '14px';
    copyButton.style.fontWeight = '500';
    copyButton.style.cursor = 'pointer';
    copyButton.style.display = 'flex';
    copyButton.style.alignItems = 'center';
    copyButton.style.justifyContent = 'center';
    copyButton.style.gap = '6px';
    
    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.backgroundColor = '#757575';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.padding = '10px 16px';
    closeButton.style.fontSize = '14px';
    closeButton.style.fontWeight = '500';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    
    // 添加按钮到按钮容器
    buttonContainer.appendChild(downloadButton);
    if (htmlPages.length > 1) {
      buttonContainer.appendChild(downloadAllButton);
    }
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(closeButton);
    
    // 添加按钮容器到内容容器
    contentContainer.appendChild(buttonContainer);
    
    // 将工具栏和内容容器添加到模态框
    modal.appendChild(toolbar);
    modal.appendChild(contentContainer);
    
    // 将模态框添加到文档
    document.body.appendChild(modal);
    
    // 当前页面图片的canvas引用
    let currentCanvas = null;
    
    // 设置iframe样式以匹配导出图像
    const setIframeStyles = (iframeDoc) => {
      try {
        // 设置适合打印的页面宽度
        const metaViewport = document.createElement('meta');
        metaViewport.name = 'viewport';
        metaViewport.content = 'width=device-width, initial-scale=1';
        iframeDoc.head.appendChild(metaViewport);
        
        // 基础样式优化
        const baseStyle = document.createElement('style');
        baseStyle.textContent = `
          @page {
            size: 750px auto;
            margin: 0;
          }
          html, body {
            width: 750px !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
            height: auto !important;
            min-height: 100% !important;
          }
          body { 
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            color: #000000 !important;
            line-height: 1.6 !important;
            font-weight: 400 !important;
            font-size: 16px !important;
            width: 750px !important;
            box-sizing: border-box !important;
          }
          .chat-container {
            overflow: visible !important;
            padding: 12px !important;
          }
          .message-content, .message-content * {
            color: #000000 !important; 
            font-weight: 500 !important;
            font-size: 17px !important;
            line-height: 1.7 !important;
          }
          .message-content p {
            margin-bottom: 10px !important;
          }
          code {
            color: #E30B29 !important;
            font-weight: 600 !important;
            background-color: rgba(255, 36, 66, 0.1) !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            font-size: 15px !important;
          }
          pre {
            background-color: #282C34 !important;
            color: #E5E5E5 !important;
            border-left: 3px solid #FF2442 !important;
            padding: 12px !important;
            margin: 10px 0 !important;
            border-radius: 4px !important;
            overflow-x: auto !important;
          }
          strong {
            color: #000000 !important;
            font-weight: 700 !important;
          }
          a {
            color: #E30B29 !important;
            font-weight: 600 !important;
          }
          blockquote {
            background-color: #FFF4E0 !important;
            color: #333 !important;
            border-left: 3px solid #FF9933 !important;
            padding: 10px 15px !important;
            margin: 10px 0 !important;
          }
          iframe.body {
            color: #000000 !important;
          }
          p, span, div, h1, h2, h3, h4, h5, h6, li {
            color: #000000 !important;
          }
          * {
            box-sizing: border-box !important;
          }
        `;
        iframeDoc.head.appendChild(baseStyle);
        
        // 移动设备上添加额外样式优化
        if (isMobile) {
          const mobileStyle = document.createElement('style');
          mobileStyle.textContent = `
            body { 
              font-size: 14px !important; 
              word-break: break-word !important;
            }
            pre, code { 
              max-width: 100% !important; 
              overflow-x: auto !important;
              white-space: pre-wrap !important;
            }
            img, video { 
              max-width: 100% !important; 
              height: auto !important;
            }
            table {
              max-width: 100% !important;
              display: block !important;
              overflow-x: auto !important;
            }
          `;
          iframeDoc.head.appendChild(mobileStyle);
        }
        
        // 添加脚本强制应用样式
        const styleScript = document.createElement('script');
        styleScript.innerHTML = `
          (function() {
            // 强制应用黑色文本
            const allElements = document.querySelectorAll('*');
            const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li');
            
            textElements.forEach(el => {
              const style = window.getComputedStyle(el);
              const color = style.getPropertyValue('color');
              
              // 如果颜色是浅色，则强制变为黑色
              if (color && (color.includes('rgb(2') || color.includes('rgb(1') || color.includes('rgba(2') || color.includes('rgba(1'))) {
                el.style.setProperty('color', '#000000', 'important');
                el.style.setProperty('font-weight', '400', 'important');
              }
            });
          })();
        `;
        iframeDoc.body.appendChild(styleScript);
      } catch (error) {
        console.error('设置iframe样式失败:', error);
      }
    };
    
    // 渲染当前页面函数
    const renderCurrentPage = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // 清空之前的内容
      iframeDoc.open();
      iframeDoc.write(htmlPages[currentPageIndex]);
      iframeDoc.close();
      
      // 应用样式
      setIframeStyles(iframeDoc);
      
      // 调整样式以确保内容完整显示
      try {
        // 设置iframe内容，不再改变高度
        setTimeout(() => {
          // 获取内容实际高度，仅用于记录
          const contentHeight = iframeDoc.body.scrollHeight;
          
          // 检查是否为小红书页面
          const isXiaohongshuPage = iframeDoc.body.querySelector('.xiaohongshu-page') !== null;
          
          // 记录尺寸到控制台，便于调试
          console.log(`预览实际内容高度: 750 x ${contentHeight}px`);
          
          // 如果是小红书页面，确保样式正确
          if (isXiaohongshuPage) {
            const xiaohongshuPages = iframeDoc.querySelectorAll('.xiaohongshu-page');
            xiaohongshuPages.forEach(page => {
              page.style.width = '750px';
              page.style.margin = '0 auto';
              page.style.boxSizing = 'border-box';
              page.style.transform = 'none';
              page.style.maxWidth = '100%';
              page.style.height = 'auto';
              page.style.minHeight = 'auto'; // 确保能够完整显示
            });
          }
          
          // 确保iframe文档能够完整显示
          iframeDoc.documentElement.style.height = 'auto';
          iframeDoc.body.style.height = 'auto';
          iframeDoc.body.style.minHeight = '100%';
          iframeDoc.body.style.overflow = 'visible';
          
          // 更新状态消息
          statusMessage.textContent = htmlPages.length > 1 ? 
            `正在查看第 ${currentPageIndex + 1} 页，共 ${htmlPages.length} 页` : 
            '聊天记录预览已就绪';
            
          // 清除之前的画布缓存
          currentCanvas = null;
        }, 100);
      } catch (error) {
        console.error('调整iframe样式失败:', error);
      }
    };
    
    // 异步处理图片生成，优化性能
    const generateCanvasForCurrentPage = (callback) => {
      // 如果已经有缓存的canvas，直接使用
      if (currentCanvas) {
        callback(currentCanvas);
        return;
      }
      
      // 显示状态消息
      statusMessage.textContent = '正在生成图片，请稍候...';
      statusMessage.style.color = 'white';
      
      // 使用requestAnimationFrame优化渲染
      requestAnimationFrame(() => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeBody = iframeDoc.body;
        
        // 在开始渲染前，强制应用样式以提高对比度
        const styleFixScript = document.createElement('script');
        styleFixScript.textContent = `
          // 强制应用样式到所有文本元素
          document.querySelectorAll('.message-content').forEach(el => {
            el.style.color = '#000000';
            el.style.fontWeight = '500';
            el.style.fontSize = '17px';
            el.style.lineHeight = '1.7';
          });
          
          document.querySelectorAll('p').forEach(el => {
            el.style.marginBottom = '10px';
            el.style.color = '#000000';
            el.style.fontSize = '17px';
          });
          
          document.querySelectorAll('strong').forEach(el => {
            el.style.color = '#000000';
            el.style.fontWeight = '700';
          });
          
          document.querySelectorAll('code').forEach(el => {
            el.style.color = '#E30B29';
            el.style.fontWeight = '600';
            el.style.backgroundColor = 'rgba(255, 36, 66, 0.1)';
            el.style.padding = '2px 4px';
            el.style.borderRadius = '3px';
            el.style.fontSize = '15px';
          });
        `;
        iframeDoc.body.appendChild(styleFixScript);
        
        // 计算内容实际高度
        const contentHeight = iframeBody.scrollHeight;
        
        // 记录到控制台，便于调试
        console.log(`导出尺寸: 750 x ${contentHeight + 40}px`);
        
        // 固定宽度
        const targetWidth = 750; // 固定宽度为750px
        
        // 检查是否为小红书页面
        const isXiaohongshuPage = iframeBody.querySelector('.xiaohongshu-page') !== null;
        
        // 完全取消高度限制，不进行截断
        // 直接生成单张图像，不进行任何分页处理
        // 创建canvas，不限制高度
        const canvas = document.createElement('canvas');
        canvas.width = 750; // 固定750px宽度
        
        // 使用内容实际高度，不限制任何高度
        canvas.height = contentHeight + (isXiaohongshuPage ? 20 : 40); // 添加一点边距，确保内容完全显示
        
        const options = {
          allowTaint: true,
          useCORS: true,
          logging: false,
          scale: 2, // 提高缩放比例到3倍以获得更高清晰度
          backgroundColor: '#FFFFFF',
          windowWidth: 750,
          windowHeight: contentHeight,
          width: 750,
          height: contentHeight,
          scrollY: 0,
          scrollX: 0,
          removeContainer: true,
          // 优化文本渲染
          letterRendering: true,
          textRendering: 'geometricPrecision', // 使用几何精度文本渲染
          fontDisplay: 'swap', // 字体加载策略
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true, // 启用foreignObject渲染以获得更好的文本质量
          imageTimeout: 0,
          // 抗锯齿和平滑设置
          imageSmoothing: true,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
          // Canvas上下文属性
          alpha: true, // 启用alpha通道
          antialias: true, // 启用抗锯齿
          willReadFrequently: true // 优化频繁读取
        };
        
        html2canvas(iframeBody, options)
          .then(canvas => {
            // 小红书页面保持原始尺寸
            const finalCanvas = document.createElement('canvas');
            // const originalHeight = canvas.height / options.scale;
            
            // 设置画布尺寸，保留完整内容
            finalCanvas.width = 750;
            
            // 确保有足够的空间显示完整内容
            finalCanvas.height = Math.ceil(canvas.height / options.scale) + 5; // 添加少量额外空间
            console.log(`图片尺寸: 750 x ${finalCanvas.height}`);
            
            const ctx = finalCanvas.getContext('2d');
            
            // 填充白色背景
            // ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // 关闭图像平滑以获得更清晰的文字
            ctx.imageSmoothingEnabled = false;
            
            // 绘制完整内容，不进行比例调整
            ctx.drawImage(
              canvas,
              0, 0, canvas.width, canvas.height, // 源区域
              0, 0, finalCanvas.width, finalCanvas.height // 目标区域
            );
            
            currentCanvas = finalCanvas; // 缓存canvas
            callback(finalCanvas);
          })
          .catch(error => {
            console.error('生成图片失败:', error);
            statusMessage.textContent = '生成图片失败: ' + (error.message || '未知错误');
            statusMessage.style.color = '#f44336';
          });
      });
    };
    
    // 初始化渲染第一页
    renderCurrentPage();
    
    // 下载当前页面
    downloadButton.addEventListener('click', () => {
      // 显示加载中
      const originalText = downloadButton.textContent;
      downloadButton.textContent = '处理中...';
      downloadButton.disabled = true;
      statusMessage.textContent = '正在生成下载图片，请稍候...';
      
      // 异步生成下载图片
      generateCanvasForCurrentPage(canvas => {
        try {
          // 转换为PNG
          const imgData = canvas.toDataURL('image/png');
          
          // 创建下载链接
          const downloadLink = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14);
          const pageInfo = htmlPages.length > 1 ? `_p${currentPageIndex + 1}of${htmlPages.length}` : '';
          const filename = `${service ? service : 'chat'}_${timestamp}${pageInfo}.png`;
          
          downloadLink.href = imgData;
          downloadLink.download = filename;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          
          // 记录尺寸
          console.log(`导出图片尺寸: ${canvas.width} x ${canvas.height}`);
          
          // 触发下载
          downloadLink.click();
          
          // 清理
          setTimeout(() => {
            document.body.removeChild(downloadLink);
            downloadButton.textContent = originalText;
            downloadButton.disabled = false;
            statusMessage.textContent = '已下载图片';
            setTimeout(() => {
              statusMessage.textContent = htmlPages.length > 1 ? 
                `正在查看第 ${currentPageIndex + 1} 页，共 ${htmlPages.length} 页` : 
                '聊天记录预览已就绪';
            }, 2000);
          }, 100);
        } catch (error) {
          console.error('下载图片失败:', error);
          downloadButton.textContent = originalText;
          downloadButton.disabled = false;
          statusMessage.textContent = '下载图片失败: ' + (error.message || '未知错误');
          statusMessage.style.color = '#f44336';
        }
      });
    });
    
    // 添加下载所有页面按钮事件监听器（当有多个页面时）
    if (htmlPages.length > 1) {
      downloadAllButton.addEventListener('click', async () => {
        // 禁用按钮防止重复点击
        downloadAllButton.disabled = true;
        downloadAllButton.style.backgroundColor = '#cccccc';
        
        // 显示状态消息
        statusMessage.textContent = '正在准备下载所有页面...';
        statusMessage.style.color = 'white';
        
        // 引入JSZip库
        try {
          // 直接导入jszip库
          const JSZip = (await import('jszip')).default;
          
          const zip = new JSZip();
          const totalPages = htmlPages.length;
          let processedPages = 0;
          
          // 循环处理每一页
          for (let i = 0; i < totalPages; i++) {
            // 更新状态消息
            statusMessage.textContent = `正在处理第 ${i + 1}/${totalPages} 页...`;
            
            // 保存当前页码
            const currentIndex = i;
            
            // 切换到该页并等待渲染
            if (currentPageIndex !== currentIndex) {
              currentPageIndex = currentIndex;
              renderCurrentPage();
              // 等待渲染完成
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // 生成该页的canvas
            const canvas = await new Promise((resolve, reject) => {
              generateCanvasForCurrentPage(canvas => {
                resolve(canvas);
              });
            });
            
            // 获取Blob数据
            const blob = await new Promise(resolve => {
              canvas.toBlob(blob => resolve(blob), 'image/png', 0.95);
            });
            
            // 添加到ZIP文件
            zip.file(`聊天记录_第${i + 1}页.png`, blob);
            
            processedPages++;
            statusMessage.textContent = `已处理 ${processedPages}/${totalPages} 页...`;
          }
          
          // 生成ZIP文件并下载
          statusMessage.textContent = '正在生成ZIP文件...';
          const zipBlob = await zip.generateAsync({type: 'blob'});
          
          // 创建下载链接
          const link = document.createElement('a');
          const url = URL.createObjectURL(zipBlob);
          link.href = url;
          link.download = `聊天记录_所有页面_${new Date().getTime()}.zip`;
          
          // 触发下载
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 释放URL对象
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          // 更新状态消息
          statusMessage.textContent = '所有页面已下载为ZIP文件';
          statusMessage.style.color = '#4CAF50';
          
        } catch (error) {
          console.error('下载所有页面失败:', error);
          statusMessage.textContent = '下载失败: ' + (error.message || '未知错误');
          statusMessage.style.color = '#f44336';
        } finally {
          // 恢复按钮状态
          downloadAllButton.disabled = false;
          downloadAllButton.style.backgroundColor = '#FF9800';
        }
      });
    }
    
    // 添加复制按钮事件监听器
    copyButton.addEventListener('click', () => {
      // 禁用按钮防止重复点击
      copyButton.disabled = true;
      copyButton.style.backgroundColor = '#cccccc';
      
      // 显示状态消息
      statusMessage.textContent = '正在复制到剪贴板...';
      statusMessage.style.color = 'white';
      
      // 生成当前页面的canvas
      generateCanvasForCurrentPage(canvas => {
        try {
          canvas.toBlob(blob => {
            // 检查是否支持Clipboard API
            if (navigator.clipboard && navigator.clipboard.write && ClipboardItem) {
              const item = new ClipboardItem({ 'image/png': blob });
              navigator.clipboard.write([item]).then(() => {
                statusMessage.textContent = '已复制到剪贴板';
                statusMessage.style.color = '#4CAF50';
                
                // 3秒后清除状态消息
                setTimeout(() => {
                  statusMessage.textContent = htmlPages.length > 1 ? 
                    `正在查看第 ${currentPageIndex + 1} 页，共 ${htmlPages.length} 页` : 
                    '聊天记录预览已就绪';
                  statusMessage.style.color = 'white';
                }, 3000);
              }).catch(error => {
                console.error('复制到剪贴板失败:', error);
                // 回退方案：使用临时链接和下载
                showNotification('复制失败，请尝试直接下载图片。', 'warning');
                statusMessage.textContent = '复制失败，请尝试直接下载图片';
                statusMessage.style.color = '#ff9800';
              }).finally(() => {
                // 恢复按钮状态
                copyButton.disabled = false;
                copyButton.style.backgroundColor = '#2196F3';
              });
            } else {
              // 不支持Clipboard API时的回退方案
              showNotification('您的浏览器不支持复制功能，已准备下载图片。', 'info');
              statusMessage.textContent = '已准备图片，请尝试下载';
              statusMessage.style.color = '#ff9800';
              
              // 自动触发下载按钮
              downloadButton.click();
              
              // 恢复按钮状态
              copyButton.disabled = false;
              copyButton.style.backgroundColor = '#2196F3';
            }
          }, 'image/png', 1);
        } catch (error) {
          console.error('复制到剪贴板失败:', error);
          statusMessage.textContent = '复制失败: ' + (error.message || '未知错误');
          statusMessage.style.color = '#f44336';
          
          // 恢复按钮状态
          copyButton.disabled = false;
          copyButton.style.backgroundColor = '#2196F3';
        }
      });
    });
    
    // 添加关闭按钮事件监听器
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // 添加ESC键关闭模态框
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // 添加触摸滑动关闭功能（对于移动设备）
    if (isMobile) {
      let touchStartY = 0;
      let touchEndY = 0;
      
      modal.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });
      
      modal.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        // 如果是向下滑动，并且滑动距离大于50像素
        if (touchEndY - touchStartY > 50) {
          closeButton.click();
        }
      }, { passive: true });
    }
    
    // 添加关闭动画样式
    const closeStyle = document.createElement('style');
    closeStyle.textContent = `
      @keyframes dco-fade-out {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.95); }
      }
      @keyframes dco-fade-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    document.head.appendChild(closeStyle);
    
    // 添加入场动画
    modal.style.animation = 'dco-fade-in 0.3s ease-out forwards';
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 设置iframe内容
    setTimeout(() => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // 添加移动端视口设置
        if (isMobile) {
          const viewport = document.createElement('meta');
          viewport.name = 'viewport';
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          iframeDoc.head.appendChild(viewport);
        }
        
        iframeDoc.open();
        iframeDoc.write(htmlPages[currentPageIndex]);
        iframeDoc.close();
        
        // 应用预览样式
        setIframeStyles(iframeDoc);
        
        // 等待iframe内容加载完成
        iframe.onload = function() {
          // 强制iframe内容宽度为750px
          const htmlStyle = document.createElement('style');
          htmlStyle.textContent = `
            html, body {
              width: 750px !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow-x: hidden !important;
            }
          `;
          iframeDoc.head.appendChild(htmlStyle);
          
          // 检测页面背景色
          const detectBackgroundColor = () => {
            // 强制使用白色背景和深色文本，确保最佳对比度
            return 'light';
            /*
            try {
              const bodyBgColor = window.getComputedStyle(iframeDoc.body).backgroundColor;
              // 将rgb颜色转换为亮度值
              const rgb = bodyBgColor.match(/\d+/g);
              if (rgb && rgb.length >= 3) {
                const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                return brightness > 125 ? 'light' : 'dark';
              }
              return 'light'; // 默认为浅色
            } catch (e) {
              console.error('检测背景色失败:', e);
              return 'light';
            }
            */
          };
          
          // 自动检测主题
          const autoDetectTheme = () => {
            const theme = detectBackgroundColor();
            
            // 强制使用白色背景和深色文本
            downloadOption.backgroundColor = '#FFFFFF';
            downloadOption.textColor = '#000000';
            
            /*
            if (theme === 'dark') {
              downloadOption.backgroundColor = '#1E1E1E';
              downloadOption.textColor = '#FFFFFF';
            } else {
              downloadOption.backgroundColor = '#FFFFFF';
              downloadOption.textColor = '#000000';
            }
            */
          };
          
          // 获取当前背景色
          const getCurrentBackgroundColor = () => {
            if (bgColorSelector.value === 'custom') {
              return customColorPicker.value;
            }
            
            switch (bgColorSelector.value) {
              case 'black':
                return '#1a1a1a';
              case 'transparent':
                return 'transparent';
              default: // white
                return '#ffffff';
            }
          };
          
          // 主题选择器事件
          themeSelector.addEventListener('change', () => {
            const selectedTheme = themeSelector.value;
            
            // 如果选择了自动检测
            if (selectedTheme === 'auto') {
              bgColorSelector.style.display = 'inline-block';
              autoDetectTheme();
            } else {
              bgColorSelector.style.display = 'none';
              customColorPicker.style.display = 'none';
              applyTheme(iframeDoc, selectedTheme);
            }
          });
          
          // 背景色选择器事件
          bgColorSelector.addEventListener('change', () => {
            if (bgColorSelector.value === 'custom') {
              customColorPicker.style.display = 'inline-block';
            } else {
              customColorPicker.style.display = 'none';
            }
          });
          
          // 自定义颜色选择器事件
          customColorPicker.addEventListener('input', () => {
            // 根据自定义颜色的亮度自动选择主题
            const rgb = customColorPicker.value.match(/\w\w/g).map(x => parseInt(x, 16));
            const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
            const theme = brightness > 125 ? 'light' : 'dark';
            
            themeSelector.value = theme;
            applyTheme(iframeDoc, theme);
          });

          // 异步处理图片生成，优化性能
          const generateCanvasAsync = (callback) => {
            // 显示状态消息
            statusMessage.textContent = '正在生成图片，请稍候...';
            statusMessage.style.color = 'white';
            
            // 使用requestAnimationFrame优化渲染
            requestAnimationFrame(() => {
              const options = {
                allowTaint: true,
                useCORS: true,
                logging: false,
                scale: isMobile ? 1.5 : 2.5, // 提高分辨率以获得更清晰的文本
                backgroundColor: getCurrentBackgroundColor(),
                // 性能优化设置
                removeContainer: true,
                foreignObjectRendering: true, // 尝试启用foreignObject以获得更好的文本渲染
                letterRendering: true
              };
              
              html2canvas(iframeDoc.body, options)
                .then(canvas => callback(canvas))
                .catch(error => {
                  console.error('生成图片失败:', error);
                  statusMessage.textContent = '生成图片失败: ' + (error.message || '未知错误');
                  statusMessage.style.color = '#f44336';
                });
            });
          };
          
          // 添加复制按钮事件监听器
          copyButton.addEventListener('click', () => {
            try {
              // 禁用按钮防止重复点击
              copyButton.disabled = true;
              copyButton.style.backgroundColor = '#cccccc';
              
              // 显示状态消息
              statusMessage.textContent = '正在复制到剪贴板...';
              statusMessage.style.color = 'white';
              
              generateCanvasAsync(canvas => {
                try {
                  canvas.toBlob(blob => {
                    // 检查是否支持Clipboard API
                    if (navigator.clipboard && navigator.clipboard.write && ClipboardItem) {
                      const item = new ClipboardItem({ 'image/png': blob });
                      navigator.clipboard.write([item]).then(() => {
                        statusMessage.textContent = '已复制到剪贴板';
                        statusMessage.style.color = '#4CAF50';
                        
                        // 3秒后清除状态消息
                        setTimeout(() => {
                          statusMessage.textContent = htmlPages.length > 1 ? 
                            `正在查看第 ${currentPageIndex + 1} 页，共 ${htmlPages.length} 页` : 
                            '聊天记录预览已就绪';
                          statusMessage.style.color = 'white';
                        }, 3000);
                      }).catch(error => {
                        console.error('复制到剪贴板失败:', error);
                        // 回退方案：使用临时链接和下载
                        const url = URL.createObjectURL(blob);
                        showNotification('复制失败，请尝试直接下载图片。', 'warning');
                        statusMessage.textContent = '复制失败，请尝试直接下载图片';
                        statusMessage.style.color = '#ff9800';
                      }).finally(() => {
                        // 恢复按钮状态
                        copyButton.disabled = false;
                        copyButton.style.backgroundColor = '#2196F3';
                      });
                    } else {
                      // 不支持Clipboard API时的回退方案
                      const url = URL.createObjectURL(blob);
                      showNotification('您的浏览器不支持复制功能，已准备下载图片。', 'info');
                      statusMessage.textContent = '已准备图片，请尝试下载';
                      statusMessage.style.color = '#ff9800';
                      
                      // 自动触发下载按钮
                      downloadButton.click();
                      
                      // 恢复按钮状态
                      copyButton.disabled = false;
                      copyButton.style.backgroundColor = '#2196F3';
                    }
                  });
                } catch (error) {
                  console.error('处理图片失败:', error);
                  statusMessage.textContent = '处理图片失败: ' + (error.message || '未知错误');
                  statusMessage.style.color = '#f44336';
                  
                  // 恢复按钮状态
                  copyButton.disabled = false;
                  copyButton.style.backgroundColor = '#2196F3';
                }
              });
            } catch (error) {
              console.error('复制到剪贴板时出错:', error);
              statusMessage.textContent = '复制时出错: ' + (error.message || '未知错误');
              statusMessage.style.color = '#f44336';
              
              // 恢复按钮状态
              copyButton.disabled = false;
              copyButton.style.backgroundColor = '#2196F3';
            }
          });
          
          // 添加下载按钮事件监听器
          downloadButton.addEventListener('click', () => {
            try {
              // 禁用按钮防止重复点击
              downloadButton.disabled = true;
              downloadButton.style.backgroundColor = '#cccccc';
              
              // 显示状态消息
              statusMessage.textContent = '正在生成图片，请稍候...';
              statusMessage.style.color = 'white';
              
              generateCanvasAsync(canvas => {
                try {
                  // 优化图片质量
                  const imgData = canvas.toDataURL('image/png', 0.9);
                  const link = document.createElement('a');
                  link.href = imgData;
                  
                  // 生成更友好的文件名
                  const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
                  link.download = `chat-${service}-${currentDate}.png`;
                  
                  // 使用更安全的方式触发下载
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // 更新状态消息
                  statusMessage.textContent = '图片已生成并下载';
                  statusMessage.style.color = '#4CAF50';
                  
                  // 3秒后清除状态消息
                  setTimeout(() => {
                    statusMessage.textContent = '';
                  }, 3000);
                } catch (error) {
                  console.error('保存图片失败:', error);
                  statusMessage.textContent = '保存图片失败: ' + (error.message || '未知错误');
                  statusMessage.style.color = '#f44336';
                } finally {
                  // 恢复按钮状态
                  downloadButton.disabled = false;
                  downloadButton.style.backgroundColor = '#4CAF50';
                }
              });
            } catch (error) {
              console.error('处理图片时出错:', error);
              statusMessage.textContent = '处理图片时出错: ' + (error.message || '未知错误');
              statusMessage.style.color = '#f44336';
              
              // 恢复按钮状态
              downloadButton.disabled = false;
              downloadButton.style.backgroundColor = '#4CAF50';
            }
          });
          
          // 默认应用浅色主题
          applyTheme(iframeDoc, 'light');
        };
      } catch (error) {
        console.error('设置iframe内容时出错:', error);
        statusMessage.textContent = '设置预览内容时出错: ' + (error.message || '未知错误');
        statusMessage.style.color = '#f44336';
      }
    }, 100);
    
    // 当模态框关闭时清理事件和恢复滚动
    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
    
    // 添加关闭时的清理函数
    modal.addEventListener('animationend', (e) => {
      if (e.animationName === 'dco-fade-out') {
        cleanup();
      }
    });
  }).catch(error => {
    // 隐藏加载指示器
    hideLoadingIndicator(loadingIndicator);
    
    console.error('加载 html2canvas 库失败:', error);
    alert('加载图片转换库失败: ' + (error.message || '未知错误'));
  });
} 