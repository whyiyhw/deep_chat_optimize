import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Tools from './Tools';
import Footer from './Footer';

const Container = styled.div`
  width: 100%;
  padding: 16px;
`;

const App = () => {
  return (
    <Container>
      <Header />
      <Tools />
      <Footer />
    </Container>
  );
};

export default App; 