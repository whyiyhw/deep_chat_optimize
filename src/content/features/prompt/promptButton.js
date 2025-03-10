/**
 * 提示词按钮模块
 */

import { isChineseUI } from '../../utils/domUtils.js';
import { togglePromptPanel } from './promptPanel.js';
import { findDeepSeekButtonArea } from '../../core/chatServices.js';

/**
 * 为输入框添加提示词按钮
 * @param {String} chatService - 聊天服务类型
 */
export function addPromptButtonToInput(chatService) {
  // 如果按钮已存在，不重复添加
  if (document.getElementById('dco-prompt-button-input')) {
    return;
  }
  
  // 针对 DeepSeek 使用专用实现
  if (chatService === 'deepseek') {
    try {
      const buttonArea = findDeepSeekButtonArea();
      if (buttonArea) {
        // 查找联网搜索按钮（寻找更多可能的识别方式）
        let searchButton = null;
        
        // 方法1: 通过类名和文本内容查找
        searchButton = Array.from(buttonArea.querySelectorAll('.ds-button')).find(
          button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
        );
        
        // 方法2: 如果方法1失败，尝试通过任何具有按钮角色和文本内容的元素查找
        if (!searchButton) {
          searchButton = Array.from(buttonArea.querySelectorAll('[role="button"]')).find(
            button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
          );
        }
        
        // 方法3: 最后尝试在整个文档中查找
        if (!searchButton) {
          searchButton = Array.from(document.querySelectorAll('[role="button"], button')).find(
            button => button.textContent.includes('联网搜索') || button.textContent.includes('Search')
          );
        }
        
        // 获取界面语言设置
        isChineseUI().then(isChinese => {
          // 创建提示词按钮
          const promptButton = createDeepSeekPromptButton(searchButton, buttonArea, isChinese);
          
          // 将按钮插入到DOM中
          if (searchButton) {
            // 在联网搜索按钮后插入提示词按钮
            searchButton.after(promptButton);
            console.log('已将提示词按钮插入到联网搜索按钮后面');
          } else {
            // 如果找不到联网搜索按钮，则添加到buttonArea
            buttonArea.appendChild(promptButton);
            console.log('已添加DeepSeek提示词按钮到按钮区域');
          }
        }).catch(error => {
          console.error('获取界面语言设置时出错:', error);
        });
      } else {
        console.error('未找到DeepSeek按钮区域');
      }
    } catch (error) {
      console.error('添加DeepSeek提示词按钮时出错:', error);
    }
    
    return; // 提前返回，避免执行下面的通用代码
  }
  
  // 针对 YuanBao 使用专用实现
  if (chatService === 'yuanbao') {
    try {
      // 额外检查元素是否完全加载
      console.log('准备寻找YuanBao元素，等待DOM完全加载...');
      
      // 标记是否已添加按钮
      let buttonAdded = false;
      
      // 用于检查元素是否已准备好的函数
      const checkAndAddButton = () => {
        if (buttonAdded) return;
        
        console.log('检查YuanBao界面元素是否已加载...');
        
        // 查找核心元素
        const coreElements = {
          textAreaWrapper: document.querySelector('.style__text-area__wrapper___VV9fW'),
          onlineSearchButton: Array.from(document.querySelectorAll('button')).find(
            button => button.textContent && button.textContent.includes('联网搜索')
          ),
          editor: document.querySelector('.ql-editor')
        };
        
        console.log('检测到的核心元素:', {
          textAreaWrapper: !!coreElements.textAreaWrapper,
          onlineSearchButton: !!coreElements.onlineSearchButton,
          editor: !!coreElements.editor
        });
        
        // 只有当至少有一个核心元素存在时，才认为页面已加载
        if (coreElements.textAreaWrapper || coreElements.onlineSearchButton || coreElements.editor) {
          console.log('YuanBao界面元素已加载，开始添加按钮');
          addButtonToYuanBao();
          buttonAdded = true;
        } else {
          console.log('YuanBao界面元素尚未加载完成，继续等待...');
        }
      };
      
      // 添加按钮的主函数
      const addButtonToYuanBao = () => {
        // 查找元宝的按钮区域 - 根据提供的HTML结构
        const findYuanbaoButtonArea = () => {
          console.log('正在查找YuanBao的按钮区域...');
          
          // 1. 通过类名查找按钮区域
          const buttonArea = document.querySelector('.style__text-area__wrapper___VV9fW');
          if (buttonArea) {
            console.log('通过类名找到YuanBao按钮区域');
            return buttonArea;
          }
          
          // 2. 通过找联网搜索按钮
          const searchButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent && button.textContent.includes('联网搜索')
          );
          
          if (searchButton) {
            console.log('找到联网搜索按钮');
            
            // 查找按钮区域 - 通常联网搜索按钮的父级元素的父级元素
            const possibleButtonArea = searchButton.closest('.style__text-area__end___G64SV');
            
            if (possibleButtonArea) {
              console.log('通过联网搜索按钮找到YuanBao按钮区域');
              return possibleButtonArea;
            }
            
            // 尝试更宽泛的查找
            const widerPossibleArea = searchButton.closest('.style__text-area__wrapper___VV9fW');
            if (widerPossibleArea) {
              console.log('通过联网搜索按钮找到YuanBao更宽泛区域');
              return widerPossibleArea;
            }
            
            // 如果找不到合适的父容器，我们直接使用按钮的父容器
            if (searchButton.parentElement) {
              console.log('使用联网搜索按钮的父容器作为按钮区域');
              return searchButton.parentElement;
            }
          }
          
          // 3. 尝试找到按钮区域通过更直接的方式
          const btnStartArea = document.querySelector('.style__btn-start___aPog1');
          if (btnStartArea) {
            console.log('找到YuanBao按钮起始区域');
            return btnStartArea;
          }
          
          // 4. 查找模型切换按钮区域
          const modelSwitchArea = document.querySelector('.style__switch-model-btn-box___wBxwY');
          if (modelSwitchArea) {
            console.log('找到YuanBao模型切换区域');
            return modelSwitchArea;
          }
          
          // 5. 查找任何可能的按钮
          const anyButton = document.querySelector('button[dt-button-id="online_search"]');
          if (anyButton && anyButton.parentElement) {
            console.log('通过属性找到联网搜索按钮');
            return anyButton.parentElement;
          }
          
          // 6. 尝试查找任何文本区域相关的元素
          const textAreaElements = document.querySelectorAll('[class*="text-area"]');
          if (textAreaElements.length > 0) {
            console.log('找到元宝文本区域相关元素');
            return textAreaElements[0];
          }
          
          // 7. 尝试找任何可能的聊天输入区
          const possibleChatInput = document.querySelector('.ql-editor') || 
                                   document.querySelector('[contenteditable="true"]');
          if (possibleChatInput) {
            console.log('找到可能的聊天输入区域');
            
            // 向上查找可能的容器
            let parent = possibleChatInput.parentElement;
            let level = 1;
            
            while (parent && level <= 3) {
              const siblingsWithButtons = Array.from(parent.children).some(
                child => child.querySelector('button')
              );
              
              if (siblingsWithButtons) {
                console.log(`在第${level}级父元素中找到含按钮的兄弟元素`);
                return parent;
              }
              
              parent = parent.parentElement;
              level++;
            }
            
            // 如果找到了输入区但没找到合适的父容器，返回其第3级父元素作为备选
            if (possibleChatInput.parentElement?.parentElement?.parentElement) {
              return possibleChatInput.parentElement.parentElement.parentElement;
            }
          }
          
          console.error('经过多种尝试，仍未找到YuanBao按钮区域');
          
          // 最后的最后，返回body作为放置位置
          return document.body;
        };
        
        const buttonArea = findYuanbaoButtonArea();
        if (buttonArea) {
          // 查找联网搜索按钮
          let searchButton = Array.from(buttonArea.querySelectorAll('button')).find(
            button => button.textContent && button.textContent.includes('联网搜索')
          );
          
          // 获取界面语言设置
          isChineseUI().then(isChinese => {
            // 创建提示词按钮
            const promptButton = createYuanbaoPromptButton(searchButton, buttonArea, isChinese);
            
            // 将按钮插入到DOM中
            if (searchButton) {
              // 尝试找到按钮所在的容器 - 针对元宝特定的层级结构
              const buttonContainer = searchButton.closest('.style__btn-start___aPog1') || 
                                    searchButton.closest('.style__text-area__end___G64SV') ||
                                    searchButton.parentElement;
              
              if (buttonContainer) {
                // 如果是flex容器，添加到容器中
                if (window.getComputedStyle(buttonContainer).display === 'flex') {
                  buttonContainer.appendChild(promptButton);
                  console.log('已将提示词按钮添加到元宝按钮flex容器中');
                } else {
                  // 不是flex容器，插入到联网搜索按钮后面
                  searchButton.insertAdjacentElement('afterend', promptButton);
                  console.log('已将提示词按钮插入到联网搜索按钮后面');
                }
              } else {
                // 在联网搜索按钮后插入提示词按钮
                searchButton.insertAdjacentElement('afterend', promptButton);
                console.log('已将提示词按钮插入到联网搜索按钮后面');
              }
            } else {
              // 如果找不到联网搜索按钮，则定位备选放置点
              // 1. 查找按钮起始区
              const btnStart = buttonArea.querySelector('.style__btn-start___aPog1');
              if (btnStart) {
                btnStart.appendChild(promptButton);
                console.log('已添加元宝提示词按钮到按钮起始区域');
                return;
              }
              
              // 2. 查找结束区域
              const endSection = buttonArea.querySelector('.style__text-area__end___G64SV');
              if (endSection) {
                endSection.appendChild(promptButton);
                console.log('已添加元宝提示词按钮到末尾区域');
                return;
              }
              
              // 3. 尝试查找任何按钮容器
              const anyButtonContainer = buttonArea.querySelector('[class*="button"], [class*="btn"]');
              if (anyButtonContainer) {
                anyButtonContainer.parentElement.appendChild(promptButton);
                console.log('已添加元宝提示词按钮到任意按钮容器');
                return;
              }
              
              // 4. 最后的选择，直接添加到找到的区域
              buttonArea.appendChild(promptButton);
              console.log('已添加元宝提示词按钮到按钮区域');
            }
          }).catch(error => {
            console.error('获取界面语言设置时出错:', error);
          });
        } else {
          console.error('未找到元宝按钮区域，尝试直接创建浮动按钮');
          createFloatingButton();
        }
      };
      
      // 创建浮动按钮的函数
      const createFloatingButton = () => {
        // 获取界面语言设置
        isChineseUI().then(isChinese => {
          // 创建按钮容器
          const buttonContainer = document.createElement('div');
          buttonContainer.id = 'dco-yuanbao-floating-container';
          buttonContainer.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
          `;
          
          // 创建提示词按钮
          const promptButton = document.createElement('button');
          promptButton.id = 'dco-prompt-button-input';
          promptButton.className = 'style__switch-model--btn___SVFm2 t-button t-button--theme-default t-button--variant-outline';
          promptButton.style.cssText = `
            border-radius: 8px;
            padding: 8px 12px;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 5px;
          `;
          
          // 为按钮添加悬停效果
          promptButton.onmouseover = function() {
            this.style.backgroundColor = '#f5f5f5';
          };
          promptButton.onmouseout = function() {
            this.style.backgroundColor = '#fff';
          };
          
          // 创建图标
          const buttonIcon = document.createElement('img');
          buttonIcon.style.width = '18px';
          buttonIcon.style.height = '18px';
          buttonIcon.style.marginRight = '5px';
          buttonIcon.style.display = 'inline-block';
          
          // 使用内联SVG而不是base64图片
          buttonIcon.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          `);
          
          // 创建文本
          const buttonText = document.createElement('span');
          buttonText.textContent = isChinese ? '提示词' : 'Prompt';
          
          // 组装按钮
          promptButton.appendChild(buttonIcon);
          promptButton.appendChild(buttonText);
          
          // 添加点击事件处理
          promptButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('元宝浮动提示词按钮被点击');
            togglePromptPanel();
          });
          
          // 将按钮添加到容器
          buttonContainer.appendChild(promptButton);
          
          // 将容器添加到页面
          document.body.appendChild(buttonContainer);
          
          console.log('已创建并添加元宝浮动提示词按钮');
        }).catch(error => {
          console.error('获取界面语言设置时出错:', error);
        });
      };
      
      // 初始检查
      checkAndAddButton();
      
      // 如果初始检查未成功，设置定时检查
      if (!buttonAdded) {
        console.log('设置定时检查和DOM变化观察器...');
        
        // 每500ms检查一次
        let checkCount = 0;
        const intervalId = setInterval(() => {
          checkAndAddButton();
          
          // 如果已经添加了按钮或者尝试了20次（10秒），则清除定时器
          if (buttonAdded || ++checkCount > 20) {
            clearInterval(intervalId);
            console.log(`定时检查${buttonAdded ? '成功' : '超时'}，已清除定时器`);
          }
        }, 500);
        
        // 同时设置DOM变化观察器
        const observer = new MutationObserver((mutations) => {
          // 每当DOM变化时检查
          checkAndAddButton();
          
          // 如果按钮已添加，断开观察器
          if (buttonAdded) {
            observer.disconnect();
            console.log('按钮已添加，断开DOM观察器');
          }
        });
        
        // 开始观察body元素的变化
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // 5秒后断开观察器，避免长时间运行
        setTimeout(() => {
          if (!buttonAdded) {
            observer.disconnect();
            console.log('DOM观察器超时，已断开');
          }
        }, 5000);
      }
    } catch (error) {
      console.error('添加元宝提示词按钮时出错:', error);
    }
    
    return; // 提前返回，避免执行下面的通用代码
  }
  
  // 通用实现 - 为其他聊天服务添加按钮
  // 根据不同的聊天服务找到输入框
  let inputContainer;
  let inputElement;
  
  const findInputInterval = setInterval(() => {
    switch (chatService) {
      case 'chatgpt':
        inputContainer = document.querySelector('form div[class*="flex"]');
        inputElement = document.querySelector('form textarea');
        break;
        
      case 'claude':
        inputContainer = document.querySelector('.input-container');
        inputElement = document.querySelector('.input-container textarea');
        break;
        
      case 'gemini':
        inputContainer = document.querySelector('div[role="textbox"]')?.parentElement;
        inputElement = document.querySelector('div[role="textbox"]');
        break;
        
      case 'perplexity':
        inputContainer = document.querySelector('div[role="textbox"]')?.parentElement;
        inputElement = document.querySelector('div[role="textbox"]');
        break;
        
      case 'generic':
      default:
        // 通用模式，尝试找到任何可能的输入框
        inputElement = document.querySelector('textarea');
        if (inputElement) {
          inputContainer = inputElement.parentElement;
        }
        break;
    }
    
    if (inputContainer && inputElement && !document.getElementById('dco-prompt-button-input')) {
      clearInterval(findInputInterval);
      
      // 创建提示词按钮
      const promptButton = document.createElement('div');
      promptButton.id = 'dco-prompt-button-input';
      
      // 添加点击事件处理
      promptButton.addEventListener('click', () => {
        togglePromptPanel();
      });
      
      // 其他聊天服务的按钮样式
      promptButton.classList.add('dco-prompt-button');
      promptButton.innerHTML = `
        <span class="dco-prompt-button-icon">📝</span>
        <span class="dco-prompt-button-text">提示词</span>
      `;
      
      // 设置按钮样式
      promptButton.style.cssText = `
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        z-index: 1000;
        user-select: none;
        transition: all 0.2s ease;
      `;
      
      // 添加按钮
      const existingPromptButton = inputContainer.querySelector('.dco-prompt-button');
      if (!existingPromptButton) {
        inputContainer.appendChild(promptButton);
        
        // 根据不同的聊天服务调整按钮位置
        switch (chatService) {
          case 'chatgpt':
            promptButton.style.right = '140px';
            promptButton.style.bottom = '18px';
            break;
            
          case 'claude':
            promptButton.style.right = '80px';
            promptButton.style.bottom = '14px';
            break;
            
          case 'gemini':
            promptButton.style.right = '70px';
            promptButton.style.bottom = '8px';
            break;
            
          case 'perplexity':
            promptButton.style.right = '60px';
            promptButton.style.bottom = '10px';
            break;
            
          default:
            promptButton.style.right = '60px';
            promptButton.style.bottom = '14px';
            break;
        }
      }
      
      console.log(`已为 ${chatService} 添加提示词按钮`);
    }
  }, 1000);
  
  // 5秒后如果找不到输入框，清除间隔
  setTimeout(() => {
    clearInterval(findInputInterval);
  }, 5000);
}

/**
 * 为 DeepSeek 创建提示词按钮
 * 专用函数，确保按钮稳定显示且样式正确
 * @param {HTMLElement} searchButton - 联网搜索按钮元素
 * @param {HTMLElement} buttonArea - 按钮区域容器
 * @param {boolean} isChinese - 是否使用中文界面
 * @returns {HTMLElement} 创建的按钮元素
 */
function createDeepSeekPromptButton(searchButton, buttonArea, isChinese) {
  // 创建按钮元素
  const promptButton = document.createElement('div');
  promptButton.id = 'dco-prompt-button-input';
  promptButton.setAttribute('role', 'button');
  promptButton.tabIndex = '0';
  
  // 使用与联网搜索按钮相同的类名
  if (searchButton && searchButton.className) {
    promptButton.className = searchButton.className;
  } else {
    // 备用样式
    promptButton.className = 'ds-button ds-button--primary ds-button--filled ds-button--rect ds-button--m';
  }
  
  // 添加点击事件处理
  promptButton.addEventListener('click', (event) => {
    // 阻止事件冒泡和默认行为
    event.preventDefault();
    event.stopPropagation();
    
    console.log('DeepSeek 提示词按钮被点击');
    togglePromptPanel();
  });
  
  // 复制联网搜索按钮的样式
  if (searchButton) {
    try {
      // 获取计算样式
      const styles = window.getComputedStyle(searchButton);
      
      // 创建内联样式，使用与搜索按钮相同的关键样式属性
      const inlineStyles = {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        margin: styles.margin,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        boxShadow: styles.boxShadow,
        transition: styles.transition
      };
      
      // 应用内联样式
      Object.assign(promptButton.style, inlineStyles);
      
      // 复制CSS变量
      if (searchButton.style.cssText) {
        promptButton.style.cssText += searchButton.style.cssText;
      }
    } catch (error) {
      console.warn('无法复制搜索按钮样式:', error);
      
      // 应用备用样式
      promptButton.style.cssText = '--ds-button-color: #fff; --button-text-color: #4c4c4c; --button-border-color: rgba(0, 0, 0, 0.12); --ds-button-hover-color: #E0E4ED;';
    }
  } else {
    // 应用备用样式
    promptButton.style.cssText = '--ds-button-color: #fff; --button-text-color: #4c4c4c; --button-border-color: rgba(0, 0, 0, 0.12); --ds-button-hover-color: #E0E4ED;';
  }
  
  // 创建按钮内容
  const buttonText = document.createElement('span');
  
  // 使用与搜索按钮相同的文本类名
  if (searchButton) {
    const searchButtonTextSpan = searchButton.querySelector('span:not([style])');
    if (searchButtonTextSpan && searchButtonTextSpan.className) {
      buttonText.className = searchButtonTextSpan.className;
    }
  }
  
  // 如果没有找到适合的类名，使用默认类名
  if (!buttonText.className) {
    buttonText.className = 'ad0c98fd';
  }
  
  // 设置按钮文本
  buttonText.textContent = isChinese ? '提示词' : 'Prompt';
  
  // 尝试创建与搜索按钮相似的图标
  const buttonIcon = document.createElement('div');
  
  // 尝试使用与搜索按钮相同的图标样式
  if (searchButton) {
    const searchButtonIcon = searchButton.querySelector('.ds-button__icon, [class*="icon"]');
    if (searchButtonIcon) {
      buttonIcon.className = searchButtonIcon.className;
      const iconStyles = window.getComputedStyle(searchButtonIcon);
      
      // 复制图标样式
      buttonIcon.style.marginRight = iconStyles.marginRight;
      buttonIcon.style.display = iconStyles.display;
    }
  }
  
  // 如果没有找到适合的类名，使用默认类名
  if (!buttonIcon.className) {
    buttonIcon.className = 'ds-button__icon';
  }
  
  // 创建图标内容
  const iconSpan = document.createElement('span');
  iconSpan.style.transition = 'none';
  iconSpan.style.transform = 'rotate(0deg)';
  
  const dsIcon = document.createElement('div');
  dsIcon.className = 'ds-icon';
  dsIcon.style.cssText = 'font-size: 17px; width: 17px; height: 17px; color: rgb(76, 76, 76);';
  
  // 创建SVG图标
  const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgIcon.setAttribute('width', '16');
  svgIcon.setAttribute('height', '16');
  svgIcon.setAttribute('viewBox', '0 0 20 20');
  svgIcon.setAttribute('fill', 'none');
  svgIcon.style.verticalAlign = 'middle';
  svgIcon.style.color = 'currentColor'; // 使用当前文本颜色
  
  // 使用与DeepSeek相同的文档图标
  svgIcon.innerHTML = `
    <path d="M14.166 2.5H5.83268C4.91602 2.5 4.16602 3.25 4.16602 4.16667V15.8333C4.16602 16.75 4.91602 17.5 5.83268 17.5H14.166C15.0827 17.5 15.8327 16.75 15.8327 15.8333V4.16667C15.8327 3.25 15.0827 2.5 14.166 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 5.83301H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 9.16699H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 12.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  
  // 组装按钮
  iconSpan.appendChild(dsIcon);
  buttonIcon.appendChild(iconSpan);
  
  // 根据搜索按钮的结构决定按钮内容的顺序
  if (searchButton) {
    const firstChild = searchButton.firstElementChild;
    if (firstChild && firstChild.tagName === 'SPAN') {
      // 如果搜索按钮的第一个元素是文本，我们也应该先放文本
      promptButton.appendChild(buttonText);
      promptButton.appendChild(buttonIcon);
    } else {
      // 否则先放图标
      promptButton.appendChild(buttonIcon);
      promptButton.appendChild(buttonText);
    }
  } else {
    // 默认顺序
    promptButton.appendChild(buttonIcon);
    promptButton.appendChild(buttonText);
  }
  
  return promptButton;
}

/**
 * 为 YuanBao 创建提示词按钮
 * 专用函数，确保按钮稳定显示且样式正确
 * @param {HTMLElement} searchButton - 联网搜索按钮元素
 * @param {HTMLElement} buttonArea - 按钮区域容器
 * @param {boolean} isChinese - 是否使用中文界面
 * @returns {HTMLElement} 创建的按钮元素
 */
function createYuanbaoPromptButton(searchButton, buttonArea, isChinese) {
  // 创建按钮元素
  const promptButton = document.createElement('button');
  promptButton.id = 'dco-prompt-button-input';
  promptButton.setAttribute('type', 'button');
  
  // 复制联网搜索按钮的属性
  if (searchButton) {
    // 复制联网搜索按钮的所有属性
    Array.from(searchButton.attributes).forEach(attr => {
      if (attr.name !== 'id' && attr.name !== 'dt-button-id' && attr.name !== 'dt-exposure') {
        promptButton.setAttribute(attr.name, attr.value);
      }
    });
    
    // 特别设置按钮的类名
    promptButton.className = 'style__switch-model--btn___SVFm2 t-button t-button--theme-default t-button--variant-outline';
    
    // 设置内联样式
    promptButton.style.fontWeight = '500';
  } else {
    // 如果没有找到搜索按钮，使用默认样式
    promptButton.className = 'style__switch-model--btn___SVFm2 t-button t-button--theme-default t-button--variant-outline';
    promptButton.style.fontWeight = '500';
  }
  
  // 添加点击事件处理
  promptButton.addEventListener('click', (event) => {
    // 阻止事件冒泡和默认行为
    event.preventDefault();
    event.stopPropagation();
    
    console.log('YuanBao 提示词按钮被点击');
    togglePromptPanel();
  });
  
  // 创建按钮的span元素
  const buttonTextSpan = document.createElement('span');
  buttonTextSpan.className = 't-button__text';
  buttonTextSpan.style.display = 'flex';
  buttonTextSpan.style.alignItems = 'center';
  
  // 尝试多种图标方案，确保至少有一种能显示
  
  // 方案1: 使用SVG图标
  const iconContainer = document.createElement('span');
  iconContainer.style.display = 'inline-flex';
  iconContainer.style.alignItems = 'center';
  iconContainer.style.marginRight = '4px';
  iconContainer.style.flexShrink = '0'; // 防止图标被压缩
  
  // 创建SVG图标
  const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgIcon.setAttribute('width', '16');
  svgIcon.setAttribute('height', '16');
  svgIcon.setAttribute('viewBox', '0 0 20 20');
  svgIcon.setAttribute('fill', 'none');
  svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); // 添加命名空间
  svgIcon.style.verticalAlign = 'middle';
  svgIcon.style.color = 'currentColor'; // 使用当前文本颜色
  svgIcon.style.minWidth = '16px'; // 确保最小宽度
  
  // 使用与DeepSeek相同的文档图标
  svgIcon.innerHTML = `
    <path d="M14.166 2.5H5.83268C4.91602 2.5 4.16602 3.25 4.16602 4.16667V15.8333C4.16602 16.75 4.91602 17.5 5.83268 17.5H14.166C15.0827 17.5 15.8327 16.75 15.8327 15.8333V4.16667C15.8327 3.25 15.0827 2.5 14.166 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 5.83301H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 9.16699H12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 12.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  
  // 添加图标到容器
  iconContainer.appendChild(svgIcon);
  
  // 方案2: 创建CSS图标作为备选
  const cssIconContainer = document.createElement('span');
  cssIconContainer.style.display = 'none'; // 默认隐藏，仅在SVG失败时显示
  cssIconContainer.style.width = '14px';
  cssIconContainer.style.height = '16px';
  cssIconContainer.style.marginRight = '6px';
  cssIconContainer.style.position = 'relative';
  cssIconContainer.style.border = '1px solid currentColor';
  cssIconContainer.style.borderRadius = '1px';
  
  // 添加文档线条
  const line1 = document.createElement('span');
  line1.style.position = 'absolute';
  line1.style.width = '8px';
  line1.style.height = '1px';
  line1.style.backgroundColor = 'currentColor';
  line1.style.top = '4px';
  line1.style.left = '3px';
  
  const line2 = document.createElement('span');
  line2.style.position = 'absolute';
  line2.style.width = '8px';
  line2.style.height = '1px';
  line2.style.backgroundColor = 'currentColor';
  line2.style.top = '8px';
  line2.style.left = '3px';
  
  const line3 = document.createElement('span');
  line3.style.position = 'absolute';
  line3.style.width = '5px';
  line3.style.height = '1px';
  line3.style.backgroundColor = 'currentColor';
  line3.style.top = '12px';
  line3.style.left = '3px';
  
  cssIconContainer.appendChild(line1);
  cssIconContainer.appendChild(line2);
  cssIconContainer.appendChild(line3);
  
  // 设置按钮文本
  const textElement = document.createElement('span');
  textElement.textContent = '提示词';
  
  // 组装按钮
  buttonTextSpan.appendChild(iconContainer);
  buttonTextSpan.appendChild(cssIconContainer);
  buttonTextSpan.appendChild(textElement);
  
  // 添加错误处理 - 如果SVG图标不显示，使用备选方案
  svgIcon.onerror = () => {
    console.log('SVG图标加载失败，使用备选图标');
    iconContainer.style.display = 'none';
    cssIconContainer.style.display = 'inline-block';
  };
  
  promptButton.appendChild(buttonTextSpan);
  
  return promptButton;
} 