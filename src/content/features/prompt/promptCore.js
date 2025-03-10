/**
 * 提示词功能核心模块
 */

import { showNotification, showConfirmDialog } from '../../utils/notificationUtils.js';

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 获取语言文本
 * @param {boolean} isZh - 是否为中文
 * @returns {Object} 语言文本对象
 */
export function getLanguageTexts(isZh) {
  return {
    panelTitle: isZh ? '提示词模板' : 'Prompt Templates',
    saveButton: isZh ? '保存' : 'Save',
    cancelButton: isZh ? '取消' : 'Cancel',
    newTemplate: isZh ? '新建模板' : 'New Template',
    editTemplate: isZh ? '编辑模板' : 'Edit Template',
    deleteTemplate: isZh ? '删除' : 'Delete',
    useTemplate: isZh ? '使用' : 'Use',
    templateNamePlaceholder: isZh ? '模板名称' : 'Template Name',
    contentPlaceholder: isZh ? '输入提示词内容...' : 'Enter prompt content...',
    noTemplates: isZh ? '暂无保存的模板' : 'No saved templates',
    confirmDelete: isZh ? '确定要删除此模板吗？' : 'Are you sure you want to delete this template?',
    inputRequired: isZh ? '请输入模板名称和内容' : 'Please enter template name and content',
    updatedOn: isZh ? '更新于' : 'Updated on'
  };
}

/**
 * 检测当前聊天服务类型
 * @returns {string|null} 聊天服务类型
 */
export function detectChatService() {
  console.log('检测当前聊天服务类型...');
  
  const urls = {
    'chatgpt': ['https://chat.openai.com'],
    'claude': ['https://claude.ai'],
    'gemini': ['https://gemini.google.com'],
    'deepseek': ['https://chat.deepseek.com'],
    'yuanbao': ['https://hunyuan.tencent.com'],
    'perplexity': ['https://www.perplexity.ai']
  };
  
  // 通过URL检测
  const currentUrl = window.location.href;
  for (const [service, urlPatterns] of Object.entries(urls)) {
    if (urlPatterns.some(pattern => currentUrl.includes(pattern))) {
      console.log(`通过URL检测到聊天服务: ${service}`);
      return service;
    }
  }
  
  // 通过特定元素检测
  if (document.querySelector('.style__text-area__wrapper___VV9fW') || 
      document.querySelector('.style__btn-start___aPog1') ||
      document.querySelector('button[dt-button-id="online_search"]')) {
    console.log('通过元素检测到聊天服务: yuanbao');
    return 'yuanbao';
  }
  
  if (document.querySelector('.ds-chat-textarea') || 
      document.querySelector('[class*="deepseek"]')) {
    console.log('通过元素检测到聊天服务: deepseek');
    return 'deepseek';
  }
  
  // 如果无法确定，返回null
  console.log('无法检测到聊天服务类型');
  return null;
} 