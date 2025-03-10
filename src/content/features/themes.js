/**
 * 主题模块 - 处理主题相关功能
 */

/**
 * 获取主题对应的背景色
 * @param {String} theme - 主题名称
 * @returns {String} - 背景色的十六进制或rgba值
 */
export function getThemeBackgroundColor(theme) {
  switch (theme) {
    case 'dark':
      return '#1a1a1a';
    case 'sepia':
      return '#f8f1e3';
    case 'contrast':
      return '#ffffff';
    default: // light
      return '#ffffff';
  }
}

/**
 * 应用主题到iframe文档
 * @param {Document} doc - iframe文档
 * @param {String} theme - 主题名称
 */
export function applyTheme(doc, theme) {
  const body = doc.body;
  const style = doc.createElement('style');
  
  // 移除已有的主题样式
  const existingStyle = doc.getElementById('dco-theme-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  style.id = 'dco-theme-style';
  
  switch (theme) {
    case 'dark':
      style.textContent = `
        body {
          background-color: #1a1a1a !important;
          color: #e0e0e0 !important;
        }
        .message, .message-content, p, span, div {
          color: #e0e0e0 !important;
        }
        .user-message, .user-message-content {
          background-color: #2d2d2d !important;
          border-color: #3a3a3a !important;
        }
        .assistant-message, .assistant-message-content {
          background-color: #252525 !important;
          border-color: #333333 !important;
        }
        pre, code {
          background-color: #2d2d2d !important;
          border-color: #444444 !important;
        }
        a {
          color: #64b5f6 !important;
        }
        hr {
          border-color: #444444 !important;
        }
      `;
      break;
    case 'sepia':
      style.textContent = `
        body {
          background-color: #f8f1e3 !important;
          color: #5b4636 !important;
        }
        .message, .message-content, p, span, div {
          color: #5b4636 !important;
        }
        .user-message, .user-message-content {
          background-color: #eee4d3 !important;
          border-color: #dfd3c3 !important;
        }
        .assistant-message, .assistant-message-content {
          background-color: #f4ece0 !important;
          border-color: #e6d9c6 !important;
        }
        pre, code {
          background-color: #eee4d3 !important;
          border-color: #dfd3c3 !important;
        }
        a {
          color: #8b6e4e !important;
        }
        hr {
          border-color: #dfd3c3 !important;
        }
      `;
      break;
    case 'contrast':
      style.textContent = `
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .message, .message-content, p, span, div {
          color: #000000 !important;
          font-weight: 500 !important;
        }
        .user-message, .user-message-content {
          background-color: #e6f7ff !important;
          border-color: #0066cc !important;
          border-width: 2px !important;
        }
        .assistant-message, .assistant-message-content {
          background-color: #f0f0f0 !important;
          border-color: #000000 !important;
          border-width: 2px !important;
        }
        pre, code {
          background-color: #f0f0f0 !important;
          border-color: #000000 !important;
          border-width: 2px !important;
        }
        a {
          color: #0000cc !important;
          text-decoration: underline !important;
          font-weight: bold !important;
        }
        hr {
          border-color: #000000 !important;
          border-width: 2px !important;
        }
      `;
      break;
    default: // light
      style.textContent = `
        body {
          background-color: #ffffff !important;
          color: #333333 !important;
        }
        .message, .message-content, p, span, div {
          color: #333333 !important;
        }
        .user-message, .user-message-content {
          background-color: #f0f7fb !important;
          border-color: #d0e3f0 !important;
        }
        .assistant-message, .assistant-message-content {
          background-color: #f7f7f7 !important;
          border-color: #e6e6e6 !important;
        }
        pre, code {
          background-color: #f5f5f5 !important;
          border-color: #e0e0e0 !important;
        }
        a {
          color: #0066cc !important;
        }
        hr {
          border-color: #e0e0e0 !important;
        }
      `;
  }
  
  doc.head.appendChild(style);
} 