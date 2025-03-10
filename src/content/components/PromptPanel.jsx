import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { showNotification, showConfirmDialog } from '../utils/notificationUtils';

// 语言文本
const translations = {
  'zh-CN': {
    panelTitle: '提示词模板',
    templateNamePlaceholder: '输入模板名称...',
    contentPlaceholder: '输入提示词内容...',
    emptyMessage: '暂无保存的提示词模板',
    useButton: '使用',
    deleteButton: '删除',
    editButton: '编辑',
    saveButton: '保存',
    cancelButton: '取消',
    addButton: '添加模板',
    updatedAt: '更新于',
    nameContentEmpty: '模板名称和内容不能为空',
    confirmDelete: '确定要删除模板吗？',
    searchPlaceholder: '搜索模板...',
    categories: '分类',
    all: '全部',
    recent: '最近',
    favorite: '收藏',
    custom: '自定义',
    favoriteAdded: '已添加到收藏',
    favoriteRemoved: '已从收藏中移除'
  },
  'en-US': {
    panelTitle: 'Prompt Templates',
    templateNamePlaceholder: 'Enter template name...',
    contentPlaceholder: 'Enter prompt content...',
    emptyMessage: 'No prompt templates saved',
    useButton: 'Use',
    deleteButton: 'Delete',
    editButton: 'Edit',
    saveButton: 'Save',
    cancelButton: 'Cancel',
    addButton: 'Add Template',
    updatedAt: 'Updated at',
    nameContentEmpty: 'Template name and content cannot be empty',
    confirmDelete: 'Are you sure you want to delete this template?',
    searchPlaceholder: 'Search templates...',
    categories: 'Categories',
    all: 'All',
    recent: 'Recent',
    favorite: 'Favorite',
    custom: 'Custom',
    favoriteAdded: 'Added to favorites',
    favoriteRemoved: 'Removed from favorites'
  }
};

// 动画
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// 样式化组件
const PanelContainer = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 420px;
  max-height: 580px;
  background-color: var(--dco-bg-color, #ffffff);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  left: auto;
  animation: ${fadeIn} 0.3s ease-out;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    width: 90%;
    right: 5%;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }
`;

const SearchBox = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #f5f7f9;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
    background-color: white;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#4285f4' : '#666'};
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #4285f4;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s ease;
  }
  
  &:hover {
    color: ${props => props.active ? '#4285f4' : '#333'};
  }
`;

const ListContainer = styled.div`
  padding: 16px 24px;
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  gap: 16px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const EmptyMessage = styled.div`
  padding: 40px 16px;
  color: #888;
  text-align: center;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: #ddd;
`;

const AddButtonContainer = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

const AddButton = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);

  &:hover {
    background-color: #3367d6;
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const PromptCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;

  ${props => props.isEditing && css`
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.15);
    border-color: #4285f4;
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: ${props => props.isExpanded ? '1px solid rgba(0, 0, 0, 0.06)' : 'none'};
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #333;
  ${props => props.isEditing && css`
    color: #4285f4;
  `}
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }
  
  ${props => props.primary && css`
    color: #4285f4;
    
    &:hover {
      background-color: rgba(66, 133, 244, 0.1);
      color: #3367d6;
    }
  `}
  
  ${props => props.danger && css`
    color: #ea4335;
    
    &:hover {
      background-color: rgba(234, 67, 53, 0.1);
      color: #d93025;
    }
  `}
`;

const CardContent = styled.div`
  padding: ${props => props.isExpanded ? '16px' : '0 16px'};
  max-height: ${props => props.isExpanded ? '300px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isExpanded ? 1 : 0};
`;

const PromptText = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
`;

const UpdatedTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.primary && css`
    background-color: #4285f4;
    color: white;
    
    &:hover {
      background-color: #3367d6;
    }
  `}
  
  ${props => props.danger && css`
    color: #ea4335;
    
    &:hover {
      background-color: rgba(234, 67, 53, 0.1);
    }
  `}
  
  ${props => props.secondary && css`
    color: #666;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `}
`;

const EditForm = styled.div`
  padding: 16px;
  animation: ${slideInRight} 0.3s ease-out;
`;

const EditInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const EditTextarea = styled.textarea`
  width: 100%;
  height: 140px;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 14px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  line-height: 1.6;

  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const CardPreview = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  display: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  
  ${props => props.isVisible && css`
    display: block;
  `}
`;

/**
 * 提示词面板组件
 * @param {Object} props - 组件属性
 * @param {String} props.chatService - 聊天服务类型
 * @param {Function} props.onClose - 关闭面板回调
 */
const PromptPanel = ({ chatService, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [language, setLanguage] = useState('zh-CN');
  const [t, setT] = useState(translations['zh-CN']);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  
  const listRef = useRef(null);
  
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
    import('../features/promptFeature.js').then(module => {
      module.loadPromptTemplates().then(templates => {
        // 按更新时间排序，最新的在前面
        templates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        setTemplates(templates);
      });
    });
  };
  
  // 过滤模板
  const filteredTemplates = templates.filter(template => {
    // 首先按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!(template.title.toLowerCase().includes(query) || 
            template.content.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // 然后按分类过滤
    if (activeTab === 'all') return true;
    if (activeTab === 'recent') {
      // 显示最近7天内更新的模板
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(template.updatedAt) >= sevenDaysAgo;
    }
    if (activeTab === 'favorite') {
      // 显示收藏的模板
      return template.isFavorite === true;
    }
    // 自定义分类可以在这里添加
    
    return true;
  });
  
  // 选择模板
  const selectTemplate = (template) => {
    setSelectedTemplate(template.id === selectedTemplate ? null : template.id);
    setEditingId(null); // 关闭任何编辑状态
  };
  
  // 开始编辑模板
  const startEditing = (template, e) => {
    if (e) e.stopPropagation();
    setEditingId(template.id);
    setEditTitle(template.title);
    setEditContent(template.content);
    setSelectedTemplate(template.id); // 确保选中
  };
  
  // 取消编辑
  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };
  
  // 开始添加新模板
  const startAdding = () => {
    setIsAdding(true);
    setEditTitle('');
    setEditContent('');
    setSelectedTemplate(null);
    
    // 滚动到底部
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };
  
  // 取消添加
  const cancelAdding = () => {
    setIsAdding(false);
  };
  
  // 切换收藏状态
  const toggleFavorite = (templateId, e) => {
    if (e) e.stopPropagation();
    
    // 找到要切换收藏状态的模板
    const templateIndex = templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) return;
    
    // 创建模板的副本并切换收藏状态
    const updatedTemplate = {
      ...templates[templateIndex],
      isFavorite: !templates[templateIndex].isFavorite
    };
    
    // 更新模板数组
    const updatedTemplates = [...templates];
    updatedTemplates[templateIndex] = updatedTemplate;
    
    // 保存到存储
    import('../features/promptFeature.js').then(module => {
      module.savePromptTemplate(updatedTemplate).then(() => {
        // 更新状态
        setTemplates(updatedTemplates);
        
        // 显示通知
        const message = updatedTemplate.isFavorite ? t.favoriteAdded : t.favoriteRemoved;
        showNotification(message, 'success');
        
        // 如果当前在收藏标签页并且取消了收藏，可能需要更新UI
        if (activeTab === 'favorite' && !updatedTemplate.isFavorite) {
          // 如果当前选中的是被取消收藏的模板，取消选中
          if (selectedTemplate === templateId) {
            setSelectedTemplate(null);
          }
        }
      });
    });
  };
  
  // 保存模板 (编辑或新增)
  const saveTemplate = (isNew = false, templateId = null, e) => {
    if (e) e.stopPropagation();
    
    if (!editTitle.trim() || !editContent.trim()) {
      showNotification(t.nameContentEmpty, 'error');
      return;
    }
    
    import('../features/promptFeature.js').then(module => {
      const template = {
        id: isNew ? Date.now().toString() : templateId,
        title: editTitle.trim(),
        content: editContent.trim(),
        createdAt: isNew ? new Date().toISOString() : templates.find(t => t.id === templateId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // 保留原有的收藏状态，如果是新模板则默认为未收藏
        isFavorite: isNew ? false : templates.find(t => t.id === templateId)?.isFavorite || false
      };
      
      module.savePromptTemplate(template).then(() => {
        // 重置状态
        setEditingId(null);
        setIsAdding(false);
        setEditTitle('');
        setEditContent('');
        
        // 重新加载模板
        loadPromptTemplates();
        
        // 选中新添加的模板
        if (isNew) {
          setTimeout(() => {
            setSelectedTemplate(template.id);
          }, 300);
        }
      });
    });
  };
  
  // 删除提示词模板
  const deleteTemplate = (templateId, e) => {
    if (e) e.stopPropagation();
    
    showConfirmDialog(
      `${t.confirmDelete}`,
      () => {
        import('../features/promptFeature.js').then(module => {
          module.deletePromptTemplate(templateId).then(() => {
            setSelectedTemplate(null);
            loadPromptTemplates();
          });
        });
      }
    );
  };
  
  // 使用提示词模板
  const useTemplate = (templateContent, e) => {
    if (e) e.stopPropagation();
    
    import('../features/promptFeature.js').then(module => {
      // 插入提示词内容
      if (typeof module.insertPromptToInput === 'function') {
        module.insertPromptToInput(templateContent, chatService);
        
        // 插入后关闭面板
        if (onClose) {
          onClose();
        }
      }
    });
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <PanelContainer id="dco-prompt-panel" className="dco-prompt-panel" data-chat-service={chatService}>
      <PanelHeader>
        <Title>{t.panelTitle}</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PanelHeader>
      
      <SearchBox>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput 
          type="text" 
          placeholder={t.searchPlaceholder} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchBox>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => setActiveTab('all')}
        >
          {t.all}
        </Tab>
        <Tab 
          active={activeTab === 'recent'} 
          onClick={() => setActiveTab('recent')}
        >
          {t.recent}
        </Tab>
        <Tab 
          active={activeTab === 'favorite'} 
          onClick={() => setActiveTab('favorite')}
        >
          {t.favorite}
        </Tab>
      </TabsContainer>
      
      <ListContainer ref={listRef}>
        {filteredTemplates.length === 0 && !isAdding ? (
          <EmptyMessage>
            <EmptyIcon>📝</EmptyIcon>
            {t.emptyMessage}
          </EmptyMessage>
        ) : (
          <>
            {filteredTemplates.map(template => (
              <PromptCard 
                key={template.id} 
                isEditing={editingId === template.id}
                onClick={() => selectTemplate(template)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <CardHeader isExpanded={selectedTemplate === template.id}>
                  <CardTitle isEditing={editingId === template.id}>
                    {template.title}
                  </CardTitle>
                  <CardActions>
                    <IconButton 
                      onClick={(e) => toggleFavorite(template.id, e)}
                      title={template.isFavorite ? t.favoriteRemoved : t.favoriteAdded}
                      primary={template.isFavorite}
                    >
                      {template.isFavorite ? '⭐' : '☆'}
                    </IconButton>
                    <IconButton 
                      primary
                      onClick={(e) => useTemplate(template.content, e)}
                      title={t.useButton}
                    >
                      💬
                    </IconButton>
                    {selectedTemplate === template.id && editingId !== template.id && (
                      <>
                        <IconButton 
                          onClick={(e) => startEditing(template, e)}
                          title={t.editButton}
                        >
                          ✏️
                        </IconButton>
                        <IconButton 
                          danger
                          onClick={(e) => deleteTemplate(template.id, e)}
                          title={t.deleteButton}
                        >
                          🗑️
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </CardHeader>
                
                <CardContent isExpanded={selectedTemplate === template.id || editingId === template.id}>
                  {editingId === template.id ? (
                    <EditForm onClick={(e) => e.stopPropagation()}>
                      <EditInput
                        type="text"
                        placeholder={t.templateNamePlaceholder}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                      />
                      <EditTextarea
                        placeholder={t.contentPlaceholder}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <ActionButtonsContainer>
                        <ActionButton 
                          secondary 
                          onClick={(e) => cancelEditing(e)}
                        >
                          {t.cancelButton}
                        </ActionButton>
                        <ActionButton 
                          primary 
                          onClick={(e) => saveTemplate(false, template.id, e)}
                        >
                          {t.saveButton}
                        </ActionButton>
                      </ActionButtonsContainer>
                    </EditForm>
                  ) : (
                    <>
                      <PromptText>{template.content}</PromptText>
                      <UpdatedTime>
                        {t.updatedAt} {formatDate(template.updatedAt)}
                      </UpdatedTime>
                      <ActionButtonsContainer>
                        <ActionButton 
                          secondary 
                          onClick={(e) => startEditing(template, e)}
                        >
                          {t.editButton}
                        </ActionButton>
                        <ActionButton 
                          danger 
                          onClick={(e) => deleteTemplate(template.id, e)}
                        >
                          {t.deleteButton}
                        </ActionButton>
                      </ActionButtonsContainer>
                    </>
                  )}
                </CardContent>
                
                {hoveredTemplate === template.id && !selectedTemplate && !editingId && (
                  <CardPreview isVisible={true}>
                    {template.content}
                  </CardPreview>
                )}
              </PromptCard>
            ))}
            
            {isAdding && (
              <PromptCard isEditing={true}>
                <CardHeader>
                  <CardTitle isEditing={true}>
                    {editTitle || t.addButton}
                  </CardTitle>
                </CardHeader>
                <CardContent isExpanded={true}>
                  <EditForm onClick={(e) => e.stopPropagation()}>
                    <EditInput
                      type="text"
                      placeholder={t.templateNamePlaceholder}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <EditTextarea
                      placeholder={t.contentPlaceholder}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <ActionButtonsContainer>
                      <ActionButton 
                        secondary 
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelAdding();
                        }}
                      >
                        {t.cancelButton}
                      </ActionButton>
                      <ActionButton 
                        primary 
                        onClick={(e) => {
                          e.stopPropagation();
                          saveTemplate(true);
                        }}
                      >
                        {t.saveButton}
                      </ActionButton>
                    </ActionButtonsContainer>
                  </EditForm>
                </CardContent>
              </PromptCard>
            )}
          </>
        )}
      </ListContainer>
      
      {!isAdding && (
        <AddButtonContainer>
          <AddButton onClick={startAdding}>
            + {t.addButton}
          </AddButton>
        </AddButtonContainer>
      )}
    </PanelContainer>
  );
};

export default PromptPanel; 