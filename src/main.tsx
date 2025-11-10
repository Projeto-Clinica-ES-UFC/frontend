import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppWrapper } from './AppWrapper'; // Importa o nosso novo componente wrapper

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);