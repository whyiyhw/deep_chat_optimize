/**
 * 提示词功能模块
 */

import { showNotification, showConfirmDialog } from '../utils/notificationUtils.js';
import { isChineseUI } from '../utils/domUtils.js';
import { findDeepSeekButtonArea, setupDeepSeekButtonObserver } from '../core/chatServices.js';

/**
 * 添加提示词功能
 * @param {String} chatService - 聊天服务名称
 */
export function addPromptFeature(chatService) {
  console.log(`为 ${chatService} 添加提示词功能`);
  
  // 创建提示词面板
  createPromptPanel();
  console.log('已创建提示词面板');
  
  // 监听输入框，添加提示词按钮
  addPromptButtonToInput(chatService);
  
  // 为 DeepSeek 添加专门的观察器
  if (chatService === 'deepseek') {
    setupDeepSeekButtonObserver();
  }
}

/**
 * 创建提示词面板
 */
export function createPromptPanel() {
  // 检查是否已存在提示词面板
  if (document.getElementById('dco-prompt-panel')) {
    return;
  }
  
  // 获取当前语言设置
  chrome.storage.sync.get('language', (result) => {
    const language = result.language || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
    const isZh = language.startsWith('zh');
    
    // 多语言文本
    const texts = {
      panelTitle: isZh ? '提示词模板' : 'Prompt Panel',
      newTemplate: isZh ? '创建新模板' : 'Create New Template',
      templateNamePlaceholder: isZh ? '模板名称' : 'Template Name',
      contentPlaceholder: isZh ? '输入提示词内容...' : 'Enter prompt content...',
      saveButton: isZh ? '保存模板' : 'Save Template',
      savedTemplates: isZh ? '已保存模板' : 'Saved Templates'
    };
    
    // 创建提示词面板容器
    const promptPanel = document.createElement('div');
    promptPanel.id = 'dco-prompt-panel';
    promptPanel.classList.add('dco-prompt-panel');
    promptPanel.style.display = 'none';
    promptPanel.style.position = 'fixed';
    promptPanel.style.bottom = '80px';
    promptPanel.style.right = '20px';
    promptPanel.style.left = 'auto';
    promptPanel.style.width = '320px';
    promptPanel.style.maxHeight = '500px';
    promptPanel.style.backgroundColor = 'var(--dco-bg-color, #ffffff)';
    promptPanel.style.border = '1px solid var(--dco-border-color, rgba(0, 0, 0, 0.08))';
    promptPanel.style.borderRadius = '12px';
    promptPanel.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.12)';
    promptPanel.style.zIndex = '1000';
    promptPanel.style.overflow = 'hidden';
    promptPanel.style.flexDirection = 'column';
    promptPanel.style.backdropFilter = 'blur(8px)';
    promptPanel.style.transition = 'all 0.3s ease';
    promptPanel.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // 创建面板头部
    const panelHeader = document.createElement('div');
    panelHeader.style.display = 'flex';
    panelHeader.style.justifyContent = 'space-between';
    panelHeader.style.alignItems = 'center';
    panelHeader.style.padding = '14px 16px';
    panelHeader.style.borderBottom = '1px solid var(--dco-border-color, rgba(0, 0, 0, 0.06))';
    panelHeader.style.backgroundColor = 'var(--dco-header-bg, rgba(255, 255, 255, 0.8))';
    
    const panelTitle = document.createElement('h3');
    panelTitle.textContent = texts.panelTitle;
    panelTitle.style.margin = '0';
    panelTitle.style.fontSize = '16px';
    panelTitle.style.fontWeight = '600';
    panelTitle.style.color = 'var(--dco-primary-text, #1a1a1a)';
    panelTitle.style.letterSpacing = '0.01em';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.lineHeight = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = 'var(--dco-text-color, #666)';
    closeButton.style.padding = '0';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.width = '28px';
    closeButton.style.height = '28px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.transition = 'background-color 0.2s ease';
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.backgroundColor = 'var(--dco-hover-bg, rgba(0, 0, 0, 0.05))';
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    closeButton.addEventListener('click', () => {
      promptPanel.style.display = 'none';
    });
    
    panelHeader.appendChild(panelTitle);
    panelHeader.appendChild(closeButton);
    
    // 创建提示词表单
    const promptForm = document.createElement('div');
    promptForm.style.padding = '16px';
    promptForm.style.backgroundColor = 'var(--dco-form-bg, #ffffff)';
    
    const formLabel = document.createElement('div');
    formLabel.textContent = texts.newTemplate;
    formLabel.style.fontSize = '14px';
    formLabel.style.fontWeight = '500';
    formLabel.style.marginBottom = '12px';
    formLabel.style.color = 'var(--dco-secondary-text, #666)';
    
    const titleInput = document.createElement('input');
    titleInput.id = 'dco-prompt-title';
    titleInput.type = 'text';
    titleInput.placeholder = texts.templateNamePlaceholder;
    titleInput.style.width = '100%';
    titleInput.style.padding = '10px 12px';
    titleInput.style.marginBottom = '12px';
    titleInput.style.border = '1px solid var(--dco-input-border, rgba(0, 0, 0, 0.1))';
    titleInput.style.borderRadius = '8px';
    titleInput.style.fontSize = '14px';
    titleInput.style.backgroundColor = 'var(--dco-input-bg, rgba(255, 255, 255, 0.8))';
    titleInput.style.color = 'var(--dco-input-text, #1a1a1a)';
    titleInput.style.outline = 'none';
    titleInput.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
    titleInput.style.boxSizing = 'border-box';
    
    titleInput.addEventListener('focus', () => {
      titleInput.style.borderColor = 'var(--dco-primary-color, #2196F3)';
      titleInput.style.boxShadow = '0 0 0 2px var(--dco-primary-shadow, rgba(33, 150, 243, 0.2))';
    });
    
    titleInput.addEventListener('blur', () => {
      titleInput.style.borderColor = 'var(--dco-input-border, rgba(0, 0, 0, 0.1))';
      titleInput.style.boxShadow = 'none';
    });
    
    const contentTextarea = document.createElement('textarea');
    contentTextarea.id = 'dco-prompt-content';
    contentTextarea.placeholder = texts.contentPlaceholder;
    contentTextarea.style.width = '100%';
    contentTextarea.style.height = '100px';
    contentTextarea.style.padding = '10px 12px';
    contentTextarea.style.marginBottom = '12px';
    contentTextarea.style.border = '1px solid var(--dco-input-border, rgba(0, 0, 0, 0.1))';
    contentTextarea.style.borderRadius = '8px';
    contentTextarea.style.fontSize = '14px';
    contentTextarea.style.backgroundColor = 'var(--dco-input-bg, rgba(255, 255, 255, 0.8))';
    contentTextarea.style.color = 'var(--dco-input-text, #1a1a1a)';
    contentTextarea.style.outline = 'none';
    contentTextarea.style.resize = 'vertical';
    contentTextarea.style.fontFamily = 'inherit';
    contentTextarea.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
    contentTextarea.style.boxSizing = 'border-box';
    
    contentTextarea.addEventListener('focus', () => {
      contentTextarea.style.borderColor = 'var(--dco-primary-color, #2196F3)';
      contentTextarea.style.boxShadow = '0 0 0 2px var(--dco-primary-shadow, rgba(33, 150, 243, 0.2))';
    });
    
    contentTextarea.addEventListener('blur', () => {
      contentTextarea.style.borderColor = 'var(--dco-input-border, rgba(0, 0, 0, 0.1))';
      contentTextarea.style.boxShadow = 'none';
    });
    
    const saveButton = document.createElement('button');
    saveButton.id = 'dco-prompt-save';
    saveButton.textContent = texts.saveButton;
    saveButton.style.width = '100%';
    saveButton.style.padding = '10px 16px';
    saveButton.style.backgroundColor = 'var(--dco-primary-color, #2196F3)';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '8px';
    saveButton.style.fontSize = '14px';
    saveButton.style.fontWeight = '500';
    saveButton.style.cursor = 'pointer';
    saveButton.style.transition = 'background-color 0.2s ease, transform 0.1s ease';
    saveButton.style.boxShadow = '0 2px 4px var(--dco-button-shadow, rgba(0, 0, 0, 0.1))';
    
    saveButton.addEventListener('mouseover', () => {
      saveButton.style.backgroundColor = 'var(--dco-primary-hover, #1976D2)';
    });
    
    saveButton.addEventListener('mouseout', () => {
      saveButton.style.backgroundColor = 'var(--dco-primary-color, #2196F3)';
    });
    
    saveButton.addEventListener('mousedown', () => {
      saveButton.style.transform = 'translateY(1px)';
    });
    
    saveButton.addEventListener('mouseup', () => {
      saveButton.style.transform = 'translateY(0)';
    });
    
    saveButton.addEventListener('click', () => {
      savePromptTemplate({
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        content: contentTextarea.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    
    promptForm.appendChild(formLabel);
    promptForm.appendChild(titleInput);
    promptForm.appendChild(contentTextarea);
    promptForm.appendChild(saveButton);
    
    // 创建已保存的模板列表
    const listSection = document.createElement('div');
    listSection.style.padding = '0 16px 16px';
    
    const listLabel = document.createElement('div');
    listLabel.textContent = texts.savedTemplates;
    listLabel.style.fontSize = '14px';
    listLabel.style.fontWeight = '500';
    listLabel.style.margin = '0 0 12px 0';
    listLabel.style.padding = '12px 0 0 0';
    listLabel.style.borderTop = '1px solid var(--dco-divider, rgba(0, 0, 0, 0.06))';
    listLabel.style.color = 'var(--dco-secondary-text, #666)';
    
    const promptList = document.createElement('div');
    promptList.id = 'dco-prompt-list';
    promptList.style.maxHeight = '200px';
    promptList.style.overflowY = 'auto';
    promptList.style.paddingRight = '4px';
    
    // 设置滚动条样式
    promptList.style.scrollbarWidth = 'thin';
    promptList.style.scrollbarColor = 'var(--dco-scrollbar-thumb, rgba(0, 0, 0, 0.2)) var(--dco-scrollbar-track, transparent)';
    
    promptList.style.msOverflowStyle = 'none';  /* IE and Edge */
    promptList.style.scrollbarWidth = 'thin';  /* Firefox */
    
    // WebKit滚动条样式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      #dco-prompt-list::-webkit-scrollbar {
        width: 6px;
      }
      #dco-prompt-list::-webkit-scrollbar-track {
        background: var(--dco-scrollbar-track, transparent);
      }
      #dco-prompt-list::-webkit-scrollbar-thumb {
        background-color: var(--dco-scrollbar-thumb, rgba(0, 0, 0, 0.2));
        border-radius: 3px;
      }
    `;
    document.head.appendChild(styleSheet);
    
    listSection.appendChild(listLabel);
    listSection.appendChild(promptList);
    
    // 组装面板
    promptPanel.appendChild(panelHeader);
    promptPanel.appendChild(promptForm);
    promptPanel.appendChild(listSection);
    
    // 添加到文档
    document.body.appendChild(promptPanel);
    
    // 监听语言变化
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.language) {
        const newLanguage = changes.language.newValue;
        const isZh = newLanguage.startsWith('zh');
        
        // 更新面板文本
        panelTitle.textContent = isZh ? '提示词模板' : 'Prompt Panel';
        formLabel.textContent = isZh ? '创建新模板' : 'Create New Template';
        titleInput.placeholder = isZh ? '模板名称' : 'Template Name';
        contentTextarea.placeholder = isZh ? '输入提示词内容...' : 'Enter prompt content...';
        saveButton.textContent = isZh ? '保存模板' : 'Save Template';
        listLabel.textContent = isZh ? '已保存模板' : 'Saved Templates';
        
        // 重新加载模板列表以更新文本
        loadPromptTemplates();
      }
    });
  });
}

/**
 * 切换提示词面板显示状态
 */
export function togglePromptPanel() {
  console.log('切换提示词面板显示状态');
  
  // 检查是否存在 React 提示词面板（如果使用 React 组件）
  const reactEvent = new CustomEvent('DCO_MESSAGE', { 
    detail: { action: 'toggle_prompt_panel' } 
  });
  window.dispatchEvent(reactEvent);
  
  // 同时处理原生 DOM 面板
  const promptPanel = document.getElementById('dco-prompt-panel');
  
  if (promptPanel) {
    // 如果面板已存在，切换其显示状态
    console.log('面板存在，切换显示状态，当前状态:', promptPanel.style.display);
    
    if (promptPanel.style.display === 'none' || promptPanel.style.display === '') {
      console.log('显示面板');
      promptPanel.style.display = 'flex';
      
      // 重新加载提示词模板
      loadPromptTemplates();
      
      // 调整面板位置，确保在合适的位置显示
      positionPromptPanel();
    } else {
      console.log('隐藏面板');
      promptPanel.style.display = 'none';
    }
  } else {
    // 如果面板不存在，则创建一个
    console.log('面板不存在，创建新面板');
    createPromptPanel();
    
    // 创建后立即显示
    const newPanel = document.getElementById('dco-prompt-panel');
    if (newPanel) {
      newPanel.style.display = 'flex';
      
      // 加载提示词模板
      loadPromptTemplates();
      
      // 调整面板位置
      positionPromptPanel();
    } else {
      console.error('无法创建提示词面板');
    }
  }
}

/**
 * 调整提示词面板位置
 * 确保面板在可见区域内，并且始终显示在右侧
 */
function positionPromptPanel() {
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

/**
 * 加载提示词模板
 */
export function loadPromptTemplates() {
  const promptList = document.getElementById('dco-prompt-list');
  if (!promptList) return;
  
  // 清空列表
  promptList.innerHTML = '';

  // 获取当前语言设置
  chrome.storage.sync.get(['promptTemplates', 'language'], (result) => {
    const templates = result.promptTemplates || [];
    const language = result.language || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
    const isZh = language.startsWith('zh');
    
    // 多语言文本
    const texts = {
      emptyMessage: isZh ? '暂无保存的提示词模板' : 'No saved prompt templates',
      useButton: isZh ? '使用' : 'Use',
      deleteButton: isZh ? '删除' : 'Delete',
      updatedAt: isZh ? '更新于' : 'Updated at',
      confirmDelete: isZh ? '确定要删除模板' : 'Are you sure you want to delete template'
    };
    
    if (templates.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = texts.emptyMessage;
      emptyMessage.style.padding = '16px 8px';
      emptyMessage.style.color = 'var(--dco-secondary-text, #888)';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.fontSize = '14px';
      emptyMessage.style.fontStyle = 'italic';
      emptyMessage.style.backgroundColor = 'var(--dco-empty-bg, rgba(0, 0, 0, 0.02))';
      emptyMessage.style.borderRadius = '8px';
      promptList.appendChild(emptyMessage);
      return;
    }
    
    // 按更新时间排序，最新的在前面
    templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // 创建模板列表
    templates.forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.classList.add('dco-prompt-item');
      templateItem.style.padding = '12px';
      templateItem.style.borderRadius = '8px';
      templateItem.style.backgroundColor = 'var(--dco-item-bg, rgba(0, 0, 0, 0.02))';
      templateItem.style.cursor = 'pointer';
      templateItem.style.transition = 'background-color 0.2s ease, transform 0.1s ease';
      templateItem.style.border = '1px solid var(--dco-item-border, rgba(0, 0, 0, 0.05))';
      templateItem.style.marginBottom = '8px';
      
      // 添加悬停效果
      templateItem.addEventListener('mouseover', () => {
        templateItem.style.backgroundColor = 'var(--dco-item-hover-bg, rgba(0, 0, 0, 0.04))';
        templateItem.style.transform = 'translateY(-1px)';
        templateItem.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      });
      
      templateItem.addEventListener('mouseout', () => {
        templateItem.style.backgroundColor = 'var(--dco-item-bg, rgba(0, 0, 0, 0.02))';
        templateItem.style.transform = 'translateY(0)';
        templateItem.style.boxShadow = 'none';
      });
      
      const itemHeader = document.createElement('div');
      itemHeader.style.display = 'flex';
      itemHeader.style.justifyContent = 'space-between';
      itemHeader.style.alignItems = 'center';
      itemHeader.style.marginBottom = '8px';
      
      const itemTitle = document.createElement('div');
      itemTitle.textContent = template.title;
      itemTitle.style.fontWeight = '600';
      itemTitle.style.fontSize = '14px';
      itemTitle.style.color = 'var(--dco-primary-text, #1a1a1a)';
      itemTitle.style.whiteSpace = 'nowrap';
      itemTitle.style.overflow = 'hidden';
      itemTitle.style.textOverflow = 'ellipsis';
      itemTitle.style.maxWidth = '160px';
      
      const itemActions = document.createElement('div');
      itemActions.style.display = 'flex';
      itemActions.style.gap = '8px';
      
      const useButton = document.createElement('button');
      useButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> ' + texts.useButton;
      useButton.style.display = 'flex';
      useButton.style.alignItems = 'center';
      useButton.style.gap = '4px';
      useButton.style.background = 'var(--dco-button-bg, rgba(33, 150, 243, 0.1))';
      useButton.style.border = 'none';
      useButton.style.padding = '4px 8px';
      useButton.style.borderRadius = '4px';
      useButton.style.cursor = 'pointer';
      useButton.style.color = 'var(--dco-primary-color, #2196F3)';
      useButton.style.fontSize = '12px';
      useButton.style.fontWeight = '500';
      useButton.style.transition = 'background-color 0.2s ease';
      
      useButton.addEventListener('mouseover', () => {
        useButton.style.backgroundColor = 'var(--dco-button-hover-bg, rgba(33, 150, 243, 0.2))';
      });
      
      useButton.addEventListener('mouseout', () => {
        useButton.style.backgroundColor = 'var(--dco-button-bg, rgba(33, 150, 243, 0.1))';
      });
      
      useButton.addEventListener('click', (e) => {
        e.stopPropagation();
        insertPromptToInput(template.content);
        document.getElementById('dco-prompt-panel').style.display = 'none';
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
      deleteButton.style.display = 'flex';
      deleteButton.style.alignItems = 'center';
      deleteButton.style.justifyContent = 'center';
      deleteButton.style.background = 'var(--dco-delete-button-bg, rgba(244, 67, 54, 0.1))';
      deleteButton.style.border = 'none';
      deleteButton.style.width = '24px';
      deleteButton.style.height = '24px';
      deleteButton.style.borderRadius = '4px';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.color = 'var(--dco-delete-color, #f44336)';
      deleteButton.style.transition = 'background-color 0.2s ease';
      deleteButton.title = texts.deleteButton;
      
      deleteButton.addEventListener('mouseover', () => {
        deleteButton.style.backgroundColor = 'var(--dco-delete-button-hover-bg, rgba(244, 67, 54, 0.2))';
      });
      
      deleteButton.addEventListener('mouseout', () => {
        deleteButton.style.backgroundColor = 'var(--dco-delete-button-bg, rgba(244, 67, 54, 0.1))';
      });
      
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmDialog(
          `${texts.confirmDelete} "${template.title}"?`,
          () => {
            deletePromptTemplate(template.id);
          }
        );
      });
      
      itemActions.appendChild(useButton);
      itemActions.appendChild(deleteButton);
      
      itemHeader.appendChild(itemTitle);
      itemHeader.appendChild(itemActions);
      
      const itemContent = document.createElement('div');
      itemContent.textContent = template.content.length > 80 
        ? template.content.substring(0, 80) + '...' 
        : template.content;
      itemContent.style.fontSize = '13px';
      itemContent.style.color = 'var(--dco-secondary-text, #666)';
      itemContent.style.lineHeight = '1.4';
      itemContent.style.maxHeight = '3.8em';
      itemContent.style.overflow = 'hidden';
      itemContent.style.whiteSpace = 'pre-line';
      itemContent.style.textOverflow = 'ellipsis';
      itemContent.style.display = '-webkit-box';
      itemContent.style.webkitLineClamp = '3';
      itemContent.style.webkitBoxOrient = 'vertical';
      
      // 添加更新时间
      const itemFooter = document.createElement('div');
      itemFooter.style.display = 'flex';
      itemFooter.style.justifyContent = 'flex-end';
      itemFooter.style.marginTop = '8px';
      itemFooter.style.fontSize = '11px';
      itemFooter.style.color = 'var(--dco-tertiary-text, #999)';
      
      const updatedAtDate = new Date(template.updatedAt);
      const formattedDate = `${updatedAtDate.getFullYear()}-${String(updatedAtDate.getMonth() + 1).padStart(2, '0')}-${String(updatedAtDate.getDate()).padStart(2, '0')}`;
      itemFooter.textContent = `${texts.updatedAt} ${formattedDate}`;
      
      templateItem.appendChild(itemHeader);
      templateItem.appendChild(itemContent);
      templateItem.appendChild(itemFooter);
      
      // 点击整个模板项时填充表单以便编辑
      templateItem.addEventListener('click', () => {
        document.getElementById('dco-prompt-title').value = template.title;
        document.getElementById('dco-prompt-content').value = template.content;
      });
      
      promptList.appendChild(templateItem);
    });
  });
}

/**
 * 保存提示词模板
 * @param {Object} template - 模板对象，包含title和content
 */
export function savePromptTemplate(template) {
  chrome.storage.sync.get('promptTemplates', (result) => {
    const templates = result.promptTemplates || [];
    
    // 检查是否已存在同名模板
    const existingIndex = templates.findIndex(t => t.title === template.title);
    
    if (existingIndex >= 0) {
      // 更新现有模板
      templates[existingIndex] = {
        ...templates[existingIndex],
        content: template.content,
        updatedAt: new Date().toISOString()
      };
    } else {
      // 添加新模板
      templates.push({
        id: Date.now().toString(),
        title: template.title,
        content: template.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    chrome.storage.sync.set({ promptTemplates: templates }, () => {
      if (chrome.runtime.lastError) {
        showNotification(`保存失败: ${chrome.runtime.lastError.message}`, 'error');
      } else {
        showNotification('提示词模板保存成功', 'success');
        // 清空表单
        document.getElementById('dco-prompt-title').value = '';
        document.getElementById('dco-prompt-content').value = '';
        // 重新加载模板列表
        loadPromptTemplates();
      }
    });
  });
}

/**
 * 删除提示词模板
 * @param {String} templateId - 模板ID
 */
export function deletePromptTemplate(templateId) {
  chrome.storage.sync.get('promptTemplates', (result) => {
    const templates = result.promptTemplates || [];
    const newTemplates = templates.filter(t => t.id !== templateId);
    
    chrome.storage.sync.set({ promptTemplates: newTemplates }, () => {
      if (chrome.runtime.lastError) {
        showNotification(`删除失败: ${chrome.runtime.lastError.message}`, 'error');
      } else {
        showNotification('提示词模板已删除', 'success');
        // 重新加载模板列表
        loadPromptTemplates();
      }
    });
  });
}

/**
 * 为输入框添加提示词按钮
 * @param {String} chatService - 聊天服务类型
 */
export function addPromptButtonToInput(chatService) {
  // 如果按钮已存在，不重复添加
  if (document.getElementById('dco-prompt-button-input')) {
    return;
  }
  
  // 针对 DeepSeek 使用专用实现
  if (chatService === 'deepseek') {
    try {
      const buttonArea = findDeepSeekButtonArea();
      if (buttonArea) {
        // 查找联网搜索按钮（寻找更多可能的识别方式）
        let searchButton = null;
        
        // 方法1: 通过类名和文本内容查找
        searchButton = Array.from(buttonArea.querySelectorAll('.ds-button')).find(
          button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
        );
        
        // 方法2: 如果方法1失败，尝试通过任何具有按钮角色和文本内容的元素查找
        if (!searchButton) {
          searchButton = Array.from(buttonArea.querySelectorAll('[role="button"]')).find(
            button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
          );
        }
        
        // 方法3: 最后尝试在整个文档中查找
        if (!searchButton) {
          searchButton = Array.from(document.querySelectorAll('[role="button"], button')).find(
            button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
          );
        }
        
        // 获取界面语言设置
        isChineseUI().then(isChinese => {
          // 创建提示词按钮
          const promptButton = createDeepSeekPromptButton(searchButton, buttonArea, isChinese);
          
          // 将按钮插入到DOM中
          if (searchButton) {
            // 在联网搜索按钮后插入提示词按钮
            searchButton.after(promptButton);
            console.log('已将提示词按钮插入到联网搜索按钮后面');
          } else {
            // 如果找不到联网搜索按钮，则添加到buttonArea
            buttonArea.appendChild(promptButton);
            console.log('已添加DeepSeek提示词按钮到按钮区域');
          }
        }).catch(error => {
          console.error('获取界面语言设置时出错:', error);
        });
      } else {
        console.error('未找到DeepSeek按钮区域');
      }
    } catch (error) {
      console.error('添加DeepSeek提示词按钮时出错:', error);
    }
    
    return; // 提前返回，避免执行下面的通用代码
  }
  
  // 根据不同的聊天服务找到输入框
  let inputContainer;
  let inputElement;
  let targetContainer; // 特定的目标容器，用于某些服务
  
  const findInputInterval = setInterval(() => {
    switch (chatService) {
      case 'chatgpt':
        inputContainer = document.querySelector('form div[class*="flex"]');
        inputElement = document.querySelector('form textarea');
        break;
        
      case 'claude':
        inputContainer = document.querySelector('.input-container');
        inputElement = document.querySelector('.input-container textarea');
        break;
        
      case 'gemini':
        inputContainer = document.querySelector('div[role="textbox"]')?.parentElement;
        inputElement = document.querySelector('div[role="textbox"]');
        break;
        
      case 'perplexity':
        inputContainer = document.querySelector('div[role="textbox"]')?.parentElement;
        inputElement = document.querySelector('div[role="textbox"]');
        break;
        
      case 'yuanbao':
        // 腾讯元宝的输入框
        inputElement = document.querySelector('textarea') || 
                       document.querySelector('.chat-input') ||
                       document.querySelector('.input-area textarea');
        
        if (inputElement) {
          // 尝试找到合适的父容器
          inputContainer = inputElement.closest('.input-container') || 
                          inputElement.closest('.chat-input-container') ||
                          inputElement.parentElement;
        }
        break;
        
      case 'generic':
      default:
        // 通用模式，尝试找到任何可能的输入框
        inputElement = document.querySelector('textarea');
        if (inputElement) {
          inputContainer = inputElement.parentElement;
        }
        break;
    }
    
    if ((inputContainer || targetContainer) && inputElement && !document.getElementById('dco-prompt-button-input')) {
      clearInterval(findInputInterval);
      
      // 创建提示词按钮
      const promptButton = document.createElement('div');
      promptButton.id = 'dco-prompt-button-input';
      
      // 添加点击事件处理
      promptButton.addEventListener('click', () => {
        togglePromptPanel();
      });
      
      // 其他聊天服务的按钮样式
      promptButton.classList.add('dco-prompt-button');
      promptButton.innerHTML = `
        <span class="dco-prompt-button-icon">📝</span>
        <span class="dco-prompt-button-text">提示词</span>
      `;
      
      // 设置按钮样式
      promptButton.style.cssText = `
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        z-index: 1000;
        user-select: none;
        transition: all 0.2s ease;
      `;
      
      // 添加按钮
      if (inputContainer) {
        const existingPromptButton = inputContainer.querySelector('.dco-prompt-button');
        if (!existingPromptButton) {
          inputContainer.appendChild(promptButton);
          
          // 根据不同的聊天服务调整按钮位置
          switch (chatService) {
            case 'chatgpt':
              promptButton.style.right = '140px';
              promptButton.style.bottom = '18px';
              break;
              
            case 'claude':
              promptButton.style.right = '80px';
              promptButton.style.bottom = '14px';
              break;
              
            case 'gemini':
              promptButton.style.right = '70px';
              promptButton.style.bottom = '8px';
              break;
              
            case 'perplexity':
              promptButton.style.right = '60px';
              promptButton.style.bottom = '10px';
              break;
              
            case 'yuanbao':
              promptButton.style.position = 'relative';
              promptButton.style.marginRight = '10px';
              
              // 特殊处理元宝的添加位置
              const submitButton = inputContainer.querySelector('button[type="submit"]');
              if (submitButton) {
                submitButton.parentElement.insertBefore(promptButton, submitButton);
              } else {
                inputContainer.appendChild(promptButton);
              }
              break;
              
            default:
              promptButton.style.right = '60px';
              promptButton.style.bottom = '14px';
              break;
          }
        }
      }
      
      console.log(`已为 ${chatService} 添加提示词按钮`);
    }
  }, 1000);
  
  // 5秒后如果找不到输入框，清除间隔
  setTimeout(() => {
    clearInterval(findInputInterval);
  }, 5000);
}

/**
 * 将提示词插入到输入框
 * @param {String} promptText - 提示词文本
 * @param {String} chatService - 聊天服务名称
 */
export function insertPromptToInput(promptText, chatService) {
  // 根据不同的聊天服务找到输入框
  let inputElement;
  
  switch (chatService) {
    case 'chatgpt':
      inputElement = document.querySelector('form textarea');
      break;
      
    case 'claude':
      inputElement = document.querySelector('.input-container textarea');
      break;
      
    case 'gemini':
      inputElement = document.querySelector('div[role="textbox"]');
      break;
      
    case 'deepseek':
      inputElement = document.querySelector('textarea');
      break;
      
    case 'yuanbao':
      inputElement = document.querySelector('textarea') || 
                     document.querySelector('.chat-input') ||
                     document.querySelector('.input-area textarea');
      break;
      
    case 'perplexity':
      inputElement = document.querySelector('div[role="textbox"]');
      break;
      
    case 'generic':
    default:
      // 尝试找到任何可能的输入框
      inputElement = document.querySelector('textarea') || 
                     document.querySelector('div[role="textbox"]');
  }
  
  if (!inputElement) {
    console.error('未找到输入框元素');
    showNotification('未找到输入框，无法插入提示词', 'error');
    return;
  }
  
  console.log(`正在向${chatService}输入框插入提示词`);
  
  // 根据元素类型不同处理插入方式
  if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
    // 标准输入框
    inputElement.value = promptText;
    
    // 触发输入事件，确保UI更新
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);
  } else {
    // contenteditable div或其他特殊元素
    inputElement.textContent = promptText;
    
    // 触发输入事件
    const inputEvent = new Event('input', { bubbles: true });
    inputElement.dispatchEvent(inputEvent);
    
    // 某些情况下可能需要额外的事件
    const changeEvent = new Event('change', { bubbles: true });
    inputElement.dispatchEvent(changeEvent);
  }
  
  // 聚焦输入框
  inputElement.focus();
}

/**
 * 为 DeepSeek 创建提示词按钮
 * 专用函数，确保按钮稳定显示且样式正确
 * @param {HTMLElement} searchButton - 联网搜索按钮元素
 * @param {HTMLElement} buttonArea - 按钮区域容器
 * @param {boolean} isChinese - 是否使用中文界面
 * @returns {HTMLElement} 创建的按钮元素
 */
function createDeepSeekPromptButton(searchButton, buttonArea, isChinese) {
  // 创建按钮元素
  const promptButton = document.createElement('div');
  promptButton.id = 'dco-prompt-button-input';
  promptButton.setAttribute('role', 'button');
  promptButton.tabIndex = '0';
  
  // 使用与联网搜索按钮相同的类名
  if (searchButton && searchButton.className) {
    promptButton.className = searchButton.className;
  } else {
    // 备用样式
    promptButton.className = 'ds-button ds-button--primary ds-button--filled ds-button--rect ds-button--m';
  }
  
  // 添加点击事件处理 - 使用增强版面板切换
  promptButton.addEventListener('click', (event) => {
    // 阻止事件冒泡和默认行为
    event.preventDefault();
    event.stopPropagation();
    
    console.log('DeepSeek 提示词按钮被点击');
    
    // 先检查面板是否存在，不存在则创建
    let promptPanel = document.getElementById('dco-prompt-panel');
    if (!promptPanel) {
      console.log('提示词面板不存在，创建新面板');
      createPromptPanel();
      promptPanel = document.getElementById('dco-prompt-panel');
    }
    
    // 切换面板显示状态
    if (promptPanel) {
      if (promptPanel.style.display === 'none' || promptPanel.style.display === '') {
        console.log('显示提示词面板');
        promptPanel.style.display = 'flex';
        loadPromptTemplates();
        
        // 调整面板位置，确保在右侧显示
        positionPromptPanel();
      } else {
        console.log('隐藏提示词面板');
        promptPanel.style.display = 'none';
      }
    } else {
      console.error('无法创建或找到提示词面板');
    }
  });
  
  // 复制联网搜索按钮的样式
  if (searchButton) {
    try {
      // 获取计算样式
      const styles = window.getComputedStyle(searchButton);
      
      // 创建内联样式，使用与搜索按钮相同的关键样式属性
      const inlineStyles = {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        margin: styles.margin,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        boxShadow: styles.boxShadow,
        transition: styles.transition
      };
      
      // 应用内联样式
      Object.assign(promptButton.style, inlineStyles);
      
      // 复制CSS变量
      if (searchButton.style.cssText) {
        promptButton.style.cssText += searchButton.style.cssText;
      }
    } catch (error) {
      console.warn('无法复制搜索按钮样式:', error);
      
      // 应用备用样式
      promptButton.style.cssText = '--ds-button-color: #fff; --button-text-color: #4c4c4c; --button-border-color: rgba(0, 0, 0, 0.12); --ds-button-hover-color: #E0E4ED;';
    }
  } else {
    // 应用备用样式
    promptButton.style.cssText = '--ds-button-color: #fff; --button-text-color: #4c4c4c; --button-border-color: rgba(0, 0, 0, 0.12); --ds-button-hover-color: #E0E4ED;';
  }
  
  // 创建按钮内容
  const buttonText = document.createElement('span');
  
  // 使用与搜索按钮相同的文本类名
  if (searchButton) {
    const searchButtonTextSpan = searchButton.querySelector('span:not([style])');
    if (searchButtonTextSpan && searchButtonTextSpan.className) {
      buttonText.className = searchButtonTextSpan.className;
    }
  }
  
  // 如果没有找到适合的类名，使用默认类名
  if (!buttonText.className) {
    buttonText.className = 'ad0c98fd';
  }
  
  // 设置按钮文本
  buttonText.textContent = isChinese ? '提示词' : 'Prompt';
  
  // 尝试创建与搜索按钮相似的图标
  const buttonIcon = document.createElement('div');
  
  // 尝试使用与搜索按钮相同的图标样式
  if (searchButton) {
    const searchButtonIcon = searchButton.querySelector('.ds-button__icon, [class*="icon"]');
    if (searchButtonIcon) {
      buttonIcon.className = searchButtonIcon.className;
      const iconStyles = window.getComputedStyle(searchButtonIcon);
      
      // 复制图标样式
      buttonIcon.style.marginRight = iconStyles.marginRight;
      buttonIcon.style.display = iconStyles.display;
    }
  }
  
  // 如果没有找到适合的类名，使用默认类名
  if (!buttonIcon.className) {
    buttonIcon.className = 'ds-button__icon';
  }
  
  // 创建图标内容
  const iconSpan = document.createElement('span');
  iconSpan.style.transition = 'none';
  iconSpan.style.transform = 'rotate(0deg)';
  
  const dsIcon = document.createElement('div');
  dsIcon.className = 'ds-icon';
  dsIcon.style.cssText = 'font-size: 17px; width: 17px; height: 17px; color: rgb(76, 76, 76);';
  
  // 使用📝图标的SVG
  dsIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.166 2.5H5.83268C4.91602 2.5 4.16602 3.25 4.16602 4.16667V15.8333C4.16602 16.75 4.91602 17.5 5.83268 17.5H14.166C15.0827 17.5 15.8327 16.75 15.8327 15.8333V4.16667C15.8327 3.25 15.0827 2.5 14.166 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 5.83301H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 9.16699H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 12.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  
  // 组装按钮
  iconSpan.appendChild(dsIcon);
  buttonIcon.appendChild(iconSpan);
  
  // 根据搜索按钮的结构决定按钮内容的顺序
  if (searchButton) {
    const firstChild = searchButton.firstElementChild;
    if (firstChild && firstChild.tagName === 'SPAN') {
      // 如果搜索按钮的第一个元素是文本，我们也应该先放文本
      promptButton.appendChild(buttonText);
      promptButton.appendChild(buttonIcon);
    } else {
      // 否则先放图标
      promptButton.appendChild(buttonIcon);
      promptButton.appendChild(buttonText);
    }
  } else {
    // 默认顺序
    promptButton.appendChild(buttonIcon);
    promptButton.appendChild(buttonText);
  }
  
  return promptButton;
} 