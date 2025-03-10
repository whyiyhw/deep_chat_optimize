import React, { createContext, useState, useEffect, useContext } from 'react';

// 语言文本
const translations = {
  'zh-CN': {
    sectionTitle: '快捷工具',
    exportChat: '导出当前聊天',
    exportChats: '导出所有聊天',
    exportChatAsImage: '分享聊天为图片',
    promptPanel: '提示词模板',
    settingsButton: '高级设置',
    helpLink: '帮助',
    title: 'DeepSeek助手',
    languageChanged: '语言已切换为中文',
    confirmAction: '确认操作',
    confirm: '确认',
    cancel: '取消',
    themeToggle: '深色模式',
    markdownSupport: 'Markdown支持',
    autoBackup: '自动备份',
    dataExportSuccess: '数据导出成功',
    dataExportFailed: '导出失败',
    settings: '设置',
    chatTools: '聊天工具',
    extensionSettings: '扩展设置',
    version: '版本'
  },
  'en-US': {
    sectionTitle: 'Quick Tools',
    exportChat: 'Export Current Chat',
    exportChats: 'Export All Chats',
    exportChatAsImage: 'Export Chat as Image',
    promptPanel: 'Prompt Panel',
    settingsButton: 'Advanced Settings',
    helpLink: 'Help',
    title: 'DeepSeek Optimize',
    languageChanged: 'Language changed to English',
    confirmAction: 'Confirm Action',
    confirm: 'Confirm',
    cancel: 'Cancel',
    themeToggle: 'Dark Mode',
    markdownSupport: 'Markdown Support',
    autoBackup: 'Auto Backup',
    dataExportSuccess: 'Data exported successfully',
    dataExportFailed: 'Export failed',
    version: 'Version',
    settings: 'Settings',
    chatTools: 'Chat Tools',
    extensionSettings: 'Extension Settings'
  }
};

// 创建上下文
const LanguageContext = createContext();

// 自定义Hook以便于使用语言上下文
export const useLanguage = () => useContext(LanguageContext);

// 语言提供者组件
export const LanguageProvider = ({ children }) => {
  // 默认语言
  const defaultLanguage = navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US';
  
  // 语言状态
  const [language, setLanguage] = useState(defaultLanguage);
  const [t, setT] = useState(translations[defaultLanguage]);

  // 加载语言设置
  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      if (chrome.runtime.lastError) {
        console.error('加载语言设置时出错:', chrome.runtime.lastError);
        return;
      }

      const savedLanguage = result.language || defaultLanguage;
      setLanguage(savedLanguage);
      setT(translations[savedLanguage] || translations['en-US']);
    });
  }, []);

  // 更改语言
  const changeLanguage = (newLanguage) => {
    if (!translations[newLanguage]) {
      console.warn(`不支持的语言: ${newLanguage}`);
      return;
    }

    setLanguage(newLanguage);
    setT(translations[newLanguage]);

    // 保存到存储
    chrome.storage.sync.set({ language: newLanguage }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存语言设置时出错:', chrome.runtime.lastError);
      }

      // 更新文档语言
      document.documentElement.setAttribute('lang', newLanguage);

      // 通知内容脚本语言已更改
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'language_changed',
              language: newLanguage
            }).catch(err => console.log('无法发送消息到内容脚本:', err));
          }
        });
      } catch (error) {
        console.error('发送语言更改消息出错:', error);
      }
    });
  };

  // 提供的上下文值
  const contextValue = {
    language,
    t,
    changeLanguage,
    supportedLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}; 