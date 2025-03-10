/**
 * UI组件模块
 */

import { exportChat } from './export.js';
import { togglePromptPanel } from './promptFeature.js';
import { highlightCodeBlocks } from '../utils/domUtils.js';

/**
 * 添加工具栏
 * @param {String} chatService - 聊天服务名称
 */
export function addToolbar(chatService) {
  // 创建工具栏容器
  const toolbar = document.createElement('div');
  toolbar.id = 'dco-toolbar';
  toolbar.classList.add('dco-toolbar');
  
  // 设置工具栏样式
  toolbar.style.display = 'flex';
  toolbar.style.gap = '8px';
  toolbar.style.padding = '8px';
  toolbar.style.borderBottom = '1px solid var(--dco-border-color, #e0e0e0)';
  toolbar.style.backgroundColor = 'var(--dco-bg-color, white)';
  toolbar.style.zIndex = '1000';
  
  // 添加导出按钮
  const exportButton = document.createElement('button');
  exportButton.textContent = '导出聊天';
  exportButton.classList.add('dco-button');
  exportButton.style.padding = '4px 8px';
  exportButton.style.borderRadius = '4px';
  exportButton.style.border = '1px solid var(--dco-border-color, #ccc)';
  exportButton.style.backgroundColor = 'var(--dco-bg-color, #f5f5f5)';
  exportButton.style.cursor = 'pointer';
  
  // 导出按钮点击事件
  exportButton.addEventListener('click', () => {
    exportChat(chatService);
  });
  
  // 添加设置按钮
  const settingsButton = document.createElement('button');
  settingsButton.textContent = '设置';
  settingsButton.classList.add('dco-button');
  settingsButton.style.padding = '4px 8px';
  settingsButton.style.borderRadius = '4px';
  settingsButton.style.border = '1px solid var(--dco-border-color, #ccc)';
  settingsButton.style.backgroundColor = 'var(--dco-bg-color, #f5f5f5)';
  settingsButton.style.cursor = 'pointer';
  
  // 设置按钮点击事件
  settingsButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' });
  });
  
  // 添加提示词按钮
  const promptButton = document.createElement('button');
  promptButton.textContent = '提示词模板';
  promptButton.classList.add('dco-button');
  promptButton.style.padding = '4px 8px';
  promptButton.style.borderRadius = '4px';
  promptButton.style.border = '1px solid var(--dco-border-color, #ccc)';
  promptButton.style.backgroundColor = 'var(--dco-bg-color, #f5f5f5)';
  promptButton.style.cursor = 'pointer';
  
  // 提示词按钮点击事件
  promptButton.addEventListener('click', () => {
    togglePromptPanel();
  });
  
  // 将按钮添加到工具栏
  toolbar.appendChild(exportButton);
  toolbar.appendChild(promptButton);
  toolbar.appendChild(settingsButton);
  
  // 获取插入工具栏的位置
  let insertPosition;
  
  switch (chatService) {
    case 'chatgpt':
      // ChatGPT特定的DOM位置
      insertPosition = document.querySelector('nav');
      if (insertPosition) {
        insertPosition.after(toolbar);
      }
      break;
      
    case 'claude':
      // Claude特定的DOM位置
      insertPosition = document.querySelector('header');
      if (insertPosition) {
        insertPosition.after(toolbar);
      }
      break;
      
    case 'yuanbao':
      // 腾讯元宝特定的DOM位置
      insertPosition = document.querySelector('header') || document.querySelector('.header');
      if (insertPosition) {
        insertPosition.after(toolbar);
      }
      break;
      
    // 根据实际情况添加其他服务的支持
    default:
      // 默认尝试插入到body的顶部
      insertPosition = document.body.firstChild;
      if (insertPosition) {
        document.body.insertBefore(toolbar, insertPosition);
      } else {
        document.body.appendChild(toolbar);
      }
  }
}

/**
 * 增强代码块
 * 为代码块添加复制按钮等功能
 */
export function enhanceCodeBlocks() {
  // 查找所有代码块
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    // 检查是否已增强
    if (block.parentElement.querySelector('.dco-code-buttons')) {
      return;
    }
    
    // 创建代码块工具栏
    const toolbar = document.createElement('div');
    toolbar.className = 'dco-code-buttons';
    toolbar.style.position = 'absolute';
    toolbar.style.top = '5px';
    toolbar.style.right = '5px';
    toolbar.style.display = 'flex';
    toolbar.style.gap = '5px';
    
    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制';
    copyButton.style.padding = '3px 6px';
    copyButton.style.fontSize = '12px';
    copyButton.style.backgroundColor = 'rgba(0,0,0,0.1)';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '3px';
    copyButton.style.cursor = 'pointer';
    
    copyButton.addEventListener('click', () => {
      const code = block.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyButton.textContent = '已复制!';
        setTimeout(() => {
          copyButton.textContent = '复制';
        }, 2000);
      });
    });
    
    toolbar.appendChild(copyButton);
    
    // 设置代码块容器为相对定位
    block.parentElement.style.position = 'relative';
    
    // 添加工具栏到代码块
    block.parentElement.appendChild(toolbar);
  });
}

/**
 * 监听页面变化
 * @param {Function} callback - 变化检测回调
 */
export function setupPageObserver(callback) {
  const observer = new MutationObserver((mutations) => {
    // 检查是否有代码块需要高亮和增强
    if (document.querySelector('pre code:not(.hljs)')) {
      highlightCodeBlocks();
      enhanceCodeBlocks();
    }
    
    // 执行回调
    if (typeof callback === 'function') {
      callback(mutations);
    }
  });
  
  // 配置观察选项
  const config = { 
    childList: true, 
    subtree: true, 
    attributes: true
  };
  
  // 开始观察整个文档
  observer.observe(document.body, config);
  
  return observer;
} 