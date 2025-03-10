/**
 * 提示词面板管理模块
 */

import { showNotification } from '../../utils/notificationUtils.js';
import { isChineseUI } from '../../utils/domUtils.js';
import { getLanguageTexts, generateUUID, detectChatService } from './promptCore.js';
import { savePromptTemplate, loadPromptTemplates } from './promptStorage.js';

/**
 * 创建提示词面板
 */
export function createPromptPanel() {
  // 如果已存在提示词面板，则不重复创建
  if (document.getElementById('dco-prompt-panel')) {
    return;
  }
  
  console.log('创建提示词面板');
  
  // 创建面板容器
  const promptPanel = document.createElement('div');
  promptPanel.id = 'dco-prompt-panel';
  promptPanel.className = 'dco-prompt-panel';
  
  // 存储当前检测到的聊天服务类型
  const currentService = detectChatService();
  if (currentService) {
    promptPanel.setAttribute('data-chat-service', currentService);
    console.log(`面板已存储当前聊天服务: ${currentService}`);
  } else {
    // 默认设置为yuanbao
    promptPanel.setAttribute('data-chat-service', 'yuanbao');
    console.log('未检测到聊天服务，默认设置为yuanbao');
  }

  // 设置基本样式
  promptPanel.style.display = 'none';
  promptPanel.style.position = 'fixed';
  promptPanel.style.zIndex = '10000';
  promptPanel.style.top = '20%';
  promptPanel.style.right = '20px';
  promptPanel.style.width = '320px';
  promptPanel.style.maxHeight = '70vh';
  promptPanel.style.overflowY = 'auto';
  promptPanel.style.backgroundColor = '#fff';
  promptPanel.style.borderRadius = '8px';
  promptPanel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  promptPanel.style.padding = '16px';
  promptPanel.style.fontFamily = 'Arial, sans-serif';
  promptPanel.style.color = '#333';
  promptPanel.style.display = 'none';
  promptPanel.style.flexDirection = 'column';
  promptPanel.style.gap = '16px';
  
  // 从存储中获取语言设置，并初始化界面
  chrome.storage.sync.get('language', (result) => {
    const language = result.language || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
    promptPanel.setAttribute('data-language', language);
    initPanelUI(promptPanel, language);
  });
  
  // 监听语言变化
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.language) {
      const newLanguage = changes.language.newValue;
      console.log(`语言设置已变更为: ${newLanguage}`);
      
      // 更新面板的语言属性
      promptPanel.setAttribute('data-language', newLanguage);
      
      // 更新界面文本
      updatePanelLanguage(promptPanel, newLanguage);
      
      // 重新加载模板列表以更新文本
      loadPromptTemplates();
    }
  });
  
  // 添加到文档
  document.body.appendChild(promptPanel);
  
  console.log('已创建提示词面板');
}

/**
 * 初始化面板UI
 * @param {HTMLElement} panel - 面板元素
 * @param {string} language - 语言设置
 */
function initPanelUI(panel, language) {
  const isZh = language.startsWith('zh');
  
  // 多语言文本
  const texts = getLanguageTexts(isZh);
  
  // 创建头部区域
  const header = document.createElement('div');
  header.className = 'dco-prompt-panel-header';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '16px';
  
  // 创建标题
  const title = document.createElement('h3');
  title.className = 'dco-prompt-panel-title';
  title.textContent = texts.panelTitle;
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = '600';
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0 5px';
  closeButton.style.color = '#999';
  closeButton.style.transition = 'color 0.2s';
  closeButton.style.lineHeight = 1;
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.color = '#333';
  });
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.color = '#999';
  });
  closeButton.addEventListener('click', () => {
    panel.style.display = 'none';
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // 创建新建按钮
  const newButton = document.createElement('button');
  newButton.className = 'dco-prompt-new-button';
  newButton.textContent = texts.newTemplate;
  newButton.style.backgroundColor = '#4CAF50';
  newButton.style.color = 'white';
  newButton.style.border = 'none';
  newButton.style.padding = '8px 16px';
  newButton.style.borderRadius = '4px';
  newButton.style.cursor = 'pointer';
  newButton.style.fontWeight = '500';
  newButton.style.fontSize = '14px';
  newButton.style.marginBottom = '16px';
  newButton.style.transition = 'background-color 0.2s';
  newButton.addEventListener('mouseover', () => {
    newButton.style.backgroundColor = '#45a049';
  });
  newButton.addEventListener('mouseout', () => {
    newButton.style.backgroundColor = '#4CAF50';
  });
  
  // 创建表单区域(初始隐藏)
  const formContainer = document.createElement('div');
  formContainer.className = 'dco-prompt-form-container';
  formContainer.style.display = 'none';
  formContainer.style.marginBottom = '16px';
  formContainer.style.backgroundColor = '#f9f9f9';
  formContainer.style.borderRadius = '4px';
  formContainer.style.padding = '16px';
  formContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
  
  // 隐藏字段 - 用于存储编辑中的模板ID
  const templateIdField = document.createElement('input');
  templateIdField.type = 'hidden';
  templateIdField.id = 'dco-prompt-template-id';
  
  // 创建标题输入
  const titleLabel = document.createElement('label');
  titleLabel.className = 'dco-prompt-label';
  titleLabel.textContent = texts.templateNamePlaceholder;
  titleLabel.style.display = 'block';
  titleLabel.style.marginBottom = '4px';
  titleLabel.style.fontSize = '14px';
  
  const titleInput = document.createElement('input');
  titleInput.id = 'dco-prompt-title';
  titleInput.type = 'text';
  titleInput.placeholder = texts.templateNamePlaceholder;
  titleInput.style.width = '100%';
  titleInput.style.padding = '8px 12px';
  titleInput.style.boxSizing = 'border-box';
  titleInput.style.marginBottom = '12px';
  titleInput.style.borderRadius = '4px';
  titleInput.style.border = '1px solid #ddd';
  titleInput.style.fontSize = '14px';
  
  // 创建内容输入
  const contentLabel = document.createElement('label');
  contentLabel.className = 'dco-prompt-label';
  contentLabel.textContent = texts.contentPlaceholder;
  contentLabel.style.display = 'block';
  contentLabel.style.marginBottom = '4px';
  contentLabel.style.fontSize = '14px';
  
  const contentTextarea = document.createElement('textarea');
  contentTextarea.id = 'dco-prompt-content';
  contentTextarea.placeholder = texts.contentPlaceholder;
  contentTextarea.style.width = '100%';
  contentTextarea.style.height = '120px';
  contentTextarea.style.padding = '8px 12px';
  contentTextarea.style.boxSizing = 'border-box';
  contentTextarea.style.marginBottom = '16px';
  contentTextarea.style.borderRadius = '4px';
  contentTextarea.style.border = '1px solid #ddd';
  contentTextarea.style.fontSize = '14px';
  contentTextarea.style.resize = 'vertical';
  
  // 创建按钮区域
  const formButtons = document.createElement('div');
  formButtons.className = 'dco-prompt-form-buttons';
  formButtons.style.display = 'flex';
  formButtons.style.justifyContent = 'flex-end';
  formButtons.style.gap = '8px';
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.className = 'dco-prompt-cancel-button';
  cancelButton.textContent = texts.cancelButton;
  cancelButton.style.padding = '6px 12px';
  cancelButton.style.backgroundColor = '#f0f0f0';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '14px';
  cancelButton.style.transition = 'background-color 0.2s';
  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.backgroundColor = '#e0e0e0';
  });
  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.backgroundColor = '#f0f0f0';
  });
  
  // 保存按钮
  const saveButton = document.createElement('button');
  saveButton.className = 'dco-prompt-save-button';
  saveButton.textContent = texts.saveButton;
  saveButton.style.padding = '6px 12px';
  saveButton.style.backgroundColor = '#2196F3';
  saveButton.style.color = 'white';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '4px';
  saveButton.style.cursor = 'pointer';
  saveButton.style.fontSize = '14px';
  saveButton.style.transition = 'background-color 0.2s';
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.backgroundColor = '#0b7dda';
  });
  saveButton.addEventListener('mouseout', () => {
    saveButton.style.backgroundColor = '#2196F3';
  });
  
  formButtons.appendChild(cancelButton);
  formButtons.appendChild(saveButton);
  
  // 组装表单区域
  formContainer.appendChild(templateIdField);
  formContainer.appendChild(titleLabel);
  formContainer.appendChild(titleInput);
  formContainer.appendChild(contentLabel);
  formContainer.appendChild(contentTextarea);
  formContainer.appendChild(formButtons);
  
  // 创建模板列表容器
  const templateListContainer = document.createElement('div');
  templateListContainer.className = 'dco-prompt-list-container';
  templateListContainer.style.flex = '1';
  templateListContainer.style.overflowY = 'auto';
  
  // 创建模板列表
  const templateList = document.createElement('div');
  templateList.id = 'dco-prompt-template-list';
  templateList.style.display = 'flex';
  templateList.style.flexDirection = 'column';
  templateList.style.gap = '12px';
  
  templateListContainer.appendChild(templateList);
  
  // 添加事件处理
  newButton.addEventListener('click', () => {
    // 清空表单
    templateIdField.value = '';
    titleInput.value = '';
    contentTextarea.value = '';
    
    // 显示表单
    formContainer.style.display = 'block';
    
    // 更新标题
    title.textContent = texts.newTemplate;
    
    // 隐藏新建按钮
    newButton.style.display = 'none';
  });
  
  cancelButton.addEventListener('click', () => {
    // 隐藏表单
    formContainer.style.display = 'none';
    // 显示新建按钮
    newButton.style.display = 'block';
    // 重置标题
    title.textContent = texts.panelTitle;
  });
  
  saveButton.addEventListener('click', () => {
    const templateTitle = titleInput.value.trim();
    const templateContent = contentTextarea.value.trim();
    
    if (!templateTitle || !templateContent) {
      showNotification(texts.inputRequired, 'error');
      return;
    }
    
    const templateId = templateIdField.value || generateUUID();
    
    // 创建模板对象
    const template = {
      id: templateId,
      title: templateTitle,
      content: templateContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 保存模板
    savePromptTemplate(template);
    
    // 显示成功通知
    const language = document.getElementById('dco-prompt-panel')?.getAttribute('data-language') || 
                    (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
    const isZh = language.startsWith('zh');
    showNotification(isZh ? '模板已保存' : 'Template saved');
    
    // 隐藏表单
    formContainer.style.display = 'none';
    // 显示新建按钮
    newButton.style.display = 'block';
    // 重置标题
    title.textContent = texts.panelTitle;
    
    // 重新加载模板列表
    loadPromptTemplates();
  });
  
  // 组装面板
  panel.appendChild(header);
  panel.appendChild(newButton);
  panel.appendChild(formContainer);
  panel.appendChild(templateListContainer);
}

/**
 * 更新面板语言
 * @param {HTMLElement} panel - 面板元素
 * @param {string} language - 新的语言设置
 */
function updatePanelLanguage(panel, language) {
  const isZh = language.startsWith('zh');
  const texts = getLanguageTexts(isZh);
  
  // 更新标题
  const title = panel.querySelector('.dco-prompt-panel-title');
  if (title) {
    // 如果正在编辑，显示编辑标题，否则显示面板标题
    const formContainer = panel.querySelector('.dco-prompt-form-container');
    if (formContainer && formContainer.style.display !== 'none') {
      title.textContent = texts.editTemplate;
    } else {
      title.textContent = texts.panelTitle;
    }
  }
  
  // 更新新建按钮
  const newButton = panel.querySelector('.dco-prompt-new-button');
  if (newButton) newButton.textContent = texts.newTemplate;
  
  // 更新标签文本
  const labels = panel.querySelectorAll('.dco-prompt-label');
  if (labels.length >= 2) {
    labels[0].textContent = texts.templateNamePlaceholder;
    labels[1].textContent = texts.contentPlaceholder;
  }
  
  // 更新输入框占位符
  const titleInput = document.getElementById('dco-prompt-title');
  const contentTextarea = document.getElementById('dco-prompt-content');
  if (titleInput) titleInput.placeholder = texts.templateNamePlaceholder;
  if (contentTextarea) contentTextarea.placeholder = texts.contentPlaceholder;
  
  // 更新按钮文本
  const saveButton = panel.querySelector('.dco-prompt-save-button');
  const cancelButton = panel.querySelector('.dco-prompt-cancel-button');
  if (saveButton) saveButton.textContent = texts.saveButton;
  if (cancelButton) cancelButton.textContent = texts.cancelButton;
}

/**
 * 切换提示词面板显示状态
 */
export function togglePromptPanel() {
  console.log('切换提示词面板显示状态');
  
  // 使用自定义事件通知React组件切换提示词面板
  const reactEvent = new CustomEvent('DCO_MESSAGE', { 
    detail: { action: 'toggle_prompt_panel' } 
  });
  window.dispatchEvent(reactEvent);
  
  // 不再同时处理原生DOM面板，避免创建重复的面板
  // 原有的DOM面板将不再使用，由React组件统一管理
  console.log('已发送切换提示词面板事件到React组件');
}

/**
 * 调整提示词面板位置
 * 确保面板在可见区域内，并且始终显示在右侧
 */
export function positionPromptPanel() {
  const panel = document.getElementById('dco-prompt-panel');
  if (!panel) return;
  
  // 获取窗口尺寸
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  // 获取面板尺寸
  const panelRect = panel.getBoundingClientRect();
  const panelHeight = panelRect.height;
  const panelWidth = panelRect.width;
  
  // 默认位置（距离右侧和底部 20px）
  let right = 20;
  let bottom = 80;
  
  // 调整垂直位置
  if (bottom + panelHeight > windowHeight) {
    // 如果面板底部超出窗口，改为从顶部放置
    panel.style.bottom = 'auto';
    panel.style.top = '80px';
  } else {
    panel.style.top = 'auto';
    panel.style.bottom = `${bottom}px`;
  }
  
  // 始终在右侧显示
  panel.style.left = 'auto';
  panel.style.right = `${right}px`;
} 