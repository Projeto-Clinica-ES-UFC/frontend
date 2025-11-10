import { useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ColorModeContext } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext'; // Importação correta

export function AppWrapper() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0077b6',
          },
          background: mode === 'light' 
              ? { default: '#f4f6f8', paper: '#ffffff' } 
              : { default: '#121212', paper: '#1e1e1e' },
        },
        typography: {
           button: { textTransform: 'none' }
        }
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* O NotificationProvider deve envolver o AuthProvider e o App */}
        <NotificationProvider> 
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}