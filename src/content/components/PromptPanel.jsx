import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { showNotification, showConfirmDialog } from '../utils/notificationUtils';

// 语言文本
const translations = {
  'zh-CN': {
    panelTitle: '提示词模板',
    templateNamePlaceholder: '模板名称',
    contentPlaceholder: '输入提示词内容...',
    saveButton: '保存模板',
    emptyMessage: '暂无保存的提示词模板',
    useButton: '使用',
    deleteTitle: '删除',
    updatedAt: '更新于',
    nameContentEmpty: '模板名称和内容不能为空',
    confirmDelete: '确定要删除模板吗？'
  },
  'en-US': {
    panelTitle: 'Prompt Panel',
    templateNamePlaceholder: 'Template Name',
    contentPlaceholder: 'Enter prompt content...',
    saveButton: 'Save Template',
    emptyMessage: 'No prompt templates saved',
    useButton: 'Use',
    deleteTitle: 'Delete',
    updatedAt: 'Updated at',
    nameContentEmpty: 'Template name and content cannot be empty',
    confirmDelete: 'Are you sure you want to delete this template?'
  }
};

// 样式化组件
const PanelContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 300px;
  max-height: 400px;
  background-color: var(--dco-bg-color, white);
  border: 1px solid var(--dco-border-color, #ccc);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  left: auto; /* 确保不会使用left属性 */
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--dco-border-color, #eee);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--dco-text-color, #333);
`;

const PromptForm = styled.div`
  padding: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--dco-border-color, #ddd);
  border-radius: 4px;
  box-sizing: border-box;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid var(--dco-border-color, #ddd);
  border-radius: 4px;
  resize: vertical;
  box-sizing: border-box;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 8px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ListContainer = styled.div`
  padding: 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
`;

const PromptItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--dco-border-color, #eee);
  cursor: pointer;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemTitle = styled.div`
  font-weight: 600;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: ${props => props.danger ? '#f44336' : '#2196F3'};
`;

const ItemContent = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const EmptyMessage = styled.div`
  padding: 10px;
  color: #888;
  text-align: center;
`;

/**
 * 提示词面板组件
 * @param {Object} props - 组件属性
 * @param {String} props.chatService - 聊天服务类型
 * @param {Function} props.onClose - 关闭面板回调
 */
const PromptPanel = ({ chatService, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [templates, setTemplates] = useState([]);
  const [language, setLanguage] = useState('zh-CN');
  const [t, setT] = useState(translations['zh-CN']);
  
  // 加载语言设置
  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const currentLanguage = result.language || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en-US');
      setLanguage(currentLanguage);
      setT(translations[currentLanguage] || translations['en-US']);
    });
    
    // 监听语言变化
    const handleLanguageChange = (changes, area) => {
      if (area === 'sync' && changes.language) {
        const newLanguage = changes.language.newValue;
        setLanguage(newLanguage);
        setT(translations[newLanguage] || translations['en-US']);
      }
    };
    
    chrome.storage.onChanged.addListener(handleLanguageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleLanguageChange);
    };
  }, []);
  
  // 加载提示词模板
  useEffect(() => {
    loadPromptTemplates();
  }, []);
  
  // 加载提示词模板
  const loadPromptTemplates = () => {
    chrome.storage.sync.get('promptTemplates', (result) => {
      const templates = result.promptTemplates || [];
      
      // 按更新时间排序，最新的在前面
      templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setTemplates(templates);
    });
  };
  
  // 保存提示词模板
  const saveTemplate = () => {
    if (!title.trim() || !content.trim()) {
      alert(t.nameContentEmpty);
      return;
    }
    
    import('../features/promptFeature.js').then(module => {
      const template = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      module.savePromptTemplate(template).then(() => {
        setTitle('');
        setContent('');
        loadPromptTemplates();
      });
    });
  };
  
  // 删除提示词模板
  const deleteTemplate = (templateId) => {
    import('../features/promptFeature.js').then(module => {
      module.deletePromptTemplate(templateId).then(() => {
        loadPromptTemplates();
      });
    });
  };
  
  // 使用提示词模板
  const useTemplate = (templateContent) => {
    import('../features/promptFeature.js').then(module => {
      module.insertPromptToInput(templateContent, chatService);
      onClose();
    });
  };
  
  return (
    <PanelContainer id="dco-prompt-panel" className="dco-prompt-panel">
      <PanelHeader>
        <Title>{t.panelTitle}</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PanelHeader>
      
      <PromptForm>
        <Input
          id="dco-prompt-title"
          placeholder={t.templateNamePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <Textarea
          id="dco-prompt-content"
          placeholder={t.contentPlaceholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <SaveButton onClick={saveTemplate}>
          {t.saveButton}
        </SaveButton>
      </PromptForm>
      
      <ListContainer>
        {templates.length === 0 ? (
          <EmptyMessage>{t.emptyMessage}</EmptyMessage>
        ) : (
          templates.map(template => (
            <PromptItem key={template.id}>
              <ItemHeader>
                <ItemTitle>{template.title}</ItemTitle>
                <ItemActions>
                  <ActionButton onClick={() => useTemplate(template.content)}>
                    {t.useButton}
                  </ActionButton>
                  <ActionButton 
                    danger 
                    onClick={() => showConfirmDialog(
                      `${t.confirmDelete} "${template.title}"?`,
                      () => deleteTemplate(template.id)
                    )}
                  >
                    {t.deleteTitle}
                  </ActionButton>
                </ItemActions>
              </ItemHeader>
              <ItemContent>{template.content}</ItemContent>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'right' }}>
                {t.updatedAt} {new Date(template.updatedAt).toLocaleDateString()}
              </div>
            </PromptItem>
          ))
        )}
      </ListContainer>
    </PanelContainer>
  );
};

export default PromptPanel; 