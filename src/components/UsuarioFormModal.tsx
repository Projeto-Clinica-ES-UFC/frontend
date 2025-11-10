import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

// A "forma" de um usuário
interface IUsuario {
    id: number;
    nome: string;
    email: string;
    perfil: 'Administrador' | 'Recepcionista' | 'Profissional';
}

// As propriedades que este componente de Modal vai aceitar
interface UsuarioFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (usuario: Omit<IUsuario, 'id'> & { id?: number }) => void;
    usuarioParaEditar?: IUsuario | null;
}

export const UsuarioFormModal = ({ open, onClose, onSave, usuarioParaEditar }: UsuarioFormModalProps) => {
    // Estados para guardar os dados do formulário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [perfil, setPerfil] = useState<'Administrador' | 'Recepcionista' | 'Profissional'>('Recepcionista');

    useEffect(() => {
        if (usuarioParaEditar) {
            // Se estamos a editar, preenchemos o formulário
            setNome(usuarioParaEditar.nome);
            setEmail(usuarioParaEditar.email);
            setPerfil(usuarioParaEditar.perfil);
        } else {
            // Se estamos a adicionar um novo, limpamos o formulário
            setNome('');
            setEmail('');
            setPerfil('Recepcionista'); // Perfil padrão para novos usuários
        }
    }, [usuarioParaEditar, open]);

    const handleSave = () => {
        const usuarioData = {
            id: usuarioParaEditar?.id,
            nome,
            email,
            perfil,
        };
        onSave(usuarioData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{usuarioParaEditar ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        id="nome"
                        label="Nome Completo"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <TextField
                        id="email"
                        label="Email de Acesso"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FormControl fullWidth>
                        <TextField
                            id="perfil"
                            select
                            label="Perfil de Acesso"
                            value={perfil}
                            onChange={(e) => setPerfil(e.target.value as IUsuario['perfil'])}
                        >
                            <MenuItem value="Administrador">Administrador</MenuItem>
                            <MenuItem value="Recepcionista">Recepcionista</MenuItem>
                            <MenuItem value="Profissional">Profissional</MenuItem>
                        </TextField>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};