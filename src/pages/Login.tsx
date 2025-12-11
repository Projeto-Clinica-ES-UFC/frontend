import { useState, type FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Material-UI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

// Ícones
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Ativos (Certifique-se de que estes arquivos existem na pasta 'public')
const VIDEO_URL = '/video_ame.mp4'; 
const LOGO_URL = '/logo_ame.jpeg';

export const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validação básica local
    if (!email || !email.includes('@')) {
        setError("Por favor, insira um endereço de e-mail válido.");
        return;
    }
    if (!password) {
        setError("Por favor, insira a sua senha.");
        return;
    }

    setIsSubmitting(true);

    try {
      // Chama a função login do AuthContext (que conecta no backend)
      await login(email, password);
      // Se der certo, redireciona
      navigate('/');
    } catch (err: unknown) {
      console.error("Falha na tentativa de login:", err);
      // Exibe erro genérico para segurança, ou específico se desejar
      setError("E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box 
      component="main" 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' }
      }}
    >
      {/* Coluna do Vídeo (Esquerda) */}
      <Box 
        sx={{ 
          display: { xs: 'none', sm: 'block' }, 
          flexBasis: { sm: '33.33%', md: '58.33%' }, 
          flexGrow: 1, 
          overflow: 'hidden', 
          position: 'relative',
          backgroundColor: 'black' // Fundo preto caso o vídeo demore a carregar
        }}
      >
        <video
            autoPlay
            loop
            muted
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        >
            <source src={VIDEO_URL} type="video/mp4" />
        </video>
        {/* Overlay opcional para escurecer o vídeo e destacar o formulário */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
      </Box>
      
      {/* Coluna do Formulário (Direita) */}
      <Box component={Paper} elevation={6} square sx={{ flexBasis: { xs: '100%', sm: '66.67%', md: '41.67%' }, flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: '450px', my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          <Box
            component="img"
            sx={{
              m: 1,
              height: 100,
              width: 100,
              objectFit: 'cover',
              borderRadius: '50%',
              border: `4px solid ${theme.palette.primary.main}`,
              boxShadow: 3
            }}
            alt="Logo Clínica AME"
            src={LOGO_URL}
          />
          
          <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
            Bem-vindo à Clínica AME
          </Typography>
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField 
                margin="normal" 
                required fullWidth 
                id="email" 
                label="Endereço de E-mail" 
                name="email" 
                autoComplete="email" 
                autoFocus 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isSubmitting} 
            />
            <TextField 
                margin="normal" 
                required fullWidth 
                name="password" 
                label="Senha" 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                autoComplete="current-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isSubmitting} 
                InputProps={{ 
                    endAdornment: ( 
                        <InputAdornment position="end"> 
                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end"> 
                                {showPassword ? <VisibilityOff /> : <Visibility />} 
                            </IconButton> 
                        </InputAdornment> 
                    ), 
                }} 
            />
            <FormControlLabel 
                control={ <Checkbox value="remember" color="primary" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> } 
                label="Lembrar de mim" 
            />

            {error && ( 
                <Typography color="error" variant="body2" sx={{ width: '100%', textAlign: 'center', mt: 1, fontWeight: 'bold' }}> 
                    {error} 
                </Typography> 
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                Esqueci minha senha
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};