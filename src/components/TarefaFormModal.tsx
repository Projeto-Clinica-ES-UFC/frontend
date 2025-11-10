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
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';

// Simulação de utilizadores (deve ser consistente com a TarefasPage)
const USUARIOS_EXEMPLO = [
  { id: 1, nome: 'Administrador Clínica' },
  { id: 2, nome: 'Recepcionista' },
  { id: 3, nome: 'Dr. João' },
];

// Interface (ATUALIZADA)
interface ITarefa {
    id: number;
    titulo: string;
    descricao?: string;
    concluida: boolean;
    prioridade: 'Baixa' | 'Média' | 'Alta';
    prazo?: string | null;
    atribuidoAId: number | null;
}

interface TarefaFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (tarefa: Omit<ITarefa, 'id' | 'concluida'> & { id?: number }) => void;
    tarefaParaEditar?: ITarefa | null;
}

export const TarefaFormModal = ({ open, onClose, onSave, tarefaParaEditar }: TarefaFormModalProps) => {
    // Estados (ATUALIZADOS)
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prioridade, setPrioridade] = useState<'Baixa' | 'Média' | 'Alta'>('Baixa');
    const [prazo, setPrazo] = useState('');
    const [atribuidoAId, setAtribuidoAId] = useState<number | null>(null);

    // useEffect (ATUALIZADO)
    useEffect(() => {
        if (tarefaParaEditar) {
            setTitulo(tarefaParaEditar.titulo);
            setDescricao(tarefaParaEditar.descricao || '');
            setPrioridade(tarefaParaEditar.prioridade);
            setPrazo(tarefaParaEditar.prazo ? tarefaParaEditar.prazo.substring(0, 16) : '');
            setAtribuidoAId(tarefaParaEditar.atribuidoAId);
        } else {
            setTitulo('');
            setDescricao('');
            setPrioridade('Baixa');
            setPrazo('');
            setAtribuidoAId(null);
        }
    }, [tarefaParaEditar, open]);

    // handleSave (ATUALIZADO)
    const handleSave = () => {
        const tarefaData = {
            id: tarefaParaEditar?.id,
            titulo,
            descricao,
            prioridade,
            prazo: prazo || null,
            atribuidoAId,
        };
        onSave(tarefaData);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{tarefaParaEditar ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</DialogTitle>
            <DialogContent>
                {/* JSX (ATUALIZADO) */}
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="titulo"
                        label="Título da Tarefa"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="descricao"
                        label="Descrição (opcional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                    <Autocomplete
                        options={USUARIOS_EXEMPLO}
                        getOptionLabel={(option) => option.nome}
                        value={USUARIOS_EXEMPLO.find(u => u.id === atribuidoAId) || null}
                        onChange={(_event, newValue) => {
                            setAtribuidoAId(newValue ? newValue.id : null);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Atribuir a (opcional)" variant="outlined" />
                        )}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="prioridade-label">Prioridade</InputLabel>
                        <Select
                            labelId="prioridade-label"
                            value={prioridade}
                            label="Prioridade"
                            onChange={(e) => setPrioridade(e.target.value as ITarefa['prioridade'])}
                        >
                            <MenuItem value="Baixa">Baixa</MenuItem>
                            <MenuItem value="Média">Média</MenuItem>
                            <MenuItem value="Alta">Alta</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        id="prazo"
                        label="Prazo (opcional)"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={prazo}
                        onChange={(e) => setPrazo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" disabled={!titulo}>Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};