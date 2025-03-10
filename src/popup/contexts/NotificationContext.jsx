import React, { createContext, useState, useContext, useCallback } from 'react';

// 创建上下文
const NotificationContext = createContext();

// 自定义Hook以便于使用通知上下文
export const useNotification = () => useContext(NotificationContext);

// 通知提供者组件
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  // 显示通知
  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    
    // 自动关闭
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  // 关闭通知
  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // 提供的上下文值
  const contextValue = {
    notification,
    showNotification,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && (
        <div 
          className={`notification ${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#4CAF50' : 
                             notification.type === 'error' ? '#F44336' : 
                             notification.type === 'warning' ? '#FFC107' : '#2196F3',
            color: '#fff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}; 