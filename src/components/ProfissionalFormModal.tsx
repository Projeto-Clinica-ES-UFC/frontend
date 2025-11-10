import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

// A "forma" de um profissional
interface IProfissional {
    id: number;
    nome: string;
    email: string;
    especialidade: string;
}

// As propriedades que este componente de Modal vai aceitar
interface ProfissionalFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (profissional: Omit<IProfissional, 'id'> & { id?: number }) => void;
    profissionalParaEditar?: IProfissional | null;
}

export const ProfissionalFormModal = ({ open, onClose, onSave, profissionalParaEditar }: ProfissionalFormModalProps) => {
    // Estados para guardar os dados do formulário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [especialidade, setEspecialidade] = useState('');

    useEffect(() => {
        if (profissionalParaEditar) {
            // Se estamos a editar, preenchemos o formulário
            setNome(profissionalParaEditar.nome);
            setEmail(profissionalParaEditar.email);
            setEspecialidade(profissionalParaEditar.especialidade);
        } else {
            // Se estamos a adicionar um novo, limpamos o formulário
            setNome('');
            setEmail('');
            setEspecialidade('');
        }
    }, [profissionalParaEditar, open]);

    const handleSave = () => {
        const profissionalData = {
            id: profissionalParaEditar?.id,
            nome,
            email,
            especialidade,
        };
        onSave(profissionalData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{profissionalParaEditar ? 'Editar Profissional' : 'Adicionar Novo Profissional'}</DialogTitle>
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
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        id="especialidade"
                        label="Especialidade"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={especialidade}
                        onChange={(e) => setEspecialidade(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};