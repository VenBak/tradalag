import React from 'react';
import Container from 'react-bootstrap/Container';
import Header from '../components/Header';
import Minmax from '../components/Minmax';
import ApiKeyBox from '../components/ApiKeyBox';

export default function Home() {
  return (
    <Container className="py-4">
      <Header />
      <ApiKeyBox />
      <Minmax />
    </Container>
  );
}
