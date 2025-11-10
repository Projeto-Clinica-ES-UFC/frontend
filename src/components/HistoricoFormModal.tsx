import { useState, useEffect, type ChangeEvent } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel'; // Importação necessária
import Select from '@mui/material/Select'; // Importação necessária
import Typography from '@mui/material/Typography';

// A "forma" de um evento do histórico (simplificada para o formulário)
interface IHistoricoEventoForm {
    data: string;
    tipo: 'Consulta' | 'Avaliação' | 'Anexo' | 'Observação';
    titulo: string;
    descricao?: string;
    anexo?: File | null; // Para guardar o ficheiro selecionado
}

// Propriedades do Modal
interface HistoricoFormModalProps {
    open: boolean;
    onClose: () => void;
    // A função onSave recebe os dados do formulário e o ID do paciente
    onSave: (eventoData: IHistoricoEventoForm, pacienteId: number) => void; 
    pacienteId: number; // Precisamos de saber a qual paciente adicionar
}

export const HistoricoFormModal = ({ open, onClose, onSave, pacienteId }: HistoricoFormModalProps) => {
    // Estados para o formulário
    const [data, setData] = useState(new Date().toLocaleDateString('sv-SE')); // Data atual por defeito
    const [tipo, setTipo] = useState<'Consulta' | 'Avaliação' | 'Anexo' | 'Observação'>('Consulta');
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [anexo, setAnexo] = useState<File | null>(null);

    // Limpa o formulário sempre que o modal abre
    useEffect(() => {
        if (open) {
            setData(new Date().toLocaleDateString('sv-SE'));
            setTipo('Consulta');
            setTitulo('');
            setDescricao('');
            setAnexo(null);
        }
    }, [open]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAnexo(event.target.files[0]);
            // Se o tipo for 'Anexo' e o título estiver vazio, preenche com o nome do ficheiro
            if (tipo === 'Anexo' && !titulo) {
                setTitulo(event.target.files[0].name);
            }
        }
    };

    const handleSave = () => {
        const eventoData: IHistoricoEventoForm = {
            data,
            tipo,
            titulo,
            descricao,
            anexo,
        };
        onSave(eventoData, pacienteId);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Adicionar Registro ao Histórico</DialogTitle>
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
                            <MenuItem value="Anexo">Anexo</MenuItem>
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
                    {/* Campo de Anexo só aparece se o tipo for 'Anexo' */}
                    {tipo === 'Anexo' && (
                         <Button
                            variant="outlined"
                            component="label" // Faz o botão funcionar como um label para o input
                         >
                             Selecionar Anexo
                             <input 
                                type="file" 
                                hidden 
                                onChange={handleFileChange} 
                             />
                         </Button>
                    )}
                    {/* Mostra o nome do ficheiro selecionado */}
                    {anexo && (
                        <Typography variant="body2" color="text.secondary">
                            Ficheiro selecionado: {anexo.name}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" disabled={!titulo || !data}>Salvar Registro</Button>
            </DialogActions>
        </Dialog>
    );
};