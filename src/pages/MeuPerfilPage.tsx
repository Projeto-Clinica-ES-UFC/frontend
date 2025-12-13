import { useState, type ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import { usersService } from '../services/rest-client';

// Ícones
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Interface para o payload de atualização
interface IUserPayload {
    name: string;
    email: string;
    photoURL?: string;
    password?: string;
}

export const MeuPerfilPage = () => {
    const { user, updateUser } = useAuth(); 

    // Estados
    const [nome, setNome] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Imagem (Apenas visual local por enquanto)
    const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
    
    // Feedback
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl); 
        }
    };

    const handleSave = async () => {
        setMessage(null);
        
        // Validação básica
        if (!nome || !email) {
            setMessage({ type: 'error', text: "Nome e Email são obrigatórios." });
            return;
        }

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: "As senhas não coincidem." });
            return;
        }

        setLoading(true);

        try {
            // 1. CORREÇÃO: Usando a interface em vez de any
            const payload: IUserPayload = {
                name: nome,
                email: email,
                // photoURL: photoPreview // Descomente se o backend suportar salvar URL
            };

            // Só envia senha se o usuário digitou algo
            if (password) {
                payload.password = password;
            }

            // 2. Envia para o Backend (PUT /users/:id)
            if (!user?.id) throw new Error("ID do usuário não encontrado.");

            await usersService.update(user.id, payload);

            // 3. Atualiza o Contexto Global (Frontend)
            updateUser({ 
                name: nome, 
                email: email, 
                photoURL: photoPreview || undefined 
            });

            setMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
            
            // Limpa campos de senha
            setPassword('');
            setConfirmPassword('');

        } catch (error) {
            console.error("Erro ao salvar:", error);
            setMessage({ type: 'error', text: "Falha ao salvar alterações. Tente novamente." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                Meu Perfil
            </Typography>

            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

                    {/* Foto de Perfil */}
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <Tooltip title="Alterar foto (Visual)">
                                <IconButton component="label" sx={{ bgcolor: 'background.paper', border: '1px solid lightgray' }}>
                                    <EditIcon fontSize="small" />
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </IconButton>
                            </Tooltip>
                        }
                    >
                        <Avatar 
                            sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}
                            src={photoPreview || undefined}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Badge>
                    
                    {/* Dados Pessoais */}
                    <TextField
                        fullWidth
                        label="Nome Completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Email de Acesso"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Divider sx={{ width: '100%', my: 1 }}>Alterar Senha (Opcional)</Divider>

                    <TextField
                        fullWidth
                        label="Nova Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Deixe em branco para manter a atual"
                    />
                    <TextField
                        fullWidth
                        label="Confirmar Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!password}
                    />

                    {/* Mensagens de Feedback */}
                    {message && (
                        <Alert severity={message.type} sx={{ width: '100%' }}>
                            {message.text}
                        </Alert>
                    )}

                    {/* Botão Salvar */}
                    <Button 
                        variant="contained" 
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{ mt: 1, px: 4 }}
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};