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

// Ícones
import EditIcon from '@mui/icons-material/Edit';

export const MeuPerfilPage = () => {
    const { user, updateUser } = useAuth(); // Busca os dados e a função de atualização

    // Estados para os campos do formulário (inicializados com os dados do utilizador)
    const [nome, setNome] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Função para lidar com a mudança da imagem
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl); // Atualiza a pré-visualização da imagem
        }
    };

    // Função para salvar as alterações
    const handleSave = () => {
        updateUser({ name: nome, email: email, photoURL: photoPreview || undefined });
        setShowSuccessMessage(true); // Mostra a mensagem de sucesso
        // Remove a mensagem após alguns segundos
        setTimeout(() => {
            setShowSuccessMessage(false);
        }, 4000);
        console.log("Alterações salvas (simulado)!", { nome, email, photoPreview });
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                Meu Perfil
            </Typography>

            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>

                    {/* Secção da Foto de Perfil */}
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <Tooltip title="Alterar foto">
                                <IconButton component="label" sx={{ bgcolor: 'background.paper', border: '1px solid lightgray' }}>
                                    <EditIcon fontSize="small" />
                                    {/* O input de ficheiro fica escondido mas é ativado pelo IconButton */}
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </IconButton>
                            </Tooltip>
                        }
                    >
                        <Avatar 
                            sx={{ width: 120, height: 120, fontSize: '3rem' }}
                            src={photoPreview || undefined}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </Badge>
                    
                    {/* Campos de Informação */}
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

                    {/* Botão de Salvar */}
                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleSave}>
                        Salvar Alterações
                    </Button>
                </Box>
            </Paper>

            {/* --- INÍCIO DA NOVA MENSAGEM DE SUCESSO --- */}
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {showSuccessMessage && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Perfil atualizado com sucesso!
                    </Alert>
                )}
            </Box>
            {/* --- FIM DA NOVA MENSAGEM --- */}
        </Box>
        );
    }