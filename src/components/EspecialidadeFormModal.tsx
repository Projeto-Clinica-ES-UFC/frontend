import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';

// A "forma" de uma especialidade
interface IEspecialidade {
    id: number;
    nome: string;
}

// As propriedades que este componente de Modal vai aceitar
interface EspecialidadeFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (especialidade: Omit<IEspecialidade, 'id'> & { id?: number }) => void;
    especialidadeParaEditar?: IEspecialidade | null;
}

export const EspecialidadeFormModal = ({ open, onClose, onSave, especialidadeParaEditar }: EspecialidadeFormModalProps) => {
    const [nome, setNome] = useState('');

    useEffect(() => {
        if (especialidadeParaEditar) {
            setNome(especialidadeParaEditar.nome);
        } else {
            setNome('');
        }
    }, [especialidadeParaEditar, open]);

    const handleSave = () => {
        const especialidadeData = {
            id: especialidadeParaEditar?.id,
            nome,
        };
        onSave(especialidadeData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{especialidadeParaEditar ? 'Editar Especialidade' : 'Adicionar Nova Especialidade'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="nome"
                        label="Nome da Especialidade"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
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