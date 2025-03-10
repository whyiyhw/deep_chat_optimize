/**
 * 提示词存储模块
 */

import { showNotification, showConfirmDialog } from '../../utils/notificationUtils.js';
import { getLanguageTexts } from './promptCore.js';
import { insertPromptToInput } from './promptInput.js';

/**
 * 加载提示词模板
 */
export function loadPromptTemplates() {
  const templateList = document.getElementById('dco-prompt-template-list');
  if (!templateList) return;
  
  // 获取当前的聊天服务类型
  const promptPanel = document.getElementById('dco-prompt-panel');
  const currentChatService = promptPanel ? promptPanel.getAttribute('data-chat-service') || 'yuanbao' : 'yuanbao';
  
  // 获取当前语言设置
  const language = promptPanel ? promptPanel.getAttribute('data-language') || 'zh-CN' : 'zh-CN';
  const isZh = language.startsWith('zh');
  
  console.log(`加载提示词模板，当前聊天服务: ${currentChatService}, 语言: ${language}`);
  
  // 清空现有模板
  templateList.innerHTML = '';
  
  // 获取多语言文本
  const texts = getLanguageTexts(isZh);
  
  chrome.storage.sync.get('promptTemplates', (result) => {
    const templates = result.promptTemplates || [];
    
    if (templates.length === 0) {
      // 如果没有保存的模板，显示提示信息
      const emptyMessage = document.createElement('div');
      emptyMessage.style.padding = '20px';
      emptyMessage.style.color = '#888';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.backgroundColor = '#f9f9f9';
      emptyMessage.style.borderRadius = '4px';
      emptyMessage.style.fontSize = '14px';
      emptyMessage.textContent = texts.noTemplates;
      templateList.appendChild(emptyMessage);
      return;
    }
    
    // 对模板按更新时间排序，最新的在前面
    templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // 添加每个模板项
    templates.forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.className = 'dco-prompt-template-item';
      templateItem.style.padding = '12px';
      templateItem.style.backgroundColor = '#f9f9f9';
      templateItem.style.borderRadius = '6px';
      templateItem.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      templateItem.style.transition = 'transform 0.2s, box-shadow 0.2s';
      
      // 添加hover效果
      templateItem.addEventListener('mouseover', () => {
        templateItem.style.transform = 'translateY(-2px)';
        templateItem.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      });
      
      templateItem.addEventListener('mouseout', () => {
        templateItem.style.transform = 'translateY(0)';
        templateItem.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      });
      
      // 标题区域
      const titleBar = document.createElement('div');
      titleBar.style.display = 'flex';
      titleBar.style.justifyContent = 'space-between';
      titleBar.style.alignItems = 'center';
      titleBar.style.marginBottom = '8px';
      
      // 模板标题
      const titleEl = document.createElement('div');
      titleEl.style.fontWeight = '600';
      titleEl.style.fontSize = '15px';
      titleEl.textContent = template.title;
      
      // 按钮组
      const buttonGroup = document.createElement('div');
      buttonGroup.style.display = 'flex';
      buttonGroup.style.gap = '6px';
      
      // 使用按钮
      const useButton = document.createElement('button');
      useButton.textContent = texts.useTemplate;
      useButton.style.backgroundColor = '#4CAF50';
      useButton.style.color = 'white';
      useButton.style.border = 'none';
      useButton.style.padding = '4px 8px';
      useButton.style.borderRadius = '3px';
      useButton.style.fontSize = '12px';
      useButton.style.cursor = 'pointer';
      useButton.style.transition = 'background-color 0.2s';
      
      useButton.addEventListener('mouseover', () => {
        useButton.style.backgroundColor = '#45a049';
      });
      
      useButton.addEventListener('mouseout', () => {
        useButton.style.backgroundColor = '#4CAF50';
      });
      
      // 编辑按钮
      const editButton = document.createElement('button');
      editButton.textContent = texts.editTemplate;
      editButton.style.backgroundColor = '#2196F3';
      editButton.style.color = 'white';
      editButton.style.border = 'none';
      editButton.style.padding = '4px 8px';
      editButton.style.borderRadius = '3px';
      editButton.style.fontSize = '12px';
      editButton.style.cursor = 'pointer';
      editButton.style.transition = 'background-color 0.2s';
      
      editButton.addEventListener('mouseover', () => {
        editButton.style.backgroundColor = '#0b7dda';
      });
      
      editButton.addEventListener('mouseout', () => {
        editButton.style.backgroundColor = '#2196F3';
      });
      
      // 删除按钮
      const deleteButton = document.createElement('button');
      deleteButton.textContent = texts.deleteTemplate;
      deleteButton.style.backgroundColor = '#f44336';
      deleteButton.style.color = 'white';
      deleteButton.style.border = 'none';
      deleteButton.style.padding = '4px 8px';
      deleteButton.style.borderRadius = '3px';
      deleteButton.style.fontSize = '12px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.transition = 'background-color 0.2s';
      
      deleteButton.addEventListener('mouseover', () => {
        deleteButton.style.backgroundColor = '#d32f2f';
      });
      
      deleteButton.addEventListener('mouseout', () => {
        deleteButton.style.backgroundColor = '#f44336';
      });
      
      // 模板内容
      const contentPreview = document.createElement('div');
      contentPreview.style.fontSize = '13px';
      contentPreview.style.color = '#555';
      contentPreview.style.lineHeight = '1.4';
      contentPreview.style.maxHeight = '80px';
      contentPreview.style.overflow = 'hidden';
      contentPreview.style.textOverflow = 'ellipsis';
      contentPreview.style.display = '-webkit-box';
      contentPreview.style.webkitLineClamp = '3';
      contentPreview.style.webkitBoxOrient = 'vertical';
      contentPreview.style.whiteSpace = 'pre-line';
      contentPreview.textContent = template.content;
      
      // 最后更新时间
      const updatedTime = document.createElement('div');
      updatedTime.style.fontSize = '11px';
      updatedTime.style.color = '#999';
      updatedTime.style.marginTop = '8px';
      updatedTime.style.textAlign = 'right';
      
      const date = new Date(template.updatedAt);
      updatedTime.textContent = isZh 
        ? `${texts.updatedOn} ${date.toLocaleDateString('zh-CN')}`
        : `${texts.updatedOn} ${date.toLocaleDateString('en-US')}`;
      
      // 添加事件处理
      useButton.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`使用模板 "${template.title}"，当前服务: ${currentChatService}`);
        insertPromptToInput(template.content, currentChatService);
        
        // 显示成功通知
        const language = document.getElementById('dco-prompt-panel')?.getAttribute('data-language') || 
                        (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
        const isZh = language.startsWith('zh');
        showNotification(isZh ? '提示词已插入' : 'Prompt inserted');
        
        // 关闭面板
        const promptPanel = document.getElementById('dco-prompt-panel');
        if (promptPanel) {
          promptPanel.style.display = 'none';
        }
      });
      
      editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // 获取表单和表单容器
        const formContainer = document.querySelector('#dco-prompt-panel > div:nth-child(3)');
        const titleInput = document.getElementById('dco-prompt-title');
        const contentTextarea = document.getElementById('dco-prompt-content');
        const templateIdField = document.getElementById('dco-prompt-template-id');
        const panelTitle = document.querySelector('#dco-prompt-panel > div:first-child > h3');
        const newButton = document.querySelector('#dco-prompt-panel > button');
        
        if (titleInput && contentTextarea && templateIdField && formContainer) {
          // 填充表单
          templateIdField.value = template.id;
          titleInput.value = template.title;
          contentTextarea.value = template.content;
          
          // 显示表单
          formContainer.style.display = 'block';
          
          // 更新标题
          if (panelTitle) {
            panelTitle.textContent = texts.editTemplate;
          }
          
          // 隐藏新建按钮
          if (newButton) {
            newButton.style.display = 'none';
          }
        }
      });
      
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmDialog(texts.confirmDelete, () => {
          deletePromptTemplate(template.id);
          // 删除成功后显示通知
          showNotification(isZh ? '模板已删除' : 'Template deleted');
        });
      });
      
      // 组装模板项
      buttonGroup.appendChild(useButton);
      buttonGroup.appendChild(editButton);
      buttonGroup.appendChild(deleteButton);
      
      titleBar.appendChild(titleEl);
      titleBar.appendChild(buttonGroup);
      
      templateItem.appendChild(titleBar);
      templateItem.appendChild(contentPreview);
      templateItem.appendChild(updatedTime);
      
      // 添加到列表
      templateList.appendChild(templateItem);
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