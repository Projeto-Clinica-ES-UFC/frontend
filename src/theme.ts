import { createTheme } from '@mui/material/styles';

// Documentação do theming do MUI: https://mui.com/material-ui/customization/theming/
export const theme = createTheme({
  palette: {
    // --- MUDE AS CORES AQUI ---
    primary: {
      main: '#0077b6', // Azul principal (para botões, links, ícones ativos)
      light: '#48a5e8',
      dark: '#004c86',
    },
    secondary: {
      main: '#00b4d8', // Cor secundária (para outros destaques)
    },
    background: {
      default: '#f4f6f8', // Cor de fundo principal (um cinzento muito claro)
      paper: '#ffffff',   // Cor de fundo dos "cartões" e da sidebar
    },
    // --- FIM DA ÁREA DE CORES ---
  },
  typography: {
    fontFamily: [
      'Inter', // Usaremos a fonte Inter para um look moderno
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
        fontWeight: 600, // Deixar os títulos um pouco mais fortes
    },
  },
  components: {
    // Estilizações globais para componentes específicos
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 8, // Bordas arredondadas para todos os Paper/Card
            }
        }
    },
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none', // Botões sem texto em maiúsculas
                borderRadius: 8,
            }
        }
    }
  }
});