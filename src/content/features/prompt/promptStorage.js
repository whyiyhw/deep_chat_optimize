/**
 * 提示词存储模块
 */

import { showNotification, showConfirmDialog } from '../../utils/notificationUtils.js';
import { getLanguageTexts } from './promptCore.js';
import { insertPromptToInput } from './promptInput.js';

/**
 * 加载提示词模板
 * @returns {Promise} - 返回一个Promise，解析为模板数组
 */
export function loadPromptTemplates() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('promptTemplates', (result) => {
      const templates = result.promptTemplates || [];
      resolve(templates);
    });
  });
}

/**
 * 保存提示词模板
 * @param {Object} template - 模板对象，包含title和content
 */
export function savePromptTemplate(template) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('promptTemplates', (result) => {
      const templates = result.promptTemplates || [];
      
      // 检查是否已存在同ID模板
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        // 更新现有模板
        templates[existingIndex] = {
          ...templates[existingIndex],
          title: template.title,
          content: template.content,
          updatedAt: new Date().toISOString(),
          // 保留或更新收藏状态
          isFavorite: template.isFavorite !== undefined ? template.isFavorite : templates[existingIndex].isFavorite
        };
      } else {
        // 添加新模板
        templates.push({
          id: template.id,
          title: template.title,
          content: template.content,
          createdAt: template.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // 设置收藏状态，默认为未收藏
          isFavorite: template.isFavorite || false
        });
      }
      
      chrome.storage.sync.set({ promptTemplates: templates }, () => {
        if (chrome.runtime.lastError) {
          showNotification(`保存失败: ${chrome.runtime.lastError.message}`, 'error');
          reject(chrome.runtime.lastError);
        } else {
          console.log('提示词模板保存成功');
          resolve(templates);
        }
      });
    });
  });
}

/**
 * 删除提示词模板
 * @param {String} templateId - 模板ID
 * @returns {Promise} - 返回一个Promise
 */
export function deletePromptTemplate(templateId) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('promptTemplates', (result) => {
      const templates = result.promptTemplates || [];
      const newTemplates = templates.filter(t => t.id !== templateId);
      
      chrome.storage.sync.set({ promptTemplates: newTemplates }, () => {
        if (chrome.runtime.lastError) {
          showNotification(`删除失败: ${chrome.runtime.lastError.message}`, 'error');
          reject(chrome.runtime.lastError);
        } else {
          console.log('提示词模板已删除');
          // 重新加载模板列表
          loadPromptTemplates();
          resolve(newTemplates);
        }
      });
    });
  });
} 