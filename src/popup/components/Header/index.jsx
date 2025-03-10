import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.headerBorderColor};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
`;

const LanguageSelector = styled.div`
  position: relative;
  margin-left: auto;
  min-width: 80px;
  
  &::after {
    content: "▼";
    font-size: 10px;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${props => props.theme.textColor};
    opacity: 0.6;
  }
`;

const Select = styled.select`
  padding: 4px 8px;
  padding-right: 20px;
  border-radius: 4px;
  border: 1px solid ${props => props.theme.borderColor};
  background-color: ${props => props.theme.selectBackground};
  color: ${props => props.theme.selectTextColor};
  font-size: 12px;
  width: 100%;
  appearance: none;
  cursor: pointer;
`;

const Header = () => {
  const { t, language, changeLanguage, supportedLanguages } = useLanguage();
  
  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };
  
  return (
    <HeaderContainer>
      <Logo>
        <LogoImage src="../images/icon48.png" alt="Logo" />
        <Title>{t.title}</Title>
      </Logo>
      
      <LanguageSelector>
        <Select value={language} onChange={handleLanguageChange}>
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </Select>
      </LanguageSelector>
    </HeaderContainer>
  );
};

export default Header; 