import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.sectionTitleColor};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background-color: ${props => props.theme.buttonBackground};
  border: 1px solid ${props => props.theme.borderColor};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.theme.textColor};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.buttonHoverBackground};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ActionIcon = styled.span`
  margin-right: 8px;
  color: ${props => props.theme.actionIconColor};
`;

const Tools = () => {
  const { t } = useLanguage();
  const { showNotification } = useNotification();
  
  // 发送消息到内容脚本
  const sendMessageToContentScript = (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action })
          .then(response => {
            if (response && response.success) {
              showNotification(t.actionSuccess, 'success');
            }
          })
          .catch(error => {
            console.error('发送消息失败:', error);
            showNotification(t.actionFailed, 'error');
          });
      } else {
        showNotification(t.noActiveTab, 'error');
      }
    });
  };
  
  // 触发内容脚本导出聊天
  const handleExportChat = () => {
    sendMessageToContentScript('export_chat');
    // 关闭弹出窗口
    window.close();
  };
  
  // 触发内容脚本导出所有聊天
  const handleExportAllChats = () => {
    sendMessageToContentScript('export_all_chats');
    // 关闭弹出窗口
    window.close();
  };
  
  // 触发内容脚本导出聊天为图片
  const handleExportChatAsImage = () => {
    sendMessageToContentScript('export_chat_as_image');
    // 关闭弹出窗口
    window.close();
  };
  
  // 打开提示词面板
  const handleTogglePromptPanel = () => {
    sendMessageToContentScript('toggle_prompt_panel');
    // 关闭弹出窗口
    window.close();
  };
  
  const handleSettings = () => {
    // 打开选项页
    chrome.runtime.openOptionsPage();
  };
  
  return (
    <>
      <Section>
        <SectionTitle>{t.chatTools || '聊天工具'}</SectionTitle>
        <ActionButton onClick={handleExportChat}>
          <ActionIcon>📤</ActionIcon>
          {t.exportChat || '导出聊天'}
        </ActionButton>
        <ActionButton onClick={handleExportAllChats}>
          <ActionIcon>📦</ActionIcon>
          {t.exportChats || '导出所有聊天'}
        </ActionButton>
        <ActionButton onClick={handleExportChatAsImage}>
          <ActionIcon>📸</ActionIcon>
          {t.exportChatAsImage || '分享聊天为图片'}
        </ActionButton>
        <ActionButton onClick={handleTogglePromptPanel}>
          <ActionIcon>📝</ActionIcon>
          {t.promptPanel || '提示词模板'}
        </ActionButton>
      </Section>
      
      <Section>
        <SectionTitle>{t.extensionSettings || '扩展设置'}</SectionTitle>
        <ActionButton onClick={handleSettings}>
          <ActionIcon>⚙️</ActionIcon>
          {t.settings || '设置'}
        </ActionButton>
      </Section>
    </>
  );
};

export default Tools; 