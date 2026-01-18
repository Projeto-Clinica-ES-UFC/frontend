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

// Tipo para os dados do formulário
export interface IHistoricoEventoForm {
    data: string;
    tipo: 'Consulta' | 'Avaliação' | 'Observação';
    titulo: string;
    descricao?: string;
}

// Dados iniciais para modo de edição
export interface IHistoricoEventoEdit extends IHistoricoEventoForm {
    id: number;
}

// Propriedades do Modal
interface HistoricoFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (eventoData: IHistoricoEventoForm, pacienteId: number, eventoId?: number) => void;
    pacienteId: number;
    eventoParaEditar?: IHistoricoEventoEdit | null; // Se presente, modo de edição
}

export const HistoricoFormModal = ({
    open,
    onClose,
    onSave,
    pacienteId,
    eventoParaEditar
}: HistoricoFormModalProps) => {
    // Estados para o formulário
    const [data, setData] = useState(new Date().toISOString().split('T')[0]);
    const [tipo, setTipo] = useState<'Consulta' | 'Avaliação' | 'Observação'>('Consulta');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');

    const isEditMode = !!eventoParaEditar;

    // Preenche o formulário quando abrir (criar ou editar)
    useEffect(() => {
        if (open) {
            if (eventoParaEditar) {
                // Modo edição - preenche com dados existentes
                setData(eventoParaEditar.data);
                setTipo(eventoParaEditar.tipo);
                setTitulo(eventoParaEditar.titulo);
                setDescricao(eventoParaEditar.descricao || '');
            } else {
                // Modo criação - limpa formulário
                setData(new Date().toISOString().split('T')[0]);
                setTipo('Consulta');
                setTitulo('');
                setDescricao('');
            }
        }
    }, [open, eventoParaEditar]);

    const handleSave = () => {
        const eventoData: IHistoricoEventoForm = {
            data,
            tipo,
            titulo,
            descricao,
        };
        onSave(eventoData, pacienteId, eventoParaEditar?.id);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditMode ? 'Editar Registro' : 'Adicionar Registro ao Histórico'}
            </DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        id="data"
                        label="Data do Registro"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <FormControl fullWidth required>
                        <InputLabel id="tipo-label">Tipo de Registro</InputLabel>
                        <Select
                            labelId="tipo-label"
                            id="tipo"
                            value={tipo}
                            label="Tipo de Registro"
                            onChange={(e) => setTipo(e.target.value as IHistoricoEventoForm['tipo'])}
                        >
                            <MenuItem value="Consulta">Consulta</MenuItem>
                            <MenuItem value="Avaliação">Avaliação</MenuItem>
                            <MenuItem value="Observação">Observação</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        id="titulo"
                        label="Título / Assunto"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                    <TextField
                        id="descricao"
                        label="Descrição / Detalhes (opcional)"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" disabled={!titulo || !data}>
                    {isEditMode ? 'Salvar Alterações' : 'Salvar Registro'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};