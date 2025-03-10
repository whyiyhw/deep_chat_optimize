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
  // 不再进行分页，直接将所有消息传递给 generatePageHTML
  if (!chatData.messages || !Array.isArray(chatData.messages)) {
    return [generatePageHTML(chatData, [], 1, 1)];
  }
  
  // 直接生成单个页面的HTML
  const html = generatePageHTML(chatData, chatData.messages, 1, 1);
  
  // 返回包含单个HTML的数组，保持与原函数相同的返回类型
  return [html];
}

/**
 * 生成单个页面的HTML
 * @param {Object} chatData - 聊天数据
 * @param {Array} messages - 消息数组
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
    <title>${chatData.title || '智能对话记录'}</title>
    <style>
      /* 全局样式 - Ant Design 风格 */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      :root {
        /* Ant Design 配色方案 */
        --primary-color: #1890ff; /* 蓝色主色调 */
        --primary-color-hover: #40a9ff; /* 鼠标悬停色 */
        --primary-color-active: #096dd9; /* 点击色 */
        --primary-color-outline: rgba(24, 144, 255, 0.2); /* 聚焦色 */
        --primary-1: #e6f7ff; /* 浅蓝背景 */
        --primary-2: #bae7ff; /* 较浅蓝色 */
        --primary-5: #40a9ff; /* 中蓝色 */
        --primary-7: #096dd9; /* 深蓝色 */
        
        --success-color: #52c41a; /* 成功色：绿色 */
        --warning-color: #faad14; /* 警告色：黄色 */
        --error-color: #f5222d; /* 错误色：红色 */
        
        --heading-color: rgba(0, 0, 0, 0.85); /* 标题色 */
        --text-color: rgba(0, 0, 0, 0.65); /* 主文本色 */
        --text-color-secondary: rgba(0, 0, 0, 0.45); /* 次文本色 */
        --disabled-color: rgba(0, 0, 0, 0.25); /* 失效色 */
        --border-color-base: #d9d9d9; /* 边框色 */
        --border-color-split: #f0f0f0; /* 分割线色 */
        --background-color-base: #f5f5f5; /* 背景色 */
        --background-color-light: #fafafa; /* 浅背景色 */
        
        --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        --code-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        
        --border-radius-base: 2px; /* 基础圆角 */
        --border-radius-sm: 2px; /* 小圆角 */
        --border-radius-lg: 4px; /* 大圆角 */
        
        --box-shadow-base: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05); /* 基础阴影 */
        --box-shadow-sm: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09); /* 小阴影 */
        
        --user-bg: var(--background-color-light); /* 用户消息背景 */
        --ai-bg: var(--primary-1); /* AI消息背景 */
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        font-family: var(--font-family);
        background-color: var(--background-color-light);
        color: var(--text-color);
        line-height: 1.5715;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 14px;
      }
      
      body {
        max-width: 800px;
        margin: 0 auto;
        position: relative;
      }
      
      /* 容器样式 - Ant Design 风格 */
      .chat-page {
        width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        background: white;
        box-shadow: var(--box-shadow-base);
      }
      
      /* 头部样式 - Ant Design 风格 */
      .header {
        padding: 16px 24px;
        background: white;
        border-bottom: 1px solid var(--border-color-split);
        position: sticky;
        top: 0;
        z-index: 10;
      }
      
      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--heading-color);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .header-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-color-secondary);
      }
      
      /* 聊天容器 */
      .chat-container {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background: white;
      }
      
      /* 消息样式 - Ant Design 风格 */
      .message {
        margin-bottom: 24px;
        animation: fadeIn 0.3s ease-out forwards;
        animation-delay: calc(0.05s * var(--idx, 0));
      }
      
      .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        color: white;
      }
      
      .user .avatar {
        background-color: var(--warning-color);
      }
      
      .ai .avatar {
        background-color: var(--primary-color);
      }
      
      .message-role {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-color);
      }
      
      .message-bubble {
        padding: 12px 16px;
        border-radius: var(--border-radius-lg);
        font-size: 14px;
        line-height: 1.5715;
        max-width: 90%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      
      .user .message-bubble {
        background-color: var(--user-bg);
        margin-left: auto;
        border: 1px solid var(--border-color-split);
      }
      
      .ai .message-bubble {
        background-color: var(--ai-bg);
        margin-right: auto;
        border: 1px solid var(--primary-2);
      }
      
      /* 代码样式 - Ant Design 风格 */
      pre {
        background-color: #141414;
        color: #fff;
        padding: 16px;
        border-radius: var(--border-radius-base);
        overflow-x: auto;
        margin: 16px 0;
        font-family: var(--code-family);
        font-size: 13px;
        position: relative;
      }
      
      pre::before {
        content: attr(data-language);
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        padding: 2px 8px;
        background: var(--primary-7);
        color: white;
        border-radius: 0 var(--border-radius-base) 0 var(--border-radius-base);
        font-weight: 500;
      }
      
      code {
        font-family: var(--code-family);
        font-size: 13px;
        background-color: rgba(150, 150, 150, 0.1);
        padding: 2px 4px;
        border-radius: var(--border-radius-sm);
        color: var(--primary-color);
        border: 1px solid rgba(100, 100, 100, 0.2);
      }
      
      /* 其他元素样式 - Ant Design 风格 */
      p {
        margin-bottom: 16px;
      }
      
      blockquote {
        border-left: 4px solid var(--primary-color);
        padding: 8px 16px;
        background-color: var(--background-color-light);
        margin: 16px 0;
        color: var(--text-color-secondary);
      }
      
      img {
        max-width: 100%;
        height: auto;
        border-radius: var(--border-radius-base);
        margin: 16px 0;
        border: 1px solid var(--border-color-split);
      }
      
      ul, ol {
        padding-left: 24px;
        margin: 16px 0;
      }
      
      li {
        margin-bottom: 8px;
      }
      
      /* 思考内容样式 - Ant Design 风格 */
      .thinking-content {
        margin-top: 16px;
        padding: 16px;
        background-color: var(--background-color-light);
        border-radius: var(--border-radius-base);
        font-size: 14px;
        color: var(--text-color-secondary);
        border: 1px solid var(--border-color-split);
        position: relative;
      }
      
      .thinking-label {
        position: absolute;
        top: -10px;
        left: 16px;
        background: var(--primary-color);
        color: white;
        font-size: 12px;
        padding: 0 8px;
        height: 20px;
        line-height: 20px;
        border-radius: 10px;
        font-weight: 500;
      }
      
      /* 页脚样式 - Ant Design 风格 */
      .footer {
        padding: 16px 24px;
        text-align: center;
        font-size: 14px;
        color: var(--text-color-secondary);
        border-top: 1px solid var(--border-color-split);
        background-color: white;
      }
      
      .chat-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--primary-1);
        color: var(--primary-color);
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
        margin-top: 12px;
        border: 1px solid var(--primary-2);
      }
      
      .tag-icon {
        width: 16px;
        height: 16px;
        background: var(--primary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      }
      
      /* 分页样式 - Ant Design 风格 */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        margin-bottom: 8px;
      }
      
      .page-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        padding: 0 15px;
        font-size: 14px;
        border-radius: var(--border-radius-base);
        border: 1px solid var(--border-color-base);
        background: white;
        color: var(--text-color);
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
      }
      
      .page-button:hover {
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      
      .page-info {
        font-size: 14px;
        color: var(--text-color-secondary);
      }
      
      /* 响应式设计 */
      @media (max-width: 640px) {
        .message-bubble {
          max-width: 85%;
        }
        
        .chat-container {
          padding: 16px;
        }
        
        .header {
          padding: 12px 16px;
        }
      }
    </style>
  </head>
  <body>
    <div class="chat-page">
      <div class="header">
        <div class="header-top">
          <h1 class="header-title">${chatData.title || '智能对话记录'}</h1>
        </div>
        <div class="header-meta">
          <span>${chatData.service || '智能对话助手'}</span>
          <span>•</span>
          <span>${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          ${totalPages > 1 ? `<span>•</span><span>第 ${pageNumber}/${totalPages} 页</span>` : ''}
        </div>
      </div>
      
      <div class="chat-container">
  `;
  
  // 添加所有消息
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
    
    // 为代码块添加语言标签
    formattedContent = formattedContent.replace(/<pre><code( class="language-([^"]+)")?>([^<]+)<\/code><\/pre>/g, (match, langClass, lang, code) => {
      return `<pre data-language="${lang || '代码'}">${code.trim()}</pre>`;
    });
    
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
      
      thinkingContentHtml = `
        <div class="thinking-content">
          <div class="thinking-label">思考过程</div>
          ${formattedThinking}
        </div>
      `;
    }
    
    html += `
    <div class="message ${roleClass}" style="--idx:${idx}">
      <div class="message-header">
        <div class="avatar">${avatarText}</div>
        <div class="message-role">${roleName}</div>
      </div>
      <div class="message-bubble">${formattedContent}</div>
      ${thinkingContentHtml}
    </div>
    `;
  });
  
  // 添加分页控制（如果有多页）
  if (totalPages > 1) {
    html += `
      <div class="pagination">
        ${pageNumber > 1 ? `<a href="chat_page_${pageNumber-1}.html" class="page-button">上一页</a>` : ''}
        <span class="page-info">第 ${pageNumber}/${totalPages} 页</span>
        ${pageNumber < totalPages ? `<a href="chat_page_${pageNumber+1}.html" class="page-button">下一页</a>` : ''}
      </div>
    `;
  }
  
  html += `
      </div>
      
      <div class="footer">
        <div>对话记录完整展示</div>
        <div class="chat-tag">
          <div class="tag-icon">AI</div>
          <span>AI智能生成 • ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  
  return html;
} 