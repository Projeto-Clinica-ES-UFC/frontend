import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';

import { usersService } from '../services/rest-client';

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';

export const MeuPerfilPage = () => {
    const { user, updateUser } = useAuth();

    // --- State: Dados Pessoais ---
    const [nome, setNome] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- State: Alterar Senha ---
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Handlers ---

    const handleSaveProfile = async () => {
        setProfileMessage(null);

        if (!nome || !email) {
            setProfileMessage({ type: 'error', text: "Nome e Email são obrigatórios." });
            return;
        }

        if (nome.length < 2 || nome.length > 100) {
            setProfileMessage({ type: 'error', text: "Nome deve ter entre 2 e 100 caracteres." });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setProfileMessage({ type: 'error', text: "Formato de email inválido." });
            return;
        }

        setProfileLoading(true);

        try {
            if (!user?.id) throw new Error("ID do usuário não encontrado.");

            const payload = {
                name: nome,
                email: email,
                // photoURL...
            };

            await usersService.update(user.id, payload);
            updateUser({ name: nome, email: email });

            setProfileMessage({ type: 'success', text: "Dados atualizados com sucesso!" });

        } catch (error: any) {
            console.error("Erro ao salvar perfil:", error);
            const errorMessage = error.message || "Falha ao salvar dados. Tente novamente.";
            setProfileMessage({ type: 'error', text: errorMessage });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMessage(null);

        if (!password) {
            setPasswordMessage({ type: 'error', text: "Digite a nova senha." });
            return;
        }

        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: "As senhas não coincidem." });
            return;
        }

        setPasswordLoading(true);

        try {
            if (!user?.id) throw new Error("ID do usuário não encontrado.");

            await usersService.update(user.id, { password });

            setPasswordMessage({ type: 'success', text: "Senha alterada com sucesso!" });
            setPassword('');
            setConfirmPassword('');

        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            setPasswordMessage({ type: 'error', text: "Falha ao alterar senha. Tente novamente." });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Box maxWidth="lg" sx={{ mx: 'auto' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                Meu Perfil
            </Typography>

            <Grid container spacing={4} justifyContent="center">

                {/* --- Coluna 1: Dados Pessoais --- */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

                            <Typography variant="h6" component="h2" gutterBottom>
                                Dados Pessoais
                            </Typography>

                            <Avatar
                                sx={{ width: 100, height: 100, fontSize: '2.5rem', bgcolor: 'primary.main' }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>

                            <TextField
                                fullWidth
                                label="Name"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                error={!!profileMessage && profileMessage.type === 'error' && profileMessage.text.includes('Nome')}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!profileMessage && profileMessage.type === 'error' && profileMessage.text.includes('Email')}
                            />

                            {profileMessage && (
                                <Alert severity={profileMessage.type} sx={{ width: '100%' }}>
                                    {profileMessage.text}
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<SaveIcon />}
                                onClick={handleSaveProfile}
                                disabled={profileLoading}
                                fullWidth
                                sx={{ mt: 'auto' }}
                            >
                                {profileLoading ? "Salvando..." : "Salvar Dados"}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* --- Coluna 2: Segurança / Senha --- */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

                            <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LockResetIcon /> Segurança
                            </Typography>

                            <Typography variant="body2" color="text.secondary" align="center">
                                Defina uma nova senha para acessar sua conta.
                            </Typography>

                            <TextField
                                fullWidth
                                label="Nova Senha"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Confirmar Nova Senha"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!password}
                            />

                            {passwordMessage && (
                                <Alert severity={passwordMessage.type} sx={{ width: '100%' }}>
                                    {passwordMessage.text}
                                </Alert>
                            )}

                            <Button
                                variant="outlined"
                                color="warning"
                                size="large"
                                startIcon={<LockResetIcon />}
                                onClick={handleChangePassword}
                                disabled={passwordLoading || !password}
                                fullWidth
                                sx={{ mt: 'auto' }}
                            >
                                {passwordLoading ? "Alterando..." : "Alterar Senha"}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};