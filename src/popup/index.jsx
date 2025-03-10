import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import App from './components/App';
import GlobalStyles from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/themes';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { NotificationProvider } from './contexts/NotificationContext';

// 添加调试日志
console.log('React popup 脚本开始执行');

// 获取当前主题设置
chrome.storage.sync.get('settings', (result) => {
  console.log('加载设置:', result);
  
  const settings = result.settings || {
    darkMode: false,
    markdownSupport: true,
    autoBackup: false
  };

  // 渲染React应用
  const container = document.getElementById('root');
  console.log('Root 元素:', container);
  
  if (!container) {
    console.error('未找到 root 元素，无法挂载React应用');
    return;
  }
  
  try {
    const root = createRoot(container);
    console.log('React root 创建成功');
    
    root.render(
      <React.StrictMode>
        <ThemeProvider theme={settings.darkMode ? darkTheme : lightTheme}>
          <GlobalStyles />
          <SettingsProvider>
            <LanguageProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </React.StrictMode>
    );
    console.log('React 应用渲染完成');
  } catch (error) {
    console.error('React 渲染错误:', error);
  }
}); 