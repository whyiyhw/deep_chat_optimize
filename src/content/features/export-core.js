/**
 * 导出功能核心模块
 */

import { extractChatData, extractAllChatsData } from './data-extractors.js';
import { showLoadingIndicator, updateLoadingIndicator, hideLoadingIndicator } from './export-ui.js';
import { showNotification } from '../utils/notificationUtils.js';
import { createImagePreviewModal } from './image-renderer.js';

/**
 * 导出聊天记录
 * @param {String} chatService - 聊天服务名称
 */
export function exportChat(chatService) {
  console.log(`正在从 ${chatService} 导出聊天数据...`);
  
  // 提取聊天数据
  extractChatData(chatService).then(chatData => {
    if (!chatData || !chatData.messages || chatData.messages.length === 0) {
      console.error('未能提取到聊天数据');
      showNotification('未能提取到聊天数据', 'error', 5000);
      return;
    }
    
    // 获取用户偏好的导出格式
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response && response.success) {
        const format = response.data.exportFormat || 'json';
        
        // 发送数据到后台脚本进行导出
        chrome.runtime.sendMessage(
          { 
            type: 'EXPORT_CHAT', 
            data: chatData, 
            format: format 
          }, 
          (exportResponse) => {
            if (exportResponse && exportResponse.success) {
              console.log('导出成功:', exportResponse.data);
            } else {
              console.error('导出失败:', exportResponse?.error);
              showNotification(`导出失败: ${exportResponse?.error || '未知错误'}`, 'error', 5000);
            }
          }
        );
      }
    });
  }).catch(error => {
    console.error('提取聊天数据时出错:', error);
    showNotification('提取聊天数据时出错: ' + error.message, 'error', 5000);
  });
}

/**
 * 导出所有聊天记录
 * @param {String} chatService - 聊天服务名称
 */
export function exportAllChats(chatService) {
  console.log(`正在从 ${chatService} 导出所有聊天数据...`);
  
  // 提取所有聊天数据
  extractAllChatsData(chatService).then(allChatsData => {
    if (!allChatsData || !Array.isArray(allChatsData) || allChatsData.length === 0) {
      console.error('未能提取到聊天数据');
      showNotification('未能提取到聊天数据', 'error', 5000);
      return;
    }
    
    // 获取用户偏好的导出格式
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (response && response.success) {
        const format = response.data.exportFormat || 'json';
        
        // 发送数据到后台脚本进行导出
        chrome.runtime.sendMessage(
          { 
            type: 'EXPORT_ALL_CHATS', 
            data: allChatsData, 
            format: format 
          }, 
          (exportResponse) => {
            if (exportResponse && exportResponse.success) {
              console.log('导出成功:', exportResponse.data);
            } else {
              console.error('导出失败:', exportResponse?.error);
              showNotification(`导出失败: ${exportResponse?.error || '未知错误'}`, 'error', 5000);
            }
          }
        );
      }
    });
  }).catch(error => {
    console.error('提取所有聊天数据时出错:', error);
    showNotification('提取所有聊天数据时出错: ' + error.message, 'error', 5000);
  });
}

/**
 * 将聊天数据渲染为图片并展示给用户
 * @param {String} chatService - 聊天服务名称
 */
export function renderChatAsImage(chatService) {
  console.log(`正在从 ${chatService} 提取聊天数据并渲染为图片...`);
  
  // 显示加载指示器
  const loadingIndicator = showLoadingIndicator('正在处理聊天数据...');
  
  // 检查是否支持html2canvas
  if (typeof window.ClipboardItem === 'undefined') {
    hideLoadingIndicator(loadingIndicator);
    console.warn('当前浏览器不支持高级剪贴板功能，复制到剪贴板功能将被禁用');
  }
  
  // 提取聊天数据
  extractChatData(chatService)
    .then(chatData => {
      if (!chatData || !chatData.messages || chatData.messages.length === 0) {
        // 隐藏加载指示器
        hideLoadingIndicator(loadingIndicator);
        console.error('未能提取到聊天数据');
        
        // 使用更友好的错误提示
        showNotification('无法提取聊天数据：未能从当前对话中提取到有效的聊天数据，请确保当前页面包含聊天内容。', 'error', 5000);
        return;
      }
      
      // 更新加载指示器
      updateLoadingIndicator(loadingIndicator, '正在渲染HTML...');
      
      // 添加元数据到聊天数据
      chatData.exportTime = new Date().toLocaleString();
      chatData.exportVersion = '1.0';
      
      // 将聊天数据发送到后台脚本，获取HTML
      chrome.runtime.sendMessage(
        { 
          type: 'RENDER_CHAT_AS_HTML', 
          data: chatData
        }, 
        (response) => {
          if (response && response.success) {
            // 隐藏加载指示器
            hideLoadingIndicator(loadingIndicator);
            // 创建一个包含HTML的iframe，支持多页面
            createImagePreviewModal(response.htmlPages, chatData.service);
            
            // 显示成功通知
            showNotification(`聊天记录已成功渲染为${response.htmlPages.length}张图片，您可以下载或复制到剪贴板。`, 'success', 3000);
          } else {
            // 隐藏加载指示器
            hideLoadingIndicator(loadingIndicator);
            console.error('渲染失败:', response?.error || '未知错误');
            
            // 使用更友好的错误提示
            showNotification(`渲染失败：无法渲染聊天记录: ${response?.error || '未知错误'}`, 'error', 5000);
          }
        }
      );
    })
    .catch(error => {
      // 隐藏加载指示器
      hideLoadingIndicator(loadingIndicator);
      console.error('提取聊天数据时出错:', error);
      
      // 使用更友好的错误提示
      showNotification(`处理出错：提取聊天数据时出错: ${error.message}`, 'error', 5000);
    });
} 