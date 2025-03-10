/**
 * 选项页脚本 - 处理扩展设置的管理和存储
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', init);

// 默认设置
const defaultSettings = {
  theme: 'light',
  exportFormat: 'json',
  includeImages: true,
  includeCode: true
};

/**
 * 初始化选项页
 */
function init() {
  console.log('选项页已加载');
  
  // 加载当前设置
  loadSettings();
  
  // 绑定事件处理
  bindEventHandlers();
  
  // 加载存储使用情况
  loadStorageUsage();
}

/**
 * 从存储中加载设置并更新UI
 */
function loadSettings() {
  chrome.storage.sync.get(null, (settings) => {
    console.log('已加载设置:', settings);
    
    // 合并默认设置和存储的设置
    const mergedSettings = { ...defaultSettings, ...settings };
    
    // 更新UI以反映当前设置
    
    // 主题
    const themeToggle = document.getElementById('theme-toggle');
    if (mergedSettings.theme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggle.checked = true;
    }
    
    // 导出格式
    document.getElementById('export-format').value = mergedSettings.exportFormat;
    
    // 包含图片
    document.getElementById('include-images-toggle').checked = mergedSettings.includeImages;
    
    // 包含代码块
    document.getElementById('include-code-toggle').checked = mergedSettings.includeCode;
  });
}

/**
 * 绑定UI元素的事件处理
 */
function bindEventHandlers() {
  // 主题切换
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', themeToggle.checked);
    saveSettingItem('theme', theme);
  });
  
  // 保存按钮
  document.getElementById('save-btn').addEventListener('click', saveAllSettings);
  
  // 重置按钮
  document.getElementById('reset-btn').addEventListener('click', resetSettings);
  
  // 清除存储按钮
  document.getElementById('clear-storage-btn').addEventListener('click', clearAllData);
  
  // 导出所有数据按钮
  document.getElementById('export-all-btn').addEventListener('click', exportAllData);
  
  // 刷新存储统计按钮
  document.getElementById('refresh-storage').addEventListener('click', () => {
    // 先重置为"计算中..."状态
    document.getElementById('local-storage-usage').textContent = '计算中...';
    document.getElementById('local-progress-bar').style.width = '0%';
    
    // 延迟一点以显示动画效果
    setTimeout(() => {
      loadStorageUsage();
    }, 300);
  });
}

/**
 * 保存单个设置项
 * @param {String} key - 设置项的键
 * @param {*} value - 设置项的值
 */
function saveSettingItem(key, value) {
  const setting = {};
  setting[key] = value;
  
  chrome.storage.sync.set(setting, () => {
    console.log(`已保存设置: ${key} = ${value}`);
  });
}

/**
 * 保存所有设置项
 */
function saveAllSettings() {
  const settings = {
    theme: document.getElementById('theme-toggle').checked ? 'dark' : 'light',
    exportFormat: document.getElementById('export-format').value || 'json',
    includeImages: document.getElementById('include-images-toggle').checked,
    includeCode: document.getElementById('include-code-toggle').checked
  };
  
  chrome.storage.sync.set(settings, () => {
    console.log('已保存所有设置:', settings);
    showSavedMessage();
  });
}

/**
 * 显示保存成功消息
 */
function showSavedMessage() {
  const message = document.createElement('div');
  message.textContent = '设置已保存';
  message.style.position = 'fixed';
  message.style.bottom = '20px';
  message.style.right = '20px';
  message.style.padding = '10px 20px';
  message.style.backgroundColor = '#4CAF50';
  message.style.color = 'white';
  message.style.borderRadius = '4px';
  message.style.zIndex = '1000';
  message.style.opacity = '0';
  message.style.transition = 'opacity 0.3s';
  
  document.body.appendChild(message);
  
  // 淡入
  setTimeout(() => {
    message.style.opacity = '1';
  }, 10);
  
  // 3秒后淡出并移除
  setTimeout(() => {
    message.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 3000);
}

/**
 * 重置所有设置为默认值
 */
function resetSettings() {
  if (confirm('确定要将所有设置重置为默认值吗？')) {
    chrome.storage.sync.set(defaultSettings, () => {
      console.log('已重置所有设置为默认值');
      loadSettings(); // 重新加载UI
      showSavedMessage();
    });
  }
}

/**
 * 清除所有数据
 */
function clearAllData() {
  if (confirm('确定要清除所有存储的数据吗？此操作不可撤销！')) {
    chrome.storage.sync.clear(() => {
      console.log('已清除所有存储的数据');
      chrome.storage.local.clear(() => {
        showSavedMessage();
        loadStorageUsage(); // 重新加载存储使用量
        loadSettings(); // 重新加载设置
      });
    });
  }
}

/**
 * 导出所有数据
 */
function exportAllData() {
  chrome.storage.sync.get(null, (data) => {
    // 创建下载
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `deep-chat-optimize-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 释放URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  });
}

/**
 * 加载存储使用情况
 */
function loadStorageUsage() {
  console.log('正在加载存储使用情况...');
  
  // Chrome 存储限制
  const LOCAL_STORAGE_LIMIT = 5242880; // 本地存储限制：5MB
  
  // 获取本地存储使用情况
  chrome.storage.local.getBytesInUse(null, (localBytesInUse) => {
    const localElement = document.getElementById('local-storage-usage');
    const localProgressBar = document.getElementById('local-progress-bar');
    
    if (chrome.runtime.lastError) {
      console.error('获取本地存储使用情况时出错:', chrome.runtime.lastError);
      localElement.textContent = '无法获取';
      return;
    }
    
    // 计算使用百分比并更新UI
    const localUsagePercent = Math.min(100, (localBytesInUse / LOCAL_STORAGE_LIMIT) * 100);
    localElement.textContent = `${formatBytes(localBytesInUse)} / ${formatBytes(LOCAL_STORAGE_LIMIT)}`;
    
    // 更新进度条
    localProgressBar.style.width = `${localUsagePercent}%`;
    
    // 根据使用率改变颜色
    if (localUsagePercent > 80) {
      localProgressBar.style.backgroundColor = '#F44336'; // 红色警告
    } else if (localUsagePercent > 60) {
      localProgressBar.style.backgroundColor = '#FF9800'; // 橙色提醒
    } else {
      localProgressBar.style.backgroundColor = '#4CAF50'; // 正常绿色
    }
  });
}

/**
 * 格式化字节数为可读格式
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的字符串
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 