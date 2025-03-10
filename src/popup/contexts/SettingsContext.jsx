import React, { createContext, useState, useEffect, useContext } from 'react';

// 创建上下文
const SettingsContext = createContext();

// 自定义Hook以便于使用设置上下文
export const useSettings = () => useContext(SettingsContext);

// 设置提供者组件
export const SettingsProvider = ({ children }) => {
  // 默认设置
  const defaultSettings = {
    darkMode: false,
    markdownSupport: true,
    autoBackup: false
  };

  // 设置状态
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        chrome.storage.sync.get('settings', (result) => {
          if (chrome.runtime.lastError) {
            console.error('加载设置时出错:', chrome.runtime.lastError);
            return;
          }

          const loadedSettings = result.settings || defaultSettings;
          setSettings(loadedSettings);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('加载设置时出错:', error);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 更新设置
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // 保存到存储
    chrome.storage.sync.set({ settings: newSettings }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存设置时出错:', chrome.runtime.lastError);
      }
    });
  };

  // 提供的上下文值
  const contextValue = {
    settings,
    updateSetting,
    isLoading
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}; 