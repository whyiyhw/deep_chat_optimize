import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    width: 320px;
    min-height: 300px;
    margin: 0;
    padding: 0;
    font-family: 'Microsoft YaHei', Arial, sans-serif;
    color: ${props => props.theme.textColor};
    background-color: ${props => props.theme.backgroundColor};
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  * {
    box-sizing: border-box;
  }
  
  button {
    font-family: 'Microsoft YaHei', Arial, sans-serif;
  }
  
  a {
    color: ${props => props.theme.linkColor};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  select {
    font-family: 'Microsoft YaHei', Arial, sans-serif;
  }
`;

export default GlobalStyles; 