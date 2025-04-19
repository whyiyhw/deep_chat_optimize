/**
 * 聊天服务检测与处理模块
 */

/**
 * 检测当前页面的聊天服务类型
 * @returns {String} 聊天服务名称或空字符串
 */
export function detectChatService() {
  // 优先使用URL进行判断
  const currentHost = window.location.hostname;
  const currentUrl = window.location.href;

  // 基于URL的精确检测
  if (currentHost.includes('deepseek.com') || currentUrl.includes('deepseek.com')) {
    return 'deepseek';
  } else if (currentHost.includes('claude.ai') || currentUrl.includes('claude.ai')) {
    return 'claude';
  } else if (currentHost.includes('chat.openai.com') || currentUrl.includes('chat.openai.com')) {
    return 'chatgpt';
  } else if (currentHost.includes('gemini.google.com') || currentUrl.includes('gemini.google.com') ||
             currentHost.includes('bard.google.com') || currentUrl.includes('bard.google.com')) {
    return 'gemini';
  } else if (currentHost.includes('yuanbao.tencent.com') || currentUrl.includes('yuanbao.tencent.com')) {
    return 'yuanbao';
  }

  // 如果URL判断不成功，尝试通过页面内容检测
  if (document.title.includes('ChatGPT') || document.body.innerHTML.includes('ChatGPT')) {
    return 'chatgpt';
  } else if (document.title.includes('Claude') || document.body.innerHTML.includes('Claude')) {
    return 'claude';
  } else if (document.title.includes('Gemini') || document.body.innerHTML.includes('Gemini') ||
             document.title.includes('Bard') || document.body.innerHTML.includes('Bard')) {
    return 'gemini';
  } else if (document.title.includes('DeepSeek') || document.body.innerHTML.includes('DeepSeek')) {
    return 'deepseek';
  } else if (document.title.includes('Perplexity') || document.body.innerHTML.includes('Perplexity')) {
    return 'perplexity';
  } else if (document.title.includes('元宝') || document.body.innerHTML.includes('元宝') ||
             document.title.includes('yuanbao') || document.body.innerHTML.includes('yuanbao')) {
    return 'yuanbao';
  } else {
    console.log('当前页面不是支持的AI聊天服务');
    console.log('如果这是AI聊天服务，请联系开发者添加支持');
    
    // 尝试通过输入框检测
    const textareas = document.querySelectorAll('textarea');
    const chatInputs = Array.from(textareas).filter(textarea => 
      textarea.placeholder && (
        textarea.placeholder.toLowerCase().includes('message') ||
        textarea.placeholder.toLowerCase().includes('chat') ||
        textarea.placeholder.toLowerCase().includes('ask') ||
        textarea.placeholder.toLowerCase().includes('question') ||
        textarea.placeholder.toLowerCase().includes('prompt')
      )
    );
    
    if (chatInputs.length > 0) {
      console.log('检测到可能的聊天输入框，尝试通用模式');
      return 'generic';
    } else {
      return '';
    }
  }
}

/**
 * 处理页面变化
 * @param {MutationRecord[]} mutations - 变化记录
 * @param {String} chatService - 聊天服务名称
 */
export function handlePageChanges(mutations, chatService) {
  // 检查是否需要重新添加提示词按钮
  if (!document.getElementById('dco-prompt-button-input')) {
    addPromptButtonToInput(chatService);
  }
  
  // 检查是否有新的代码块需要高亮
  if (document.querySelector('pre code:not(.hljs)')) {
    highlightCodeBlocks();
  }
  
  // 检查是否需要重新添加工具栏
  if (!document.getElementById('dco-toolbar') && document.querySelector('.chat-message, .message, [data-message]')) {
    addToolbar(chatService);
  }
}

/**
 * 查找DeepSeek的按钮区域（DeepThink和Search按钮所在区域）
 * 添加缓存机制，避免短时间内重复调用
 * @returns {HTMLElement|null} - 按钮区域元素或null
 */
// 设置缓存和上次查找时间
let cachedButtonArea = null;
let lastFindTime = 0;
const CACHE_DURATION = 1000; // 缓存1秒

export function findDeepSeekButtonArea() {
  // 调试输出整个DOM结构，用于分析
  console.debug('DeepSeek页面结构：', document.body.innerHTML);
  
  // 检查缓存是否有效
  const now = Date.now();
  if (cachedButtonArea && now - lastFindTime < CACHE_DURATION) {
    // 使用缓存的结果，不打印日志避免刷屏
    return cachedButtonArea;
  }
  
  console.log('正在查找DeepSeek的按钮区域...');
  
  // 0. 最直接的方式，通过用户提供的DOM结构查找 (优先级最高)
  const specificStructure = document.querySelector('div.ec4f5d61');
  if (specificStructure) {
    console.log('通过精确类名找到按钮区域:', specificStructure);
    // 更新缓存和时间
    cachedButtonArea = specificStructure;
    lastFindTime = now;
    return specificStructure;
  }
  
  // 1. 查找包含深度思考和联网搜索按钮的容器
  // 查找所有文本包含这些关键词的按钮元素
  const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));
  console.log('页面中的所有按钮:', allButtons.length);
  
  // 查找深度思考按钮
  const deepThinkButton = allButtons.find(button => 
    button.textContent && (
      button.textContent.includes('深度思考') || 
      button.textContent.includes('DeepThink') ||
      button.textContent.includes('R1')
    )
  );
  
  // 查找联网搜索按钮
  const searchButton = allButtons.find(button => 
    button.textContent && (
      button.textContent.includes('联网搜索') || 
      button.textContent.includes('Search')
    )
  );
  
  console.log('深度思考按钮:', deepThinkButton);
  console.log('联网搜索按钮:', searchButton);
  
  // 如果找到了两个按钮，尝试找到它们的共同父元素
  if (deepThinkButton && searchButton) {
    // 获取深度思考按钮的所有父元素
    let deepThinkParents = [];
    let parent = deepThinkButton.parentElement;
    while (parent) {
      deepThinkParents.push(parent);
      parent = parent.parentElement;
    }
    
    // 查找联网搜索按钮的父元素，直到找到共同的父元素
    parent = searchButton.parentElement;
    while (parent) {
      if (deepThinkParents.includes(parent)) {
        console.log('找到深度思考和联网搜索按钮的共同父元素:', parent);
        cachedButtonArea = parent;
        lastFindTime = now;
        return parent;
      }
      parent = parent.parentElement;
    }
    
    // 如果没有找到共同父元素，但找到了联网搜索按钮，使用其父元素
    console.log('没有找到共同父元素，使用联网搜索按钮的父元素');
    parent = searchButton.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      // 检查父元素是否有合适的特征
      if (parent.querySelectorAll('[role="button"]').length >= 2) {
        console.log('找到包含多个按钮的父元素:', parent);
        cachedButtonArea = parent;
        lastFindTime = now;
        return parent;
      }
      parent = parent.parentElement;
    }
    
    // 如果还是没找到，直接使用联网搜索按钮的父元素
    if (searchButton.parentElement) {
      console.log('使用联网搜索按钮的直接父元素:', searchButton.parentElement);
      cachedButtonArea = searchButton.parentElement;
      lastFindTime = now;
      return searchButton.parentElement;
    }
  }
  
  // 2. 尝试通过类名查找按钮区域（已存在的方法）
  const buttonAreaByClass = document.querySelector('.ec4f5d61');
  if (buttonAreaByClass) {
    console.log('通过类名找到按钮区域:', buttonAreaByClass);
    // 更新缓存和时间
    cachedButtonArea = buttonAreaByClass;
    lastFindTime = now;
    return buttonAreaByClass;
  }
  
  // 3. 尝试查找包含特定按钮的区域（支持中文和英文界面）
  const dsButtons = document.querySelectorAll('.ds-button');
  for (const button of dsButtons) {
    const buttonText = button.textContent.trim();
    // 检查是否包含DeepSeek 或深度思考
    if (buttonText.includes('DeepSeek') || buttonText.includes('深度思考')) {
      // 找到按钮，查找其父容器
      let parent = button.parentElement;
      while (parent && !parent.classList.contains('ec4f5d61') && !parent.classList.contains('bf38813a')) {
        parent = parent.parentElement;
        if (parent && (
            parent.querySelectorAll('.ds-button').length >= 2 || 
            parent.querySelectorAll('button').length >= 2)) {
          console.log('通过按钮找到父容器:', parent);
          // 更新缓存和时间
          cachedButtonArea = parent;
          lastFindTime = now;
          return parent;
        }
      }
      
      // 如果找到了特定类的父元素
      if (parent) {
        console.log('通过类名找到父容器:', parent);
        // 更新缓存和时间
        cachedButtonArea = parent;
        lastFindTime = now;
        return parent;
      }
    }
  }
  
  // 4. 尝试查找包含搜索按钮的区域
  for (const button of dsButtons) {
    const buttonText = button.textContent.trim();
    if (buttonText.includes('Search') || buttonText.includes('联网搜索')) {
      // 找到按钮，查找其父容器
      let parent = button.parentElement;
      while (parent && parent.tagName !== 'BODY') {
        if (parent.querySelectorAll('.ds-button').length >= 1 || 
            parent.querySelectorAll('button').length >= 1) {
          console.log('通过搜索按钮找到父容器:', parent);
          // 更新缓存和时间
          cachedButtonArea = parent;
          lastFindTime = now;
          return parent;
        }
        parent = parent.parentElement;
      }
    }
  }
  
  // 5. 最后的尝试：查找任何可能的按钮区域
  const possibleButtonAreas = document.querySelectorAll('div[role="button"]');
  if (possibleButtonAreas.length > 0) {
    // 找到多个按钮的容器
    for (const area of possibleButtonAreas) {
      const parent = area.parentElement;
      if (parent && parent.querySelectorAll('[role="button"]').length >= 2) {
        console.log('找到可能的按钮区域:', parent);
        cachedButtonArea = parent;
        lastFindTime = now;
        return parent;
      }
    }
  }
  
  // 未找到，更新缓存为null
  console.error('无法找到DeepSeek按钮区域，请检查页面结构');
  cachedButtonArea = null;
  lastFindTime = now;
  return null;
}

/**
 * 为DeepSeek添加专门的DOM监听器，确保按钮不会消失
 */
export function setupDeepSeekButtonObserver() {
  // 如果已经设置了观察器，不重复设置
  if (window._deepSeekButtonObserver) {
    console.log('DeepSeek按钮观察器已设置，跳过重复设置');
    return;
  }
  
  console.log('设置DeepSeek按钮观察器...');
  
  // 用于追踪按钮添加状态的变量
  let isAddingButton = false;
  let lastAddTime = 0;
  const ADD_COOLDOWN = 2000; // 添加后的冷却时间，2秒内不重复添加
  
  // 强制创建按钮的函数
  const forceAddButton = () => {
    // 如果正在添加按钮或者冷却时间未到，则跳过
    const now = Date.now();
    if (isAddingButton || (now - lastAddTime < ADD_COOLDOWN)) {
      console.log('跳过添加按钮：正在添加或冷却中');
      return;
    }
    
    isAddingButton = true;
    console.log('强制重新添加DeepSeek提示词按钮');
    
    // 先移除已有按钮，避免重复
    const existingButton = document.getElementById('dco-prompt-button-input');
    if (existingButton) {
      existingButton.remove();
    }
    
    // 导入并调用添加按钮的函数
    Promise.all([
      import('../features/promptFeature.js'),
      import('../features/prompt/promptButton.js')
    ]).then(([promptFeature, promptButton]) => {
      // 直接使用promptButton模块中的函数
      promptButton.addPromptButtonToInput('deepseek');
      
      // 更新添加时间和状态
      lastAddTime = Date.now();
      isAddingButton = false;
    }).catch(err => {
      console.error('导入模块失败:', err);
      isAddingButton = false;
    });
  };
  
  // 立即尝试添加按钮
  forceAddButton();
  
  // 保存上一次检测到的按钮状态
  let previouslyHadButton = false;
  
  // 设置定时器，每5秒检查一次按钮
  const intervalId = setInterval(() => {
    const hasButton = !!document.getElementById('dco-prompt-button-input');
    
    // 只有当按钮状态发生变化（从有到无）时才重新添加
    if (previouslyHadButton && !hasButton) {
      console.log('定时检查: 按钮已消失，尝试重新添加');
      forceAddButton();
    }
    
    // 更新按钮状态
    previouslyHadButton = hasButton;
  }, 5000);
  
  // 保存intervalId用于可能的清理
  window._deepSeekButtonIntervalId = intervalId;
  
  // 创建变异过滤函数，忽略与按钮相关的变化
  const shouldProcessMutation = (mutation) => {
    // 检查变异是否与我们的按钮相关
    if (mutation.target.id === 'dco-prompt-button-input' || 
        mutation.target.closest('#dco-prompt-button-input')) {
      return false;
    }
    
    // 检查添加/删除的节点是否是我们的按钮
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.id === 'dco-prompt-button-input' || 
            (node.nodeType === 1 && node.querySelector('#dco-prompt-button-input'))) {
          return false;
        }
      }
      for (const node of mutation.removedNodes) {
        if (node.id === 'dco-prompt-button-input' || 
            (node.nodeType === 1 && node.querySelector('#dco-prompt-button-input'))) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // 创建观察器处理函数
  const handleMutations = mutations => {
    // 如果正在添加按钮，跳过此次变化
    if (isAddingButton) {
      return;
    }
    
    // 过滤掉与我们按钮相关的变化
    const relevantMutations = mutations.filter(shouldProcessMutation);
    
    if (relevantMutations.length === 0) {
      return;
    }
    
    // 检查是否需要重新添加按钮
    const promptButton = document.getElementById('dco-prompt-button-input');
    
    // 如果没有按钮，且距离上次添加已经过了冷却时间
    if (!promptButton && (Date.now() - lastAddTime > ADD_COOLDOWN)) {
      console.log('检测到DOM变化，需要重新添加提示词按钮');
      
      // 延迟添加按钮，避免与其他DOM变化冲突
      setTimeout(forceAddButton, 500);
    } 
    // 如果按钮存在，但位置可能不正确
    else if (promptButton) {
      // 每隔一段时间才检查按钮位置，避免频繁检查
      if (Math.random() < 0.1) { // 只有10%几率检查位置
        const searchButton = Array.from(document.querySelectorAll('[role="button"], button')).find(
          button => button.textContent && (
            button.textContent.includes('联网搜索') || 
            button.textContent.includes('Search')
          )
        );
        
        if (searchButton && searchButton.nextSibling !== promptButton) {
          console.log('提示词按钮位置不正确，延迟重新定位');
          // 大幅延迟重新添加，避免频繁闪烁
          setTimeout(() => {
            // 再次检查按钮是否仍然存在且位置不正确
            const currentPromptButton = document.getElementById('dco-prompt-button-input');
            const currentSearchButton = Array.from(document.querySelectorAll('[role="button"], button')).find(
              button => button.textContent && (
                button.textContent.includes('联网搜索') || 
                button.textContent.includes('Search')
              )
            );
            
            if (currentPromptButton && currentSearchButton && 
                currentSearchButton.nextSibling !== currentPromptButton) {
              currentPromptButton.remove();
              forceAddButton();
            }
          }, 2000);
        }
      }
    }
  };
  
  // 创建一个观察器实例
  const observer = new MutationObserver(handleMutations);
  
  // 配置观察选项 - 减少监视范围和深度
  const config = { 
    childList: true,   // 观察目标子节点的变化
    subtree: true,     // 观察所有后代节点
    attributes: false, // 不观察属性变化，减少触发次数
    characterData: false // 不观察文本变化，减少触发次数
  };
  
  // 观察整个文档
  observer.observe(document.body, config);
  
  // 保存观察器引用
  window._deepSeekButtonObserver = observer;
  
  // 更智能的重试机制: 延迟较长时间再尝试，避免频繁添加
  setTimeout(forceAddButton, 3000);
  setTimeout(forceAddButton, 10000);
  
  // 监听页面可见性变化，当用户返回页面时重新检查按钮
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 延迟检查，等待页面完全恢复
      setTimeout(() => {
        if (!document.getElementById('dco-prompt-button-input')) {
          console.log('页面变为可见，检查按钮存在性');
          forceAddButton();
        }
      }, 1000);
    }
  });
  
  console.log('DeepSeek按钮观察器设置完成');
} 