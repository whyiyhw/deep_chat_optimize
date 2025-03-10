/**
 * 导出功能UI组件模块
 */

/**
 * 显示加载指示器
 * @param {String} message - 加载消息
 * @returns {HTMLElement} - 加载指示器元素
 */
export function showLoadingIndicator(message) {
  // 创建加载指示器容器
  const loadingContainer = document.createElement('div');
  loadingContainer.id = 'dco-loading-indicator';
  loadingContainer.style.position = 'fixed';
  loadingContainer.style.top = '0';
  loadingContainer.style.left = '0';
  loadingContainer.style.width = '100%';
  loadingContainer.style.height = '100%';
  loadingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
  loadingContainer.style.zIndex = '10001';
  loadingContainer.style.display = 'flex';
  loadingContainer.style.flexDirection = 'column';
  loadingContainer.style.alignItems = 'center';
  loadingContainer.style.justifyContent = 'center';
  loadingContainer.style.backdropFilter = 'blur(5px)';
  
  // 创建加载动画容器
  const spinnerContainer = document.createElement('div');
  spinnerContainer.style.position = 'relative';
  spinnerContainer.style.width = '80px';
  spinnerContainer.style.height = '80px';
  
  // 创建加载动画
  const spinner = document.createElement('div');
  spinner.style.boxSizing = 'border-box';
  spinner.style.position = 'absolute';
  spinner.style.width = '64px';
  spinner.style.height = '64px';
  spinner.style.margin = '8px';
  spinner.style.border = '4px solid transparent';
  spinner.style.borderTopColor = '#3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'dco-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite';
  
  const spinner2 = spinner.cloneNode();
  spinner2.style.animation = 'dco-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite 0.3s';
  spinner2.style.borderTopColor = 'transparent';
  spinner2.style.borderRightColor = '#3498db';
  
  const spinner3 = spinner.cloneNode();
  spinner3.style.animation = 'dco-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite 0.6s';
  spinner3.style.borderTopColor = 'transparent';
  spinner3.style.borderRightColor = 'transparent';
  spinner3.style.borderBottomColor = '#3498db';
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dco-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes dco-pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
  
  // 创建消息元素
  const messageElement = document.createElement('div');
  messageElement.id = 'dco-loading-message';
  messageElement.textContent = message;
  messageElement.style.color = 'white';
  messageElement.style.marginTop = '24px';
  messageElement.style.fontSize = '18px';
  messageElement.style.fontWeight = '500';
  messageElement.style.textAlign = 'center';
  messageElement.style.maxWidth = '80%';
  messageElement.style.animation = 'dco-pulse 1.5s ease-in-out infinite';
  messageElement.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
  
  // 添加元素到DOM
  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(spinner2);
  spinnerContainer.appendChild(spinner3);
  loadingContainer.appendChild(spinnerContainer);
  loadingContainer.appendChild(messageElement);
  document.body.appendChild(loadingContainer);
  
  return loadingContainer;
}

/**
 * 更新加载指示器消息
 * @param {HTMLElement} loadingIndicator - 加载指示器元素
 * @param {String} message - 新的加载消息
 */
export function updateLoadingIndicator(loadingIndicator, message) {
  const messageElement = loadingIndicator.querySelector('#dco-loading-message');
  if (messageElement) {
    // 添加淡入淡出效果
    messageElement.style.opacity = '0';
    setTimeout(() => {
      messageElement.textContent = message;
      messageElement.style.opacity = '1';
    }, 300);
  }
}

/**
 * 隐藏加载指示器
 * @param {HTMLElement} loadingIndicator - 加载指示器元素
 */
export function hideLoadingIndicator(loadingIndicator) {
  if (loadingIndicator && loadingIndicator.parentNode) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
  }
}

/**
 * 显示通知
 * @param {Object} options - 通知选项
 * @param {String} options.title - 通知标题
 * @param {String} options.message - 通知消息
 * @param {String} options.type - 通知类型 (success, error, warning, info)
 * @param {Number} options.duration - 通知显示时间 (毫秒)
 */
export function showNotification(options) {
  // 移除已存在的通知
  const existingNotification = document.getElementById('dco-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  // 创建通知容器
  const notification = document.createElement('div');
  notification.id = 'dco-notification';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.maxWidth = '350px';
  notification.style.padding = '16px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.zIndex = '10002';
  notification.style.display = 'flex';
  notification.style.alignItems = 'flex-start';
  notification.style.gap = '12px';
  notification.style.transform = 'translateX(400px)';
  notification.style.transition = 'transform 0.3s ease-out';
  notification.style.backdropFilter = 'blur(8px)';
  
  // 设置通知类型样式
  switch (options.type) {
    case 'success':
      notification.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
      notification.style.borderLeft = '4px solid #2e7d32';
      break;
    case 'error':
      notification.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
      notification.style.borderLeft = '4px solid #c62828';
      break;
    case 'warning':
      notification.style.backgroundColor = 'rgba(255, 152, 0, 0.9)';
      notification.style.borderLeft = '4px solid #ef6c00';
      break;
    default: // info
      notification.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
      notification.style.borderLeft = '4px solid #1565c0';
  }
  
  // 创建图标
  const icon = document.createElement('div');
  icon.style.width = '24px';
  icon.style.height = '24px';
  icon.style.display = 'flex';
  icon.style.alignItems = 'center';
  icon.style.justifyContent = 'center';
  
  // 设置图标内容
  switch (options.type) {
    case 'success':
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`;
      break;
    case 'error':
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
      break;
    case 'warning':
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`;
      break;
    default: // info
      icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`;
  }
  
  // 创建内容容器
  const content = document.createElement('div');
  content.style.flex = '1';
  
  // 创建标题
  const title = document.createElement('div');
  title.textContent = options.title;
  title.style.color = 'white';
  title.style.fontWeight = '600';
  title.style.fontSize = '16px';
  title.style.marginBottom = '4px';
  
  // 创建消息
  const message = document.createElement('div');
  message.textContent = options.message;
  message.style.color = 'rgba(255, 255, 255, 0.9)';
  message.style.fontSize = '14px';
  message.style.lineHeight = '1.4';
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;
  closeButton.style.background = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.borderRadius = '50%';
  closeButton.style.transition = 'background-color 0.2s';
  
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  });
  
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = 'transparent';
  });
  
  closeButton.addEventListener('click', () => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  });
  
  // 添加元素到DOM
  content.appendChild(title);
  content.appendChild(message);
  notification.appendChild(icon);
  notification.appendChild(content);
  notification.appendChild(closeButton);
  document.body.appendChild(notification);
  
  // 显示通知
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // 自动隐藏通知
  if (options.duration) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, options.duration);
  }
} 