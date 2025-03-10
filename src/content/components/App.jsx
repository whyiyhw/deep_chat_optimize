import React, { useState, useEffect } from 'react';
import PromptPanel from './PromptPanel';
import ThemeProvider from './ThemeProvider';
import { applyTheme } from '../features/themeManager';
import { addPromptFeature } from '../features/promptFeature';
import { setupDeepSeekButtonObserver } from '../core/chatServices';
import { updateButtonTextByLanguage } from '../utils/domUtils';
import styled from 'styled-components';

// 添加样式化容器组件
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

/**
 * 应用主组件
 * @param {Object} props - 组件属性
 * @param {String} props.chatService - 聊天服务类型
 * @param {Object} props.settings - 用户设置
 */
const App = ({ chatService, settings }) => {
  // 状态管理
  const [promptPanelVisible, setPromptPanelVisible] = useState(false);
  const [themeMode, setThemeMode] = useState(settings.theme);
  
  // 组件挂载时的初始化
  useEffect(() => {
    console.log(`初始化App组件 - 聊天服务: ${chatService}`);
    
    // 初始化页面主题
    applyTheme(settings.theme);
    console.log('初始化页面主题', settings.theme);
    
    // 针对DeepSeek特殊处理
    if (chatService === 'deepseek') {
      console.log('检测到DeepSeek服务，应用特殊初始化');
      // 使用更强大的监控器
      setupDeepSeekButtonObserver();
    } else {
      // 为其他服务添加普通的提示词功能
      addPromptFeature(chatService);
    }
  }, [chatService, settings]);
  
  // 处理消息事件
  useEffect(() => {
    const handleMessage = (event) => {
      const request = event.detail;
      
      if (request.action === 'toggle_prompt_panel') {
        setPromptPanelVisible(prev => !prev);
      } else if (request.action === 'export_chat') {
        handleExportChat();
      } else if (request.action === 'export_all_chats') {
        handleExportAllChats();
      } else if (request.action === 'export_chat_as_image') {
        handleExportChatAsImage();
      } else if (request.action === 'language_changed') {
        console.log('语言已更改为:', request.language);
        // 更新提示词按钮文本
        updateButtonTextByLanguage(request.language);
        // 语言变化处理由 ThemeProvider 处理
      } else if (request.action === 'open_settings') {
        chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' });
      }
    };
    
    // 注册事件监听
    window.addEventListener('DCO_MESSAGE', handleMessage);
    
    // 清理函数
    return () => {
      window.removeEventListener('DCO_MESSAGE', handleMessage);
    };
  }, [chatService, settings]);
  
  // 监听语言设置变更
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === 'sync' && changes.language) {
        console.log('存储中的语言设置已更改:', changes.language.newValue);
        updateButtonTextByLanguage(changes.language.newValue);
      }
    };
    
    // 注册存储变更监听
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    // 加载当前语言设置并应用
    chrome.storage.sync.get('language', (result) => {
      if (result.language) {
        updateButtonTextByLanguage(result.language);
      }
    });
    
    // 清理函数
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);
  
  // 处理导出聊天
  const handleExportChat = () => {
    import('../features/export.js').then(module => {
      module.exportChat(chatService);
    });
  };
  
  // 处理导出所有聊天
  const handleExportAllChats = () => {
    import('../features/export.js').then(module => {
      module.exportAllChats(chatService);
    });
  };
  
  // 处理将聊天导出为图片
  const handleExportChatAsImage = () => {
    import('../features/export.js').then(module => {
      module.renderChatAsImage(chatService);
    });
  };
  
  // 切换提示词面板
  const togglePromptPanel = () => {
    setPromptPanelVisible(prev => !prev);
  };
  
  return (
    <ThemeProvider theme={themeMode}>
      <Container>
        {promptPanelVisible && (
          <PromptPanel 
            chatService={chatService}
            onClose={() => setPromptPanelVisible(false)}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App; 