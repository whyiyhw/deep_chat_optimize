/**
 * 内容脚本 - 使用 React 实现 AI 聊天页面增强
 * 处理 UI 增强、数据提取和用户交互
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { detectChatService } from './core/chatServices.js';
import App from './components/App.jsx';

// 创建扩展挂载点
function createMountPoint() {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'deep-chat-optimize-root';
  // 确保扩展UI不会干扰原始页面
  mountPoint.style.position = 'relative';
  mountPoint.style.zIndex = '9999';
  document.body.appendChild(mountPoint);
  return mountPoint;
}

// 初始化扩展
function initExtension() {
  console.log('Deep Chat Optimize 内容脚本已加载');
  console.log('当前URL:', window.location.href);
  console.log('当前主机名:', window.location.hostname);
  
  // 检测当前聊天服务
  const chatService = detectChatService();
  
  if (chatService) {
    console.log(`检测到AI聊天服务: ${chatService}`);
    
    // 获取用户设置
    chrome.storage.sync.get('settings', (result) => {
      const settings = result.settings || {
        theme: 'auto',
        markdownSupport: true,
        shortcuts: {
          export: 'ctrl+shift+e',
          promptPanel: 'ctrl+shift+p'
        }
      };
      
      // 创建挂载点并渲染 React App
      const mountPoint = createMountPoint();
      
      ReactDOM.render(
        <App 
          chatService={chatService} 
          settings={settings}
        />,
        mountPoint
      );
    });
  } else {
    console.log('未检测到支持的AI聊天服务');
  }
}

// 确保DOM完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', initExtension);

// 检测页面是否为已加载状态
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initExtension();
}

// 监听来自popup或background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  // 将消息事件分发到 window 对象，让 React 组件可以监听
  window.dispatchEvent(
    new CustomEvent('DCO_MESSAGE', { 
      detail: request 
    })
  );
  
  // 向发送者返回成功状态
  sendResponse({ success: true, action: request.action });
  
  // 返回true表示异步响应
  return true;
}); 