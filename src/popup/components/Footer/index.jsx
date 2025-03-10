import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

const FooterContainer = styled.div`
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.footerBorderColor};
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${props => props.theme.footerTextColor};
`;

const Link = styled.a`
  color: ${props => props.theme.linkColor};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Footer = () => {
  const { t } = useLanguage();
  
  const handleHelpClick = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/your-username/deep-chat-optimize' });
  };
  
  return (
    <FooterContainer>
      <span>{t.version} 1.0.0</span>
      <Link href="#" onClick={handleHelpClick}>{t.helpLink}</Link>
    </FooterContainer>
  );
};

export default Footer; 