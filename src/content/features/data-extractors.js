/**
 * 数据提取模块 - 从各种聊天服务提取数据
 */

/**
 * 从特定的聊天服务提取聊天数据
 * @param {String} chatService - 聊天服务名称
 * @returns {Promise<Object>} - 提取的聊天数据
 */
export async function extractChatData(chatService) {
    let messages = [];
    let title = '未定义';
    try {
        switch (chatService) {
            case 'chatgpt':
                // 提取ChatGPT的聊天数据
                messages = extractChatGPTData();
                break;

            case 'claude':
                // 提取Claude的聊天数据
                messages = extractClaudeData();
                break;

            case 'gemini':
                // 提取Gemini/Bard的聊天数据
                messages = extractGeminiData();
                break;

            case 'deepseek':
                // 提取DeepSeek的聊天数据
                const result = await extractDeepSeekData();
                messages = result.extractedMessages ?? [];
                title = result.title ?? '';
                break;

            case 'yuanbao':
                // 提取腾讯元宝的聊天数据
                messages = extractYuanbaoData();
                break;

            default:
                console.error(`不支持的聊天服务: ${chatService}`);
                return null;
        }

        return {
            service: chatService,
            timestamp: new Date().toISOString(),
            messages: messages,
            title: title
        };
    } catch (error) {
        console.error('提取聊天数据时出错:', error);
        return null;
    }
}

/**
 * 从特定的聊天服务提取所有聊天数据
 * @param {String} chatService - 聊天服务名称
 * @returns {Promise<Array>} - 提取的所有聊天数据数组
 */
export async function extractAllChatsData(chatService) {
    try {
        switch (chatService) {
            case 'chatgpt':
                // 提取ChatGPT的所有聊天数据
                return await extractAllChatGPTData();

            case 'claude':
                // 提取Claude的所有聊天数据
                return await extractAllClaudeData();

            case 'gemini':
                // 提取Gemini/Bard的所有聊天数据
                return await extractAllGeminiData();

            case 'deepseek':
                // 提取DeepSeek的所有聊天数据
                return await extractAllDeepSeekData();

            case 'yuanbao':
                // 提取腾讯元宝的所有聊天数据
                return await extractAllYuanbaoData();

            default:
                console.error(`不支持的聊天服务: ${chatService}`);
                return [];
        }
    } catch (error) {
        console.error('提取所有聊天数据时出错:', error);
        return [];
    }
}

/**
 * 提取ChatGPT的聊天数据
 * @returns {Array} - 消息数组
 */
function extractChatGPTData() {
    const messages = [];

    // 查找包含对话的元素
    const conversationElements = document.querySelectorAll('[data-message-author-role]');

    conversationElements.forEach(element => {
        const role = element.getAttribute('data-message-author-role');
        const contentElement = element.querySelector('.markdown');

        if (contentElement) {
            const content = contentElement.innerHTML;

            messages.push({
                role: role === 'user' ? 'user' : 'assistant',
                content: content
            });
        }
    });

    return messages;
}

/**
 * 提取Claude的聊天数据
 * @returns {Array} - 消息数组
 */
function extractClaudeData() {
    // Claude的DOM结构提取逻辑
    const messages = [];

    // 模拟提取逻辑，具体实现需要根据Claude的实际DOM结构调整
    const messageContainers = document.querySelectorAll('.message-container');

    messageContainers.forEach(container => {
        const isUser = container.classList.contains('user-message');
        const contentElement = container.querySelector('.message-content');

        if (contentElement) {
            messages.push({
                role: isUser ? 'user' : 'assistant',
                content: contentElement.innerHTML
            });
        }
    });

    return messages;
}

/**
 * 提取Gemini/Bard的聊天数据
 * @returns {Array} - 消息数组
 */
function extractGeminiData() {
    const messages = [];
    console.log('正在提取Gemini/Bard聊天数据...');

    try {
        // 尝试找到聊天消息容器
        const chatContainer = document.querySelector('main') ||
            document.querySelector('.conversation-container');

        if (!chatContainer) {
            console.error('未找到Gemini聊天容器');
            return messages;
        }

        // 查找所有消息元素
        const messageElements = chatContainer.querySelectorAll('div[role="row"]') ||
            chatContainer.querySelectorAll('div[class*="message"]');

        messageElements.forEach((element, index) => {
            // 尝试确定消息角色
            let role = 'unknown';

            // 通过类名或内容判断角色
            if (element.classList.contains('user') ||
                element.classList.contains('user-message') ||
                element.innerHTML.includes('user-avatar')) {
                role = 'user';
            } else if (element.classList.contains('model') ||
                element.classList.contains('bot-message') ||
                element.classList.contains('assistant') ||
                element.innerHTML.includes('model-avatar')) {
                role = 'assistant';
            } else {
                // 如果无法通过类名判断，尝试通过顺序判断
                role = index % 2 === 0 ? 'user' : 'assistant';
            }

            // 提取消息内容
            const contentElement = element.querySelector('div[class*="content"]') ||
                element.querySelector('div[class*="message-content"]') ||
                element;

            if (contentElement) {
                const content = contentElement.innerHTML;

                messages.push({
                    role: role,
                    content: content
                });
            }
        });

        return messages;
    } catch (error) {
        console.error('提取Gemini聊天数据时出错:', error);
        return messages;
    }
}

/**
 * 提取DeepSeek的聊天数据
 * @returns {Promise<Object>} - 消息和标题的Promise
 */
async function extractDeepSeekData() {
    console.log('正在提取DeepSeek聊天数据...');

    try {
        // 从URL中提取UUID
        const url = window.location.href;
        const uuidMatch = url.match(/\/chat\/s\/([0-9a-f-]+)/);

        if (!uuidMatch || !uuidMatch[1]) {
            console.error('未能从URL中提取UUID');
            return [];
        }
        console.log(uuidMatch);

        const uuid = uuidMatch[1];
        console.log('从URL中提取到UUID:', uuid);

        // 从IndexedDB中获取聊天记录
        return new Promise((resolve) => {
            // 打开IndexedDB数据库
            const request = indexedDB.open('deepseek-chat', 1);

            request.onerror = (event) => {
                console.error('打开IndexedDB失败:', event);
                resolve([]);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;

                // 检查是否存在history-message存储
                if (!db.objectStoreNames.contains('history-message')) {
                    console.error('未找到history-message存储');
                    resolve([]);
                    return;
                }

                // 开始事务
                const transaction = db.transaction(['history-message'], 'readonly');
                const store = transaction.objectStore('history-message');

                // 获取所有记录
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    const records = getAllRequest.result;
                    console.log('从IndexedDB获取到记录数:', records.length);

                    // 查找匹配UUID的记录
                    const matchingRecord = records.find(record =>
                        record.key === uuid ||
                        (record.chat_session && record.chat_session.id === uuid)
                    );

                    if (matchingRecord) {
                        console.log('找到匹配的聊天记录:', matchingRecord);

                        // 提取消息
                        let extractedMessages = [];
                        let title = '';
                        if (matchingRecord.data.chat_messages && Array.isArray(matchingRecord.data.chat_messages)) {
                            // 直接使用messages数组
                            extractedMessages = matchingRecord.data.chat_messages.map(msg => ({
                                role: msg.role,
                                content: msg.content,
                                thinking_content: msg.thinking_content ?? ''
                            }));
                        }
                        if (matchingRecord.data.chat_session) {
                            title = matchingRecord.data.chat_session.title;
                        }

                        console.log(`从IndexedDB成功提取 ${extractedMessages.length} 条消息`);
                        resolve({ extractedMessages, title: title });
                    } else {
                        console.error('未找到匹配UUID的记录');
                        resolve([]);
                    }
                };

                getAllRequest.onerror = (event) => {
                    console.error('获取IndexedDB记录失败:', event);
                    resolve([]);
                };
            };
        });
    } catch (error) {
        console.error('提取DeepSeek聊天数据时出错:', error);
        return [];
    }
}

/**
 * 提取腾讯元宝的聊天数据
 * @returns {Array} - 消息数组
 */
function extractYuanbaoData() {
    const messages = [];
    console.log('正在提取腾讯元宝聊天数据...');

    try {
        // 尝试找到聊天消息容器
        const chatContainer = document.querySelector('.chat-container') ||
            document.querySelector('.conversation-container') ||
            document.querySelector('main');

        if (!chatContainer) {
            console.error('未找到腾讯元宝聊天容器');
            return messages;
        }

        // 查找所有消息元素
        const messageElements = chatContainer.querySelectorAll('div[class*="message"]') ||
            chatContainer.querySelectorAll('div[class*="chat-message"]');

        console.log(`找到 ${messageElements.length} 条消息`);

        messageElements.forEach((element, index) => {
            // 尝试确定消息角色
            let role = 'unknown';

            // 通过类名或内容判断角色
            if (element.classList.contains('user') ||
                element.classList.contains('user-message') ||
                element.innerHTML.includes('user-avatar') ||
                element.querySelector('img[alt*="user"]')) {
                role = 'user';
            } else if (element.classList.contains('assistant') ||
                element.classList.contains('bot-message') ||
                element.innerHTML.includes('bot-avatar') ||
                element.querySelector('img[alt*="assistant"]') ||
                element.querySelector('img[alt*="bot"]')) {
                role = 'assistant';
            } else {
                // 如果无法通过类名判断，尝试通过顺序判断
                role = index % 2 === 0 ? 'user' : 'assistant';
            }

            // 提取消息内容
            const contentElement = element.querySelector('div[class*="content"]') ||
                element.querySelector('div[class*="message-content"]') ||
                element;

            if (contentElement) {
                const content = contentElement.innerHTML;

                messages.push({
                    role: role,
                    content: content
                });
            }
        });

        console.log(`成功提取 ${messages.length} 条消息`);
        return messages;
    } catch (error) {
        console.error('提取腾讯元宝聊天数据时出错:', error);
        return messages;
    }
}

/**
 * 提取DeepSeek的所有聊天数据
 * @returns {Promise<Array>} - 所有聊天数据的数组
 */
async function extractAllDeepSeekData() {
    console.log('正在提取DeepSeek所有聊天数据...');

    try {
        // 从IndexedDB中获取所有聊天记录
        return new Promise((resolve) => {
            // 打开IndexedDB数据库
            const request = indexedDB.open('deepseek-chat', 1);

            request.onerror = (event) => {
                console.error('打开IndexedDB失败:', event);
                resolve([]);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;

                // 检查是否存在history-message存储
                if (!db.objectStoreNames.contains('history-message')) {
                    console.error('未找到history-message存储');
                    resolve([]);
                    return;
                }

                // 开始事务
                const transaction = db.transaction(['history-message'], 'readonly');
                const store = transaction.objectStore('history-message');

                // 获取所有记录
                const getAllRequest = store.getAll();

                getAllRequest.onsuccess = () => {
                    const records = getAllRequest.result;
                    console.log('从IndexedDB获取到记录数:', records.length);

                    if (records.length === 0) {
                        console.error('未找到聊天记录');
                        resolve([]);
                        return;
                    }

                    // 处理所有聊天记录
                    const allChats = records.map(record => {
                        let chatData = {
                            id: record.key || (record.chat_session && record.chat_session.id) || '',
                            title: record.data.title || '未命名聊天',
                            timestamp: record.data.timestamp || new Date().toISOString(),
                            messages: []
                        };

                        // 提取消息
                        if (record.data.chat_messages && Array.isArray(record.data.chat_messages)) {
                            chatData.messages = record.data.chat_messages.map(msg => ({
                                role: msg.role,
                                content: msg.content
                            }));
                        }

                        return chatData;
                    }).filter(chat => chat.messages.length > 0); // 过滤掉没有消息的聊天

                    console.log(`从IndexedDB成功提取 ${allChats.length} 个聊天记录`);
                    resolve(allChats);
                };

                getAllRequest.onerror = (event) => {
                    console.error('获取IndexedDB记录失败:', event);
                    resolve([]);
                };
            };
        });
    } catch (error) {
        console.error('提取DeepSeek所有聊天数据时出错:', error);
        return [];
    }
}

/**
 * 提取ChatGPT的所有聊天数据
 * @returns {Promise<Array>} - 所有聊天数据的数组
 */
async function extractAllChatGPTData() {
    // 由于ChatGPT的聊天记录不容易批量获取，这里只返回当前聊天
    const currentChat = {
        id: 'current-chat',
        title: '当前聊天',
        timestamp: new Date().toISOString(),
        messages: extractChatGPTData()
    };

    return [currentChat];
}

/**
 * 提取Claude的所有聊天数据
 * @returns {Promise<Array>} - 所有聊天数据的数组
 */
async function extractAllClaudeData() {
    // 由于Claude的聊天记录不容易批量获取，这里只返回当前聊天
    const currentChat = {
        id: 'current-chat',
        title: '当前聊天',
        timestamp: new Date().toISOString(),
        messages: extractClaudeData()
    };

    return [currentChat];
}

/**
 * 提取Gemini的所有聊天数据
 * @returns {Promise<Array>} - 所有聊天数据的数组
 */
async function extractAllGeminiData() {
    // 由于Gemini的聊天记录不容易批量获取，这里只返回当前聊天
    const currentChat = {
        id: 'current-chat',
        title: '当前聊天',
        timestamp: new Date().toISOString(),
        messages: extractGeminiData()
    };

    return [currentChat];
}

/**
 * 提取腾讯元宝的所有聊天数据
 * @returns {Promise<Array>} - 所有聊天数据的数组
 */
async function extractAllYuanbaoData() {
    // 由于腾讯元宝的聊天记录不容易批量获取，这里只返回当前聊天
    const currentChat = {
        id: 'current-chat',
        title: '当前聊天',
        timestamp: new Date().toISOString(),
        messages: extractYuanbaoData()
    };

    return [currentChat];
} 