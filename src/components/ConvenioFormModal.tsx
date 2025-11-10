import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';

// A "forma" de um convênio
interface IConvenio {
    id: number;
    nome: string;
    desconto: number;
}

// As propriedades que este componente de Modal vai aceitar
interface ConvenioFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (convenio: Omit<IConvenio, 'id'> & { id?: number }) => void;
    convenioParaEditar?: IConvenio | null;
}

export const ConvenioFormModal = ({ open, onClose, onSave, convenioParaEditar }: ConvenioFormModalProps) => {
    // Estados para guardar os dados do formulário
    const [nome, setNome] = useState('');
    const [desconto, setDesconto] = useState(0);

    useEffect(() => {
        if (convenioParaEditar) {
            // Se estamos a editar, preenchemos o formulário
            setNome(convenioParaEditar.nome);
            setDesconto(convenioParaEditar.desconto);
        } else {
            // Se estamos a adicionar um novo, limpamos o formulário
            setNome('');
            setDesconto(0);
        }
    }, [convenioParaEditar, open]);

    const handleSave = () => {
        const convenioData = {
            id: convenioParaEditar?.id,
            nome,
            desconto: Number(desconto) || 0, // Garante que o valor é um número
        };
        onSave(convenioData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{convenioParaEditar ? 'Editar Convênio' : 'Adicionar Novo Convênio'}</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        id="nome"
                        label="Nome do Convênio"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <TextField
                        id="desconto"
                        label="Desconto"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={desconto}
                        onChange={(e) => setDesconto(Number(e.target.value))}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
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