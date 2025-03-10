import React, { createContext, useContext, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// 主题配置
const themes = {
  light: {
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0',
    accent: '#0078d7',
    hoverBg: '#f0f0f0'
  },
  dark: {
    background: '#1e1e1e',
    text: '#e0e0e0',
    border: '#444',
    accent: '#0078d7',
    hoverBg: '#4d4d4d'
  }
};

// 创建主题上下文
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

/**
 * 主题提供者组件
 * @param {Object} props - 组件属性
 * @param {String} props.theme - 主题名称
 * @param {React.ReactNode} props.children - 子组件
 */
const ThemeProvider = ({ theme = 'light', children }) => {
  // 注入主题 CSS 变量
  useEffect(() => {
    document.body.classList.remove('dco-theme-light', 'dco-theme-dark');
    document.body.classList.add(`dco-theme-${theme}`);
    
    // 监听系统主题变化
    if (theme === 'auto' && window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        document.body.classList.remove('dco-theme-light', 'dco-theme-dark');
        document.body.classList.add(`dco-theme-${e.matches ? 'dark' : 'light'}`);
      };
      
      // 初始设置
      handleChange(darkModeQuery);
      
      // 添加监听
      darkModeQuery.addEventListener('change', handleChange);
      
      // 清理函数
      return () => {
        darkModeQuery.removeEventListener('change', handleChange);
      };
    }
  }, [theme]);
  
  // 获取当前主题的配置
  const currentTheme = theme === 'dark' ? themes.dark : themes.light;
  
  // 提供主题上下文
  return (
    <ThemeContext.Provider value={{ theme, currentTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// 导出主题钩子
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider; 