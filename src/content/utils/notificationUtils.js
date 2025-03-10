/**
 * 通知和对话框工具函数
 */

// 通知计数器和容器
let notificationCounter = 0;
let notificationsContainer = null;

/**
 * 显示美观的通知提示
 * @param {String} message - 提示消息
 * @param {String} type - 提示类型 (success, error, info)
 * @param {Number} duration - 显示时长(毫秒)
 */
export function showNotification(message, type = 'success', duration = 3000) {
  // 初始化通知容器（如果不存在）
  if (!notificationsContainer) {
    notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'dco-notifications-container';
    notificationsContainer.style.position = 'fixed';
    notificationsContainer.style.top = '20px';
    notificationsContainer.style.left = '50%';
    notificationsContainer.style.transform = 'translateX(-50%)';
    notificationsContainer.style.zIndex = '10000';
    notificationsContainer.style.display = 'flex';
    notificationsContainer.style.flexDirection = 'column';
    notificationsContainer.style.gap = '10px';
    notificationsContainer.style.pointerEvents = 'none'; // 容器本身不接收鼠标事件
    document.body.appendChild(notificationsContainer);
  }
  
  // 生成唯一ID
  const notificationId = `dco-notification-${++notificationCounter}`;
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.id = notificationId;
  notification.style.position = 'relative';
  notification.style.padding = '12px 18px';
  notification.style.borderRadius = '10px';
  notification.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.gap = '10px';
  notification.style.fontSize = '14px';
  notification.style.fontWeight = '500';
  notification.style.opacity = '0';
  notification.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  notification.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  notification.style.backdropFilter = 'blur(6px)';
  notification.style.minWidth = '280px';
  notification.style.maxWidth = '400px';
  notification.style.border = '1px solid';
  notification.style.pointerEvents = 'auto'; // 通知元素可以接收鼠标事件
  
  // 根据类型设置样式
  if (type === 'success') {
    notification.style.backgroundColor = 'rgba(240, 249, 235, 0.95)';
    notification.style.color = '#52b030';
    notification.style.borderColor = 'rgba(225, 243, 216, 0.6)';
  } else if (type === 'error') {
    notification.style.backgroundColor = 'rgba(254, 240, 240, 0.95)';
    notification.style.color = '#e74c3c';
    notification.style.borderColor = 'rgba(253, 226, 226, 0.6)';
  } else {
    notification.style.backgroundColor = 'rgba(237, 242, 252, 0.95)';
    notification.style.color = '#3498db';
    notification.style.borderColor = 'rgba(217, 236, 255, 0.6)';
  }
  
  // 创建图标容器，使图标居中
  const iconContainer = document.createElement('div');
  iconContainer.style.display = 'flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.width = '24px';
  iconContainer.style.height = '24px';
  iconContainer.style.borderRadius = '50%';
  iconContainer.style.flexShrink = '0';
  
  if (type === 'success') {
    iconContainer.style.backgroundColor = 'rgba(82, 176, 48, 0.12)';
  } else if (type === 'error') {
    iconContainer.style.backgroundColor = 'rgba(231, 76, 60, 0.12)';
  } else {
    iconContainer.style.backgroundColor = 'rgba(52, 152, 219, 0.12)';
  }
  
  // 创建图标
  const icon = document.createElement('span');
  if (type === 'success') {
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;
  } else if (type === 'error') {
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`;
  } else {
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>`;
  }
  
  iconContainer.appendChild(icon);
  
  // 创建内容区
  const content = document.createElement('div');
  content.style.flex = '1';
  
  // 创建消息文本
  const text = document.createElement('div');
  text.textContent = message;
  text.style.lineHeight = '1.5';
  
  // 添加到内容区
  content.appendChild(text);
  
  // 创建关闭按钮
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '18px';
  closeButton.style.color = 'currentColor';
  closeButton.style.opacity = '0.6';
  closeButton.style.padding = '0';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.transition = 'opacity 0.2s';
  closeButton.style.marginLeft = '8px';
  closeButton.style.flexShrink = '0';
  
  closeButton.addEventListener('mouseover', () => {
    closeButton.style.opacity = '1';
  });
  
  closeButton.addEventListener('mouseout', () => {
    closeButton.style.opacity = '0.6';
  });
  
  closeButton.addEventListener('click', () => {
    hideNotification(notificationId);
  });
  
  // 添加到通知元素
  notification.appendChild(iconContainer);
  notification.appendChild(content);
  notification.appendChild(closeButton);
  
  // 添加到通知容器
  notificationsContainer.appendChild(notification);
  
  // 显示通知
  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);
  
  // 隐藏通知的函数
  function hideNotification(id) {
    const notificationToHide = document.getElementById(id);
    if (notificationToHide) {
      notificationToHide.style.opacity = '0';
      setTimeout(() => {
        if (notificationToHide.parentNode) {
          notificationToHide.remove();
          
          // 如果容器中没有通知了，移除容器
          if (notificationsContainer && notificationsContainer.children.length === 0) {
            notificationsContainer.remove();
            notificationsContainer = null;
          }
        }
      }, 300);
    }
  }
  
  // 设置自动消失
  let timeoutId = setTimeout(() => {
    hideNotification(notificationId);
  }, duration);
  
  // 鼠标悬停时暂停倒计时
  notification.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });
  
  // 鼠标离开时恢复倒计时
  notification.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
      hideNotification(notificationId);
    }, duration);
  });
  
  // 返回通知ID，以便外部可以手动关闭
  return notificationId;
}

/**
 * 显示自定义确认对话框
 * @param {String} message - 确认消息
 * @param {Function} onConfirm - 确认回调
 * @param {Function} onCancel - 取消回调（可选）
 */
export function showConfirmDialog(message, onConfirm, onCancel = () => {}) {
  // 检查是否已存在确认对话框
  let existingDialog = document.getElementById('dco-confirm-dialog');
  if (existingDialog) {
    existingDialog.remove();
  }
  
  // 创建对话框容器
  const dialogOverlay = document.createElement('div');
  dialogOverlay.id = 'dco-confirm-dialog';
  dialogOverlay.style.position = 'fixed';
  dialogOverlay.style.top = '0';
  dialogOverlay.style.left = '0';
  dialogOverlay.style.width = '100%';
  dialogOverlay.style.height = '100%';
  dialogOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
  dialogOverlay.style.display = 'flex';
  dialogOverlay.style.justifyContent = 'center';
  dialogOverlay.style.alignItems = 'center';
  dialogOverlay.style.zIndex = '10000';
  dialogOverlay.style.opacity = '0';
  dialogOverlay.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  dialogOverlay.style.backdropFilter = 'blur(2px)';
  
  // 创建对话框
  const dialog = document.createElement('div');
  dialog.style.backgroundColor = 'var(--dco-dialog-bg, white)';
  dialog.style.borderRadius = '12px';
  dialog.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
  dialog.style.padding = '24px';
  dialog.style.maxWidth = '400px';
  dialog.style.width = '90%';
  dialog.style.transform = 'translateY(-20px) scale(0.95)';
  dialog.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  dialog.style.border = '1px solid var(--dco-border-color, rgba(0, 0, 0, 0.08))';
  dialog.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  
  // 创建警告图标
  const iconContainer = document.createElement('div');
  iconContainer.style.marginBottom = '20px';
  iconContainer.style.display = 'flex';
  iconContainer.style.justifyContent = 'center';
  
  const warningIcon = document.createElement('div');
  warningIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>`;
  warningIcon.style.display = 'flex';
  warningIcon.style.justifyContent = 'center';
  warningIcon.style.alignItems = 'center';
  warningIcon.style.width = '64px';
  warningIcon.style.height = '64px';
  warningIcon.style.borderRadius = '50%';
  warningIcon.style.backgroundColor = 'var(--dco-warning-bg, rgba(244, 67, 54, 0.1))';
  
  iconContainer.appendChild(warningIcon);
  
  // 创建标题
  const title = document.createElement('div');
  title.textContent = '确认操作';
  title.style.fontSize = '18px';
  title.style.fontWeight = '600';
  title.style.marginBottom = '16px';
  title.style.color = 'var(--dco-primary-text, #333)';
  title.style.textAlign = 'center';
  
  // 创建消息
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.style.marginBottom = '24px';
  messageEl.style.color = 'var(--dco-secondary-text, #555)';
  messageEl.style.lineHeight = '1.5';
  messageEl.style.textAlign = 'center';
  messageEl.style.fontSize = '15px';
  
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '12px';
  
  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.border = '1px solid var(--dco-border-color, rgba(0, 0, 0, 0.1))';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.backgroundColor = 'var(--dco-cancel-button-bg, rgba(0, 0, 0, 0.05))';
  cancelButton.style.color = 'var(--dco-secondary-text, #555)';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontSize = '14px';
  cancelButton.style.fontWeight = '500';
  cancelButton.style.transition = 'all 0.2s ease';
  cancelButton.style.minWidth = '100px';
  
  // 鼠标悬停效果
  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.backgroundColor = 'var(--dco-cancel-button-hover-bg, rgba(0, 0, 0, 0.08))';
    cancelButton.style.transform = 'translateY(-1px)';
  });
  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.backgroundColor = 'var(--dco-cancel-button-bg, rgba(0, 0, 0, 0.05))';
    cancelButton.style.transform = 'translateY(0)';
  });
  
  // 创建确认按钮
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '确认删除';
  confirmButton.style.padding = '10px 20px';
  confirmButton.style.border = 'none';
  confirmButton.style.borderRadius = '8px';
  confirmButton.style.backgroundColor = 'var(--dco-delete-color, #f44336)';
  confirmButton.style.color = 'white';
  confirmButton.style.cursor = 'pointer';
  confirmButton.style.fontSize = '14px';
  confirmButton.style.fontWeight = '500';
  confirmButton.style.transition = 'all 0.2s ease';
  confirmButton.style.minWidth = '100px';
  confirmButton.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
  
  // 鼠标悬停效果
  confirmButton.addEventListener('mouseover', () => {
    confirmButton.style.backgroundColor = 'var(--dco-delete-color-hover, #e53935)';
    confirmButton.style.transform = 'translateY(-1px)';
    confirmButton.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
  });
  confirmButton.addEventListener('mouseout', () => {
    confirmButton.style.backgroundColor = 'var(--dco-delete-color, #f44336)';
    confirmButton.style.transform = 'translateY(0)';
    confirmButton.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
  });
  
  // 添加事件监听
  cancelButton.addEventListener('click', () => {
    closeDialog();
    onCancel();
  });
  
  confirmButton.addEventListener('click', () => {
    closeDialog();
    onConfirm();
  });
  
  // 点击背景关闭对话框
  dialogOverlay.addEventListener('click', (e) => {
    if (e.target === dialogOverlay) {
      closeDialog();
      onCancel();
    }
  });
  
  // 关闭对话框的函数
  function closeDialog() {
    dialogOverlay.style.opacity = '0';
    dialog.style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
      dialogOverlay.remove();
    }, 200);
  }
  
  // 组装对话框
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  
  dialog.appendChild(iconContainer);
  dialog.appendChild(title);
  dialog.appendChild(messageEl);
  dialog.appendChild(buttonContainer);
  
  dialogOverlay.appendChild(dialog);
  document.body.appendChild(dialogOverlay);
  
  // 显示对话框（添加延迟以便触发过渡效果）
  setTimeout(() => {
    dialogOverlay.style.opacity = '1';
    dialog.style.transform = 'translateY(0) scale(1)';
  }, 10);
  
  // 添加键盘事件监听
  const keyHandler = (e) => {
    if (e.key === 'Escape') {
      closeDialog();
      onCancel();
      document.removeEventListener('keydown', keyHandler);
    } else if (e.key === 'Enter') {
      closeDialog();
      onConfirm();
      document.removeEventListener('keydown', keyHandler);
    }
  };
  
  document.addEventListener('keydown', keyHandler);
} 