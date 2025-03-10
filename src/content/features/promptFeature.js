/**
 * 提示词功能主模块
 * 整合各个提示词子模块的功能
 */

import { detectChatService } from './prompt/promptCore.js';
import { createPromptPanel, togglePromptPanel } from './prompt/promptPanel.js';
import { loadPromptTemplates, savePromptTemplate, deletePromptTemplate } from './prompt/promptStorage.js';
import { insertPromptToInput } from './prompt/promptInput.js';
import { addPromptButtonToInput } from './prompt/promptButton.js';
import { setupDeepSeekButtonObserver } from '../core/chatServices.js';

/**
 * 添加提示词功能
 * @param {String} chatService - 聊天服务名称
 */
export function addPromptFeature(chatService) {
  console.log(`为 ${chatService} 添加提示词功能`);
  
  // 不再创建DOM提示词面板，由React组件统一管理
  // createPromptPanel();
  console.log('提示词面板将由React组件管理');
  
  // 监听输入框，添加提示词按钮
  addPromptButtonToInput(chatService);
  
  // 为 DeepSeek 添加专门的观察器
  if (chatService === 'deepseek') {
    setupDeepSeekButtonObserver();
  }
}

// 导出所有需要的功能，便于外部调用
export { 
  togglePromptPanel,
  loadPromptTemplates,
  savePromptTemplate,
  deletePromptTemplate,
  insertPromptToInput,
  createPromptPanel,  // 保持API兼容性，即使不再调用它
  addPromptButtonToInput  // 添加这个函数的导出，解决TypeError错误
};