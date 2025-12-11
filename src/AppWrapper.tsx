import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

export function AppWrapper() {
  return (
    // 1. O Tema envolve tudo para garantir que cores/fontes estejam disponíveis
    <ThemeContextProvider>
      <CssBaseline /> {/* Reseta o CSS do navegador para o padrão Material UI */}
      
      {/* 2. Notificações globais */}
      <NotificationProvider>
        
        {/* 3. Autenticação (User Token) */}
        <AuthProvider>
          
          {/* 4. Roteamento */}
          <BrowserRouter>
            <App />
          </BrowserRouter>
          
        </AuthProvider>
      </NotificationProvider>
    </ThemeContextProvider>
  );
}