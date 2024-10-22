import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter, helps in routing and navigate method use
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <BrowserRouter>   {/* Wrap your App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </ChakraProvider>,
);
