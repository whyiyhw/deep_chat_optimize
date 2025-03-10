/**
 * 背景脚本 - 扩展的主要后台逻辑
 * 处理消息通信、数据存储和全局状态管理
 */

// 导入 markdown-it 和插件
import MarkdownIt from 'markdown-it';
import markdownItHtml5Embed from 'markdown-it-html5-embed';
import markdownItContainer from 'markdown-it-container';
import markdownItAttrs from 'markdown-it-attrs';

// 初始化 markdown-it 实例，配置选项
const md = new MarkdownIt({
  html: true,        // 启用 HTML 标签
  breaks: true,      // 将换行符转换为 <br>
  linkify: true,     // 自动将 URL 转换为链接
  typographer: true, // 启用一些语言中性的替换和引号美化
  xhtmlOut: false    // 不使用 XHTML 闭合标签，避免破坏 SVG
});

// 使用插件
md.use(markdownItHtml5Embed, {
  html5embed: {
    useImageSyntax: true,    // 使用图像语法嵌入媒体
    attributes: {            // 默认属性
      audio: 'controls preload="metadata"',
      video: 'controls preload="metadata"',
      svg: 'class="svg-embed"'
    }
  }
});

// 添加自定义容器支持
md.use(markdownItContainer, 'svg', {
  validate: function(params) {
    return params.trim().match(/^svg\s*(.*)$/);
  },
  render: function (tokens, idx) {
    if (tokens[idx].nesting === 1) {
      // 开始标签
      return '<div class="svg-container">';
    } else {
      // 结束标签
      return '</div>';
    }
  }
});

// 添加属性支持，扩展允许的属性列表以支持更多 SVG 属性
md.use(markdownItAttrs, {
  // 允许的属性 - 扩展以支持更多 SVG 相关属性
  allowedAttributes: [
    // 基本属性
    'id', 'class', 'style', 'title', 'lang', 'dir',
    // SVG 特有属性
    'width', 'height', 'viewBox', 'xmlns', 'version', 'preserveAspectRatio',
    // 图形属性
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
    'stroke-dashoffset', 'stroke-opacity', 'fill-opacity', 'opacity', 'transform',
    // 动画属性
    'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
    'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode',
    'animation-play-state',
    // 其他常用属性
    'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'x1', 'y1', 'x2', 'y2',
    'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
    'clip-path', 'mask', 'filter'
  ]
});

// 创建一个函数来处理复杂的 SVG 内容
function processSvgContent(content) {
  // 检查是否是 SVG 内容
  if (!content.includes('<svg') && !content.includes('</svg>')) {
    return null; // 不是 SVG 内容
  }
  
  try {
    // 提取完整的 SVG 标签及其内容
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      return svgMatch[0]; // 返回完整的 SVG 内容
    }
  } catch (error) {
    console.error('处理 SVG 内容时出错:', error);
  }
  
  // 如果无法提取或处理，则返回原始内容
  return content;
}

// 自定义 markdown-it 的渲染规则，确保 SVG 内容被正确处理
const defaultRender = md.renderer.rules.html_block || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

// 重写 html_block 规则，保留 SVG 内容
md.renderer.rules.html_block = function(tokens, idx, options, env, self) {
  const content = tokens[idx].content;
  
  // 处理 SVG 内容
  const svgContent = processSvgContent(content);
  if (svgContent) {
    return svgContent; // 返回处理后的 SVG 内容
  }
  
  // 对于非 SVG 内容，使用默认渲染器
  return defaultRender(tokens, idx, options, env, self);
};

// 同样处理内联 HTML
const defaultInlineRender = md.renderer.rules.html_inline || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.html_inline = function(tokens, idx, options, env, self) {
  const content = tokens[idx].content;
  
  // 处理 SVG 内容
  const svgContent = processSvgContent(content);
  if (svgContent) {
    return svgContent; // 返回处理后的 SVG 内容
  }
  
  // 对于非 SVG 内容，使用默认渲染器
  return defaultInlineRender(tokens, idx, options, env, self);
};

// 监听扩展安装或更新事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 首次安装时的逻辑
    console.log('扩展已安装');
    
    // 初始化存储的默认值
    chrome.storage.sync.set({
      theme: 'auto',
      markdownSupport: true,
      autoBackup: false,
      shortcuts: {
        export: 'Ctrl+Shift+E',
        theme: 'Ctrl+Shift+T'
      }
    });
  } else if (details.reason === 'update') {
    // 更新时的逻辑
    console.log(`扩展已更新到版本 ${chrome.runtime.getManifest().version}`);
  }
});

// 监听来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  
  if (message.type === 'EXPORT_CHAT') {
    // 处理导出聊天数据的请求
    handleExportChat(message.data, message.format)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 表示将异步发送响应
  }
  
  if (message.type === 'EXPORT_ALL_CHATS') {
    // 处理导出所有聊天数据的请求
    handleExportAllChats(message.data, message.format)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 表示将异步发送响应
  }
  
  if (message.type === 'RENDER_CHAT_AS_HTML') {
    // 处理将聊天数据渲染为HTML的请求
    try {
      console.log('渲染聊天数据为HTML:', message.data);
      const htmlPages = convertChatToHTML(message.data);
      sendResponse({ success: true, htmlPages: htmlPages });
    } catch (error) {
      console.error('渲染聊天数据为HTML失败:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // 表示将异步发送响应
  }
  
  if (message.type === 'GET_SETTINGS') {
    // 获取用户设置
    chrome.storage.sync.get(null, (settings) => {
      sendResponse({ success: true, data: settings });
    });
    return true; // 表示将异步发送响应
  }
});

/**
 * 处理聊天数据导出
 * @param {Object} chatData - 要导出的聊天数据
 * @param {String} format - 导出格式 (json, md)
 * @returns {Promise<Object>} - 导出结果
 */
async function handleExportChat(chatData, format = 'json') {
  try {
    let content;
    let mimeType;
    let filename = `chat-export-${new Date().toISOString().split('T')[0]}`;
    
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(chatData, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
      
      case 'md':
      case 'markdown':
        // 将聊天数据转换为Markdown格式
        content = convertChatToMarkdown(chatData);
        mimeType = 'text/markdown';
        filename += '.md';
        break;
      
      default:
        // 如果提供了不支持的格式，默认使用JSON
        content = JSON.stringify(chatData, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
    }
    
    // 创建Data URL而不是使用URL.createObjectURL
    const dataUrl = `data:${mimeType};base64,${btoa(unescape(encodeURIComponent(content)))}`;
    
    // 使用chrome.downloads API创建下载
    const downloadId = await chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true
    });
    
    return { downloadId, filename };
  } catch (error) {
    console.error('导出聊天数据失败:', error);
    throw error;
  }
}

/**
 * 处理所有聊天数据导出
 * @param {Array} allChatsData - 要导出的所有聊天数据
 * @param {String} format - 导出格式 (json, md)
 * @returns {Promise<Object>} - 导出结果
 */
async function handleExportAllChats(allChatsData, format = 'json') {
  try {
    let content;
    let mimeType;
    let filename = `all-chats-export-${new Date().toISOString().split('T')[0]}`;
    
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(allChatsData, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
      
      case 'md':
      case 'markdown':
        // 将所有聊天数据转换为Markdown格式
        content = convertAllChatsToMarkdown(allChatsData);
        mimeType = 'text/markdown';
        filename += '.md';
        break;
      
      default:
        // 如果提供了不支持的格式，默认使用JSON
        content = JSON.stringify(allChatsData, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
    }
    
    // 创建Data URL而不是使用URL.createObjectURL
    const dataUrl = `data:${mimeType};base64,${btoa(unescape(encodeURIComponent(content)))}`;
    
    // 使用chrome.downloads API创建下载
    const downloadId = await chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true
    });
    
    return { downloadId, filename };
  } catch (error) {
    console.error('导出所有聊天数据失败:', error);
    throw error;
  }
}

/**
 * 将聊天数据转换为Markdown格式
 * @param {Object} chatData - 聊天数据
 * @returns {String} - Markdown文本
 */
function convertChatToMarkdown(chatData) {
  let markdown = `# 聊天记录\n\n日期: ${new Date().toLocaleString()}\n\n`;
  
  if (chatData.messages && Array.isArray(chatData.messages)) {
    chatData.messages.forEach(msg => {
      const role = msg.role === 'user' ? '用户' : 'AI';
      markdown += `## ${role}\n\n${msg.content}\n\n`;
    });
  }
  
  return markdown;
}

/**
 * 将所有聊天数据转换为Markdown格式
 * @param {Array} allChatsData - 所有聊天数据
 * @returns {String} - Markdown文本
 */
function convertAllChatsToMarkdown(allChatsData) {
  let markdown = `# 所有聊天记录\n\n导出日期: ${new Date().toLocaleString()}\n\n`;
  
  if (Array.isArray(allChatsData)) {
    allChatsData.forEach((chatData, index) => {
      markdown += `# 聊天 ${index + 1}: ${chatData.title || '未命名聊天'}\n\n`;
      markdown += `ID: ${chatData.id}\n\n`;
      markdown += `日期: ${new Date(chatData.timestamp).toLocaleString()}\n\n`;
      
      if (chatData.messages && Array.isArray(chatData.messages)) {
        chatData.messages.forEach(msg => {
          const role = msg.role === 'user' ? '用户' : 'AI';
          markdown += `## ${role}\n\n${msg.content}\n\n`;
        });
      }
      
      markdown += `---\n\n`;
    });
  }
  
  return markdown;
}

/**
 * 将聊天数据转换为HTML格式
 * @param {Object} chatData - 聊天数据
 * @returns {String} - HTML文本
 */
function convertChatToHTML(chatData) {
  // 智能分页：考虑消息长度的分页
  // 估计单条消息的长度，以字符数作为基础计算
  const estimateMessageLength = (msg) => {
    let length = msg.content ? msg.content.length : 0;
    // 代码块消耗更多空间
    const codeBlockCount = (msg.content.match(/```[\s\S]*?```/g) || []).length;
    length += codeBlockCount * 200; // 代码块额外加权
    
    // 思考内容消耗额外空间
    if (msg.thinking_content) {
      length += msg.thinking_content.length * 0.7; // 思考内容权重稍低
    }
    
    return length;
  };
  
  // 目标是每页有合理的内容长度
  const TARGET_PAGE_LENGTH = 1500; // 每页目标字符数
  
  // 分割消息为多个页面
  let pages = [];
  let currentPage = [];
  let currentPageLength = 0;
  
  if (chatData.messages && Array.isArray(chatData.messages)) {
    chatData.messages.forEach((msg, index) => {
      const msgLength = estimateMessageLength(msg);
      
      // 检查当前消息是否会导致页面过长
      if (currentPageLength > 0 && currentPageLength + msgLength > TARGET_PAGE_LENGTH) {
        // 如果当前页已有内容且加入新消息会超出目标长度，则创建新页面
        pages.push([...currentPage]);
        currentPage = [msg];
        currentPageLength = msgLength;
      } else {
        // 否则添加到当前页面
        currentPage.push(msg);
        currentPageLength += msgLength;
      }
      
      // 最后一条消息，确保添加最后一页
      if (index === chatData.messages.length - 1 && currentPage.length > 0) {
        pages.push([...currentPage]);
      }
    });
  }
  
  // 如果没有内容，创建一个空页面
  if (pages.length === 0) {
    pages.push([]);
  }
  
  // 生成所有页面的HTML
  let allPagesHtml = pages.map((pageMessages, pageIndex) => {
    return generatePageHTML(chatData, pageMessages, pageIndex + 1, pages.length);
  });
  
  // 返回所有页面HTML的数组
  return allPagesHtml;
}

/**
 * 生成单个页面的HTML
 * @param {Object} chatData - 聊天数据
 * @param {Array} messages - 当前页面的消息数组
 * @param {Number} pageNumber - 当前页码
 * @param {Number} totalPages - 总页数
 * @returns {String} - 页面HTML
 */
function generatePageHTML(chatData, messages, pageNumber, totalPages) {
  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${chatData.title || '智能对话记录'} (${pageNumber}/${totalPages})</title>
    <style>
      /* 全局样式 */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        --primary-color: #FF2442; /* 小红书红色 */
        --primary-dark: #E30B29; /* 深红色，用于文字 */
        --secondary-color: #FF6B81; /* 浅红色 */
        --accent-color: #FF9933; /* 小红书特色橙色 */
        --accent-dark: #E67E0D; /* 深橙色，用于重要文字 */
        --accent-light: #FFF4E0; /* 浅橙色背景 */
        --user-bg: #F0F2F5; /* 调整用户消息背景，提高对比度 */
        --ai-bg: #FFF0F0; /* 调整AI消息背景，提高对比度 */
        --user-header: #DFE3E8; /* 用户消息头部背景 */
        --ai-header: #FFE5E5; /* AI消息头部背景 */
        --text-primary: #111111; /* 主要文本色，加深至接近黑色 */
        --text-secondary: #333333; /* 次要文本色，加深 */
        --text-tertiary: #555555; /* 第三级文本色，加深 */
        --text-light: #777777; /* 浅色文本，加深 */
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        --shadow-sm: 0 2px 8px rgba(255, 36, 66, 0.1);
        --shadow-md: 0 4px 12px rgba(255, 36, 66, 0.15);
        --shadow-accent: 0 4px 12px rgba(255, 153, 51, 0.25);
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --gradient-main: linear-gradient(135deg, #FF2442 0%, #FF6B81 100%);
        --gradient-accent: linear-gradient(135deg, #FF9933 0%, #FFCC33 100%);
        --gradient-dark: linear-gradient(135deg, #E30B29 0%, #FF4E6D 100%);
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      body {
        font-family: var(--font-sans);
        background-color: #FFF;
        color: var(--text-primary);
        line-height: 1.6;
        /* 固定3:4长宽比，无右侧空白 */
        width: 100%;
        height: 133.33vw; /* 保持3:4比例 */
        max-width: 750px;
        max-height: 1000px;
        margin: 0 auto;
        position: relative;
        overflow: hidden;
        -webkit-font-smoothing: antialiased; /* 提高字体清晰度 */
        -moz-osx-font-smoothing: grayscale; /* 提高字体清晰度 */
      }
      
      /* 容器样式 - 小红书风格 */
      .xiaohongshu-page {
        width: 100%;
        height: 100%;
        position: relative;
        background: #FFFFFF;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background-image: 
          radial-gradient(circle at 5% 95%, rgba(255, 36, 66, 0.05) 0%, transparent 30%),
          radial-gradient(circle at 95% 5%, rgba(255, 153, 51, 0.05) 0%, transparent 30%);
      }
      
      /* 头部样式 - 小红书风格提升 */
      .header {
        padding: 16px;
        background: linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%);
        border-bottom: 1px solid #F0F0F0;
        position: relative;
        display: flex;
        flex-direction: column;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.03);
      }
      
      /* 头部背景装饰 */
      .header::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        background-image: var(--gradient-main);
        opacity: 0.08;
        border-radius: 0 0 0 100px;
        z-index: 0;
      }
      
      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        position: relative;
        z-index: 1;
      }
      
      .header-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--text-primary);
        margin-right: 8px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      
      .page-indicator {
        font-size: 14px;
        color: #fff;
        background: var(--gradient-dark);
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: var(--shadow-sm);
        letter-spacing: 0.5px;
      }
      
      .header-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-tertiary);
        position: relative;
        z-index: 1;
        font-weight: 500; /* 稍微加粗 */
      }
      
      .header-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--gradient-main);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        font-weight: bold;
        margin-right: 6px;
        box-shadow: var(--shadow-sm);
      }
      
      /* 聊天容器 */
      .chat-container {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        animation: fadeIn 0.5s ease-out forwards;
        background: linear-gradient(180deg, #FFFFFF 0%, #FCFCFC 100%);
      }
      
      /* 消息样式 - 更吸引眼球的小红书风格 */
      .message {
        margin-bottom: 24px;
        border-radius: var(--radius-md);
        overflow: hidden;
        background: #FFFFFF;
        border: 1px solid rgba(240, 240, 240, 0.8);
        box-shadow: var(--shadow-sm);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        animation: fadeIn 0.5s ease-out forwards;
        animation-delay: calc(0.1s * var(--idx, 0));
        transform-origin: center left;
        position: relative;
      }
      
      .message:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px) scale(1.01);
      }
      
      /* 消息装饰元素 */
      .message::after {
        content: "";
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--gradient-main);
        opacity: 0.2;
      }
      
      .user.message::after {
        background: var(--gradient-accent);
        opacity: 0.3;
      }
      
      .message-header {
        padding: 12px 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        position: relative;
        overflow: hidden;
      }
      
      .message-header::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background: var(--gradient-main);
        opacity: 0.1;
      }
      
      .message-content {
        padding: 16px;
        font-size: 16px; /* 增大字体 */
        line-height: 1.6;
        word-break: break-word;
        color: var(--text-primary);
        letter-spacing: 0.3px;
        font-weight: 500; /* 增加文字粗细 */
        text-shadow: 0 0 1px rgba(0,0,0,0.05); /* 轻微文字阴影增强可读性 */
      }
      
      /* 用户消息样式 */
      .user .message-header {
        color: var(--text-primary);
        background-color: var(--user-header);
      }
      
      .user .message-content {
        background-color: var(--user-bg);
      }
      
      .user .message-header::before {
        background: var(--gradient-accent);
        opacity: 0.15; /* 增强对比度 */
      }
      
      /* AI消息样式 */
      .ai .message-header {
        color: var(--primary-dark);
        background-color: var(--ai-header);
      }
      
      .ai .message-content {
        background-color: var(--ai-bg);
      }
      
      /* 头像样式 */
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      }
      
      .user .avatar {
        background: var(--gradient-accent);
      }
      
      .ai .avatar {
        background: var(--gradient-main);
      }
      
      /* 代码样式优化 */
      pre {
        background-color: #282C34; /* 深色背景，高对比度 */
        color: #E5E5E5; /* 浅色文本，高对比度 */
        padding: 16px;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        margin: 14px 0;
        font-size: 13px;
        border: none;
        position: relative;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        border-left: 3px solid var(--primary-color);
      }
      
      pre::before {
        content: "代码";
        position: absolute;
        top: -8px;
        right: 10px;
        background: var(--gradient-accent);
        color: white;
        font-size: 10px;
        padding: 2px 10px;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 14px; /* 增大代码字体 */
        background-color: rgba(255, 36, 66, 0.1); /* 增强背景对比度 */
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--primary-dark);
        font-weight: 600; /* 加粗代码 */
      }
      
      /* 其他元素样式优化 */
      p {
        margin-bottom: 12px;
      }
      
      /* 引用块 */
      blockquote {
        border-left: 3px solid var(--accent-color);
        padding: 10px 16px;
        background-color: var(--accent-light);
        margin: 14px 0;
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: var(--accent-dark);
        font-weight: 500;
        position: relative;
      }
      
      blockquote::before {
        content: """;
        position: absolute;
        left: 8px;
        top: 0;
        font-size: 40px;
        color: var(--accent-color);
        opacity: 0.2;
        font-family: serif;
        line-height: 1;
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius-sm);
        margin: 14px 0;
        box-shadow: var(--shadow-sm);
      }
      
      ul, ol {
        padding-left: 24px;
        margin: 14px 0;
        color: var(--text-primary);
      }
      
      li {
        margin-bottom: 8px;
        position: relative;
      }
      
      /* 强化的思考内容样式 */
      .thinking-content {
        position: relative;
        font-size: 15px; /* 增大字体 */
        color: var(--text-secondary);
        background-color: #FFFAF5;
        padding: 18px;
        border-radius: 12px;
        margin-top: 14px;
        border-left: 4px solid var(--accent-color);
        box-shadow: var(--shadow-accent);
        font-weight: 500; /* 增加字重 */
      }
      
      .thinking-content::before {
        content: "思考过程";
        position: absolute;
        top: -10px;
        left: 14px;
        background: var(--gradient-accent);
        color: white;
        font-size: 12px;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: bold;
        box-shadow: var(--shadow-sm);
        letter-spacing: 0.5px;
      }
      
      /* 页脚样式增强 */
      .footer {
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: var(--text-tertiary);
        border-top: 1px solid #F2F2F2;
        background-color: #FCFCFC;
        position: relative;
      }
      
      /* 页脚装饰 */
      .footer::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--gradient-main);
        opacity: 0.3;
      }
      
      .xiaohongshu-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(to right, #FFF0F0, #FFF6F6);
        color: var(--primary-dark);
        padding: 6px 14px;
        border-radius: 18px;
        font-size: 13px;
        font-weight: 600;
        margin-top: 12px;
        box-shadow: var(--shadow-sm);
        border: 1px solid rgba(255, 36, 66, 0.12);
        position: relative;
        z-index: 1;
      }
      
      .xiaohongshu-tag:hover {
        animation: pulse 1s infinite ease-in-out;
      }
      
      /* 小红书图标增强 */
      .xiaohongshu-icon {
        width: 20px;
        height: 20px;
        background: var(--gradient-main);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(255, 36, 66, 0.3);
      }
      
      /* 互动元素 - 点赞、收藏、分享计数 */
      .interaction-stats {
        display: flex;
        justify-content: space-between;
        padding: 10px 16px;
        margin-top: 10px;
        border-top: 1px dashed rgba(0, 0, 0, 0.06);
        font-size: 13px;
        color: var(--text-tertiary);
        font-weight: 500;
      }
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 5px;
        transition: transform 0.3s ease, color 0.3s ease;
      }
      
      .stat-item:hover {
        transform: scale(1.05);
        color: var(--primary-dark);
      }
      
      /* 装饰元素 - 小红书风格标签 */
      .decorative-tag {
        position: absolute;
        top: 14px;
        right: 14px;
        background: var(--gradient-dark);
        color: white;
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 6px;
        transform: rotate(3deg);
        box-shadow: var(--shadow-sm);
        z-index: 5;
        letter-spacing: 0.5px;
      }
      
      /* 强调文本 */
      strong {
        color: var(--text-primary);
        font-weight: 700; /* 更粗 */
      }
      
      /* 文本链接 */
      a {
        transition: all 0.2s ease;
        color: var(--primary-dark) !important; /* 强制使用深色 */
        font-weight: 600 !important; /* 强制加粗 */
        text-decoration: none !important;
        border-bottom: 1.5px dotted var(--primary-color) !important; /* 更明显的下划线 */
      }
      
      a:hover {
        opacity: 0.9;
        text-decoration: none;
      }

      /* 深色环境适配 */
      @media (prefers-color-scheme: dark) {
        :root {
          --text-primary: #000000; /* 深色模式下用纯黑色确保最大对比度 */
          --text-secondary: #222222;
          --text-tertiary: #444444;
          --text-light: #666666;
        }
      }
      
      /* 高对比度印刷适配 */
      @media print {
        body {
          color: black !important;
          background: white !important;
        }
        
        .message-content {
          color: black !important;
          font-weight: 600 !important;
        }
        
        a, strong, code {
          color: black !important;
          font-weight: 700 !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="xiaohongshu-page">
      <div class="decorative-tag">置顶精选</div>
      <div class="header">
        <div class="header-top">
          <h1 class="header-title">${chatData.title || '智能对话记录'}</h1>
          <div class="page-indicator">${pageNumber}/${totalPages}</div>
        </div>
        <div class="header-meta">
          <div class="header-avatar">AI</div>
          <span>${chatData.service || '智能对话助手'}</span>
          <span>·</span>
          <span>${new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      <div class="chat-container">
  `;
  
  // 添加当前页面的消息
  messages.forEach((msg, idx) => {
    const roleClass = msg.role.toLowerCase() === 'user' ? 'user' : 'ai';
    const roleName = msg.role.toLowerCase() === 'user' ? '我' : 'AI';
    const avatarText = msg.role.toLowerCase() === 'user' ? '我' : 'AI';
    
    // 处理内容，确保代码块和其他格式正确显示
    let formattedContent = msg.content || '';
    
    // 保存 SVG 内容，避免被后续处理破坏
    const svgPlaceholders = [];
    let svgIndex = 0;
    
    // 提取并保存所有 SVG 内容
    formattedContent = formattedContent.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
      const placeholder = `__SVG_PLACEHOLDER_${svgIndex}__`;
      svgPlaceholders.push({ placeholder, content: match });
      svgIndex++;
      return placeholder;
    });
    
    // 使用 markdown-it 将 Markdown 转换为 HTML
    formattedContent = md.render(formattedContent);
    
    // 恢复 SVG 内容
    svgPlaceholders.forEach(({ placeholder, content }) => {
      // 为 SVG 添加响应式样式
      const enhancedSvg = content.replace(/<svg/, '<svg style="max-width:100%;height:auto;display:block;margin:16px auto;"');
      formattedContent = formattedContent.replace(placeholder, enhancedSvg);
    });
    
    // 添加自定义样式到生成的 HTML 元素
    // 为代码块添加样式
    formattedContent = formattedContent.replace(/<pre><code( class="language-([^"]+)")?>([^<]+)<\/code><\/pre>/g, (match, langClass, lang, code) => {
      return `<pre style="background-color:#282C34;color:#E5E5E5;padding:16px;border-radius:8px;margin:14px 0;font-size:14px;border-left:3px solid var(--primary-color);position:relative;"><code style="font-family:monospace;color:#E5E5E5;">${code.trim()}</code><div style="position:absolute;top:-8px;right:10px;background:var(--gradient-accent);color:white;font-size:10px;padding:2px 10px;border-radius:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${lang || '代码'}</div></pre>`;
    });
    
    // 为行内代码添加样式
    formattedContent = formattedContent.replace(/<code>([^<]+)<\/code>/g, '<code style="font-family:monospace;font-size:14px;background-color:rgba(255,36,66,0.1);padding:2px 6px;border-radius:4px;color:#E30B29;font-weight:600;">$1</code>');
    
    // 为标题添加样式
    formattedContent = formattedContent.replace(/<h3>([^<]+)<\/h3>/g, '<strong style="display:block;margin-top:14px;margin-bottom:8px;font-size:16px;color:var(--text-primary);border-left:3px solid var(--primary-color);padding-left:8px;font-weight:700;">$1</strong>');
    formattedContent = formattedContent.replace(/<h2>([^<]+)<\/h2>/g, '<strong style="display:block;margin-top:16px;margin-bottom:10px;font-size:17px;color:var(--text-primary);border-left:3px solid var(--primary-color);padding-left:8px;font-weight:700;">$1</strong>');
    formattedContent = formattedContent.replace(/<h1>([^<]+)<\/h1>/g, '<strong style="display:block;margin-top:18px;margin-bottom:12px;font-size:18px;color:var(--text-primary);border-left:3px solid var(--primary-color);padding-left:8px;font-weight:700;">$1</strong>');
    
    // 为粗体添加样式
    formattedContent = formattedContent.replace(/<strong>([^<]+)<\/strong>/g, '<strong style="font-weight:700;color:#000;">$1</strong>');
    
    // 为斜体添加样式
    formattedContent = formattedContent.replace(/<em>([^<]+)<\/em>/g, '<em style="color:var(--accent-dark);font-weight:500;">$1</em>');
    
    // 为链接添加样式
    formattedContent = formattedContent.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '<a href="$1" style="color:var(--primary-dark);text-decoration:none;border-bottom:1.5px dotted var(--primary-color);font-weight:600;">$2</a>');
    
    // 为引用添加样式
    formattedContent = formattedContent.replace(/<blockquote>([^<]+)<\/blockquote>/g, '<blockquote style="background-color:#FFF4E0;color:#333;border-left:3px solid var(--accent-color);padding:10px 16px;font-weight:500;">$1</blockquote>');
    
    // 为无序列表添加样式
    formattedContent = formattedContent.replace(/<ul>(([\s\S])*?)<\/ul>/g, '<ul style="padding-left:24px;margin:14px 0;color:#111;">$1</ul>');
    formattedContent = formattedContent.replace(/<li>([^<]+)<\/li>/g, '<li style="margin-bottom:8px;color:#111;">$1</li>');
    
    // 为有序列表添加样式
    formattedContent = formattedContent.replace(/<ol>(([\s\S])*?)<\/ol>/g, '<ol style="padding-left:24px;margin:14px 0;color:#111;">$1</ol>');
    
    // 为 SVG 容器添加样式
    formattedContent = formattedContent.replace(/<div class="svg-container">([\s\S]*?)<\/div>/g, '<div class="svg-container" style="margin:16px 0;text-align:center;">$1</div>');
    
    // 为 SVG 嵌入添加样式
    formattedContent = formattedContent.replace(/<svg class="svg-embed"/g, '<svg class="svg-embed" style="max-width:100%;height:auto;"');
    
    // 处理思考内容（如果存在）
    let thinkingContentHtml = '';
    if (msg.thinking_content) {
      let formattedThinking = msg.thinking_content;
      
      // 保存 SVG 内容，避免被后续处理破坏
      const thinkingSvgPlaceholders = [];
      let thinkingSvgIndex = 0;
      
      // 提取并保存所有 SVG 内容
      formattedThinking = formattedThinking.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
        const placeholder = `__THINKING_SVG_PLACEHOLDER_${thinkingSvgIndex}__`;
        thinkingSvgPlaceholders.push({ placeholder, content: match });
        thinkingSvgIndex++;
        return placeholder;
      });
      
      // 使用 markdown-it 处理思考内容
      formattedThinking = md.render(formattedThinking);
      
      // 恢复 SVG 内容
      thinkingSvgPlaceholders.forEach(({ placeholder, content }) => {
        // 为 SVG 添加响应式样式
        const enhancedSvg = content.replace(/<svg/, '<svg style="max-width:100%;height:auto;display:block;margin:16px auto;"');
        formattedThinking = formattedThinking.replace(placeholder, enhancedSvg);
      });
      
      // 添加自定义样式到生成的 HTML 元素
      // 为代码块添加样式
      formattedThinking = formattedThinking.replace(/<pre><code( class="language-([^"]+)")?>([^<]+)<\/code><\/pre>/g, (match, langClass, lang, code) => {
        return `<pre style="background-color:#282C34;color:#E5E5E5;padding:16px;border-radius:8px;margin:14px 0;font-size:14px;border-left:3px solid var(--primary-color);"><code style="font-family:monospace;color:#E5E5E5;">${code.trim()}</code></pre>`;
      });
      
      // 为行内代码添加样式
      formattedThinking = formattedThinking.replace(/<code>([^<]+)<\/code>/g, '<code style="font-family:monospace;font-size:14px;background-color:rgba(255,36,66,0.1);padding:2px 6px;border-radius:4px;color:#E30B29;font-weight:600;">$1</code>');
      
      // 为粗体添加样式
      formattedThinking = formattedThinking.replace(/<strong>([^<]+)<\/strong>/g, '<strong style="font-weight:700;color:#000;">$1</strong>');
      
      // 为斜体添加样式
      formattedThinking = formattedThinking.replace(/<em>([^<]+)<\/em>/g, '<em style="color:var(--accent-dark);font-weight:500;">$1</em>');
      
      // 为 SVG 容器添加样式
      formattedThinking = formattedThinking.replace(/<div class="svg-container">([\s\S]*?)<\/div>/g, '<div class="svg-container" style="margin:16px 0;text-align:center;">$1</div>');
      
      // 为 SVG 嵌入添加样式
      formattedThinking = formattedThinking.replace(/<svg class="svg-embed"/g, '<svg class="svg-embed" style="max-width:100%;height:auto;"');
      
      thinkingContentHtml = `<div class="thinking-content">${formattedThinking}</div>`;
    }
    
    html += `
    <div class="message ${roleClass}" style="--idx:${idx}">
      <div class="message-header">
        <div class="avatar">${avatarText}</div>
        <div>${roleName}</div>
      </div>
      <div class="message-content">${formattedContent}</div>
      ${thinkingContentHtml}
      ${roleClass === 'ai' ? `
      <div class="interaction-stats">
        <div class="stat-item">❤️ ${Math.floor(Math.random() * 900) + 100}</div>
        <div class="stat-item">💬 ${Math.floor(Math.random() * 50) + 5}</div>
        <div class="stat-item">🔖 ${Math.floor(Math.random() * 200) + 50}</div>
      </div>` : ''}
    </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="footer">
        <div>${pageNumber === totalPages ? '对话记录完整展示' : '查看下一张继续阅读'}</div>
        <div class="xiaohongshu-tag">
          <div class="xiaohongshu-icon">红</div>
          <span>AI智能生成 · ${Math.floor(Math.random() * 5000) + 1000}人已浏览</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  
  return html;
} 