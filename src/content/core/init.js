/**
 * 初始化模块
 */

import { detectChatService, handlePageChanges, setupDeepSeekButtonObserver } from './chatServices.js';
import { addToolbar, setupPageObserver } from '../features/ui.js';
import { applyTheme, enableMarkdownSupport } from '../features/themeManager.js';
import { addPromptFeature } from '../features/promptFeature.js';

/**
 * 初始化内容脚本
 */
export function init() {
  console.log('Deep Chat Optimize 内容脚本已加载');
  console.log('当前URL:', window.location.href);
  console.log('当前主机名:', window.location.hostname);
  
  // 检测当前页面类型
  const currentHost = window.location.hostname;
  const currentUrl = window.location.href;
  let chatService = '';
  
  // AI聊天服务检测，基本检测
  if (currentHost.includes('deepseek.com') || currentUrl.includes('deepseek.com')) {
    chatService = 'deepseek';
  } else if (currentHost.includes('yuanbao.tencent.com') || currentUrl.includes('yuanbao.tencent.com')) {
    chatService = 'yuanbao';
  } else {
    // 使用更精细的检测
    chatService = detectChatService();
  }
  
  if (chatService) {
    console.log(`检测到AI聊天服务: ${chatService}`);
    
    // 获取用户设置
    chrome.storage.sync.get('settings', (result) => {
      const settings = result.settings || {
        theme: 'auto',
        markdownSupport: true,
        shortcuts: {
          export: 'ctrl+shift+e',
          toggleTheme: 'ctrl+shift+t',
          promptPanel: 'ctrl+shift+p'
        }
      };
      
      // 初始化功能
      initializeFeatures(chatService, settings);
      
      // 监听页面变化，处理动态加载的内容
      setupPageObserver((mutations) => {
        handlePageChanges(mutations, chatService);
      });
    });
  } else {
    console.log('未检测到支持的AI聊天服务');
  }
}

/**
 * 根据聊天服务和用户设置初始化功能
 * @param {String} chatService - 聊天服务名称
 * @param {Object} settings - 用户设置
 */
export function initializeFeatures(chatService, settings) {
  // 应用主题
  applyTheme(settings.theme);
  
  // 添加工具栏
  addToolbar(chatService);
  
  // 启用Markdown支持
  if (settings.markdownSupport) {
    enableMarkdownSupport();
  }
  
  // 添加提示词功能
  addPromptFeature(chatService);
  
  // 为DeepSeek设置专门的观察器
  if (chatService === 'deepseek') {
    setupDeepSeekButtonObserver();
  }
  
  // 功能特性初始化结束
  console.log('所有功能已初始化完成');
}

// 确保DOM完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', init);

// 检测页面是否为已加载状态
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} 