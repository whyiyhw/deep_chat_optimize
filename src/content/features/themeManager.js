/**
 * 主题管理模块
 */

/**
 * 应用主题
 * @param {String} theme - 主题名称
 */
export function applyTheme(theme) {
  // 移除现有主题类
  document.body.classList.remove('dco-theme-light', 'dco-theme-dark');
  
  // 添加新主题类
  document.body.classList.add(`dco-theme-${theme}`);
  
  // 注入主题CSS
  let themeCSS = '';
  
  if (theme === 'dark') {
    themeCSS = `
      .dco-theme-dark {
        --dco-bg-color: #1e1e1e;
        --dco-text-color: #e0e0e0;
        --dco-border-color: #444;
        --dco-accent-color: #0078d7;
      }
      
      .dco-theme-dark .dco-toolbar {
        background-color: #2d2d2d !important;
        border-color: #444 !important;
      }
      
      .dco-theme-dark .dco-button {
        background-color: #3d3d3d !important;
        color: #e0e0e0 !important;
        border-color: #555 !important;
      }
      
      .dco-theme-dark .dco-button:hover {
        background-color: #4d4d4d !important;
      }
    `;
  } else {
    themeCSS = `
      .dco-theme-light {
        --dco-bg-color: #ffffff;
        --dco-text-color: #333333;
        --dco-border-color: #e0e0e0;
        --dco-accent-color: #0078d7;
      }
      
      .dco-theme-light .dco-toolbar {
        background-color: #f5f5f5 !important;
        border-color: #e0e0e0 !important;
      }
      
      .dco-theme-light .dco-button {
        background-color: #ffffff !important;
        color: #333333 !important;
        border-color: #cccccc !important;
      }
      
      .dco-theme-light .dco-button:hover {
        background-color: #f0f0f0 !important;
      }
    `;
  }
  
  // 注入CSS
  const style = document.createElement('style');
  style.id = 'dco-theme-style';
  style.textContent = themeCSS;
  
  // 移除现有主题样式
  const existingStyle = document.getElementById('dco-theme-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(style);
}

/**
 * 根据系统主题自动切换主题
 */
export function setupAutoTheme() {
  // 检查是否支持媒体查询
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 初始设置
    if (darkModeQuery.matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
    
    // 监听系统主题变化
    darkModeQuery.addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
}

/**
 * 切换主题
 */
export function toggleTheme() {
  // 获取当前主题
  const isDark = document.body.classList.contains('dco-theme-dark');
  
  // 应用相反的主题
  applyTheme(isDark ? 'light' : 'dark');
  
  // 保存用户主题偏好
  chrome.storage.sync.get('settings', (result) => {
    const settings = result.settings || {};
    settings.theme = isDark ? 'light' : 'dark';
    
    chrome.storage.sync.set({ settings }, () => {
      console.log(`已将主题切换为 ${settings.theme}`);
    });
  });
}