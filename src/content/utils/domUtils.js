/**
 * DOM操作相关工具函数
 */

/**
 * 判断按键事件是否匹配快捷键
 * @param {KeyboardEvent} event - 键盘事件
 * @param {String} shortcut - 快捷键字符串 (如 "Ctrl+Shift+E")
 * @returns {Boolean} - 是否匹配
 */
export function isShortcutMatch(event, shortcut) {
  const parts = shortcut.split('+');
  
  // 检查修饰键
  const ctrlRequired = parts.includes('Ctrl');
  const shiftRequired = parts.includes('Shift');
  const altRequired = parts.includes('Alt');
  
  // 检查按键
  const key = parts[parts.length - 1].toLowerCase();
  
  return event.ctrlKey === ctrlRequired &&
         event.shiftKey === shiftRequired &&
         event.altKey === altRequired &&
         event.key.toLowerCase() === key;
}

/**
 * 检查页面是否为中文界面
 * @returns {Promise<Boolean>} - 是否为中文界面
 */
export function isChineseUI() {
  // 先检查是否有保存的语言设置
  return new Promise((resolve) => {
    chrome.storage.sync.get('language', (result) => {
      if (result.language) {
        // 如果有保存的语言设置，直接使用
        resolve(result.language.startsWith('zh'));
      } else {
        // 否则，使用界面检测
        detectUILanguage().then(isZh => resolve(isZh));
      }
    });
  });
}

/**
 * 检测界面语言
 * @returns {Promise<Boolean>} - 是否为中文界面
 */
export async function detectUILanguage() {
  // 检查深度思考按钮的文本
  const deepThinkButton = Array.from(document.querySelectorAll('.ds-button')).find(
    button => button.textContent.includes('深度思考') || button.textContent.includes('DeepThink')
  );
  
  // 如果深度思考按钮存在，直接判断其文本
  if (deepThinkButton) {
    return deepThinkButton.textContent.includes('深度思考');
  }
  
  // 检查联网搜索按钮的文本
  const searchButton = Array.from(document.querySelectorAll('.ds-button')).find(
    button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
  );
  
  // 如果联网搜索按钮存在，直接判断其文本
  if (searchButton) {
    return searchButton.textContent.includes('联网搜索');
  }
  
  // 如果上述按钮都不存在，使用页面文本检测
  const pageText = document.body.innerText;
  const containsChinese = /[\u4e00-\u9fa5]+/.test(pageText);
  
  return containsChinese;
}

/**
 * 更新按钮文本根据语言设置
 * @param {String} language - 语言代码
 */
export function updateButtonTextByLanguage(language) {
  // 更新提示词按钮文本
  const promptButton = document.getElementById('dco-prompt-button-input');
  if (promptButton) {
    const buttonText = promptButton.querySelector('.ad0c98fd');
    if (buttonText) {
      buttonText.textContent = language.startsWith('zh') ? '提示词' : 'Prompt';
      console.log(`已将按钮文本更新为: ${buttonText.textContent}`);
    }
  }
}

/**
 * 高亮代码块
 */
export function highlightCodeBlocks() {
  // 查找未高亮的代码块
  const codeBlocks = document.querySelectorAll('pre code:not(.hljs)');
  
  if (codeBlocks.length === 0) return;
  
  console.log(`发现 ${codeBlocks.length} 个未高亮的代码块`);
  
  // 如果存在hljs库，使用它进行高亮
  if (typeof hljs !== 'undefined') {
    codeBlocks.forEach(block => {
      hljs.highlightElement(block);
    });
    console.log('代码块已高亮处理');
  } else {
    console.log('未找到hljs库，无法进行代码高亮');
  }
} 