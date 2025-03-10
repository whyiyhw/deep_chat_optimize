/**
 * 提示词输入模块
 */

import { showNotification } from '../../utils/notificationUtils.js';

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
                     document.querySelector('.input-area textarea') ||
                     document.querySelector('.ql-editor');
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
    
    // 特殊处理元宝的Quill编辑器
    if (chatService === 'yuanbao' && inputElement.classList.contains('ql-editor')) {
      console.log('检测到元宝Quill编辑器，尝试特殊处理...');
      
      try {
        // 方法1: 直接设置innerHTML
        const pTag = document.createElement('p');
        pTag.textContent = promptText;
        inputElement.innerHTML = '';
        inputElement.appendChild(pTag);
        
        // 方法2: 尝试使用Quill API
        const quillInstance = window.Quill && window.Quill.find(inputElement);
        if (quillInstance) {
          console.log('找到Quill实例，使用Quill API设置内容');
          quillInstance.setText(promptText);
        }
        
        // 方法3: 模拟键盘输入
        const focusEvent = new Event('focus', { bubbles: true });
        inputElement.dispatchEvent(focusEvent);
        
        // 尝试触发输入事件
        setTimeout(() => {
          const customEvent = new CustomEvent('text-change', { bubbles: true });
          inputElement.dispatchEvent(customEvent);
        }, 100);
      } catch (error) {
        console.error('元宝编辑器特殊处理失败:', error);
      }
    }
  }
  
  // 聚焦输入框
  inputElement.focus();
} 